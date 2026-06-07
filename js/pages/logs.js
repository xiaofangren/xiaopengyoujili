// ============================================
// 小孩激励积分 - 积分记录 / 我的页面
// ============================================

Pages.logs = Pages.logs || {};

Pages.logs = {
    activeTab: 'logs', // logs(记录) | settings(设置)

    /**
     * 初始化"我的"页面
     */
    async init() {
        this.render();
        this.bindEvents();
    },

    /**
     * 渲染"我的"页面
     */
    async render() {
        const container = document.getElementById('logs-content');
        if (!container) return;

        const user = AUTH.getCurrentUser();
        console.log('🔍 logs.js - getCurrentUser:', user);
        if (!user) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">😴</div><p>请先登录</p></div>';
            return;
        }

        let html = `
            <!-- 用户信息 -->
            <div class="card" style="text-align:center; padding:24px;">
                <div style="font-size:3rem; margin-bottom:8px;">👤</div>
                <div style="font-size:1.4rem; font-weight:700;">${user.username}</div>
                <div style="font-size:0.9rem; color:var(--text-secondary); margin-top:4px;">
                    📅 累计完成任务 ${user.taskCount || 0} 个
                </div>
            </div>

            <!-- 分段选择器 -->
            <div class="segmented-control">
                <button class="segment-btn ${this.activeTab === 'logs' ? 'active' : ''}" data-tab="logs">📋 积分记录</button>
                <button class="segment-btn ${this.activeTab === 'settings' ? 'active' : ''}" data-tab="settings">⚙️ 设置</button>
            </div>
        `;

        if (this.activeTab === 'logs') {
            // 获取积分记录
            console.log('🔍 查询积分记录, userId:', user._id);
            const logsResult = await dbQuery(COLLECTIONS.LOGS, {
                userId: user._id,
            });
            console.log('🔍 积分记录结果:', logsResult);

            html += '<div id="logs-list">';
            if (logsResult.success && logsResult.data.length > 0) {
                // 按时间倒序
                const sortedLogs = [...logsResult.data].reverse();
                sortedLogs.forEach(log => {
                    const isPositive = log.amount > 0;
                    const time = log._createTime ? new Date(log._createTime).toLocaleString('zh-CN', {
                        month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                    }) : '';

                    let icon = '📝';
                    if (log.type === 'task') icon = '✅';
                    else if (log.type === 'reward') icon = '🎁';
                    else if (log.type === 'lottery') icon = '🎰';

                    html += `
                        <div class="log-item">
                            <div class="log-icon">${icon}</div>
                            <div class="log-info">
                                <div class="log-desc">${log.reason || '积分变动'}</div>
                                <div class="log-time">${time}</div>
                            </div>
                            <div class="log-amount ${isPositive ? 'positive' : 'negative'}">
                                ${isPositive ? '+' : ''}${log.amount}
                            </div>
                        </div>
                    `;
                });
            } else {
                html += `
                    <div class="empty-state">
                        <div class="empty-state-icon">📝</div>
                        <p class="empty-state-text">还没有积分记录</p>
                        <p class="empty-state-text" style="margin-top:8px; font-size:0.85rem;">
                            完成任务即可赚取积分哦！
                        </p>
                    </div>
                `;
            }
            html += '</div>';
        } else {
            // 设置页面
            html += `
                <div id="settings-content">
                    <!-- 积分概览 -->
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-icon">💰</div>
                            <div class="stat-value">${user.score}</div>
                            <div class="stat-label">当前积分</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-icon">⭐</div>
                            <div class="stat-value">${user.totalEarned || 0}</div>
                            <div class="stat-label">累计获得</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-icon">🎁</div>
                            <div class="stat-value">${user.totalSpent || 0}</div>
                            <div class="stat-label">累计消耗</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-icon">🏆</div>
                            <div class="stat-value">${user.taskCount || 0}</div>
                            <div class="stat-label">完成任务</div>
                        </div>
                    </div>

                    <!-- 管理功能 -->
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">🔧 管理功能</span>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:12px; margin-top:12px;">
                            <button class="btn btn-outline" onclick="Pages.logs.showAddScoreModal()" style="justify-content:flex-start;">
                                ➕ 手动添加积分
                            </button>
                            <button class="btn btn-outline" onclick="Pages.logs.resetToday()" style="justify-content:flex-start;">
                                🔄 重置今日完成数
                            </button>
                            <button class="btn btn-outline" onclick="Pages.logs.showDataModal()" style="justify-content:flex-start;">
                                📤 导出数据
                            </button>
                        </div>
                    </div>

                    <!-- 退出登录 -->
                    <div style="margin-top:24px; text-align:center;">
                        <button class="btn btn-warning" onclick="Pages.logs.logout()" style="width:100%;">
                            🚪 退出登录
                        </button>
                    </div>
                </div>
            `;
        }

        container.innerHTML = html;
    },

    /**
     * 绑定事件
     */
    bindEvents() {
        const container = document.getElementById('logs-content');
        if (!container) return;

        container.addEventListener('click', (e) => {
            const segmentBtn = e.target.closest('.segment-btn');
            if (segmentBtn) {
                this.activeTab = segmentBtn.dataset.tab;
                this.render();
            }
        });
    },

    /**
     * 手动添加积分
     */
    showAddScoreModal() {
        APP.showFormModal({
            title: '➕ 手动添加积分',
            fields: [
                { name: 'amount', label: '积分数', type: 'number', placeholder: '10', required: true },
                { name: 'reason', label: '原因', type: 'text', placeholder: '例如：考试得了满分', required: true, maxLength: 50 },
            ],
            onSubmit: async (values) => {
                const amount = parseInt(values.amount);
                if (amount <= 0) {
                    APP.showToast('请输入有效积分数');
                    return;
                }
                const result = await AUTH.addScore(amount, values.reason, 'manual');
                if (result.success) {
                    APP.showToast(`✅ 成功添加 ${amount} 积分！`);
                    this.render();
                } else {
                    APP.showToast('操作失败：' + result.error);
                }
            },
        });
    },

    /**
     * 重置今日完成数
     */
    resetToday() {
        APP.showConfirm('重置今日完成数', '确定要重置今日的任务完成计数吗？这不会影响积分。', async () => {
            const user = AUTH.getCurrentUser();
            if (user) {
                await dbUpdate(COLLECTIONS.USERS, user._id, { completedToday: 0 });
                user.completedToday = 0;
                AUTH._saveToLocalStorage();
                APP.showToast('✅ 今日完成数已重置');
                this.render();
            }
        });
    },

    /**
     * 导出数据（简单 JSON 格式）
     */
    showDataModal() {
        const user = AUTH.getCurrentUser();
        if (!user) return;

        APP.showConfirm(
            '导出数据',
            '将导出你的积分数据到剪贴板，方便备份。',
            async () => {
                const logsResult = await dbQuery(COLLECTIONS.LOGS, { userId: user._id });
                const data = {
                    user: user,
                    logs: logsResult.success ? logsResult.data : [],
                    exportTime: new Date().toISOString(),
                };

                try {
                    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
                    APP.showToast('✅ 数据已复制到剪贴板');
                } catch (e) {
                    APP.showToast('复制失败，请手动截图');
                }
            }
        );
    },

    /**
     * 退出登录
     */
    logout() {
        APP.showConfirm('退出登录', '确定要退出登录吗？', () => {
            AUTH.logout();
            APP.navigateTo('login');
            APP.showToast('已退出登录');
        });
    },
};
