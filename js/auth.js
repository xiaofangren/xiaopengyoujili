// ============================================
// 小孩激励积分 - 用户认证模块
// ============================================

const AUTH = {
    currentUser: null,
    STORAGE_KEY: 'reward_app_user',

    /**
     * 用户登录
     */
    async login(username, role = 'child') {
        if (!username || !username.trim()) {
            return { success: false, error: '请输入昵称' };
        }

        username = username.trim();

        // 先尝试从 localStorage 恢复已登录用户
        const existing = localStorage.getItem(this.STORAGE_KEY);
        if (existing) {
            try {
                const cachedUser = JSON.parse(existing);
                if (cachedUser.username === username && cachedUser._id) {
                    // 验证 _id 在云端是否存在
                    const verifyResult = await dbGetById(COLLECTIONS.USERS, cachedUser._id);
                    if (verifyResult.success && verifyResult.data) {
                        this.currentUser = verifyResult.data;
                        // 检查跨天（使用本地时间，不是 UTC）
                        const today = new Date().toLocaleDateString('sv-SE');
                        if (this.currentUser.lastDate !== today) {
                            this.currentUser.completedToday = 0;
                            this.currentUser.lastDate = today;
                            await dbUpdate(COLLECTIONS.USERS, this.currentUser._id, {
                                completedToday: 0,
                                lastDate: today,
                            });
                            this._saveToLocalStorage();
                        }
                        console.log(`✅ 用户登录成功: ${username} (已验证云端数据)`);
                        return { success: true, user: this.currentUser };
                    }
                }
            } catch (e) {
                // 解析失败，继续创建新用户
            }
        }

        // 用 username 查询是否存在
        const result = await dbQuery(COLLECTIONS.USERS, { username: username });

        if (result.success && result.data.length > 0) {
            this.currentUser = result.data[0];
            this._ensureFields(this.currentUser);

            // 检查跨天（使用本地时间，不是 UTC）
            const today = new Date().toLocaleDateString('sv-SE');
            if (this.currentUser.lastDate !== today) {
                this.currentUser.completedToday = 0;
                this.currentUser.lastDate = today;
                await dbUpdate(COLLECTIONS.USERS, this.currentUser._id, {
                    completedToday: 0,
                    lastDate: today,
                });
            }
        } else {
            // 创建新用户
            const addResult = await dbAdd(COLLECTIONS.USERS, {
                username: username,
                role: role,
                score: 0,
                totalEarned: 0,
                totalSpent: 0,
                taskCount: 0,
                completedToday: 0,
                lastDate: null,
            });

            if (addResult.success) {
                this.currentUser = {
                    _id: addResult.id,
                    username: username,
                    role: role,
                    score: 0,
                    totalEarned: 0,
                    totalSpent: 0,
                    taskCount: 0,
                    completedToday: 0,
                    lastDate: null,
                };
            } else {
                return addResult;
            }
        }

        // 缓存到 localStorage（只存业务字段，去掉云开发元数据）
        const saveData = {
            _id: this.currentUser._id,
            username: this.currentUser.username,
            role: this.currentUser.role,
            score: this.currentUser.score,
            totalEarned: this.currentUser.totalEarned,
            totalSpent: this.currentUser.totalSpent,
            taskCount: this.currentUser.taskCount,
            completedToday: this.currentUser.completedToday,
            lastDate: this.currentUser.lastDate,
        };
        this._saveToLocalStorage();
        console.log(`✅ 用户登录成功: ${username} (角色: ${role}, _id: ${this.currentUser._id})`);
        return { success: true, user: this.currentUser };
    },

    /**
     * 将用户数据存入 localStorage（只存业务字段）
     */
    _saveToLocalStorage() {
        const u = this.currentUser;
        if (!u) return;
        const saveData = {
            _id: u._id, username: u.username, role: u.role,
            score: u.score, totalEarned: u.totalEarned,
            totalSpent: u.totalSpent, taskCount: u.taskCount,
            completedToday: u.completedToday, lastDate: u.lastDate,
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saveData));
    },

    /**
     * 确保用户数据字段完整
     */
    _ensureFields(user) {
        if (!user) return;
        user.score = typeof user.score === 'number' && !isNaN(user.score) ? user.score : 0;
        user.totalEarned = typeof user.totalEarned === 'number' && !isNaN(user.totalEarned) ? user.totalEarned : 0;
        user.totalSpent = typeof user.totalSpent === 'number' && !isNaN(user.totalSpent) ? user.totalSpent : 0;
        user.taskCount = typeof user.taskCount === 'number' && !isNaN(user.taskCount) ? user.taskCount : 0;
        user.completedToday = typeof user.completedToday === 'number' && !isNaN(user.completedToday) ? user.completedToday : 0;
        user.lastDate = user.lastDate || null;
    },

    /**
     * 用户登出
     */
    logout() {
        this.currentUser = null;
        localStorage.removeItem(this.STORAGE_KEY);
        console.log('👋 用户已登出');
    },

    /**
     * 获取当前用户
     */
    getCurrentUser() {
        if (this.currentUser) return this.currentUser;

        const cached = localStorage.getItem(this.STORAGE_KEY);
        console.log('🔍 getCurrentUser localStorage:', cached, typeof cached);
        if (cached) {
            try {
                let parsed = JSON.parse(cached);
                // 如果是数组（脏数据），取最后一个
                if (Array.isArray(parsed)) {
                    console.warn('⚠️ localStorage 中是数组，取最后一个');
                    parsed = parsed[parsed.length - 1];
                }
                if (typeof parsed !== 'object' || parsed === null) {
                    console.warn('⚠️ localStorage 数据格式异常');
                    localStorage.removeItem(this.STORAGE_KEY);
                    return null;
                }
                // 腾讯云云开发会把数据包装在 data 字段里
                // 外层有 _id 和 _openid，data 里有业务字段
                if (parsed.data && typeof parsed.data === 'object') {
                    // 合并外层 _id 到 data 里
                    const outerId = parsed._id;
                    parsed.data._id = outerId; // 优先用云返回的 _id
                    parsed = parsed.data;
                }
                this.currentUser = parsed;
                this._ensureFields(this.currentUser);
                return this.currentUser;
            } catch (e) {
                localStorage.removeItem(this.STORAGE_KEY);
            }
        }
        return null;
    },

    isLoggedIn() {
        return this.getCurrentUser() !== null;
    },

    getUsername() {
        const user = this.getCurrentUser();
        return user ? user.username : '';
    },

    /**
     * 增加用户积分
     */
    async addScore(amount, reason = '', type = 'manual') {
        const user = this.getCurrentUser();
        if (!user) {
            return { success: false, error: '用户未登录' };
        }

        // 确保 score 是有效数字
        if (typeof user.score !== 'number' || isNaN(user.score)) {
            user.score = 0;
            this._saveToLocalStorage();
        }

        const isPositive = amount > 0;
        const absAmount = Math.abs(amount);

        try {
            const updateData = {
                score: user.score + amount,
                _updateTime: new Date().toISOString(),
            };

            if (isPositive) {
                updateData.totalEarned = user.totalEarned + absAmount;
                if (type === 'task') {
                    updateData.taskCount = user.taskCount + 1;
                    updateData.completedToday = user.completedToday + 1;
                }
            } else {
                updateData.totalSpent = user.totalSpent + absAmount;
            }

            const updateResult = await dbUpdate(COLLECTIONS.USERS, user._id, updateData);
            if (!updateResult.success) return updateResult;

            // 更新内存和本地缓存
            user.score = updateData.score;
            if (isPositive) {
                user.totalEarned = updateData.totalEarned;
                if (type === 'task') {
                    user.taskCount = updateData.taskCount;
                    user.completedToday = updateData.completedToday;
                }
            } else {
                user.totalSpent = updateData.totalSpent;
            }
            this._saveToLocalStorage();

            // 记录积分日志
            const logTime = new Date();
            const logResult = await dbAdd(COLLECTIONS.LOGS, {
                userId: user._id,
                username: user.username,
                amount: amount,
                reason: reason,
                type: type,
                balanceAfter: user.score,
                createTime: logTime.toISOString(),
                localDate: logTime.toLocaleDateString('sv-SE'),
            });

            console.log(`📊 积分变动: ${isPositive ? '+' : ''}${amount} (${reason}), 当前: ${user.score}`);
            return { success: true, amount: amount, balance: user.score };
        } catch (error) {
            console.error('❌ 积分变动失败:', error);
            return { success: false, error: error.message || String(error) };
        }
    },

    /**
     * 刷新当前用户数据（从云端读取最新数据）
     */
    async refreshUser() {
        const user = this.getCurrentUser();
        if (!user) {
            return { success: false, error: '用户未登录' };
        }

        // 优先用 _id 查询（比 username 查询更可靠）
        let result;
        if (user._id) {
            result = await dbGetById(COLLECTIONS.USERS, user._id);
            if (result.success && result.data) {
                this.currentUser = result.data;
                this._ensureFields(this.currentUser);

                // 检查跨天（使用本地时间，不是 UTC）
                const today = new Date().toLocaleDateString('sv-SE');
                if (this.currentUser.lastDate !== today) {
                    this.currentUser.completedToday = 0;
                    this.currentUser.lastDate = today;
                    await dbUpdate(COLLECTIONS.USERS, this.currentUser._id, {
                        completedToday: 0,
                        lastDate: today,
                    });
                }
                this._saveToLocalStorage();
                return { success: true, user: this.currentUser };
            }
        }

        // _id 查不到，降级用 username 查询
        if (user.username) {
            result = await dbQuery(COLLECTIONS.USERS, { username: user.username });
            if (result.success && result.data && result.data.length > 0) {
                this.currentUser = result.data[0];
                this._ensureFields(this.currentUser);

                // 检查跨天（使用本地时间，不是 UTC）
                const today = new Date().toLocaleDateString('sv-SE');
                if (this.currentUser.lastDate !== today) {
                    this.currentUser.completedToday = 0;
                    this.currentUser.lastDate = today;
                }
                this._saveToLocalStorage();
                return { success: true, user: this.currentUser };
            }
        }

        return { success: false, error: '获取用户数据失败' };
    },
};
