// ============================================
// 小孩激励积分 - 用户认证模块
// ============================================

const AUTH = {
    currentUser: null,
    STORAGE_KEY: 'reward_app_user',
    KNOWN_USERS_KEY: 'reward_app_known_users',

    /**
     * 用户登录
     * @param {string} username - 昵称
     * @param {string} role - 'child' 或 'parent'
     * @param {string} familyCode - 可选，加入家庭时填的 6 位家庭码
     */
    async login(username, role = 'child', familyCode = '') {
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
                        this._ensureFields(this.currentUser);
                        // 检查跨天
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

                        // 老用户没有 familyId 时自动生成（升级兼容）
                        if (!this.currentUser.familyId) {
                            this.currentUser.familyId = crypto.randomUUID();
                            this.currentUser.familyCode = generateFamilyCode();
                            await dbUpdate(COLLECTIONS.USERS, this.currentUser._id, {
                                familyId: this.currentUser.familyId,
                                familyCode: this.currentUser.familyCode,
                            });
                            this._saveToLocalStorage();
                        }

                        this.addKnownUser(this.currentUser);
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

            // 检查跨天
            const today = new Date().toLocaleDateString('sv-SE');
            if (this.currentUser.lastDate !== today) {
                this.currentUser.completedToday = 0;
                this.currentUser.lastDate = today;
                await dbUpdate(COLLECTIONS.USERS, this.currentUser._id, {
                    completedToday: 0,
                    lastDate: today,
                });
            }

            // 老用户没有 familyId 时自动生成（升级兼容）
            if (!this.currentUser.familyId) {
                this.currentUser.familyId = crypto.randomUUID();
                this.currentUser.familyCode = generateFamilyCode();
                await dbUpdate(COLLECTIONS.USERS, this.currentUser._id, {
                    familyId: this.currentUser.familyId,
                    familyCode: this.currentUser.familyCode,
                });
            }
        } else {
            // 新用户：决定是加入家庭还是创建新家庭
            let targetFamilyId = '';
            let targetFamilyCode = '';

            if (familyCode) {
                // 找同家庭码的已有用户
                const familyResult = await dbQuery(COLLECTIONS.USERS, { familyCode: familyCode.toUpperCase() });
                if (familyResult.success && familyResult.data.length > 0) {
                    targetFamilyId = familyResult.data[0].familyId || '';
                    targetFamilyCode = familyCode.toUpperCase();
                } else {
                    return { success: false, error: '家庭码无效，请检查后重试' };
                }
            } else {
                // 创建新家庭
                targetFamilyId = crypto.randomUUID();
                targetFamilyCode = generateFamilyCode();
            }

            const addResult = await dbAdd(COLLECTIONS.USERS, {
                username: username,
                role: role,
                familyId: targetFamilyId,
                familyCode: targetFamilyCode,
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
                    familyId: targetFamilyId,
                    familyCode: targetFamilyCode,
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

        // 保存到 knownUsers
        this.addKnownUser(this.currentUser);
        this._saveToLocalStorage();

        console.log(`✅ 用户登录成功: ${username} (角色: ${role}, _id: ${this.currentUser._id}, familyId: ${this.currentUser.familyId})`);
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
            familyId: u.familyId, familyCode: u.familyCode,
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
        user.familyId = user.familyId || '';
        user.familyCode = user.familyCode || '';
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

                // 老用户没有 familyId 时自动生成
                if (!this.currentUser.familyId) {
                    this.currentUser.familyId = crypto.randomUUID();
                    this.currentUser.familyCode = generateFamilyCode();
                    await dbUpdate(COLLECTIONS.USERS, this.currentUser._id, {
                        familyId: this.currentUser.familyId,
                        familyCode: this.currentUser.familyCode,
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

                // 老用户没有 familyId 时自动生成
                if (!this.currentUser.familyId) {
                    this.currentUser.familyId = crypto.randomUUID();
                    this.currentUser.familyCode = generateFamilyCode();
                    await dbUpdate(COLLECTIONS.USERS, this.currentUser._id, {
                        familyId: this.currentUser.familyId,
                        familyCode: this.currentUser.familyCode,
                    });
                }

                this._saveToLocalStorage();
                return { success: true, user: this.currentUser };
            }
        }

        return { success: false, error: '获取用户数据失败' };
    },

    // ========== 家庭与用户切换 ==========

    /**
     * 获取已知用户列表（同一设备登录过的家庭成员）
     */
    getKnownUsers() {
        try {
            const data = localStorage.getItem(this.KNOWN_USERS_KEY);
            const users = data ? JSON.parse(data) : [];
            return Array.isArray(users) ? users : [];
        } catch {
            return [];
        }
    },

    /**
     * 添加用户到已知用户列表
     */
    addKnownUser(user) {
        if (!user || !user._id) return;
        const users = this.getKnownUsers().filter(u => u._id !== user._id);
        users.push({
            _id: user._id,
            username: user.username,
            role: user.role || 'child',
            familyId: user.familyId || '',
        });
        localStorage.setItem(this.KNOWN_USERS_KEY, JSON.stringify(users));
    },

    /**
     * 从已知用户列表中移除
     */
    removeKnownUser(userId) {
        const users = this.getKnownUsers().filter(u => u._id !== userId);
        localStorage.setItem(this.KNOWN_USERS_KEY, JSON.stringify(users));
    },

    /**
     * 一键切换到另一个已知用户
     */
    async switchToUser(userId) {
        const result = await dbGetById(COLLECTIONS.USERS, userId);
        if (result.success && result.data) {
            this.currentUser = result.data;
            this._ensureFields(this.currentUser);

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
        return { success: false, error: '找不到该用户' };
    },

    /**
     * 添加家庭成员（快速创建同家庭的新用户）
     */
    async addFamilyMember(username, role = 'child') {
        const user = this.getCurrentUser();
        if (!user) {
            return { success: false, error: '请先登录' };
        }
        if (!username || !username.trim()) {
            return { success: false, error: '请输入昵称' };
        }
        username = username.trim();

        // 先检查用户名是否已被占用
        const existing = await dbQuery(COLLECTIONS.USERS, { username });
        if (existing.success && existing.data.length > 0) {
            return { success: false, error: '该昵称已被使用' };
        }

        // 确保当前用户有 familyId
        let familyId = user.familyId;
        let familyCode = user.familyCode || '';
        if (!familyId) {
            familyId = crypto.randomUUID();
            familyCode = generateFamilyCode();
            // 更新当前用户的 familyId
            await dbUpdate(COLLECTIONS.USERS, user._id, { familyId, familyCode });
            user.familyId = familyId;
            user.familyCode = familyCode;
            this._saveToLocalStorage();
        }

        const addResult = await dbAdd(COLLECTIONS.USERS, {
            username: username,
            role: role,
            familyId: familyId,
            familyCode: familyCode,
            score: 0,
            totalEarned: 0,
            totalSpent: 0,
            taskCount: 0,
            completedToday: 0,
            lastDate: null,
        });

        if (addResult.success) {
            const newUser = {
                _id: addResult.id,
                username: username,
                role: role,
                familyId: familyId,
                familyCode: familyCode,
                score: 0,
                totalEarned: 0,
                totalSpent: 0,
                taskCount: 0,
                completedToday: 0,
                lastDate: null,
            };
            this.addKnownUser(newUser);
            return { success: true, user: newUser };
        }
        return { success: false, error: addResult.error || '创建失败' };
    },
};
