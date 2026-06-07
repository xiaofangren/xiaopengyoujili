// ============================================
// 小孩激励积分 - 任务管理
// ============================================

Pages.tasks = Pages.tasks || {};

// 任务分类图标映射
const TASK_CATEGORIES = {
    study: { icon: '📚', color: '#74B9FF' },
    life: { icon: '🏠', color: '#A8E6CF' },
    sports: { icon: '⚽', color: '#FFB347' },
    behavior: { icon: '⭐', color: '#FFE66D' },
    custom: { icon: '✨', color: '#C9B1FF' },
};

// 今天已完成任务追踪（从云端 logs 集合查询，多设备同步）
async function getCompletedToday() {
    const user = AUTH.getCurrentUser();
    if (!user || !user._id) return new Set();

    try {
        // 查询今天所有 task 类型的日志
        const result = await dbQuery(COLLECTIONS.LOGS, {
            userId: user._id,
            type: 'task',
        });
        if (result.success && result.data.length > 0) {
            const today = new Date().toISOString().slice(0, 10);
            const names = [];
            result.data.forEach(log => {
                // 用 _createTime 或 _updateTime 判断是否今天
                const time = log._createTime || log._updateTime || '';
                const isToday = time.startsWith(today);
                if (isToday && log.reason && log.reason.startsWith('完成任务：')) {
                    names.push(log.reason.replace('完成任务：', ''));
                }
            });
            console.log('📋 今日已完成任务:', names);
            return new Set(names);
        }
    } catch (e) {
        console.warn('⚠️ 查询今日已完成任务失败:', e);
    }
    return new Set();
}

