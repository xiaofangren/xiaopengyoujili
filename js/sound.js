// ============================================
// 小孩激励积分 - 按键声音反馈
// 使用 Web Audio API 合成音效，无需外部音频文件
// ============================================

const SOUND = {
    _ctx: null,

    /**
     * 初始化 AudioContext（必须在用户手势之后调用）
     */
    _init() {
        if (!this._ctx) {
            this._ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this._ctx.state === 'suspended') {
            this._ctx.resume();
        }
    },

    /**
     * 播放一个短暂的点击音
     * @param {number} freq - 频率 (Hz)
     * @param {string} type - 波形类型
     * @param {number} duration - 持续时间 (秒)
     */
    _playTone(freq = 800, type = 'sine', duration = 0.08) {
        this._init();
        const ctx = this._ctx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
    },

    /**
     * 通用点击音 - 短促清脆
     */
    click() {
        this._playTone(600, 'sine', 0.06);
    },

    /**
     * Tab 切换音 - 轻快上升
     */
    tabSwitch() {
        this._init();
        const ctx = this._ctx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.12);
    },

    /**
     * 完成任务音 - 开心的双音
     */
    checkTask() {
        this._playTone(523, 'sine', 0.1);          // C5
        setTimeout(() => this._playTone(659, 'sine', 0.1), 80);  // E5
        setTimeout(() => this._playTone(784, 'sine', 0.15), 160); // G5
    },

    /**
     * 积分增加音 - 明亮上升
     */
    scoreUp() {
        this._playTone(400, 'triangle', 0.08);
        setTimeout(() => this._playTone(600, 'triangle', 0.08), 60);
        setTimeout(() => this._playTone(800, 'triangle', 0.15), 120);
    },

    /**
     * 撤回/失败音 - 短促下降
     */
    fail() {
        this._playTone(400, 'sine', 0.1);
        setTimeout(() => this._playTone(300, 'sine', 0.15), 80);
    },

    /**
     * 弹窗打开音
     */
    modalOpen() {
        this._playTone(600, 'sine', 0.08);
        setTimeout(() => this._playTone(800, 'sine', 0.12), 60);
    },

    /**
     * 抽奖-滚动音 - 快速哒哒哒
     */
    slotSpin() {
        for (let i = 0; i < 10; i++) {
            setTimeout(() => this._playTone(200 + i * 20, 'square', 0.03), i * 30);
        }
    },

    /**
     * 抽奖-结果音 - 中奖庆祝
     */
    slotWin() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this._playTone(freq, 'sine', 0.2), i * 100);
        });
    },

    /**
     * 抽奖-未中奖音
     */
    slotLose() {
        this._playTone(300, 'sine', 0.1);
        setTimeout(() => this._playTone(250, 'sine', 0.2), 80);
    },

    /**
     * 登录成功音 - 欢乐上行音阶
     */
    login() {
        const notes = [523, 587, 659, 784, 880, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this._playTone(freq, 'sine', 0.12), i * 80);
        });
    },

    /**
     * Toast 提示音 - 极短
     */
    toast() {
        this._playTone(1000, 'sine', 0.04);
    },

    /**
     * 奖励兑换音 - 礼品开箱感觉
     */
    redeem() {
        this._playTone(700, 'triangle', 0.08);
        setTimeout(() => this._playTone(900, 'triangle', 0.08), 70);
        setTimeout(() => this._playTone(1100, 'triangle', 0.15), 140);
    },

    /**
     * 编辑/添加音 - 中性点击
     */
    edit() {
        this._playTone(500, 'triangle', 0.07);
    },

    /**
     * 删除音 - 低沉
     */
    delete() {
        this._playTone(250, 'sawtooth', 0.12);
    },

    /**
     * 抽奖按钮点击音
     */
    lotteryClick() {
        this._playTone(800, 'square', 0.05);
        setTimeout(() => this._playTone(1000, 'square', 0.08), 50);
    },

    /**
     * 撒花庆祝音 - 大奖
     */
    celebrate() {
        this._init();
        const ctx = this._ctx;
        const notes = [523, 659, 784, 1047, 1318];
        notes.forEach((freq, i) => {
            setTimeout(() => this._playTone(freq, 'sine', 0.3), i * 100);
        });
        // 加一点和声
        setTimeout(() => this._playTone(262, 'triangle', 0.5), 0);
    },
};

// 用户首次交互时初始化 AudioContext
function _initSoundOnFirstInteraction() {
    document.addEventListener('click', () => SOUND._init(), { once: true });
    document.addEventListener('touchstart', () => SOUND._init(), { once: true });
}
_initSoundOnFirstInteraction();
