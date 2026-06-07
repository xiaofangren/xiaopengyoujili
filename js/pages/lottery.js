// ============================================
// 小孩激励积分 - 幸运抽奖
// ============================================

Pages.lottery = Pages.lottery || {};

// 奖品配置
const DEFAULT_PRIZES = [
    { name: '🌟 大奖', score: 10, color: '#FF6B9D', probability: 5 },
    { name: '🎁 小奖', score: 6, color: '#4ECDC4', probability: 60 },
    { name: '✨ 幸运奖', score: 8, color: '#FFE66D', probability: 15 },
    { name: '💫 谢谢参与', score: 2, color: '#A8E6CF', probability: 10 },
    { name: '💰 再来一次', score: 5, color: '#C9B1FF', probability: 10 },
];

// 每次抽奖消耗积分
const LOTTERY_COST = 5;

// 每日抽奖次数限制
const DAILY_LIMIT = 3;

Pages.lottery = {
    isSpinning: false,
    spinsRemaining: DAILY_LIMIT,
    todayLotteryCount: 0,

    /**
     * 初始化抽奖页
     */
    async init() {
        this.render();
    },

    /**
     * 渲染抽奖页面
     */
    async render() {
        const container = document.getElementById('lottery-content');
        if (!container) return;

        const user = AUTH.getCurrentUser();
        console.log('🔍 lottery.js - getCurrentUser:', user);
        if (!user) {
            container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">😴</div><p>请先登录</p></div>';
            return;
        }

        // 获取用户今日抽奖次数
        const today = new Date().toISOString().slice(0, 10);
        const logsResult = await dbQuery(COLLECTIONS.LOGS, {
            userId: user._id,
            type: 'lottery',
        });

        this.todayLotteryCount = 0;
        if (logsResult.success) {
            this.todayLotteryCount = logsResult.data.filter(log =>
                log._createTime && log._createTime.startsWith(today) && log.reason === '抽奖消耗'
            ).length;
        }

        this.spinsRemaining = Math.max(0, DAILY_LIMIT - this.todayLotteryCount);

        // 构建转盘选项
        let wheelOptions = DEFAULT_PRIZES.map(prize =>
            `${prize.name} (${prize.score})`
        ).join(', ');

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

            <!-- 转盘 -->
            <div class="lottery-container">
                <div class="lottery-wheel-wrapper">
                    <div class="lottery-wheel" id="lottery-wheel">
                        ${DEFAULT_PRIZES.map((prize, i) => {
                            const segmentAngle = 360 / DEFAULT_PRIZES.length;
                            const angle = segmentAngle * i + segmentAngle / 2;
                            return `<span class="wheel-label" style="transform:rotate(${angle}deg) translate(95px) rotate(-${angle}deg) translate(-50%, -50%); display:block; width:auto; text-align:center; min-width:80px;">${prize.name}<br>+${prize.score}</span>`;
                        }).join('')}
                    </div>
                </div>
                <div class="lottery-pointer"></div>
                <div class="lottery-result" id="lottery-result"></div>
            </div>

            <!-- 抽奖按钮 -->
            <div style="text-align:center; margin-top:24px;">
                <button id="btn-draw" class="btn btn-primary btn-large" style="width:auto; padding:16px 48px; font-size:1.2rem;">
                    🎰 开始抽奖 (${LOTTERY_COST}积分)
                </button>
            </div>

            <!-- 奖品说明 -->
            <div class="card" style="margin-top:16px;">
                <div class="card-header">
                    <span class="card-title">📖 奖品说明</span>
                </div>
                ${DEFAULT_PRIZES.map(prize => `
                    <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #F0F0F0;">
                        <span>${prize.name}</span>
                        <span style="color:var(--accent-orange); font-weight:600;">+${prize.score} 积分</span>
                    </div>
                `).join('')}
            </div>

            ${this.spinsRemaining === 0 ? `
                <div style="text-align:center; margin-top:16px; padding:16px; background:var(--accent-green); border-radius:var(--radius-lg);">
                    <div style="font-size:1.5rem;">🎉</div>
                    <div style="font-weight:600; color:var(--text-primary);">今日抽奖次数已用完</div>
                    <div style="font-size:0.85rem; color:var(--text-secondary);">明天再来吧！</div>
                </div>
            ` : ''}
        `;

        // 绑定转盘标签（让标签随转盘旋转）
        const wheelLabels = container.querySelectorAll('.wheel-label');
        wheelLabels.forEach(label => {
            label.style.position = 'absolute';
            label.style.left = '50%';
            label.style.top = '50%';
            label.style.fontSize = '0.8rem';
            label.style.fontWeight = '700';
            label.style.whiteSpace = 'nowrap';
            label.style.color = '#fff';
            label.style.textShadow = '0 2px 4px rgba(0,0,0,0.5)';
            label.style.cursor = 'default';
            label.style.userSelect = 'none';
            label.style.lineHeight = '1.3';
            label.style.width = '80px';
            label.style.padding = '2px 0';
        });

        // 绑定抽奖按钮（去除之前的事件监听）
        const btn = document.getElementById('btn-draw');
        if (btn) {
            // 克隆按钮以移除旧的事件监听器
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            if (this.spinsRemaining > 0) {
                newBtn.addEventListener('click', () => this.startSpin());
            }
        }
    },

    /**
     * 开始转动
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
        const btn = document.getElementById('btn-draw');
        if (btn) {
            btn.disabled = true;
            btn.style.opacity = '0.5';
        }

        // 随机选择奖品
        const prizeIndex = this.randomWeightedIndex();
        const prize = DEFAULT_PRIZES[prizeIndex];

        // 计算旋转角度
        const segments = DEFAULT_PRIZES.length;
        const segmentAngle = 360 / segments;
        // 指针在上方，转盘顺时针旋转
        const centerAngle = prizeIndex * segmentAngle + segmentAngle / 2;
        const targetAngle = 360 - centerAngle;
        const totalRotate = 360 * 5 + targetAngle; // 转5圈

        const wheel = document.getElementById('lottery-wheel');
        if (wheel) {
            wheel.style.transform = `rotate(${totalRotate}deg)`;
        }

        // 动画结束后处理
        setTimeout(async () => {
            // 扣除积分
            const deductResult = await AUTH.addScore(-LOTTERY_COST, '抽奖消耗', 'lottery');

            // 增加奖品积分
            if (prize.score > 0) {
                const addResult = await AUTH.addScore(prize.score, `抽奖获得：${prize.name}`, 'lottery');
            }

            this.spinsRemaining--;
            this.isSpinning = false;

            const btn2 = document.getElementById('btn-draw');
            if (btn2) {
                btn2.disabled = false;
                btn2.style.opacity = '1';
            }

            // 显示结果
            const resultEl = document.getElementById('lottery-result');
            if (resultEl) {
                resultEl.textContent = `🎉 恭喜获得：${prize.name} (+${prize.score}积分)`;
                resultEl.classList.add('animate-pop');
            }

            // 重新渲染
            this.render();

            if (prize.score === 0) {
                APP.showToast('谢谢参与，下次加油！💪');
            } else {
                APP.showToast(`🎉 获得 ${prize.name} (+${prize.score}积分)`);
            }
        }, 3500);
    },

    /**
     * 加权随机选择奖品索引
     * @returns {number} 奖品索引
     */
    randomWeightedIndex() {
        const total = DEFAULT_PRIZES.reduce((sum, p) => sum + p.probability, 0);
        let random = Math.random() * total;

        for (let i = 0; i < DEFAULT_PRIZES.length; i++) {
            random -= DEFAULT_PRIZES[i].probability;
            if (random <= 0) return i;
        }
        return DEFAULT_PRIZES.length - 1;
    },
};
