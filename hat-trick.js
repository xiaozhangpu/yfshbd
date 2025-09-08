class HatTrickGame {
    constructor() {
        this.hats = document.querySelectorAll('.hat-wrapper');
        this.startButton = document.getElementById('startButton');
        this.gameMessage = document.getElementById('gameMessage');
        this.overlay = document.getElementById('overlay');
        this.resultText = document.getElementById('resultText');
        this.resultEmoji = document.getElementById('resultEmoji');
        
        this.gameState = 'idle'; // idle, showing, swapping, guessing
        this.correctPosition = 0;
        this.isAnimating = false;
        
        // 预加载音效
        this.swapSound = null;
        this.loadSounds();
        
        this.init();
    }

    init() {
        this.bindEvents();
        // 页面加载后立即开始游戏，无需用户点击开始按钮
        this.gameMessage.textContent = '游戏加载中...';
        setTimeout(() => {
            this.startGame();
        }, 1000);
    }

    bindEvents() {
        // 再玩一次按钮已移除，无需绑定事件
        this.hats.forEach((hat, index) => {
            hat.addEventListener('click', () => this.handleHatClick(index));
        });
    }

    loadSounds() {
        try {
            this.swapSound = new Audio('sounds/notification-change.mp3');
            this.swapSound.preload = 'auto';
            this.swapSound.volume = 0.7;
            
            this.winSound = new Audio('sounds/win.mp3');
            this.winSound.preload = 'auto';
            this.winSound.volume = 0.8;
            
            this.wrongSound = new Audio('sounds/wrong.mp3');
            this.wrongSound.preload = 'auto';
            this.wrongSound.volume = 0.8;

            this.popSound = new Audio('sounds/pop.mp3');
            this.popSound.preload = 'auto';
            this.popSound.volume = 0.8;
            
            console.log('所有音效加载成功');
        } catch (e) {
            console.log('音效加载失败:', e);
        }
    }

    playSwapSound() {
        if (this.swapSound) {
            // 创建新的音效实例，避免重叠播放问题
            const sound = this.swapSound.cloneNode();
            sound.play().catch(e => {
                console.log('音效播放失败:', e);
            });
        }
    }

    playWinSound() {
        if (this.winSound) {
            const sound = this.winSound.cloneNode();
            sound.play().catch(e => {
                console.log('胜利音效播放失败:', e);
            });
        }
    }

    playWrongSound() {
        if (this.wrongSound) {
            const sound = this.wrongSound.cloneNode();
            sound.play().catch(e => {
                console.log('失败音效播放失败:', e);
            });
        }
    }

    playPopSound() {
        if (this.popSound) {
            const sound = this.popSound.cloneNode();
            sound.play().catch(e => {
                console.log('pop音效播放失败:', e);
            });
        }
    }

    resetGame() {
        this.gameState = 'idle';
        this.isAnimating = false;
        
        // 重置所有帽子和角色
        this.hats.forEach((hat, index) => {
            const hatElement = hat.querySelector('.hat');
            const character = hat.querySelector('.character-container');
            
            hatElement.classList.remove('hat-lift');
            character.classList.remove('show', 'character-bounce');
            
            // 隐藏所有角色
            character.style.opacity = '0';
        });

        // 重置UI
        this.gameMessage.textContent = '新游戏即将开始...';
        
        // 隐藏弹窗
        this.overlay.classList.remove('show');
        
        // 自动开始游戏
        setTimeout(() => {
            this.startGame();
        }, 500);
    }

    startGame() {
        if (this.isAnimating) return;
        
        this.gameState = 'showing';
        this.isAnimating = true;
        
        this.gameMessage.textContent = '注意看！海绵宝宝要出现了...';
        
        // 随机选择位置
        this.correctPosition = Math.floor(Math.random() * 3);
        
        // 展示角色
        setTimeout(() => {
            this.showCharacter();
        }, 1000);
    }

    showCharacter() {
        const correctHat = this.hats[this.correctPosition];
        const hatElement = correctHat.querySelector('.hat');
        const character = correctHat.querySelector('.character-container');
        
        // 帽子升起
        hatElement.classList.add('hat-lift');
        
        setTimeout(() => {
            // 播放pop音效
            this.playPopSound();
            
            // 显示角色
            character.classList.add('show');
            character.style.opacity = '1';
            
            this.gameMessage.textContent = '记住这个位置！';
            
            // 2秒后隐藏角色
            setTimeout(() => {
                character.style.opacity = '0';
                
                setTimeout(() => {
                    // 帽子降下
                    hatElement.classList.remove('hat-lift');
                    
                    setTimeout(() => {
                        this.startSwapping();
                    }, 500);
                }, 300);
            }, 2000);
        }, 500);
    }

    startSwapping() {
        this.gameState = 'swapping';
        this.gameMessage.textContent = '帽子开始交换...';
        
        // 固定执行4次交换
        const swapCount = 4;
        this.performSwaps(swapCount, 0);
    }

    async performSwaps(totalSwaps, currentSwap) {
        if (currentSwap >= totalSwaps) {
            this.gameState = 'guessing';
            this.gameMessage.textContent = '猜猜海绵宝宝在哪儿？';
            this.isAnimating = false;
            
            // 清除所有动画状态，防止视觉干扰
            this.clearAllAnimations();
            
            return;
        }

        // 随机选择两个帽子交换
        let index1, index2;
        do {
            index1 = Math.floor(Math.random() * 3);
            index2 = Math.floor(Math.random() * 3);
        } while (index1 === index2);

        // 添加交换提示
        this.gameMessage.textContent = `交换 ${currentSwap + 1}/${totalSwaps}`;
        
        // 高亮即将交换的帽子
        this.highlightHats(index1, index2);
        
        // 延迟后执行交换
        setTimeout(async () => {
            // 播放交换音效
            this.playSwapSound();
            
            // 执行交换动画
            await this.swapHats(index1, index2);
            
            // 清除高亮
            this.clearHighlight(index1, index2);
            
            // 更新正确位置
            if (this.correctPosition === index1) {
                this.correctPosition = index2;
            } else if (this.correctPosition === index2) {
                this.correctPosition = index1;
            }

            // 延迟后继续下一次交换
            setTimeout(() => {
                this.performSwaps(totalSwaps, currentSwap + 1);
            }, 800); // 交换后间隔800ms
        }, 500); // 高亮显示500ms后开始交换
    }

    swapHats(index1, index2) {
        return new Promise((resolve) => {
            const hat1 = this.hats[index1];
            const hat2 = this.hats[index2];
            
            // 降低交换速度，更容易观察
            const swapDuration = 800;
            
            // 添加交换动画
            hat1.style.transition = `transform ${swapDuration}ms ease-in-out`;
            hat2.style.transition = `transform ${swapDuration}ms ease-in-out`;
            
            const rect1 = hat1.getBoundingClientRect();
            const rect2 = hat2.getBoundingClientRect();
            
            const deltaX = rect2.left - rect1.left;
            const deltaY = rect2.top - rect1.top;
            
            hat1.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
            hat2.style.transform = `translate(${-deltaX}px, ${-deltaY}px)`;
            
            setTimeout(() => {
                // 静默交换：先移除过渡，再交换DOM，最后清除transform
                hat1.style.transition = 'none';
                hat2.style.transition = 'none';
                
                // 立即交换DOM位置
                const container = hat1.parentElement;
                if (index1 < index2) {
                    container.insertBefore(hat2, hat1);
                } else {
                    container.insertBefore(hat1, hat2);
                }
                
                // 强制重排后立即清除transform，避免飞入效果
                container.offsetHeight; // 强制重排
                hat1.style.transform = '';
                hat2.style.transform = '';
                
                resolve();
                
            }, swapDuration);
        });
    }

    handleHatClick(index) {
        if (this.gameState !== 'guessing' || this.isAnimating) return;
        
        this.isAnimating = true;
        const clickedHat = this.hats[index];
        const hatElement = clickedHat.querySelector('.hat');
        const character = clickedHat.querySelector('.character-container');
        
        // 帽子升起
        hatElement.classList.add('hat-lift');
        
        setTimeout(() => {
            // 显示角色（或不显示）
            if (index === this.correctPosition) {
                character.style.opacity = '1';
                character.classList.add('character-bounce');
                this.showResult(true);
            } else {
                // 显示空帽子
                setTimeout(() => {
                    // 显示正确位置
                    const correctHat = this.hats[this.correctPosition];
                    const correctCharacter = correctHat.querySelector('.character-container');
                    const correctHatElement = correctHat.querySelector('.hat');
                    
                    correctHatElement.classList.add('hat-lift');
                    correctCharacter.style.opacity = '1';
                    
                    setTimeout(() => {
                        this.showResult(false);
                    }, 1000);
                }, 1000);
            }
        }, 500);
    }

    highlightHats(index1, index2) {
        this.hats[index1].classList.add('hat-highlight');
        this.hats[index2].classList.add('hat-highlight');
    }

    clearHighlight(index1, index2) {
        this.hats[index1].classList.remove('hat-highlight');
        this.hats[index2].classList.remove('hat-highlight');
    }

    clearAllAnimations() {
        // 清除所有可能产生视觉干扰的动画和样式
        this.hats.forEach(hat => {
            const hatElement = hat.querySelector('.hat');
            const character = hat.querySelector('.character-container');
            
            // 清除所有动画类
            hatElement.classList.remove('hat-lift', 'hat-shake', 'hat-highlight', 'hat-pulse');
            character.classList.remove('show', 'character-bounce');
            
            // 重置所有样式
            hatElement.style.transform = '';
            hatElement.style.transition = '';
            hatElement.style.boxShadow = '';
            character.style.opacity = '0';
            character.style.transform = '';
            character.style.transition = '';
        });
    }

    showResult(isCorrect) {
        this.gameState = 'idle';
        
        if (isCorrect) {
            this.resultEmoji.textContent = '🎉';
            this.resultText.textContent = '太棒了！你找到我了！';
            // 播放胜利音效
            this.playWinSound();
        } else {
            this.resultEmoji.textContent = '😅';
            this.resultText.textContent = '再试一次吧！';
            // 播放失败音效
            this.playWrongSound();
        }
        
        this.overlay.classList.add('show');
        
        // 等待用户点击"继续"按钮后自动开始新游戏
        // 点击事件在closeModal函数中处理
    }
}

function closeModal() {
    document.getElementById('overlay').classList.remove('show');
    // 点击继续后立即开始新游戏
    setTimeout(() => {
        game.resetGame();
    }, 300);
}

// 启动游戏
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new HatTrickGame();
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