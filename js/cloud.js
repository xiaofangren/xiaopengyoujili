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
 */
function unwrapDoc(doc) {
    if (!doc) return doc;
    // 如果有 data 子对象，把 data 里的字段合并到顶层
    if (doc.data && typeof doc.data === 'object' && !Array.isArray(doc.data)) {
        const unwrapped = { ...doc.data };
        // 保留 _id（外层的 _id 是云开发生成的真实 ID）
        if (doc._id) unwrapped._id = String(doc._id);
        return unwrapped;
    }
    // 没有 data 包装，确保 _id 是字符串
    if (doc._id && typeof doc._id !== 'string') {
        doc._id = String(doc._id);
    }
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
        const result = await db.collection(collection).where(condition).get();
        const data = (result.data || []).map(item => unwrapDoc(item));
        return { success: true, data };
    } catch (error) {
        console.error(`❌ 查询 ${collection} 失败:`, error);
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
        return { success: false, error: '云开发未初始化' };
    }
    try {
        // 直接用 add(item)，不用 add({data: item})
        // 这样字段存在顶层，.where() 才能正确查询
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
