// ============================================
// 小孩激励积分 - 首页（积分展示）
// ============================================

Pages.home = Pages.home || {};

Pages.home = {
    /**
     * 初始化首页
     */
    async init() {
        const container = document.getElementById('home-content');
        if (!container) return;

        APP.showLoading();

        // 刷新用户数据
        const refreshResult = await AUTH.refreshUser();
        const user = AUTH.getCurrentUser();

        APP.hideLoading();

        if (!user) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">😴</div><p>请先登录</p></div>';
            return;
        }

        // 获取任务统计
        const tasksResult = await dbQuery(COLLECTIONS.TASKS, familyQuery(user.familyId));
        const totalTasks = tasksResult.success ? tasksResult.data.length : 0;

        // 获取今日已完成任务
        const logsResult = await dbQueryLogsPaged(user._id, 2, 500);
        let completedToday = 0;
        if (logsResult.success && logsResult.data.length > 0) {
            const today = new Date().toLocaleDateString('sv-SE');
            completedToday = logsResult.data.filter(log => {
                if (log.type !== 'task') return false;
                if (log.localDate === today) return true;
                const time = log.createTime || log._createTime || '';
                return time && time.startsWith(today);
            }).length;
        }

        container.innerHTML = `
            <!-- 积分展示 -->
            <div class="score-display animate-pop">
                <div class="score-number" id="home-score">${user.score}</div>
                <div class="score-label">💰 ${user.username} 的积分</div>
            </div>

            <!-- 统计格 -->
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-icon">📅</div>
                    <div class="stat-value">${completedToday}</div>
                    <div class="stat-label">今日完成</div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon">🏆</div>
                    <div class="stat-value">${user.taskCount || 0}</div>
                    <div class="stat-label">累计完成</div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-value">${user.totalEarned || 0}</div>
                    <div class="stat-label">累计获得</div>
                </div>
                <div class="stat-item">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-value">${totalTasks}</div>
                    <div class="stat-label">全部任务</div>
                </div>
            </div>

            <!-- 今日任务进度 -->
            <div class="card">
                <div class="card-header">
                    <span class="card-title">📊 今日进度</span>
                </div>
                <div style="background:#F0F4F8; border-radius:12px; height:20px; overflow:hidden; margin-top:8px;">
                    <div id="home-progress-bar" style="height:100%; background:linear-gradient(90deg, var(--primary), var(--accent-orange)); border-radius:12px; transition:width 0.5s ease; width: 0%;"></div>
                </div>
                <div style="display:flex; justify-content:space-between; margin-top:8px; font-size:0.85rem; color:var(--text-secondary);">
                    <span>已完成 ${completedToday} 个</span>
                    <span>共 ${totalTasks} 个任务</span>
                </div>
            </div>

            <!-- 快速入口 -->
            <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 12px;">
                <div class="card" style="text-align:center; cursor:pointer; margin:0;" onclick="APP.navigateTo('tasks')">
                    <div style="font-size:2rem;">📋</div>
                    <div style="font-size:0.85rem; margin-top:4px; color:var(--text-secondary);">完成任务</div>
                </div>
                <div class="card" style="text-align:center; cursor:pointer; margin:0;" onclick="APP.navigateTo('rewards')">
                    <div style="font-size:2rem;">🎁</div>
                    <div style="font-size:0.85rem; margin-top:4px; color:var(--text-secondary);">兑换奖励</div>
                </div>
                <div class="card" style="text-align:center; cursor:pointer; margin:0;" onclick="APP.navigateTo('lottery')">
                    <div style="font-size:2rem;">🎰</div>
                    <div style="font-size:0.85rem; margin-top:4px; color:var(--text-secondary);">幸运抽奖</div>
                </div>
            </div>
        `;

        // 更新进度条
        if (totalTasks > 0) {
            const progressPercent = Math.min(100, Math.round((completedToday / totalTasks) * 100));
            const progressBar = document.getElementById('home-progress-bar');
            if (progressBar) {
                setTimeout(() => {
                    progressBar.style.width = progressPercent + '%';
                }, 100);
            }
        }
    },
};
