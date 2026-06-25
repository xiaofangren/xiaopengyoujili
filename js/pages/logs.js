// ============================================
// 小孩激励积分 - 积分记录 / 我的页面（日历视图）
// ============================================

Pages.logs = Pages.logs || {};

/**
 * 获取指定年月日历的天数信息
 */
function getCalendarDays(year, month) {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDayOfWeek = firstDay.getDay(); // 0=Sun
    const totalDays = lastDay.getDate();

    const days = [];
    // 填充上个月的空白
    for (let i = 0; i < startDayOfWeek; i++) {
        days.push(null);
    }
    // 填充当月天数
    for (let d = 1; d <= totalDays; d++) {
        days.push(d);
    }
    return days;
}

/**
 * 格式化 YYYY-MM-DD
 */
function formatDateStr(year, month, day) {
    const m = String(month).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
}

Pages.logs = {
    activeTab: 'logs', // logs(记录) | settings(设置)
    selectedDate: null,  // 'YYYY-MM-DD'，null 表示今天
    viewYear: new Date().getFullYear(),
    viewMonth: new Date().getMonth() + 1,
    allLogs: null,       // 缓存全部日志

    /**
     * 初始化"我的"页面
     */
    async init() {
        this.selectedDate = formatDateStr(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            new Date().getDate()
        );
        await this.refreshLogs();
        this.render();
        this.bindEvents();
    },

    /**
     * 从云端刷新全部日志（查最近 90 天，按时间倒序）
     */
    async refreshLogs() {
        const user = AUTH.getCurrentUser();
        if (!user) return;
        const result = await dbQueryLogsPaged(user._id, 90, 500);
        this.allLogs = result.success ? result.data : [];
    },

    /**
     * 按日期筛选日志
     */
    getLogsByDate(dateStr) {
        if (!this.allLogs) return [];
        return this.allLogs.filter(log => {
            if (log.localDate === dateStr) return true;
            const time = log.createTime || log._createTime || log._updateTime || '';
            if (!time) return false;
            const logTime = new Date(time);
            const start = new Date(dateStr + 'T00:00:00');
            const end = new Date(dateStr + 'T23:59:59.999');
            return logTime >= start && logTime <= end;
        });
    },

    /**
     * 获取某天的总积分
     */
    getDayTotal(dateStr) {
        const logs = this.getLogsByDate(dateStr);
        return logs.reduce((sum, log) => sum + log.amount, 0);
    },

    /**
     * 获取有记录的日期集合 { 'DD': true }
     */
    getDaysWithLogs() {
        const days = new Set();
        const targetPrefix = `${this.viewYear}-${String(this.viewMonth).padStart(2, '0')}`;

        this.allLogs.forEach(log => {
            // 优先用 localDate
            const localDate = log.localDate || log._createTime || log._updateTime || '';
            if (!localDate) return;
            if (localDate.startsWith(targetPrefix + '-')) {
                const d = parseInt(localDate.substring(8, 10), 10);
                if (!isNaN(d)) days.add(d);
            }
            // 降级：用 createTime 做时区转换
            const createTime = log.createTime || '';
            if (createTime) {
                const logTime = new Date(createTime);
                const localStr = logTime.toLocaleDateString('sv-SE');
                if (localStr.startsWith(targetPrefix)) {
                    const d = parseInt(localStr.substring(8, 10), 10);
                    if (!isNaN(d)) days.add(d);
                }
            }
        });
        return days;
    },

    /**
     * 渲染"我的"页面
     */
    async render() {
        const container = document.getElementById('logs-content');
        if (!container) return;

        const user = AUTH.getCurrentUser();
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
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1;
            const todayDate = now.getDate();

            const year = this.viewYear;
            const month = this.viewMonth;

            // 计算上一年/下一年月份
            const prevMonth = month === 1 ? `${currentYear - 1}-12` : `${year}-${String(month - 1).padStart(2, '0')}`;
            const nextMonth = month === 12 ? `${currentYear + 1}-01` : `${year}-${String(month + 1).padStart(2, '0')}`;

            // 月份标题
            html += `
                <div class="card" style="margin-bottom:16px;">
                    <div style="display:flex; align-items:center; justify-content:space-between;">
                        <button class="btn btn-outline btn-small" id="cal-prev-month" data-month="${prevMonth}" style="padding:6px 14px; min-height:32px;">◀</button>
                        <span style="font-size:1.2rem; font-weight:800;" id="cal-month-title">${year}年${month}月</span>
                        <button class="btn btn-outline btn-small" id="cal-next-month" data-month="${nextMonth}" style="padding:6px 14px; min-height:32px;">▶</button>
                    </div>
                </div>
            `;

            // 日历视图
            const days = getCalendarDays(year, month);
            const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
            const hasLogs = this.getDaysWithLogs();

            html += '<div class="card" style="margin-bottom:16px;">';
            // 星期标题行
            html += '<div style="display:grid; grid-template-columns: repeat(7, 1fr); gap:2px; margin-bottom:4px;">';
            weekDays.forEach(wd => {
                html += `<div style="text-align:center; font-size:0.78rem; color:var(--text-secondary); font-weight:700; padding:4px 0;">${wd}</div>`;
            });
            html += '</div>';

            // 日期网格
            html += '<div style="display:grid; grid-template-columns: repeat(7, 1fr); gap:4px;">';
            days.forEach(d => {
                if (!d) {
                    html += '<div></div>'; // 空白
                    return;
                }

                const dateStr = formatDateStr(year, month, d);
                const isToday = (year === currentYear && month === currentMonth && d === todayDate);
                const isSelected = (dateStr === this.selectedDate);
                const hasLog = hasLogs.has(d);
                const dayTotal = this.getDayTotal(dateStr);

                let dayClass = 'cal-day';
                if (isToday) dayClass += ' cal-day-today';
                if (isSelected) dayClass += ' cal-day-selected';

                html += `
                    <div class="${dayClass}" data-date="${dateStr}" data-day="${d}">
                        <div style="text-align:center;">
                            <span style="display:inline-flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:50%; font-size:0.95rem; font-weight:${isSelected ? '800' : (isToday ? '700' : '500')}; ${isSelected ? 'background:var(--primary); color:#fff;' : (isToday ? 'color:var(--primary);' : '')}">${d}</span>
                        </div>
                    </div>
                `;
            });
            html += '</div></div>';

            // 选中日期的记录
            const dayTotal = this.getDayTotal(this.selectedDate);
            html += `
                <div style="text-align:center; margin-bottom:16px; padding:10px 0; background:linear-gradient(135deg, #667eea20, #764ba220); border-radius:12px;">
                    <span style="font-size:1.1rem; font-weight:800; color:${dayTotal >= 0 ? 'var(--success)' : 'var(--danger)'};">
                        💪 今日总分 &nbsp;${dayTotal > 0 ? '+' : ''}${dayTotal} 积分
                    </span>
                </div>
            `;
            html += '<div id="cal-logs-list">';

            const selectedLogs = this.getLogsByDate(this.selectedDate);
            if (selectedLogs.length > 0) {
                // 按时间倒序（新的在最上面），与 dbQueryLogsPaged 查询顺序一致
                const sortedLogs = [...selectedLogs];
                sortedLogs.forEach(log => {
                    const isPositive = log.amount > 0;
                    const time = log.createTime || log._createTime || '';
                    const displayTime = time ? new Date(time).toLocaleString('zh-CN', {
                        month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                    }) : '';

                    let icon = '📝';
                    if (log.type === 'task') icon = '✅';
                    else if (log.type === 'reward') icon = '🎁';
                    else if (log.type === 'lottery') icon = '🎰';
                    else if (log.type === 'manual') icon = '➕';

                    html += `
                        <div class="log-item">
                            <div class="log-icon">${icon}</div>
                            <div class="log-info">
                                <div class="log-desc">${log.reason || '积分变动'}</div>
                                <div class="log-time">${displayTime}</div>
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
                        <div class="empty-state-icon">📅</div>
                        <p class="empty-state-text">这一天还没有积分记录</p>
                    </div>
                `;
            }
            html += '</div>';
        } else {
            // 设置页面（保持不变）
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

        const self = this;

        container.addEventListener('click', (e) => {
            // 分段选择器
            const segmentBtn = e.target.closest('.segment-btn');
            if (segmentBtn) {
                SOUND.click();
                self.activeTab = segmentBtn.dataset.tab;
                self.render();
                return;
            }

            // 日历日期点击
            const calDay = e.target.closest('.cal-day');
            if (calDay) {
                SOUND.click();
                self.selectedDate = calDay.dataset.date;
                self.render();
                return;
            }

            // 月份切换
            const prevBtn = e.target.closest('#cal-prev-month');
            const nextBtn = e.target.closest('#cal-next-month');
            if (prevBtn) {
                SOUND.tabSwitch();
                self.viewMonth--;
                if (self.viewMonth < 1) {
                    self.viewMonth = 12;
                    self.viewYear--;
                }
                self.render();
                return;
            }
            if (nextBtn) {
                SOUND.tabSwitch();
                self.viewMonth++;
                if (self.viewMonth > 12) {
                    self.viewMonth = 1;
                    self.viewYear++;
                }
                self.render();
                return;
            }
        });
    },

    /**
     * 手动添加积分
     */
    showAddScoreModal() {
        SOUND.edit();
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
                    await this.refreshLogs();
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
                SOUND.click();
                APP.showToast('✅ 今日完成数已重置');
                await this.refreshLogs();
                this.render();
            }
        });
    },

    /**
     * 导出数据（简单 JSON 格式）
     */
    showDataModal() {
        SOUND.edit();
        const user = AUTH.getCurrentUser();
        if (!user) return;

        APP.showConfirm(
            '导出数据',
            '将导出你的积分数据到剪贴板，方便备份。',
            async () => {
                const logsResult = await dbQueryLogsPaged(user._id, 365, 500);
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
        SOUND.click();
        APP.showConfirm('退出登录', '确定要退出登录吗？', () => {
            AUTH.logout();
            APP.navigateTo('login');
            APP.showToast('已退出登录');
        });
    },
};
