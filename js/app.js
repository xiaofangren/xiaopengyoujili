// ============================================
// 小孩激励积分 - 主应用逻辑（路由管理）
// ============================================

const APP = {
    // 当前页面
    currentPage: 'login',

    // 页面映射
    pageMap: {
        login: 'page-login',
        home: 'page-home',
        tasks: 'page-tasks',
        rewards: 'page-rewards',
        lottery: 'page-lottery',
        logs: 'page-logs',
    },

    /**
     * 应用初始化
     */
    async init() {
        console.log('🚀 应用启动中...');

        // 1. 初始化云开发
        const cloudResult = await initCloud();
        if (!cloudResult.success) {
            console.warn('⚠️ 云开发初始化失败，将使用本地模式（数据不会同步）');
        }

        // 2. 注册 Service Worker（PWA）
        this.registerSW();

        // 3. 初始化 TabBar（绑定点击事件）
        initTabBar();

        // 4. 绑定登录按钮事件（直接绑定，不依赖 Pages.login）
        const loginBtn = document.getElementById('btn-login');
        const loginInput = document.getElementById('login-username');
        if (loginBtn && loginInput) {
            // 回车键登录
            loginInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    loginBtn.click();
                }
            });
            loginInput.focus();
            loginBtn.addEventListener('click', async () => {
                SOUND.click();
                const username = loginInput.value.trim();
                
                if (!username) {
                    this.showToast('请输入昵称哦~ 😊');
                    loginInput.focus();
                    return;
                }

                // 获取家庭码（可选）
                const familyCodeInput = document.getElementById('login-family-code');
                const familyCode = familyCodeInput ? familyCodeInput.value.trim() : '';

                this.showLoading();
                const result = await AUTH.login(username, 'child', familyCode);
                this.hideLoading();

                if (result.success) {
                    SOUND.login();
                    this.showToast(`欢迎 ${result.user.username}！🎉`);
                    this.navigateTo('home');
                } else {
                    this.showToast('登录失败：' + result.error);
                }
            });
        }

        // 5. 检查登录状态
        if (AUTH.isLoggedIn()) {
            await this.navigateTo('home');
        } else {
            this.navigateTo('login');
        }

        console.log('✅ 应用初始化完成');
    },

    /**
     * 页面导航
     * @param {string} page - 目标页面标识
     */
    async navigateTo(page) {
        if (!this.pageMap[page]) {
            console.error('❌ 未知页面:', page);
            return;
        }

        // 如果登录则隐藏 tabBar
        const tabBar = document.getElementById('tab-bar');

        // 隐藏所有页面
        Object.values(this.pageMap).forEach(id => {
            document.getElementById(id).classList.remove('active');
        });

        // 显示目标页面
        const pageEl = document.getElementById(this.pageMap[page]);
        if (pageEl) {
            pageEl.classList.add('active');
        }

        this.currentPage = page;

        // 更新 tab 栏状态
        tabBarActiveState(page);

        // 加载对应页面的内容（先刷新云端数据）
        switch (page) {
            case 'home':
                await AUTH.refreshUser();
                await Pages.home.init();
                break;
            case 'tasks':
                await AUTH.refreshUser();
                await Pages.tasks.init();
                break;
            case 'rewards':
                await AUTH.refreshUser();
                await Pages.rewards.init();
                break;
            case 'lottery':
                await AUTH.refreshUser();
                await Pages.lottery.init();
                break;
            case 'logs':
                await AUTH.refreshUser();
                await Pages.logs.init();
                break;
        }
    },

    /**
     * 显示加载提示
     */
    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    },

    /**
     * 隐藏加载提示
     */
    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    },

    /**
     * 显示弹窗
     * @param {Object} options - 弹窗配置
     */
    showModal(options) {
        const { title, body, actions = [{ text: '知道了', callback: () => this.hideModal() }] } = options;
        const modalContent = document.getElementById('modal-content');

        let actionsHtml = actions.map((action, i) =>
            `<button class="btn ${action.primary ? 'btn-primary' : 'btn-outline'}" data-action="${i}">${action.text}</button>`
        ).join('');

        modalContent.innerHTML = `
            <h3 class="modal-title">${title}</h3>
            <div class="modal-body">${body}</div>
            <div class="modal-actions">${actionsHtml}</div>
        `;

        document.getElementById('modal-overlay').classList.remove('hidden');
        SOUND.modalOpen();

        // 绑定按钮事件
        modalContent.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.action);
                if (actions[idx] && actions[idx].callback) {
                    actions[idx].callback();
                }
            });
        });
    },

    /**
     * 隐藏弹窗
     */
    hideModal() {
        document.getElementById('modal-overlay').classList.add('hidden');
    },

    /**
     * 显示 Toast 提示
     * @param {string} message - 提示消息
     * @param {number} duration - 持续时间（毫秒）
     */
    showToast(message, duration = 2000) {
        // 创建 toast 元素
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            toast.style.cssText = `
                position: fixed; top: 20%; left: 50%; transform: translateX(-50%);
                background: rgba(0,0,0,0.75); color: #fff; padding: 12px 24px;
                border-radius: 28px; font-size: 0.95rem; z-index: 5000;
                animation: fadeIn 0.3s ease; white-space: nowrap;
            `;
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.style.display = 'block';
        SOUND.toast();

        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
            toast.style.display = 'none';
        }, duration);
    },

    /**
     * 注册 Service Worker
     */
    registerSW() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('pwa/sw.js')
                    .then(reg => console.log('✅ Service Worker 注册成功:', reg.scope))
                    .catch(err => console.warn('⚠️ Service Worker 注册失败:', err));
            });
        }
    },

    /**
     * 通用确认弹窗
     * @param {string} title - 标题
     * @param {string} message - 确认信息
     * @param {Function} onConfirm - 确认回调
     */
    showConfirm(title, message, onConfirm) {
        this.showModal({
            title: title,
            body: message,
            actions: [
                { text: '取消', callback: () => this.hideModal() },
                {
                    text: '确定',
                    primary: true,
                    callback: () => {
                        this.hideModal();
                        if (onConfirm) onConfirm();
                    }
                }
            ]
        });
    },

    /**
     * 通用表单弹窗
     * @param {Object} config - 配置
     */
    showFormModal(config) {
        const { title, fields, onSubmit } = config;
        const modalContent = document.getElementById('modal-content');
        let fieldsHtml = '';

        fields.forEach((field, i) => {
            if (field.type === 'select') {
                const options = (field.options || []).map(opt =>
                    `<option value="${opt.value}">${opt.label}</option>`
                ).join('');
                fieldsHtml += `
                    <div style="margin-bottom: 12px;">
                        <label style="display:block; margin-bottom:4px; font-weight:600; font-size:0.9rem;">${field.label}</label>
                        <select id="form-field-${i}" class="form-select">${options}</select>
                    </div>
                `;
            } else if (field.type === 'textarea') {
                fieldsHtml += `
                    <div style="margin-bottom: 12px;">
                        <label style="display:block; margin-bottom:4px; font-weight:600; font-size:0.9rem;">${field.label}</label>
                        <textarea id="form-field-${i}" class="form-input" rows="3" placeholder="${field.placeholder || ''}" maxlength="${field.maxLength || 200}"></textarea>
                    </div>
                `;
            } else {
                fieldsHtml += `
                    <div style="margin-bottom: 12px;">
                        <label style="display:block; margin-bottom:4px; font-weight:600; font-size:0.9rem;">${field.label}</label>
                        <input id="form-field-${i}" type="${field.type || 'text'}" class="form-input" placeholder="${field.placeholder || ''}" ${field.required ? 'required' : ''} ${field.maxLength ? `maxlength="${field.maxLength}"` : ''}>
                    </div>
                `;
            }
        });

        modalContent.innerHTML = `
            <h3 class="modal-title">${title}</h3>
            <div class="modal-form">${fieldsHtml}</div>
            <div class="modal-actions">
                <button class="btn btn-outline" id="form-cancel">取消</button>
                <button class="btn btn-primary" id="form-submit">确定</button>
            </div>
        `;

        document.getElementById('modal-overlay').classList.remove('hidden');
        SOUND.modalOpen();

        // 取消按钮
        document.getElementById('form-cancel').addEventListener('click', () => this.hideModal());

        // 确定按钮
        document.getElementById('form-submit').addEventListener('click', () => {
            const values = {};
            let valid = true;
            fields.forEach((field, i) => {
                const el = document.getElementById(`form-field-${i}`);
                values[field.name] = field.type === 'number' ? Number(el.value) : el.value;
                if (field.required && !values[field.name]) {
                    valid = false;
                    el.style.borderColor = 'var(--danger)';
                }
            });

            if (!valid) {
                this.showToast('请填写所有必填项');
                return;
            }

            this.hideModal();
            SOUND.click();
            if (onSubmit) onSubmit(values);
        });
    },

    // ========== 家庭成员切换 ==========

    /**
     * 显示家庭成员切换器
     */
    showFamilySwitcher() {
        const knownUsers = AUTH.getKnownUsers();
        const currentUser = AUTH.getCurrentUser();
        if (!currentUser) return;

        // 只显示同家庭的成员
        const familyUsers = knownUsers.filter(u => u.familyId && u.familyId === currentUser.familyId);

        let userListHtml = '';
        if (familyUsers.length === 0) {
            userListHtml = '<div style="padding:16px; color:var(--text-secondary);">暂无其他家庭成员</div>';
        } else {
            familyUsers.forEach(u => {
                const isCurrent = u._id === currentUser._id;
                userListHtml += `
                    <div class="family-member-item ${isCurrent ? 'current' : ''}" data-user-id="${u._id}" style="display:flex; align-items:center; padding:12px 16px; border-radius:12px; margin-bottom:4px; cursor:pointer; ${isCurrent ? 'background:var(--primary); color:#fff;' : 'background:#F8F9FA;'}">
                        <span style="font-size:1.5rem; margin-right:12px;">👶</span>
                        <div style="flex:1;">
                            <div style="font-weight:700; font-size:1rem;">${u.username}</div>
                        </div>
                        ${isCurrent ? '<span style="font-size:0.8rem;">当前 ✓</span>' : '<span style="font-size:0.8rem; color:var(--primary);">切换</span>'}
                    </div>
                `;
            });
        }

        const modalContent = document.getElementById('modal-content');
        modalContent.innerHTML = `
            <h3 class="modal-title" style="margin-bottom:16px;">👨‍👩‍👧‍👦 切换家庭成员</h3>
            <div class="family-member-list" style="margin-bottom:16px; max-height:300px; overflow-y:auto;">
                ${userListHtml}
            </div>
            <div style="display:flex; gap:8px;">
                <button class="btn btn-primary" id="btn-add-family-member" style="flex:1; padding:12px;">＋ 添加成员</button>
                <button class="btn btn-outline" id="btn-switch-cancel" style="flex:0; padding:12px;">取消</button>
            </div>
        `;

        document.getElementById('modal-overlay').classList.remove('hidden');

        modalContent.querySelectorAll('.family-member-item[data-user-id]').forEach(item => {
            item.addEventListener('click', async () => {
                const userId = item.dataset.userId;
                if (userId === currentUser._id) {
                    this.hideModal();
                    return;
                }
                this.hideModal();
                this.showLoading();
                const result = await AUTH.switchToUser(userId);
                this.hideLoading();
                if (result.success) {
                    this.showToast(`已切换到 ${result.user.username} 👋`);
                    this.navigateTo('home');
                } else {
                    this.showToast('切换失败：' + result.error);
                }
            });
        });

        document.getElementById('btn-add-family-member').addEventListener('click', () => {
            this.hideModal();
            this.showAddFamilyMemberModal();
        });

        document.getElementById('btn-switch-cancel').addEventListener('click', () => {
            this.hideModal();
        });
    },

    /**
     * 显示添加家庭成员弹窗
     */
    showAddFamilyMemberModal() {
        this.showFormModal({
            title: '👶 添加家庭成员',
            fields: [
                { name: 'username', label: '昵称', type: 'text', placeholder: '例如：小宝', required: true, maxLength: 20 },
            ],
            onSubmit: async (values) => {
                this.showLoading();
                const result = await AUTH.addFamilyMember(values.username, 'child');
                this.hideLoading();
                if (result.success) {
                    this.showToast(`✅ 已添加 ${result.user.username}！`);
                    this.navigateTo('home');
                } else {
                    this.showToast(result.error || '添加失败');
                }
            },
        });
    },
};

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    APP.init();
});
