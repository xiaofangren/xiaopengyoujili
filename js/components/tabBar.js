// ============================================
// 小孩激励积分 - 底部 TabBar 组件
// ============================================

/**
 * 设置指定 tab 的激活状态
 * @param {string} pageName - 页面标识
 */
function tabBarActiveState(pageName) {
    const tabBar = document.getElementById('tab-bar');
    if (!tabBar) return;

    const items = tabBar.querySelectorAll('.tab-item');
    items.forEach(item => {
        if (item.dataset.page === pageName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // 登录页隐藏 tabBar
    if (APP.currentPage === 'login') {
        tabBar.classList.add('hidden');
    } else {
        tabBar.classList.remove('hidden');
    }
}

/**
 * 初始化 TabBar 点击事件
 */
function initTabBar() {
    const tabBar = document.getElementById('tab-bar');
    if (!tabBar) return;

    tabBar.addEventListener('click', (e) => {
        const tabItem = e.target.closest('.tab-item');
        if (tabItem) {
            const page = tabItem.dataset.page;
            if (page) {
                SOUND.tabSwitch();
                APP.navigateTo(page);
            }
        }
    });
}

// 不再在 DOMContentLoaded 时绑定，改为在 APP.init() 中显式调用
