// ============================================
// 小孩激励积分 - 腾讯云云开发配置
// ============================================

let db = null;
let cloud = null;
let cloudMode = false;

/**
 * 初始化云开发
 */
async function initCloud() {
    if (typeof cloudbase === 'undefined') {
        console.log('⚠️ cloudbase SDK 未加载');
        return { success: false, mode: 'none' };
    }

    try {
        cloud = cloudbase.init({
            env: 'xiaohaijili-d8g917q3ec846392b',
        });

        const auth = cloud.auth();
        await auth.signInAnonymously();
        console.log('✅ 匿名登录成功');

        db = cloud.database();
        cloudMode = true;

        console.log('✅ 云开发初始化成功');
        return { success: true, mode: 'cloud', cloud, db };
    } catch (error) {
        console.error('❌ 云开发初始化失败:', error);
        return { success: false, mode: 'none', error: error.message };
    }
}

/**
 * 数据库集合名称
 */
const COLLECTIONS = {
    USERS: 'users',
    TASKS: 'tasks',
    REWARDS: 'rewards',
    LOGS: 'logs',
    LOTTERY_CONFIG: 'lottery_config',
};

/**
 * 解析云开发返回的文档，把 data 子字段展开到顶层
 * 腾讯云 SDK add({data: item}) 后，查询返回的文档结构是：
 * { _id: 'xxx', _openid: 'xxx', data: { score: 0, username: '丫丫', ... } }
 * 需要把 data 里的字段提到顶层
 *
 * 同时保留云开发自动生成的元数据字段（_createTime, _updateTime 等）
 */
function unwrapDoc(doc) {
    if (!doc) return doc;

    // 云开发元数据字段（这些在 data 子对象和外层都可能有，优先保留外层的）
    const metaFields = ['_createTime', '_updateTime', 'createTime', 'updateTime'];

    // 先把外层元数据字段暂存
    const meta = {};
    metaFields.forEach(f => {
        if (doc[f] !== undefined) meta[f] = doc[f];
    });

    // 如果有 data 子对象，把 data 里的字段合并到顶层
    if (doc.data && typeof doc.data === 'object' && !Array.isArray(doc.data)) {
        const unwrapped = { ...doc.data };
        // 保留 _id（外层的 _id 是云开发生成的真实 ID）
        if (doc._id) unwrapped._id = String(doc._id);
        // 保留云开发自动生成的元数据字段（外层的可能带时区信息更准确）
        Object.keys(meta).forEach(f => {
            if (!(f in unwrapped)) unwrapped[f] = meta[f];
        });
        return unwrapped;
    }
    // 没有 data 包装，确保 _id 是字符串，同时补上元数据字段
    if (doc._id && typeof doc._id !== 'string') {
        doc._id = String(doc._id);
    }
    metaFields.forEach(f => {
        if (!(f in doc) && meta[f] !== undefined) {
            doc[f] = meta[f];
        }
    });
    return doc;
}

/**
 * 通用查询
 */
async function dbQuery(collection, condition = {}) {
    if (!cloudMode || !db) {
        return { success: false, data: [], error: '云开发未初始化' };
    }
    try {
        let query = db.collection(collection).where(condition);
        // 日志集合需要限制返回数量，避免截断
        if (collection === COLLECTIONS.LOGS) {
            query = query.limit(100);
        }
        const result = await query.get();
        const data = (result.data || []).map(item => unwrapDoc(item));
        return { success: true, data };
    } catch (error) {
        console.error(`❌ 查询 ${collection} 失败:`, error);
        return { success: false, data: [], error: error.message };
    }
}

/**
 * 日志专用查询：按 createTime 倒序查最近 N 天
 */
async function dbQueryLogsPaged(userId, maxDays = 90, maxCount = 500) {
    if (!cloudMode || !db) {
        return { success: false, data: [], error: '云开发未初始化' };
    }
    try {
        const from = new Date();
        from.setDate(from.getDate() - maxDays);
        // 云开发 SDK orderBy + limit 查询
        let query = db.collection(COLLECTIONS.LOGS)
            .where({ userId, createTime: { $gte: from.toISOString() } })
            .orderBy('createTime', 'desc')
            .limit(maxCount);
        const result = await query.get();
        const data = (result.data || []).map(item => unwrapDoc(item));
        return { success: true, data };
    } catch (error) {
        console.error(`❌ 日志分页查询失败:`, error);
        return { success: false, data: [], error: error.message };
    }
}

/**
 * 通过 _id 查询单条
 */
