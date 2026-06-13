// ============================================
// 小孩激励积分 - 拉霸机抽奖
// ============================================

Pages.lottery = Pages.lottery || {};

// 每次抽奖消耗积分
const LOTTERY_COST = 5;

// 每日抽奖次数限制
const DAILY_LIMIT = 3;

// 四张奖品图片
const SLOT_IMAGES = [
    '图片/fWWZkBVFC.jpeg',
    '图片/转盘奖项文字居中问题.png',
    '图片/转盘奖项文字居中问题 (1).png',
    '图片/转盘奖项文字居中问题 (2).png',
];

// 中奖概率表
const PRIZE_PROBS = [
    { name: '大奖',    score: 10, match: 4, prob: 5  },  // 四个一样
    { name: '幸运奖',  score: 8,  match: 3, prob: 15 },  // 三个一样
    { name: '运气奖',  score: 7,  match: 2, prob: 10 },  // 两队一样（AABB）
    { name: '小奖',    score: 6,  match: 2, prob: 50 },  // 两个一样
    { name: '谢谢参与', score: 4,  match: 0, prob: 10 },  // 全都不一樣
];

/**
 * 根据概率表随机选择一个奖品配置
 */
function randomPrize() {
    const total = PRIZE_PROBS.reduce((s, p) => s + p.prob, 0);
    let r = Math.random() * total;
    for (const p of PRIZE_PROBS) {
        r -= p.prob;
        if (r <= 0) return p;
    }
    return PRIZE_PROBS[PRIZE_PROBS.length - 1];
}

/**
 * 根据中奖匹配数生成四列的符号索引
 * match=4: 全部相同  match=3: 三个相同  match=2+team=2: 两队一样  match=2: 两个相同  match=0: 全部不同
 */
function generateResult(match, team = false) {
    const results = [0, 1, 2, 3]; // 四列

    if (match === 4) {
        // 四个一样，随机选一个符号
        const idx = Math.floor(Math.random() * 4);
        results[0] = results[1] = results[2] = results[3] = idx;
    } else if (match === 3) {
        // 三个一样：先随机选一个符号出现三次，另一个出现一次
        const sameIdx = Math.floor(Math.random() * 4);
        const otherIdx = Math.floor(Math.random() * 3);
        // 随机选一个位置放不同的
        const diffPos = Math.floor(Math.random() * 4);
        for (let i = 0; i < 4; i++) {
            results[i] = i === diffPos ? otherIdx : sameIdx;
        }
    } else if (team === true) {
        // 两队一样：如 AABB、ABAB、ABBA 三种模式之一
        // 选两个不同的符号索引
        const idxA = Math.floor(Math.random() * 4);
        let idxB;
        do { idxB = Math.floor(Math.random() * 4); } while (idxB === idxA);

        // 随机选一种配对模式
        const patterns = [
            [0, 0, 1, 1],  // AABB
            [0, 1, 0, 1],  // ABAB
            [0, 1, 1, 0],  // ABBA
        ];
        const pattern = patterns[Math.floor(Math.random() * patterns.length)];
        results[0] = pattern[0] === 0 ? idxA : idxB;
        results[1] = pattern[1] === 0 ? idxA : idxB;
        results[2] = pattern[2] === 0 ? idxA : idxB;
        results[3] = pattern[3] === 0 ? idxA : idxB;
    } else if (match === 2) {
        // 两个一样：先随机选一对位置放相同符号，另两个位置放不同的
        // 选哪两个位置放相同
        const samePositions = [];
        while (samePositions.length < 2) {
            const pos = Math.floor(Math.random() * 4);
            if (!samePositions.includes(pos)) samePositions.push(pos);
        }
        const sameIdx = Math.floor(Math.random() * 4);
        // 另两个位置各选一个不同的符号
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
            if (samePositions.includes(i)) {
                results[i] = sameIdx;
            } else {
                results[i] = otherIndices[otherIdx++];
            }
        }
    } else if (match === 0) {
        // 四个全不同
        const indices = [0, 1, 2, 3];
        // 洗牌
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        results[0] = indices[0];
        results[1] = indices[1];
        results[2] = indices[2];
        results[3] = indices[3];
    }

    return results;
}

