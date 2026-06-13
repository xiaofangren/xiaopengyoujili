// ============================================
// 小孩激励积分 - 登录页面逻辑
// ============================================

Pages.login = {
    /**
     * 初始化登录页（不绑定事件，登录按钮由 APP.init() 统一绑定）
     */
    init() {
        const usernameInput = document.getElementById('login-username');
        // 自动聚焦
        if (usernameInput) {
            usernameInput.focus();
        }
    },

    /**
     * 处理登录
     */
    async handleLogin() {
        const usernameInput = document.getElementById('login-username');
        if (!usernameInput) return;
        
        const username = usernameInput.value.trim();

        if (!username) {
            APP.showToast('请输入昵称哦~ 😊');
            usernameInput.focus();
            return;
        }

        // 获取选中的角色
        const roleBtn = document.querySelector('.role-btn.active');
        const role = roleBtn ? roleBtn.dataset.role : 'child';

        APP.showLoading();

        const result = await AUTH.login(username, role);

        APP.hideLoading();

        if (result.success) {
            APP.showToast(`欢迎 ${result.user.username}！🎉`);
            APP.navigateTo('home');
        } else {
            APP.showToast('登录失败：' + result.error);
        }
    },
};