Pages.tasks = {
    longPressTimer: null,
    completedCache: null,

    async init() {
        this.completedCache = await getCompletedToday();
        await this.render();
    },

    async render() {
        const container = document.getElementById('tasks-content');
        if (!container) return;

        APP.showLoading();

        const user = AUTH.getCurrentUser();
        if (!user) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">😴</div><p>请先登录</p></div>';
            APP.hideLoading();
            return;
        }

        if (!this.completedCache || this.completedCache.size === undefined) {
            this.completedCache = await getCompletedToday();
        }

        const tasksResult = await dbQuery(COLLECTIONS.TASKS, {});
        const tasks = tasksResult.success ? tasksResult.data : [];

        APP.hideLoading();

        let html = `
            <div class="card" style="margin-bottom:16px;">
                <div style="display:flex; align-items:center; justify-content:space-between;">
                    <div>
                        <div style="font-size:0.85rem; color:var(--text-secondary);">你的积分</div>
                        <div style="font-size:2rem; font-weight:800; color:var(--primary);" id="tasks-score-el">${user.score} 🌟</div>
                    </div>
                    <div style="text-align:right; font-size:0.85rem; color:var(--text-secondary);">
                        <div>💰 累计获得: ${user.totalEarned || 0}</div>
                        <div>🏆 累计完成: ${user.taskCount || 0}</div>
                    </div>
                </div>
            </div>
        `;

        if (tasks.length === 0) {
            html += `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <p class="empty-state-text">还没有任务哦</p>
                    <p class="empty-state-text" style="margin-top:8px; font-size:0.85rem;">
                        点击下方 + 添加任务
                    </p>
                </div>
            `;
        } else {
            const grouped = {};
            tasks.forEach(task => {
                const cat = task.category || 'custom';
                if (!grouped[cat]) grouped[cat] = [];
                grouped[cat].push(task);
            });

            html += '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">';
            html += '<span style="font-size:0.9rem; color:var(--text-secondary);" id="tasks-today-count-el">📅 今天已完成 ' + this.completedCache.size + ' 个</span>';
            html += '</div>';

            Object.keys(grouped).forEach(cat => {
                const catInfo = TASK_CATEGORIES[cat] || TASK_CATEGORIES.custom;
                const catLabel = cat === 'study' ? '学习' : cat === 'life' ? '生活' : cat === 'sports' ? '运动' : cat === 'behavior' ? '行为' : cat === 'custom' ? '自定义' : cat;
                html += `
                    <div style="margin-top:16px; margin-bottom:8px;">
                        <span style="font-size:0.9rem; color:var(--text-secondary);">${catInfo.icon} ${catLabel}</span>
                    </div>
                `;

                grouped[cat].forEach(task => {
                    const isCompleted = this.completedCache.has(task.name);
                    html += `
                        <div class="task-item ${isCompleted ? 'completed' : ''}" data-task-id="${task._id}" data-task-name="${task.name}">
                            <div class="task-icon" style="background:${catInfo.color}20;">
                                ${task.icon || catInfo.icon}
                            </div>
                            <div class="task-info">
                                <div class="task-name">${task.name}</div>
                                <div class="task-desc">${task.description || ''}</div>
                            </div>
                            <div class="task-score">+${task.score}</div>
                            <div class="task-check ${isCompleted ? 'checked' : ''}" data-task-name="${task.name}" style="cursor:${isCompleted ? 'not-allowed' : 'pointer'}">${isCompleted ? '✓' : ''}</div>
                        </div>
                    `;
                });
            });
        }

        html += `
            <div class="bottom-actions">
                <button class="btn btn-primary bottom-action-btn" onclick="Pages.tasks.showAddModal()">➕ 添加任务</button>
                <button class="btn btn-success bottom-action-btn" onclick="Pages.tasks.showAddScoreModal()">➕ 手动加分</button>
            </div>
        `;

        container.innerHTML = html;
        this.bindEvents();
    },

    bindEvents() {
        const container = document.getElementById('tasks-content');
        if (!container) return;
        const self = this;

        container.querySelectorAll('.task-item').forEach(item => {
            const taskId = item.dataset.taskId;
            const taskName = item.dataset.taskName;

            item.addEventListener('touchstart', (e) => {
                self.longPressTimer = setTimeout(() => {
                    e.preventDefault();
                    self.showTaskMenu(taskId, taskName);
                }, 600);
            }, { passive: false });
            item.addEventListener('touchend', () => clearTimeout(self.longPressTimer));
            item.addEventListener('touchmove', () => clearTimeout(self.longPressTimer));

            item.addEventListener('mousedown', (e) => {
                if (e.button !== 0) return;
                self.longPressTimer = setTimeout(() => {
                    self.showTaskMenu(taskId, taskName);
                }, 600);
            });
            item.addEventListener('mouseup', () => clearTimeout(self.longPressTimer));
            item.addEventListener('mouseleave', () => clearTimeout(self.longPressTimer));
        });

        container.querySelectorAll('.task-check').forEach(check => {
            if (check.classList.contains('checked')) return;

            check.addEventListener('click', async function handler() {
                this.removeEventListener('click', handler);
                this.style.pointerEvents = 'none';

                const taskItem = this.closest('.task-item');
                const taskId = taskItem.dataset.taskId;
                const taskName = taskItem.dataset.taskName;

                if (self.completedCache.has(taskName)) {
                    APP.showToast('今天已完成过这个任务了 ✓');
                    return;
                }

                // 再次从云端验证，防止多设备重复
                const cloudCompleted = await getCompletedToday();
                if (cloudCompleted.has(taskName)) {
                    self.completedCache = cloudCompleted;
                    APP.showToast('今天已完成过这个任务了 ✓');
                    this.classList.add('checked');
                    this.textContent = '✓';
                    this.style.cursor = 'not-allowed';
                    return;
                }

                const tasksResult = await dbQuery(COLLECTIONS.TASKS, {});
                const task = tasksResult.data?.find(t => t._id === taskId);
                if (!task) {
                    APP.showToast('任务不存在');
                    this.style.pointerEvents = '';
                    return;
                }

                const result = await AUTH.addScore(task.score, '完成任务：' + taskName, 'task');
                if (result.success) {
                    // 更新本地缓存
                    self.completedCache.add(taskName);

                    // 更新 DOM
                    this.classList.add('checked');
                    this.textContent = '✓';
                    this.style.cursor = 'not-allowed';

                    // 实时刷新积分显示 —— 从 localStorage 读取最新用户数据
                    const userEl = document.getElementById('tasks-score-el');
                    if (userEl) {
                        const cached = localStorage.getItem(AUTH.STORAGE_KEY);
                        if (cached) {
                            try {
                                const freshUser = JSON.parse(cached);
                                userEl.textContent = freshUser.score + ' 🌟';
                            } catch {}
                        }
                    }

                    // 更新今日计数
                    const countEl = document.getElementById('tasks-today-count-el');
                    if (countEl) {
                        countEl.textContent = '📅 今天已完成 ' + self.completedCache.size + ' 个';
                    }

                    APP.showToast('+' + task.score + ' 积分！🎉');
                } else {
                    APP.showToast('积分添加失败');
                    this.style.pointerEvents = '';
                    this.addEventListener('click', handler);
                }
            });
        });
    },

    showTaskMenu(taskId, taskName) {
        APP.showModal({
            title: '任务操作',
            body: '<p style="margin-bottom:12px;">' + taskName + '</p>',
            actions: [
                {
                    text: '✏️ 编辑',
                    primary: true,
                    callback: () => { APP.hideModal(); this.editTask(taskId, taskName); }
                },
                {
                    text: '🗑️ 删除',
                    callback: () => {
                        APP.hideModal();
                        APP.showConfirm('删除任务', '确定要删除这个任务吗？', async () => {
                            const result = await dbDelete(COLLECTIONS.TASKS, taskId);
                            if (result.success) {
                                APP.showToast('✅ 任务已删除');
                                this.render();
                            } else {
                                APP.showToast('删除失败');
                            }
                        });
                    }
                },
                { text: '取消', callback: () => APP.hideModal() }
            ]
        });
    },

    editTask(taskId, taskName) {
        APP.showFormModal({
            title: '✏️ 编辑任务',
            fields: [
                { name: 'name', label: '任务名称', type: 'text', placeholder: '例如：整理房间', required: true, maxLength: 30 },
                { name: 'category', label: '分类', type: 'select', required: true, options: [
                    { value: 'study', label: '📚 学习' }, { value: 'life', label: '🏠 生活' },
                    { value: 'sports', label: '⚽ 运动' }, { value: 'behavior', label: '⭐ 行为' },
                    { value: 'custom', label: '✨ 自定义' },
                ]},
                { name: 'icon', label: '图标', type: 'text', placeholder: 'Emoji 图标，如 📖', maxLength: 4 },
                { name: 'score', label: '积分', type: 'number', placeholder: '10', required: true },
                { name: 'description', label: '描述（可选）', type: 'textarea', placeholder: '任务要求说明...' },
            ],
            onSubmit: async (values) => {
                const catInfo = TASK_CATEGORIES[values.category] || TASK_CATEGORIES.custom;
                const result = await dbUpdate(COLLECTIONS.TASKS, taskId, {
                    name: values.name, category: values.category,
                    icon: values.icon || catInfo.icon,
                    score: parseInt(values.score) || 10, description: values.description || '',
                });
                if (result.success) { APP.showToast('✅ 任务已更新！'); this.render(); }
                else { APP.showToast('更新失败：' + result.error); }
            },
        });
    },

    showAddModal() {
        APP.showFormModal({
            title: '➕ 添加新任务',
            fields: [
                { name: 'name', label: '任务名称', type: 'text', placeholder: '例如：整理房间', required: true, maxLength: 30 },
                { name: 'category', label: '分类', type: 'select', required: true, options: [
                    { value: 'study', label: '📚 学习' }, { value: 'life', label: '🏠 生活' },
                    { value: 'sports', label: '⚽ 运动' }, { value: 'behavior', label: '⭐ 行为' },
                    { value: 'custom', label: '✨ 自定义' },
                ]},
                { name: 'icon', label: '图标', type: 'text', placeholder: 'Emoji 图标，如 📖', maxLength: 4 },
                { name: 'score', label: '积分', type: 'number', placeholder: '10', required: true },
                { name: 'description', label: '描述（可选）', type: 'textarea', placeholder: '任务要求说明...' },
            ],
            onSubmit: async (values) => {
                const catInfo = TASK_CATEGORIES[values.category] || TASK_CATEGORIES.custom;
                const result = await dbAdd(COLLECTIONS.TASKS, {
                    name: values.name, category: values.category,
                    icon: values.icon || catInfo.icon,
                    score: parseInt(values.score) || 10,
                    description: values.description || '', enabled: true,
                });
                if (result.success) { APP.showToast('✅ 任务添加成功！'); this.render(); }
                else { APP.showToast('添加失败：' + result.error); }
            },
        });
    },

    showAddScoreModal() {
        APP.showFormModal({
            title: '➕ 手动添加积分',
            fields: [
                { name: 'amount', label: '积分数', type: 'number', placeholder: '10', required: true },
                { name: 'reason', label: '原因', type: 'text', placeholder: '例如：考试得了满分', required: true, maxLength: 50 },
            ],
            onSubmit: async (values) => {
                const amount = parseInt(values.amount);
                if (amount <= 0) { APP.showToast('请输入有效积分数'); return; }
                const result = await AUTH.addScore(amount, values.reason, 'manual');
                if (result.success) { APP.showToast('✅ 成功添加 ' + amount + ' 积分！'); this.render(); }
                else { APP.showToast('操作失败：' + result.error); }
            },
        });
    },
};