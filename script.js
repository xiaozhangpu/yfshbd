// 游戏数据
const characters = [
    { id: 0, name: '海绵宝宝', image: 'images/spongebob.png' },
    { id: 1, name: '派大星', image: 'images/patrick.png' },
    { id: 2, name: '章鱼哥', image: 'images/squidward.png' },
    { id: 3, name: '蟹老板', image: 'images/mr-krabs.png' }
];

// 游戏管理
let currentGame = null;
let gameInstance = null;

// DOM元素
const mainMenu = document.getElementById('mainMenu');
const gameContainer = document.getElementById('gameContainer');

// 游戏类定义
class FindCharacterGame {
    constructor() {
        this.gameState = {
            isCountingDown: true,
            isGameActive: false,
            targetCharacter: null,
            characterPositions: [],
            remainingDoors: 4
        };

        this.elements = {
            countdownTimer: document.querySelector('.countdown-timer'),
            countdownText: document.querySelector('.countdown-text'),
            doors: document.querySelectorAll('.door'),
            winMessage: document.querySelector('.win-message'),
            playAgainButton: document.querySelector('.play-again'),
            winSound: document.getElementById('win-sound'),
            wrongSound: document.getElementById('wrong-sound'),
            titleCharacter: document.querySelector('.title-character')
        };

        this.setupEventListeners();
    }

    init() {
        // 重置游戏状态
        this.gameState = {
            isCountingDown: true,
            isGameActive: false,
            targetCharacter: null,
            characterPositions: [],
            remainingDoors: 4
        };

        // 随机选择目标角色
        const randomIndex = Math.floor(Math.random() * characters.length);
        this.gameState.targetCharacter = characters[randomIndex];

        // 倒计时期间显示问号图片
        this.elements.titleCharacter.src = 'images/question-mark.png';
        this.elements.titleCharacter.alt = '问号';

        // 随机分配角色位置
        this.gameState.characterPositions = this.shuffleArray(characters.map(char => char.id));

        // 更新门后的角色图片
        this.elements.doors.forEach((door, index) => {
            const characterId = this.gameState.characterPositions[index];
            const character = characters.find(char => char.id === characterId);
            const characterImg = door.querySelector('.character');
            characterImg.src = character.image;
            characterImg.alt = character.name;
            characterImg.classList.remove('jumping', 'disappointed', 'peeking');
        });

        // 重置UI状态
        this.elements.winMessage.classList.remove('show');
        this.elements.playAgainButton.style.display = 'none';

        // 记忆期间：门打开，显示角色
        this.elements.doors.forEach(door => {
            const doorInner = door.querySelector('.door-inner');
            doorInner.classList.add('open');
        });

        // 显示记忆提示语
        const memoryHint = document.getElementById('memoryHint');
        if (memoryHint) {
            memoryHint.style.display = 'block';
        }

        // 开始倒计时
        this.startCountdown();
    }

    startCountdown() {
        let countdown = 3;

        const countdownInterval = setInterval(() => {
            countdown--;

            if (countdown <= 0) {
                clearInterval(countdownInterval);
                this.gameState.isCountingDown = false;
                this.gameState.isGameActive = true;
                this.closeAllDoors();
            }
        }, 1000);
    }

    closeAllDoors() {
        // 隐藏记忆提示语
        const memoryHint = document.getElementById('memoryHint');
        if (memoryHint) {
            memoryHint.style.display = 'none';
        }

        this.elements.doors.forEach(door => {
            setTimeout(() => {
                const doorInner = door.querySelector('.door-inner');
                doorInner.classList.remove('open');
            }, 100);
        });

        // 所有门关闭后显示目标角色图片
        setTimeout(() => {
            this.elements.titleCharacter.src = this.gameState.targetCharacter.image;
            this.elements.titleCharacter.alt = this.gameState.targetCharacter.name;
        }, 500);
    }

    openDoor(doorIndex) {
        const door = this.elements.doors[doorIndex];
        const doorInner = door.querySelector('.door-inner');
        doorInner.classList.add('open');
        return door;
    }

    checkSelection(doorIndex) {
        if (!this.gameState.isGameActive) return;

        const selectedCharacterId = this.gameState.characterPositions[doorIndex];
        const door = this.openDoor(doorIndex);
        const characterImg = door.querySelector('.character');

        // 减少剩余门数量
        this.gameState.remainingDoors--;

        if (selectedCharacterId === this.gameState.targetCharacter.id) {
            this.handleWin(door, characterImg);
        } else {
            this.handleWrong(door, characterImg);
        }
    }

    handleWin(door, characterImg) {
        characterImg.classList.remove('peeking');
        characterImg.classList.add('jumping');

        this.elements.winMessage.classList.add('show');

        try {
            this.elements.winSound.currentTime = 0;
            this.elements.winSound.play();
        } catch (e) {
            console.log('无法播放声音:', e);
        }

        this.gameState.isGameActive = false;
        this.elements.playAgainButton.style.display = 'block';

        setTimeout(() => {
            this.elements.doors.forEach(d => {
                const doorInner = d.querySelector('.door-inner');
                doorInner.classList.add('open');
                const img = d.querySelector('.character');
                img.classList.remove('peeking');
                if (img !== characterImg) {
                    img.classList.add('disappointed');
                }
            });
        }, 1000);
    }

    handleWrong(door, characterImg) {
        characterImg.classList.remove('peeking');
        characterImg.classList.add('disappointed');

        try {
            this.elements.wrongSound.currentTime = 0;
            this.elements.wrongSound.play();
        } catch (e) {
            console.log('无法播放声音:', e);
        }

        setTimeout(() => {
            const doorInner = door.querySelector('.door-inner');
            doorInner.classList.remove('open');
            characterImg.classList.remove('disappointed');
        }, 1000);
    }

    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    setupEventListeners() {
        this.elements.doors.forEach((door, index) => {
            door.addEventListener('click', () => {
                if (this.gameState.isGameActive && !door.querySelector('.door-inner').classList.contains('open')) {
                    this.checkSelection(index);
                }
            });
        });

        this.elements.playAgainButton.addEventListener('click', () => {
            this.init();
        });
    }
}

// 游戏切换管理
function showGame(gameType) {
    if (gameType === 'cup-flip') {
        window.location.href = 'cup-flip.html';
        return;
    } else if (gameType === 'hat-trick') {
        window.location.href = 'hat-trick.html';
        return;
    } else if (gameType === 'find-character') {
        mainMenu.style.display = 'none';
        gameContainer.style.display = 'block';
        currentGame = gameType;
        gameInstance = new FindCharacterGame();
        gameInstance.init();
    }
}

function backToMain() {
    mainMenu.style.display = 'flex';
    gameContainer.style.display = 'none';
    currentGame = null;
    gameInstance = null;
}

// 主界面事件监听
document.addEventListener('DOMContentLoaded', () => {
    // 游戏卡片点击事件
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        card.addEventListener('click', () => {
            const gameType = card.dataset.game;
            showGame(gameType);
        });
    });

    // 为其他游戏预留的占位符
    window.showGame = showGame;
    window.backToMain = backToMain;
});