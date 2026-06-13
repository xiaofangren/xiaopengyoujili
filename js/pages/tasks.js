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
        // 只查今天的日志
        const today = new Date().toLocaleDateString('sv-SE');
        const result = await dbQuery(COLLECTIONS.LOGS, {
            userId: user._id,
            type: 'task',
        });
        if (result.success && result.data.length > 0) {
            const names = [];
            result.data.forEach(log => {
                const localDate = log.localDate || '';
                let isToday = localDate === today;
                if (!isToday) {
                    const time = log.createTime || log._createTime || '';
                    if (time) {
                        const logTime = new Date(time);
                        isToday = logTime.toLocaleDateString('sv-SE') === today;
                    }
                }
                if (isToday && log.reason && log.reason.startsWith('完成任务：')) {
                    names.push(log.reason.replace('完成任务：', ''));
                }
            });
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
            html += '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">';
            html += '<span style="font-size:0.9rem; color:var(--text-secondary);" id="tasks-today-count-el">📅 今天已完成 ' + this.completedCache.size + ' 个</span>';
            html += '</div>';

            tasks.forEach(task => {
                const cat = task.category || 'custom';
                const catInfo = TASK_CATEGORIES[cat] || TASK_CATEGORIES.custom;
                const isCompleted = this.completedCache.has(task.name);
                html += `
                    <div class="task-item ${isCompleted ? 'completed' : ''}" data-task-id="${task._id}" data-task-name="${task.name}" draggable="true">
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

            // --- 拖拽排序 ---
            item.addEventListener('dragstart', (e) => {
                self._draggedItem = item;
                item.style.opacity = '0.4';
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', taskId);
            });

            item.addEventListener('dragend', () => {
                item.style.opacity = '';
                self._draggedItem = null;
                // 清除所有高亮
                container.querySelectorAll('.task-item').forEach(el => {
                    el.style.borderTop = '';
                });
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (self._draggedItem && self._draggedItem !== item) {
                    item.style.borderTop = '3px solid var(--primary)';
                }
            });

            item.addEventListener('dragleave', () => {
                item.style.borderTop = '';
            });

            item.addEventListener('drop', async (e) => {
                e.preventDefault();
                item.style.borderTop = '';
                if (!self._draggedItem || self._draggedItem === item) return;

                // 交换 DOM 位置
                const allItems = [...container.querySelectorAll('.task-item')];
                const fromIdx = allItems.indexOf(self._draggedItem);
                const toIdx = allItems.indexOf(item);

                if (fromIdx < toIdx) {
                    item.after(self._draggedItem);
                } else {
                    item.before(self._draggedItem);
                }

                // 从云端同步顺序：获取新的 DOM 顺序，逐个更新云端 order 字段
                const newTasksResult = await dbQuery(COLLECTIONS.TASKS, {});
                const newTasks = newTasksResult.success ? newTasksResult.data : [];
                const updatedOrder = [];
                allItems.forEach((el, idx) => {
                    updatedOrder.push({ id: el.dataset.taskId, order: idx });
                });

                // 只更新有变化的
                for (const entry of updatedOrder) {
                    const task = newTasks.find(t => t._id === entry.id);
                    if (task && task.order !== entry.order) {
                        await dbUpdate(COLLECTIONS.TASKS, entry.id, { order: entry.order });
                    }
                }

                APP.showToast('✅ 排序已保存');
                SOUND.click();
            });

            // --- 双击打开菜单 ---
            item.addEventListener('dblclick', () => {
                SOUND.click();
                self.showTaskMenu(taskId, taskName);
            });

            // 触摸双击：通过快速两次 tap 模拟
            let lastTap = 0;
            item.addEventListener('touchend', (e) => {
                const now = Date.now();
                if (now - lastTap < 400) {
                    SOUND.click();
                    self.showTaskMenu(taskId, taskName);
                    e.preventDefault();
                }
                lastTap = now;
            });
        });

        container.querySelectorAll('.task-check').forEach(check => {
            const taskItem = check.closest('.task-item');
            const taskId = taskItem.dataset.taskId;
            const taskName = taskItem.dataset.taskName;
            const isCompleted = check.classList.contains('checked');

            // --- 已完成的勾子：点击撤回 ---
            if (isCompleted) {
                check.style.cursor = 'pointer';
                check.addEventListener('click', async () => {
                    // 先查任务数据拿到 score
                    const tasksResult = await dbQuery(COLLECTIONS.TASKS, {});
                    const task = tasksResult.data?.find(t => t._id === taskId);
                    if (!task) {
                        APP.showToast('任务不存在');
                        return;
                    }
                    APP.showConfirm('撤回任务', `确定要撤回「${task.name}」吗？将扣除 ${task.score} 积分。`, async () => {
                        // 删除今日该任务的 log 记录
                        const logsResult = await dbQuery(COLLECTIONS.LOGS, {
                            userId: AUTH.getCurrentUser()._id,
                            type: 'task',
                        });
                        if (logsResult.success) {
                            const today = new Date().toLocaleDateString('sv-SE');
                            const todayLogs = logsResult.data.filter(log => {
                                const localDate = log.localDate || '';
                                return localDate === today && log.reason === '完成任务：' + taskName;
                            });
                            if (todayLogs.length > 0) {
                                const logToDelete = todayLogs[todayLogs.length - 1];
                                await dbDelete(COLLECTIONS.LOGS, logToDelete._id);

                                // 手动扣积分，不调用 AUTH.addScore（避免产生新的"撤回"记录）
                                const user = AUTH.getCurrentUser();
                                const newScore = Math.max(0, user.score - task.score);
                                await dbUpdate(COLLECTIONS.USERS, user._id, { score: newScore });
                                user.score = newScore;
                                AUTH._saveToLocalStorage();
                            }
                        }

                        // UI 更新
                        self.completedCache.delete(taskName);
                        // 直接重新渲染整个列表，确保事件处理器与状态一致
                        await self.render();
                        APP.showToast('已撤回，扣除 ' + task.score + ' 积分');
                    });
                });
                return;
            }

            // --- 未完成的勾子：点击完成 ---
            check.addEventListener('click', async function handler() {
                this.removeEventListener('click', handler);
                this.style.pointerEvents = 'none';

                // 再次从云端验证，防止多设备重复
                const cloudCompleted = await getCompletedToday();
                if (cloudCompleted.has(taskName)) {
                    SOUND.fail();
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
                    SOUND.fail();
                    APP.showToast('任务不存在');
                    this.style.pointerEvents = '';
                    return;
                }

                const result = await AUTH.addScore(task.score, '完成任务：' + taskName, 'task');
                if (result.success) {
                    SOUND.checkTask();
                    // 更新本地缓存
                    self.completedCache.add(taskName);

                    // 更新 DOM
                    this.classList.add('checked');
                    this.textContent = '✓';
                    this.style.cursor = 'pointer';
                    this.style.pointerEvents = '';  // 恢复点击，否则撤回事件无法触发

                    // 绑定撤回事件：完成后立即绑定，不需要切换页面就能撤回
                    const checkEl = this;
                    const taskItemEl = checkEl.closest('.task-item');
                    checkEl.addEventListener('click', async () => {
                        const tasksResult = await dbQuery(COLLECTIONS.TASKS, {});
                        const undoneTask = tasksResult.data?.find(t => t._id === taskId);
                        if (!undoneTask) {
                            APP.showToast('任务不存在');
                            return;
                        }
                        APP.showConfirm('撤回任务', `确定要撤回「${undoneTask.name}」吗？将扣除 ${undoneTask.score} 积分。`, async () => {
                            const logsResult = await dbQuery(COLLECTIONS.LOGS, {
                                userId: AUTH.getCurrentUser()._id,
                                type: 'task',
                            });
                            if (logsResult.success) {
                                const today = new Date().toLocaleDateString('sv-SE');
                                const todayLogs = logsResult.data.filter(log => {
                                    const time = log._createTime || log._updateTime || '';
                                    return time.startsWith(today) && log.reason === '完成任务：' + taskName;
                                });
                                if (todayLogs.length > 0) {
                                    const logToDelete = todayLogs[todayLogs.length - 1];
                                    await dbDelete(COLLECTIONS.LOGS, logToDelete._id);

                                    const user = AUTH.getCurrentUser();
                                    const newScore = Math.max(0, user.score - undoneTask.score);
                                    await dbUpdate(COLLECTIONS.USERS, user._id, { score: newScore });
                                    user.score = newScore;
                                    AUTH._saveToLocalStorage();
                                }
                            }
                            self.completedCache.delete(taskName);
                            checkEl.classList.remove('checked');
                            checkEl.textContent = '';
                            checkEl.style.cursor = 'pointer';
                            taskItemEl.classList.remove('completed');
                            const countEl = document.getElementById('tasks-today-count-el');
                            if (countEl) {
                                countEl.textContent = '📅 今天已完成 ' + self.completedCache.size + ' 个';
                            }
                            await self.render();
                            APP.showToast('已撤回，扣除 ' + undoneTask.score + ' 积分');
                        });
                    });

                    // 实时刷新积分显示
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
                    SOUND.scoreUp();
                } else {
                    APP.showToast('积分添加失败');
                    this.style.pointerEvents = '';
                    this.addEventListener('click', handler);
                }
            });
        });
    },

    showTaskMenu(taskId, taskName) {
        SOUND.click();
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
        SOUND.edit();
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
        SOUND.edit();
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
        SOUND.edit();
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