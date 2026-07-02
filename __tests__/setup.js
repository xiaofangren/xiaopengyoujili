// ============================================
// 测试全局设置 — 模拟浏览器 API 和全局依赖
// ============================================
import { vi, beforeEach } from 'vitest';

// ─── 1. 模拟 localStorage ───────────────────
const store = {};
Object.defineProperty(globalThis, 'localStorage', {
    value: {
        getItem: vi.fn((key) => store[key] ?? null),
        setItem: vi.fn((key, value) => { store[key] = String(value); }),
        removeItem: vi.fn((key) => { delete store[key]; }),
        clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
        get length() { return Object.keys(store).length; },
        key: vi.fn((i) => Object.keys(store)[i] || null),
    },
    writable: true,
});

// ─── 2. 模拟 AudioContext ───────────────────
globalThis.AudioContext = vi.fn().mockImplementation(() => ({
    createOscillator: () => ({
        type: '',
        frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
    }),
    createGain: () => ({
        gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
    }),
    destination: {},
    state: 'running',
    resume: vi.fn(),
}));
globalThis.webkitAudioContext = globalThis.AudioContext;

// ─── 3. 模拟全局变量 ───────────────────────
globalThis.cloudbase = undefined;
globalThis.COLLECTIONS = {
    USERS: 'users',
    TASKS: 'tasks',
    REWARDS: 'rewards',
    LOGS: 'logs',
    LOTTERY_CONFIG: 'lottery_config',
};

// ─── 4. 创建可覆写的 Mock 数据库函数 ────────
globalThis.dbQuery = vi.fn();
globalThis.dbGetById = vi.fn();
globalThis.dbAdd = vi.fn();
globalThis.dbUpdate = vi.fn();
globalThis.dbDelete = vi.fn();
globalThis.dbQueryLogsPaged = vi.fn();
globalThis.initCloud = vi.fn();

// ─── 4b. 模拟家庭相关函数 ─────────────────
globalThis.familyQuery = vi.fn((familyId) => ({ $or: [{ familyId }, { familyId: { $exists: false } }] }));
globalThis.generateFamilyCode = vi.fn(() => 'ABC123');
globalThis.hasOrphanData = vi.fn(async () => false);
globalThis.migrateOrphanData = vi.fn(async (familyId) => ({ success: true, count: 0 }));

// ─── 4c. 模拟 crypto.randomUUID ────────────
if (!globalThis.crypto) {
    globalThis.crypto = {};
}
globalThis.crypto.randomUUID = vi.fn(() => '00000000-0000-4000-8000-000000000001');

// ─── 5. 模拟 document.addEventListener（用于 sound.js） ───
document.addEventListener = vi.fn();
document.removeEventListener = vi.fn();

// ─── 6. 每个测试前清空状态 ─────────────────
beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // 重置 cloudMode（cloud.js 中的全局变量）
    globalThis.cloudMode = false;
});