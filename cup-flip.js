class CupFlipGame {
    constructor() {
        this.cupStates = [0, 0, 0, 0, 0]; // 0: 正面朝上, 1: 反面朝上
        this.selectedCups = [];
        this.moveCount = 0;
        this.gameCompleted = false;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.render();
    }

    bindEvents() {
        // 杯子点击事件
        document.querySelectorAll('.cup').forEach((cup, index) => {
            cup.addEventListener('click', () => this.selectCup(index));
        });

        // 再玩一次按钮事件
        document.getElementById('playAgainBtn').addEventListener('click', () => this.resetGame());
    }

    selectCup(index) {
        if (this.gameCompleted) return;

        // 播放点击音效
        const clickSound = new Audio('sounds/notification-click.mp3');
        clickSound.play().catch(error => {
            console.log('点击音效播放失败:', error);
        });

        const cup = document.querySelectorAll('.cup')[index];
        const cupContainer = cup.parentElement;

        if (this.selectedCups.includes(index)) {
            // 取消选择
            this.selectedCups = this.selectedCups.filter(i => i !== index);
            cup.classList.remove('selected');
        } else {
            // 选择杯子
            if (this.selectedCups.length < 3) {
                this.selectedCups.push(index);
                cup.classList.add('selected');
            }
        }

        // 当选择3个杯子后，自动翻转
        if (this.selectedCups.length === 3) {
            setTimeout(() => {
                this.flipCups();
            }, 300); // 短暂延迟让用户看到选择效果
        }
    }



    flipCups() {
        // 翻转选中的杯子
        this.selectedCups.forEach(index => {
            this.cupStates[index] = this.cupStates[index] === 0 ? 1 : 0;
            const cup = document.querySelectorAll('.cup')[index];
            
            // 添加翻转动画
            if (this.cupStates[index] === 1) {
                cup.classList.add('flipped');
            } else {
                cup.classList.remove('flipped');
            }
            
            // 移除选中状态
            cup.classList.remove('selected');
        });

        this.moveCount++;
        document.getElementById('moveCount').textContent = this.moveCount;
        
        this.selectedCups = [];
        
        // 检查胜利条件
        setTimeout(() => this.checkVictory(), 600);
    }

    checkVictory() {
        const allFlipped = this.cupStates.every(state => state === 1);
        
        if (allFlipped) {
            this.gameCompleted = true;
            this.showVictory();
        }
    }

    showVictory() {
        // 播放胜利音效
        const victorySound = new Audio('sounds/win.mp3');
        victorySound.play().catch(error => {
            console.log('音效播放失败:', error);
        });

        // 触发庆祝动画
        document.querySelectorAll('.cup').forEach(cup => {
            cup.classList.add('victory');
        });

        // 显示胜利弹窗
        document.getElementById('finalCount').textContent = this.moveCount;
        document.getElementById('victoryModal').classList.add('show');
    }

    resetGame() {
        // 重置游戏状态
        this.cupStates = [0, 0, 0, 0, 0];
        this.selectedCups = [];
        this.moveCount = 0;
        this.gameCompleted = false;

        // 重置UI
        document.getElementById('moveCount').textContent = '0';
        document.getElementById('victoryModal').classList.remove('show');

        document.querySelectorAll('.cup').forEach(cup => {
            cup.classList.remove('flipped', 'selected', 'victory');
        });
    }

    render() {
        // 初始渲染
        this.cupStates.forEach((state, index) => {
            const cup = document.querySelectorAll('.cup')[index];
            if (state === 1) {
                cup.classList.add('flipped');
            }
        });
    }
}

// 启动游戏
document.addEventListener('DOMContentLoaded', () => {
    new CupFlipGame();
});

// 防止移动端双击缩放
document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

let lastTouchEnd = 0;
document.addEventListener('touchend', function(e) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);