Pages.lottery = {
    isSpinning: false,
    spinsRemaining: DAILY_LIMIT,
    todayLotteryCount: 0,

    /**
     * 初始化
     */
    async init() {
        this.render();
    },

    /**
     * 渲染页面
     */
    async render() {
        const container = document.getElementById('lottery-content');
        if (!container) return;

        const user = AUTH.getCurrentUser();
        if (!user) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">😴</div><p>请先登录</p></div>';
            return;
        }

        // 统计今日抽奖次数（查当天消耗记录）
        const today = new Date().toLocaleDateString('sv-SE');
        const logsResult = await dbQuery(COLLECTIONS.LOGS, {
            userId: user._id,
            type: 'lottery',
        });
        this.todayLotteryCount = 0;
        if (logsResult.success) {
            this.todayLotteryCount = logsResult.data.filter(log => {
                // 优先用 localDate 精确匹配
                if (log.localDate === today && log.reason === '抽奖消耗') return true;
                // 降级：用 createTime 做时区转换
                const time = log.createTime || log._createTime || '';
                return time && time.startsWith(today) && log.reason === '抽奖消耗';
            }).length;
        }
        this.spinsRemaining = Math.max(0, DAILY_LIMIT - this.todayLotteryCount);

        container.innerHTML = `
            <!-- 今日抽奖次数 -->
            <div class="card" style="margin-bottom:16px;">
                <div style="display:flex; align-items:center; justify-content:space-between;">
                    <div>
                        <div style="font-size:0.85rem; color:var(--text-secondary);">今日剩余次数</div>
                        <div style="font-size:1.5rem; font-weight:700;">🎰 ${this.spinsRemaining} / ${DAILY_LIMIT}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:0.85rem; color:var(--text-secondary);">每次消耗</div>
                        <div style="font-size:1.2rem; font-weight:700; color:var(--accent-orange);">💰 ${LOTTERY_COST} 积分</div>
                    </div>
                </div>
            </div>

            <!-- 积分展示 -->
            <div class="score-display" style="margin-bottom:16px; padding:16px;">
                <div class="score-number" style="font-size:2.5rem;">${user.score}</div>
                <div class="score-label">当前积分</div>
            </div>

            <!-- 拉霸机 -->
            <div class="slot-machine" id="slot-machine">
                <div class="slot-frame">
                    <div class="slot-reel" id="reel-0">
                        <div class="slot-window">
                            ${this._symbolHTML(SLOT_IMAGES[0])}
                        </div>
                    </div>
                    <div class="slot-reel" id="reel-1">
                        <div class="slot-window">
                            ${this._symbolHTML(SLOT_IMAGES[1])}
                        </div>
                    </div>
                    <div class="slot-reel" id="reel-2">
                        <div class="slot-window">
                            ${this._symbolHTML(SLOT_IMAGES[2])}
                        </div>
                    </div>
                    <div class="slot-reel" id="reel-3">
                        <div class="slot-window">
                            ${this._symbolHTML(SLOT_IMAGES[3])}
                        </div>
                    </div>
                </div>
                <!-- 中奖提示 -->
                <div class="slot-result" id="slot-result"></div>
            </div>

            <!-- 抽奖按钮 -->
            <div style="text-align:center; margin-top:16px;">
                <button id="btn-draw" class="btn btn-primary btn-large" style="width:auto; padding:16px 48px; font-size:1.2rem;">
                    🎰 开始拉霸 (${LOTTERY_COST}积分)
                </button>
            </div>

            <!-- 规则说明 -->
            <div class="card" style="margin-top:16px;">
                <div class="card-header">
                    <span class="card-title">📖 玩法说明</span>
                </div>
                <div style="padding:4px 0; font-size:0.9rem; color:var(--text-secondary); line-height:1.8;">
                    <div>🎯 四列图案相同即中奖</div>
                    <div>✨ 四个一样 = 大奖 10 积分 (5%)</div>
                    <div>🌟 三个一样 = 幸运奖 8 积分 (15%)</div>
                    <div>🎁 两队一样 = 运气奖 7 积分 (10%)</div>
                    <div>🎉 两个一样 = 小奖 6 积分 (50%)</div>
                    <div>💫 全都不一样 = 谢谢参与 4 积分 (10%)</div>
                </div>
            </div>

            ${this.spinsRemaining === 0 ? `
                <div style="text-align:center; margin-top:16px; padding:16px; background:var(--accent-green); border-radius:var(--radius-lg);">
                    <div style="font-size:1.5rem;">🎉</div>
                    <div style="font-weight:600; color:var(--text-primary);">今日抽奖次数已用完</div>
                    <div style="font-size:0.85rem; color:var(--text-secondary);">明天再来吧！</div>
                </div>
            ` : ''}
        `;

        // 绑定按钮
        const btn = document.getElementById('btn-draw');
        if (btn) {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            if (this.spinsRemaining > 0) {
                newBtn.addEventListener('click', () => {
                    SOUND.lotteryClick();
                    this.startSpin();
                });
            }
        }
    },

    /**
     * 生成单个符号的 HTML（图片）
     */
    _symbolHTML(imgSrc) {
        return `<div class="slot-symbol-img"><img src="${imgSrc}" alt="symbol" /></div>`;
    },

    /**
     * 开始抽奖
     */
    startSpin() {
        if (this.isSpinning) return;
        if (this.spinsRemaining <= 0) {
            APP.showToast('今日抽奖次数已用完 🙅');
            return;
        }

        const user = AUTH.getCurrentUser();
        if (user.score < LOTTERY_COST) {
            APP.showToast('积分不足，需要 ' + LOTTERY_COST + ' 积分 💰');
            return;
        }

        this.isSpinning = true;
        SOUND.slotSpin();
        const btn = document.getElementById('btn-draw');
        if (btn) {
            btn.disabled = true;
            btn.style.opacity = '0.5';
        }

        // 1. 选奖品（保持原概率）
        const prize = randomPrize();
        const matchCount = prize.match;
        const isTeam = (prize.name === '运气奖'); // 两队一样
        const results = generateResult(matchCount, isTeam);

        // 2. 扣除积分
        AUTH.addScore(-LOTTERY_COST, '抽奖消耗', 'lottery');

        // 3. 四列依次启动、依次停止：前一列真正停下后，再启动下一列
        const settleGap = 200; // 一列停下后，间隔 200ms 再启动下一列

        const spinChain = [0, 1, 2, 3].reduce((chain, col) => {
            return chain.then(() => {
                const reel = document.getElementById(`reel-${col}`);
                const windowEl = reel.querySelector('.slot-window');
                return this._spinReel(reel, windowEl, results[col]);
            });
        }, Promise.resolve());

        // 等待所有列完成
        spinChain.then(() => {
            // 全部停下后，等待 settleGap 再结算
            setTimeout(async () => {
                // 增加奖品积分
                AUTH.addScore(prize.score, `抽奖获得：拉霸 ${prize.name}`, 'lottery');

                this.spinsRemaining--;
                this.isSpinning = false;

                const btn2 = document.getElementById('btn-draw');
                if (btn2) {
                    btn2.disabled = false;
                    btn2.style.opacity = '1';
                }

                // 显示结果
                const resultEl = document.getElementById('slot-result');
                if (resultEl) {
                    const matchNames = { 4: '四个一样', 3: '三个一样', 2: '两队一样', 0: '全都不一樣' };
                    if (prize.score >= 6) {
                        SOUND.celebrate();
                        resultEl.innerHTML = `<span style="color:var(--primary); font-size:1.3rem;">🎉 ${matchNames[matchCount]} — ${prize.name}！+${prize.score} 积分</span>`;
                    } else {
                        SOUND.slotLose();
                        resultEl.innerHTML = `<span style="color:var(--text-secondary);">💫 ${matchNames[matchCount]} — ${prize.name}！+${prize.score} 积分</span>`;
                    }
                }

                APP.showToast(prize.score >= 6
                    ? `🎉 ${prize.name}！获得 ${prize.score} 积分`
                    : `谢谢参与！获得 ${prize.score} 积分 💫`
                );

                // 3秒后重新渲染恢复原始状态
                setTimeout(() => {
                    this.render();
                }, 3000);
            }, settleGap);
        });
    },

    /**
     * 单列滚动动画（返回 Promise，完成后链式调用下一列）
     */
    _spinReel(reel, windowEl, targetImageIndex) {
        return new Promise(resolve => {
            const totalFrames = 40; // 总帧数，增加后更流畅
            const baseInterval = 50; // 基础帧间隔 50ms

            let currentFrame = 0;
            let lastIndex = -1;

            // 构建滚动序列：中间随机，最后停在目标
            const sequence = [];
            for (let i = 0; i < totalFrames - 1; i++) {
                let idx;
                do {
                    idx = Math.floor(Math.random() * SLOT_IMAGES.length);
                } while (idx === lastIndex);
                lastIndex = idx;
                sequence.push(SLOT_IMAGES[idx]);
            }
            sequence.push(SLOT_IMAGES[targetImageIndex]);

            // 减速曲线：前段快，后段逐渐慢下来
            function getInterval(frameIndex) {
                const progress = frameIndex / totalFrames;
                if (progress < 0.6) {
                    return baseInterval; // 前60% 正常速度
                } else if (progress < 0.85) {
                    return baseInterval + 30; // 中间减速
                } else {
                    return baseInterval + 80; // 最后15% 很慢，模拟惯性
                }
            }

            // 用递归 setTimeout 替代 setInterval，以便每帧间隔可变
            function playFrame() {
                if (currentFrame >= sequence.length) {
                    resolve();
                    return;
                }
                // 切换前淡出
                windowEl.querySelector('.slot-symbol-img').classList.add('fading');
                setTimeout(() => {
                    windowEl.innerHTML = Pages.lottery._symbolHTML(sequence[currentFrame]);
                    // 切换完成后淡入
                    windowEl.querySelector('.slot-symbol-img').classList.remove('fading');
                    currentFrame++;
                    const interval = getInterval(currentFrame);
                    setTimeout(playFrame, interval);
                }, 40);
            }
            playFrame();
        });
    },
};
