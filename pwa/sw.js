// ============================================
// 小孩激励积分 - Service Worker
// PWA 离线缓存支持
// ============================================

const CACHE_NAME = 'kid-reward-v1';

// 需要缓存的资源
const STATIC_ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './js/cloud.js',
    './js/auth.js',
    './js/app.js',
    './js/components/tabBar.js',
    './js/pages/login.js',
    './js/pages/home.js',
    './js/pages/tasks.js',
    './js/pages/rewards.js',
    './js/pages/lottery.js',
    './js/pages/logs.js',
];

/**
 * 安装时预缓存静态资源
 */
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('✅ Service Worker 缓存静态资源');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    // 立即激活新的 Service Worker
    self.skipWaiting();
});

/**
 * 激活时清理旧缓存
 */
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    // 立即控制所有页面
    self.clients.claim();
});

/**
 * 网络请求拦截
 * 优先使用缓存，缓存没有则请求网络
 */
self.addEventListener('fetch', (event) => {
    // 跳过非 GET 请求
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            // 没有缓存则请求网络
            return fetch(event.request).then((response) => {
                // 只缓存有效的响应
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // 克隆响应并缓存
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return response;
            }).catch(() => {
                // 网络失败时返回离线页面
                if (event.request.headers.get('accept').includes('text/html')) {
                    return caches.match('./index.html');
                }
            });
        })
    );
});

/**
 * 后台同步（可选，用于离线操作）
 */
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-logs') {
        event.waitUntil(syncLogs());
    }
});

async function syncLogs() {
    // 在这里实现离线数据的同步逻辑
    console.log('🔄 后台同步积分记录');
}
