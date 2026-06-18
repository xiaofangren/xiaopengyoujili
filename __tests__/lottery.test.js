// ============================================
// lottery.js — 抽奖逻辑纯函数测试（优化版）
// ============================================
import { describe, it, expect, vi } from 'vitest';

// ─── 从 lottery.js 复制的常量 ───────────────
const LOTTERY_COST = 5;
const DAILY_LIMIT = 3;
const SLOT_IMAGES = [
    '图片/1.jpeg',
    '图片/2.jpg',
    '图片/3.jpg',
    '图片/4.jpg',
];
const PRIZE_PROBS = [
    { name: '大奖',    score: 10, match: 4, prob: 5.6  },
    { name: '幸运奖',  score: 8,  match: 3, prob: 16.7 },
    { name: '运气奖',  score: 7,  match: 2, prob: 11.1 },
    { name: '小奖',    score: 6,  match: 2, prob: 55.5 },
    { name: '谢谢参与', score: 4,  match: 0, prob: 11.1 },
];

function randomPrize() {
    const total = PRIZE_PROBS.reduce((s, p) => s + p.prob, 0);
    let r = Math.random() * total;
    for (const p of PRIZE_PROBS) {
        r -= p.prob;
        if (r <= 0) return p;
    }
    return PRIZE_PROBS[PRIZE_PROBS.length - 1];
}

function generateResult(match, team = false) {
    const results = [0, 1, 2, 3];

    if (match === 4) {
        const idx = Math.floor(Math.random() * 4);
        results[0] = results[1] = results[2] = results[3] = idx;
    } else if (match === 3) {
        const sameIdx = Math.floor(Math.random() * 4);
        let otherIdx;
        do { otherIdx = Math.floor(Math.random() * 4); } while (otherIdx === sameIdx);
        const diffPos = Math.floor(Math.random() * 4);
        for (let i = 0; i < 4; i++) results[i] = i === diffPos ? otherIdx : sameIdx;
    } else if (team === true) {
        const idxA = Math.floor(Math.random() * 4);
        let idxB;
        do { idxB = Math.floor(Math.random() * 4); } while (idxB === idxA);
        const patterns = [
            [0, 0, 1, 1], [0, 1, 0, 1], [0, 1, 1, 0],
        ];
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        results[0] = pattern[0] === 0 ? idxA : idxB;
        results[1] = pattern[1] === 0 ? idxA : idxB;
        results[2] = pattern[2] === 0 ? idxA : idxB;
        results[3] = pattern[3] === 0 ? idxA : idxB;
    } else if (match === 2) {
        const samePositions = [];
        while (samePositions.length < 2) {
            const pos = Math.floor(Math.random() * 4);
            if (!samePositions.includes(pos)) samePositions.push(pos);
        }
        const sameIdx = Math.floor(Math.random() * 4);
        const otherIndices = [];
        for (let i = 0; i < 4; i++) {
            if (!samePositions.includes(i)) {
                let idx;
                do { idx = Math.floor(Math.random() * 4); } while (idx === sameIdx || otherIndices.includes(idx));
                otherIndices.push(idx);
            }
        }
        let otherIdx = 0;
        for (let i = 0; i < 4; i++) {
            results[i] = samePositions.includes(i) ? sameIdx : otherIndices[otherIdx++];
        }
    } else if (match === 0) {
        const indices = [0, 1, 2, 3];
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        results[0] = indices[0]; results[1] = indices[1];
        results[2] = indices[2]; results[3] = indices[3];
    }

    return results;
}

/** 统计每列的值出现次数（降序） */
function countMatches(results) {
    const counts = {};
    results.forEach(v => { counts[v] = (counts[v] || 0) + 1; });
    return Object.values(counts).sort((a, b) => b - a);
}

/** 判断 generateResult 是否符合 match 模式 */
function validateResult(results, match, team) {
    if (results.length !== 4) return false;
    if (results.some(v => v < 0 || v > 3)) return false;
    const counts = countMatches(results);
    if (match === 4) return counts[0] === 4;
    if (match === 3) return counts[0] === 3 && counts[1] === 1;
    if (team) return counts[0] === 2 && counts[1] === 2;
    if (match === 2) return counts[0] === 2 && counts[1] === 1 && counts[2] === 1;
    return counts.length === 4; // match === 0
}

// =============================================
// 测试
// =============================================