async function dbGetById(collection, docId) {
    if (!cloudMode || !db) {
        return { success: false, data: null };
    }
    try {
        const result = await db.collection(collection).doc(docId).get();
        // SDK 可能返回数组或对象
        let doc = result.data;
        if (Array.isArray(doc)) {
            doc = doc.length > 0 ? doc[0] : null;
        }
        if (doc) {
            doc = unwrapDoc(doc);
        }
        return { success: true, data: doc };
    } catch (error) {
        console.error(`❌ 查询 ${collection}#${docId} 失败:`, error);
        return { success: false, data: null };
    }
}

/**
 * 通用插入
 */
async function dbAdd(collection, item) {
    if (!cloudMode || !db) {
        console.warn('⚠️ dbAdd 未调用，cloudMode:', cloudMode, 'db:', !!db);
        return { success: false, error: '云开发未初始化' };
    }
    try {
        const result = await db.collection(collection).add(item);
        return { success: true, id: String(result.id) };
    } catch (error) {
        console.error(`❌ 插入 ${collection} 失败:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * 通用更新
 */
async function dbUpdate(collection, docId, data) {
    if (!cloudMode || !db) {
        return { success: false, error: '云开发未初始化' };
    }
    try {
        await db.collection(collection).doc(docId).update(data);
        return { success: true };
    } catch (error) {
        console.error(`❌ 更新 ${collection} 失败:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * 通用删除
 */
async function dbDelete(collection, docId) {
    if (!cloudMode || !db) {
        return { success: false, error: '云开发未初始化' };
    }
    try {
        await db.collection(collection).doc(docId).remove();
        return { success: true };
    } catch (error) {
        console.error(`❌ 删除 ${collection} 失败:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * 构建家庭隔离查询条件
 * 兼容旧数据（没有 familyId 字段的记录也能查到）
 * @param {string} familyId - 当前用户的家庭 ID
 * @returns {object} db.command 查询条件
 */
function familyQuery(familyId) {
    if (!db) return {};
    const _ = db.command;
    return _.or([
        { familyId: familyId },
        { familyId: _.exists(false) },
    ]);
}

/**
 * 生成随机家庭码（6 位大写字母数字，不含易混淆字符）
 */
function generateFamilyCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

/**
 * 检查是否有无主的旧数据（没有 familyId 的任务或奖励）
 */
async function hasOrphanData() {
    if (!db) return false;
    const _ = db.command;
    try {
        const tasksResult = await db.collection(COLLECTIONS.TASKS).where({ familyId: _.exists(false) }).limit(1).get();
        if (tasksResult.data && tasksResult.data.length > 0) return true;
        const rewardsResult = await db.collection(COLLECTIONS.REWARDS).where({ familyId: _.exists(false) }).limit(1).get();
        if (rewardsResult.data && rewardsResult.data.length > 0) return true;
    } catch (e) {
        console.warn('⚠️ 检查无主数据失败:', e);
    }
    return false;
}

/**
 * 将无主的旧数据迁移到当前家庭
 * @param {string} familyId - 当前用户的家庭 ID
 * @returns {Promise<{success: boolean, count: number, error?: string}>}
 */
async function migrateOrphanData(familyId) {
    if (!db) return { success: false, count: 0, error: '云开发未初始化' };
    if (!familyId) return { success: false, count: 0, error: '无效的家庭 ID' };
    const _ = db.command;
    let totalCount = 0;

    try {
        // 迁移任务
        const tasksResult = await db.collection(COLLECTIONS.TASKS).where({ familyId: _.exists(false) }).get();
        if (tasksResult.data && tasksResult.data.length > 0) {
            for (const task of tasksResult.data) {
                const id = task._id || (task.data && task.data._id);
                if (id) {
                    await db.collection(COLLECTIONS.TASKS).doc(id).update({ familyId });
                    totalCount++;
                }
            }
        }

        // 迁移奖励
        const rewardsResult = await db.collection(COLLECTIONS.REWARDS).where({ familyId: _.exists(false) }).get();
        if (rewardsResult.data && rewardsResult.data.length > 0) {
            for (const reward of rewardsResult.data) {
                const id = reward._id || (reward.data && reward.data._id);
                if (id) {
                    await db.collection(COLLECTIONS.REWARDS).doc(id).update({ familyId });
                    totalCount++;
                }
            }
        }

        return { success: true, count: totalCount };
    } catch (error) {
        console.error('❌ 迁移无主数据失败:', error);
        return { success: false, count: totalCount, error: error.message };
    }
}
