// ============================================
// cloud.js — 云开发工具函数测试
// ============================================
import { describe, it, expect } from 'vitest';

// ─── unwrapDoc 纯函数（从源码复制，无外部依赖） ──

function unwrapDoc(doc) {
    if (!doc) return doc;
    const metaFields = ['_createTime', '_updateTime', 'createTime', 'updateTime'];
    const meta = {};
    metaFields.forEach(f => {
        if (doc[f] !== undefined) meta[f] = doc[f];
    });
    if (doc.data && typeof doc.data === 'object' && !Array.isArray(doc.data)) {
        const unwrapped = { ...doc.data };
        if (doc._id) unwrapped._id = String(doc._id);
        Object.keys(meta).forEach(f => {
            if (!(f in unwrapped)) unwrapped[f] = meta[f];
        });
        return unwrapped;
    }
    if (doc._id && typeof doc._id !== 'string') {
        doc._id = String(doc._id);
    }
    metaFields.forEach(f => {
        if (!(f in doc) && meta[f] !== undefined) {
            doc[f] = meta[f];
        }
    });
    return doc;
}

describe('unwrapDoc', () => {
    it('处理 null 或 undefined 返回原值', () => {
        expect(unwrapDoc(null)).toBeNull();
        expect(unwrapDoc(undefined)).toBeUndefined();
    });

    it('无 data 子对象时原样返回', () => {
        const doc = { _id: 'abc', score: 10, name: 'test' };
        expect(unwrapDoc(doc)).toEqual(doc);
    });

    it('将 data 子字段展开到顶层并保留 _id', () => {
        const doc = {
            _id: 'doc123',
            _openid: 'open456',
            data: { score: 50, username: '丫丫', role: 'child' },
        };
        const result = unwrapDoc(doc);
        expect(result).toEqual({
            _id: 'doc123',
            score: 50,
            username: '丫丫',
            role: 'child',
        });
        expect(result._openid).toBeUndefined();
    });

    it('将 _id 转为字符串', () => {
        const doc = { _id: 12345, data: { score: 10 } };
        const result = unwrapDoc(doc);
        expect(result._id).toBe('12345');
    });

    it('保留云开发元数据字段', () => {
        const doc = {
            _id: 'abc',
            _createTime: '2026-01-01T00:00:00Z',
            data: { score: 10 },
        };
        const result = unwrapDoc(doc);
        expect(result._createTime).toBe('2026-01-01T00:00:00Z');
    });

    it('data 子字段优先级高于外层同名字段', () => {
        const doc = {
            _id: 'abc',
            score: 999,
            data: { score: 42 },
        };
        const result = unwrapDoc(doc);
        expect(result.score).toBe(42);
    });

    it('处理 data 为空对象', () => {
        const doc = { _id: 'abc', data: {} };
        const result = unwrapDoc(doc);
        expect(result).toEqual({ _id: 'abc' });
    });

    it('处理 data 是数组的情况不做展开', () => {
        const doc = { _id: 'abc', data: [1, 2, 3] };
        const result = unwrapDoc(doc);
        expect(result).toEqual(doc);
    });

    it('处理 _updateTime 元数据字段', () => {
        const doc = {
            _id: 'abc',
            _updateTime: '2026-06-16T10:00:00Z',
            data: { score: 25 },
        };
        const result = unwrapDoc(doc);
        expect(result._updateTime).toBe('2026-06-16T10:00:00Z');
        expect(result.score).toBe(25);
    });
});

describe('COLLECTIONS 常量', () => {
    it('包含所有预期的集合名', () => {
        expect(globalThis.COLLECTIONS).toEqual({
            USERS: 'users',
            TASKS: 'tasks',
            REWARDS: 'rewards',
            LOGS: 'logs',
            LOTTERY_CONFIG: 'lottery_config',
        });
    });
});