describe('概率表定义', () => {
    it('概率之和精确等于 100', () => {
        const total = PRIZE_PROBS.reduce((s, p) => s + p.prob, 0);
        expect(total).toBe(100);
    });

    it('每条记录字段完整有效', () => {
        PRIZE_PROBS.forEach(p => {
            expect(p).toHaveProperty('name');
            expect(p).toHaveProperty('score');
            expect(p).toHaveProperty('match');
            expect(p).toHaveProperty('prob');
            expect(typeof p.name).toBe('string');
            expect(p.score).toBeGreaterThan(0);
            expect(p.prob).toBeGreaterThan(0);
            expect([0, 2, 3, 4]).toContain(p.match);
        });
    });

    it('有 5 种奖品等级', () => {
        expect(PRIZE_PROBS).toHaveLength(5);
    });
});

describe('randomPrize', () => {
    it('始终返回有效的奖品对象（100 次验证）', () => {
        for (let i = 0; i < 100; i++) {
            const prize = randomPrize();
            expect(PRIZE_PROBS).toContainEqual(prize);
        }
    });

    it('概率分布符合预期（50000 次采样，3.5σ 容差）', () => {
        const TRIALS = 50000;
        const counts = {};
        PRIZE_PROBS.forEach(p => { counts[p.name] = 0; });

        for (let i = 0; i < TRIALS; i++) {
            counts[randomPrize().name]++;
        }

        PRIZE_PROBS.forEach(p => {
            const prob = p.prob / 100;
            const expected = prob * TRIALS;
            const actual = counts[p.name];
            // 二项分布标准差: σ = sqrt(n * p * (1-p))
            const sigma = Math.sqrt(TRIALS * prob * (1 - prob));
            const tolerance = 3.5 * sigma; // 3.5σ ≈ 99.95%

            expect(actual).toBeGreaterThan(expected - tolerance);
            expect(actual).toBeLessThan(expected + tolerance);
        });
    });

    it('Math.random=0 时返回第一个奖品（大奖）', () => {
        const mock = vi.spyOn(Math, 'random').mockReturnValue(0);
        expect(randomPrize().name).toBe('大奖');
        mock.mockRestore();
    });

    it('Math.random≈1 时返回最后一个奖品（谢谢参与）', () => {
        const mock = vi.spyOn(Math, 'random').mockReturnValue(0.999999);
        expect(randomPrize().name).toBe('谢谢参与');
        mock.mockRestore();
    });
});

describe('generateResult', () => {
    it('match=4：四个全部相同', () => {
        for (let i = 0; i < 50; i++) {
            const r = generateResult(4);
            expect(validateResult(r, 4)).toBe(true);
            expect(new Set(r).size).toBe(1);
        }
    });

    it('match=3：三个相同一个不同', () => {
        for (let i = 0; i < 50; i++) {
            const r = generateResult(3);
            expect(validateResult(r, 3)).toBe(true);
            expect(new Set(r).size).toBe(2);
        }
    });

    it('match=2 + team=true：两队各二', () => {
        for (let i = 0; i < 50; i++) {
            const r = generateResult(2, true);
            expect(validateResult(r, 2, true)).toBe(true);
            expect(new Set(r).size).toBe(2);
            const counts = countMatches(r);
            expect(counts[0]).toBe(2);
            expect(counts[1]).toBe(2);
        }
    });

    it('match=2：两个相同，另两个各不相同', () => {
        for (let i = 0; i < 50; i++) {
            const r = generateResult(2);
            expect(validateResult(r, 2)).toBe(true);
            expect(new Set(r).size).toBe(3);
        }
    });

    it('match=0：四个全不同', () => {
        for (let i = 0; i < 50; i++) {
            const r = generateResult(0);
            expect(validateResult(r, 0)).toBe(true);
            expect(new Set(r).size).toBe(4);
        }
    });

    it('所有模式的索引都在 0–3 范围内', () => {
        const modes = [
            () => generateResult(4),
            () => generateResult(3),
            () => generateResult(2, true),
            () => generateResult(2),
            () => generateResult(0),
        ];
        for (let i = 0; i < 200; i++) {
            const r = modes[i % modes.length]();
            expect(r).toHaveLength(4);
            r.forEach(v => {
                expect(v).toBeGreaterThanOrEqual(0);
                expect(v).toBeLessThan(4);
            });
        }
    });
});

describe('抽奖常量', () => {
    it('每次抽奖消耗 5 积分', () => {
        expect(LOTTERY_COST).toBe(5);
    });

    it('每日上限 3 次', () => {
        expect(DAILY_LIMIT).toBe(3);
    });

    it('奖品图片有 4 张', () => {
        expect(SLOT_IMAGES).toHaveLength(4);
    });
});