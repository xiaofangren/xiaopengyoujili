// ============================================
// 小孩激励积分 - 奖励兑换
// ============================================

Pages.rewards = Pages.rewards || {};

// 奖励类型图标
const REWARD_ICONS = {
    snack: '🍪',
    toy: '🧸',
    activity: '🎮',
    screenTime: '📺',
    money: '💰',
    food: '🍕',
    book: '📕',
    custom: '✨',
};

Pages.rewards = {
    longPressTimer: null,

    /**
     * 初始化奖励页
     */
    async init() {
        const container = document.getElementById('rewards-content');
        if (!container) return;
        this.render();
    },

    /**
     * 兑换奖励
     */
    async redeemReward(rewardId) {
        const user = AUTH.getCurrentUser();
        const rewardsResult = await dbQuery(COLLECTIONS.REWARDS, familyQuery(user.familyId));
        const rewards = rewardsResult.success ? rewardsResult.data : [];
        const reward = rewards.find(r => r._id === rewardId);
        if (!reward) return;

        if (user.score < reward.cost) {
            APP.showToast('积分不足，再加油吧！💪');
            return;
        }

        APP.showConfirm(
            '兑换奖励',
            `确定用 ${reward.cost} 积分兑换「${reward.name}」吗？`,
            async () => {
                const result = await AUTH.addScore(-reward.cost, `兑换奖励：${reward.name}`, 'reward');
                if (result.success) {
                    SOUND.redeem();
                    APP.showToast(`🎉 兑换成功！剩余 ${result.balance} 积分`);
                    this.render();
                } else {
                    APP.showToast('兑换失败：' + result.error);
                }
            }
        );
    },

    /**
     * 渲染奖励列表
     */
    async render() {
        const container = document.getElementById('rewards-content');
        if (!container) return;

        APP.showLoading();

        // 获取用户积分
        const user = AUTH.getCurrentUser();
        if (!user) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">😴</div><p>请先登录</p></div>';
            APP.hideLoading();
            return;
        }

        // 获取奖励列表
        const rewardsResult = await dbQuery(COLLECTIONS.REWARDS, familyQuery(user.familyId));
        const rewards = (rewardsResult.success ? rewardsResult.data : []).sort((a, b) => (a.order || 0) - (b.order || 0));

        APP.hideLoading();

        // 渲染头部积分信息
        let html = `
            <div class="card" style="margin-bottom:16px;">
                <div style="display:flex; align-items:center; justify-content:space-between;">
                    <div>
                        <div style="font-size:0.85rem; color:var(--text-secondary);">你的积分</div>
                        <div style="font-size:2rem; font-weight:800; color:var(--primary);">${user.score} 🌟</div>
                    </div>
                    <div style="text-align:right; font-size:0.85rem; color:var(--text-secondary);">
                        <div>💰 累计获得: ${user.totalEarned || 0}</div>
                        <div>🎁 累计兑换: ${user.totalSpent || 0}</div>
                    </div>
                </div>
            </div>
        `;

        if (rewards.length === 0) {
            html += `
                <div class="empty-state">
                    <div class="empty-state-icon">🎁</div>
                    <p class="empty-state-text">还没有奖励哦</p>
                    <p class="empty-state-text" style="margin-top:8px; font-size:0.85rem;">
                        点击下方 + 添加奖励
                    </p>
                </div>
            `;
        } else {
            html += '<div style="display:grid; grid-template-columns:1fr; gap:10px;">';
            rewards.forEach(reward => {
                const canRedeem = user.score >= reward.cost;
                const icon = reward.icon || REWARD_ICONS[reward.category] || REWARD_ICONS.custom;

                html += `
                    <div class="reward-item" data-reward-id="${reward._id}" draggable="true">
                        <div class="reward-icon">${icon}</div>
                        <div class="reward-info">
                            <div class="reward-name">${reward.name}</div>
                            <div class="reward-cost">💰 ${reward.cost} 积分</div>
                        </div>
                        <button class="btn ${canRedeem ? 'btn-primary' : 'btn-outline'} btn-small" ${!canRedeem ? 'disabled style="opacity:0.5"' : ''} ${canRedeem ? `onclick="Pages.rewards.redeemReward('${reward._id}')"` : ''}>
                            ${canRedeem ? '兑换' : '积分不足'}
                        </button>
                    </div>
                `;
            });
            html += '</div>';
        }

        html += `
            <div style="text-align:center; margin-top:24px;">
                <button class="btn btn-primary" onclick="Pages.rewards.showAddModal()">🎁 添加新奖励</button>
            </div>
        `;

        container.innerHTML = html;
        this.bindEvents();
    },

    /**
     * 绑定长按事件
     */
    bindEvents() {
        const container = document.getElementById('rewards-content');
        if (!container) return;

        container.querySelectorAll('.reward-item').forEach(item => {
            const rewardId = item.dataset.rewardId;
            const rewardName = item.querySelector('.reward-name')?.textContent || '';

            // --- 拖拽排序 ---
            item.addEventListener('dragstart', (e) => {
                this._draggedItem = item;
                item.style.opacity = '0.4';
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', rewardId);
            });

            item.addEventListener('dragend', () => {
                item.style.opacity = '';
                this._draggedItem = null;
                container.querySelectorAll('.reward-item').forEach(el => {
                    el.style.borderTop = '';
                });
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (this._draggedItem && this._draggedItem !== item) {
                    item.style.borderTop = '3px solid var(--primary)';
                }
            });

            item.addEventListener('dragleave', () => {
                item.style.borderTop = '';
            });

            item.addEventListener('drop', async (e) => {
                e.preventDefault();
                item.style.borderTop = '';
                if (!this._draggedItem || this._draggedItem === item) return;

                const fromIdxBefore = [...container.querySelectorAll('.reward-item')].indexOf(this._draggedItem);
                const toIdxBefore = [...container.querySelectorAll('.reward-item')].indexOf(item);
                if (fromIdxBefore < toIdxBefore) {
                    item.after(this._draggedItem);
                } else {
                    item.before(this._draggedItem);
                }

                // 同步顺序到云端：拖拽后重新获取 DOM 顺序
                const newRewardsResult = await dbQuery(COLLECTIONS.REWARDS, familyQuery(AUTH.getCurrentUser().familyId));
                const newRewards = newRewardsResult.success ? newRewardsResult.data : [];
                const updatedOrder = [];
                container.querySelectorAll('.reward-item').forEach((el, idx) => {
                    updatedOrder.push({ id: el.dataset.rewardId, order: idx });
                });
                for (const entry of updatedOrder) {
                    const reward = newRewards.find(r => r._id === entry.id);
                    if (reward && reward.order !== entry.order) {
                        await dbUpdate(COLLECTIONS.REWARDS, entry.id, { order: entry.order });
                    }
                }

                APP.showToast('✅ 排序已保存');
                SOUND.click();
            });

            // --- 双击打开菜单 ---
            item.addEventListener('dblclick', () => {
                SOUND.click();
                this.showRewardMenu(rewardId, rewardName);
            });

            let lastTap = 0;
            item.addEventListener('touchend', (e) => {
                const now = Date.now();
                if (now - lastTap < 400) {
                    SOUND.click();
                    this.showRewardMenu(rewardId, rewardName);
                    e.preventDefault();
                }
                lastTap = now;
            });
        });
    },

    /**
     * 长按弹出菜单（编辑 + 删除）
     */
    showRewardMenu(rewardId, rewardName) {
        SOUND.click();
        APP.showModal({
            title: '奖励操作',
            body: `<p style="margin-bottom:12px;">${rewardName}</p>`,
            actions: [
                {
                    text: '✏️ 编辑',
                    primary: true,
                    callback: () => {
                        APP.hideModal();
                        this.editReward(rewardId, rewardName);
                    }
                },
                {
                    text: '🗑️ 删除',
                    callback: () => {
                        APP.hideModal();
                        APP.showConfirm('删除奖励', '确定要删除这个奖励吗？', async () => {
                            const result = await dbDelete(COLLECTIONS.REWARDS, rewardId);
                            if (result.success) {
                                APP.showToast('✅ 奖励已删除');
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

    /**
     * 编辑奖励
     */
    editReward(rewardId, rewardName) {
        SOUND.edit();
        APP.showFormModal({
            title: '✏️ 编辑奖励',
            fields: [
                { name: 'name', label: '奖励名称', type: 'text', placeholder: '例如：吃冰淇淋', required: true, maxLength: 30 },
                { name: 'category', label: '分类', type: 'select', required: true, options: [
                    { value: 'snack', label: '🍪 零食' },
                    { value: 'toy', label: '🧸 玩具' },
                    { value: 'activity', label: '🎮 活动' },
                    { value: 'screenTime', label: '📺 屏幕时间' },
                    { value: 'money', label: '💰 零花钱' },
                    { value: 'food', label: '🍕 美食' },
                    { value: 'book', label: '📕 书籍' },
                    { value: 'custom', label: '✨ 自定义' },
                ]},
                { name: 'icon', label: '图标', type: 'text', placeholder: 'Emoji 图标，如 🍦', maxLength: 4 },
                { name: 'cost', label: '所需积分', type: 'number', placeholder: '50', required: true },
                { name: 'description', label: '说明（可选）', type: 'textarea', placeholder: '例如：可以买一个冰淇淋...' },
            ],
            onSubmit: async (values) => {
                const catIcon = REWARD_ICONS[values.category] || REWARD_ICONS.custom;
                const result = await dbUpdate(COLLECTIONS.REWARDS, rewardId, {
                    name: values.name,
                    category: values.category,
                    icon: values.icon || catIcon,
                    cost: parseInt(values.cost) || 10,
                    description: values.description || '',
                });
                if (result.success) {
                    APP.showToast('✅ 奖励已更新！');
                    this.render();
                } else {
                    APP.showToast('更新失败：' + result.error);
                }
            },
        });
    },

    /**
     * 显示添加奖励弹窗
     */
    showAddModal() {
        SOUND.edit();
        APP.showFormModal({
            title: '🎁 添加新奖励',
            fields: [
                { name: 'name', label: '奖励名称', type: 'text', placeholder: '例如：吃冰淇淋', required: true, maxLength: 30 },
                { name: 'category', label: '分类', type: 'select', required: true, options: [
                    { value: 'snack', label: '🍪 零食' },
                    { value: 'toy', label: '🧸 玩具' },
                    { value: 'activity', label: '🎮 活动' },
                    { value: 'screenTime', label: '📺 屏幕时间' },
                    { value: 'money', label: '💰 零花钱' },
                    { value: 'food', label: '🍕 美食' },
                    { value: 'book', label: '📕 书籍' },
                    { value: 'custom', label: '✨ 自定义' },
                ]},
                { name: 'icon', label: '图标', type: 'text', placeholder: 'Emoji 图标，如 🍦', maxLength: 4 },
                { name: 'cost', label: '所需积分', type: 'number', placeholder: '50', required: true },
                { name: 'description', label: '说明（可选）', type: 'textarea', placeholder: '例如：可以买一个冰淇淋...' },
            ],
            onSubmit: async (values) => {
                const catIcon = REWARD_ICONS[values.category] || REWARD_ICONS.custom;
                const result = await dbAdd(COLLECTIONS.REWARDS, {
                    name: values.name,
                    category: values.category,
                    icon: values.icon || catIcon,
                    cost: parseInt(values.cost) || 10,
                    description: values.description || '',
                    enabled: true,
                    familyId: AUTH.getCurrentUser().familyId || '',
                });

                if (result.success) {
                    APP.showToast('✅ 奖励添加成功！');
                    this.render();
                } else {
                    APP.showToast('添加失败：' + result.error);
                }
            },
        });
    },
};
