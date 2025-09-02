// 游戏角色数据
const characters = [
    { id: 0, name: '海绵宝宝', image: 'images/spongebob.png' },
    { id: 1, name: '派大星', image: 'images/patrick.png' },
    { id: 2, name: '章鱼哥', image: 'images/squidward.png' },
    { id: 3, name: '蟹老板', image: 'images/mr-krabs.png' }
];

// 游戏状态变量
let gameState = {
    isCountingDown: true,
    isGameActive: false,
    targetCharacter: null,
    characterPositions: [],
    remainingDoors: 4
};

// DOM元素
const elements = {
    countdownTimer: document.querySelector('.countdown-timer'),
    countdownText: document.querySelector('.countdown-text'),
    doors: document.querySelectorAll('.door'),
    winMessage: document.querySelector('.win-message'),
    playAgainButton: document.querySelector('.play-again'),
    winSound: document.getElementById('win-sound'),
    wrongSound: document.getElementById('wrong-sound'),
    titleCharacter: document.querySelector('.title-character')
};

// 初始化游戏
function initGame() {
    // 重置游戏状态
    gameState = {
        isCountingDown: true,
        isGameActive: false,
        targetCharacter: null,
        characterPositions: [],
        remainingDoors: 4
    };
    
    // 随机选择目标角色
    const randomIndex = Math.floor(Math.random() * characters.length);
    gameState.targetCharacter = characters[randomIndex];
    
    // 倒计时期间显示问号图片
    elements.titleCharacter.src = 'images/question-mark.png';
    elements.titleCharacter.alt = '问号';
    
    // 随机分配角色位置
    gameState.characterPositions = shuffleArray(characters.map(char => char.id));
    
    // 更新门后的角色图片
    elements.doors.forEach((door, index) => {
        const characterId = gameState.characterPositions[index];
        const character = characters.find(char => char.id === characterId);
        const characterImg = door.querySelector('.character');
        characterImg.src = character.image;
        characterImg.alt = character.name;
        characterImg.classList.remove('jumping', 'disappointed', 'peeking');
        // 不添加peeking类，保持图片静态
    });
    
    // 重置UI状态
    elements.winMessage.classList.remove('show');
    elements.playAgainButton.style.display = 'none';
    
    // 开始倒计时
    startCountdown();
}
// 倒计时函数（在后台进行，不显示在页面上）
function startCountdown() {
    let countdown = 3;
    
    const countdownInterval = setInterval(() => {
        countdown--;
        
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            gameState.isCountingDown = false;
            gameState.isGameActive = true;
            closeAllDoors();
        }
    }, 1000);
}


// 关闭所有门
function closeAllDoors() {
    elements.doors.forEach(door => {
        setTimeout(() => {
            const doorInner = door.querySelector('.door-inner');
            doorInner.classList.remove('open');
        }, 100); // 轻微延迟增加动画效果
    });
    
    // 所有门关闭后显示目标角色图片
    setTimeout(() => {
        elements.titleCharacter.src = gameState.targetCharacter.image;
        elements.titleCharacter.alt = gameState.targetCharacter.name;
    }, 500); // 延迟显示，确保门已关闭
}

// 打开指定的门
function openDoor(doorIndex) {
    const door = elements.doors[doorIndex];
    const doorInner = door.querySelector('.door-inner');
    doorInner.classList.add('open');
    
    return door;
}

// 检查选择是否正确
function checkSelection(doorIndex) {
    if (!gameState.isGameActive) return;
    
    const selectedCharacterId = gameState.characterPositions[doorIndex];
    const door = openDoor(doorIndex);
    const characterImg = door.querySelector('.character');
    
    // 减少剩余门数量
    gameState.remainingDoors--;
    
    if (selectedCharacterId === gameState.targetCharacter.id) {
        // 选择正确
        handleWin(door, characterImg);
    } else {
        // 选择错误
        handleWrong(door, characterImg);
    }
}

// 处理胜利情况
function handleWin(door, characterImg) {
    // 播放胜利动画
    characterImg.classList.remove('peeking');
    characterImg.classList.add('jumping');
    
    // 显示胜利消息
    elements.winMessage.classList.add('show');
    
    // 播放胜利音效
    try {
        elements.winSound.currentTime = 0;
        elements.winSound.play();
    } catch (e) {
        console.log('无法播放声音:', e);
    }
    
    // 游戏结束，显示再玩一次按钮
    gameState.isGameActive = false;
    elements.playAgainButton.style.display = 'block';
    
    // 打开所有门
    setTimeout(() => {
        elements.doors.forEach(d => {
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

// 处理错误情况
function handleWrong(door, characterImg) {
    // 播放失望动画
    characterImg.classList.remove('peeking');
    characterImg.classList.add('disappointed');
    
    // 播放错误音效
    try {
        elements.wrongSound.currentTime = 0;
        elements.wrongSound.play();
    } catch (e) {
        console.log('无法播放声音:', e);
    }
    
    // 短暂显示后关闭门
    setTimeout(() => {
        const doorInner = door.querySelector('.door-inner');
        doorInner.classList.remove('open');
        characterImg.classList.remove('disappointed');
        // 不添加peeking类，保持图片静态
    }, 1000);
}

// 数组随机排序
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// 事件监听器
function setupEventListeners() {
    // 门的点击事件
    elements.doors.forEach((door, index) => {
        door.addEventListener('click', () => {
            if (gameState.isGameActive && !door.querySelector('.door-inner').classList.contains('open')) {
                checkSelection(index);
            }
        });
    });
    
    // 再玩一次按钮点击事件
    elements.playAgainButton.addEventListener('click', initGame);
}

// 初始化游戏和事件监听器
function startGame() {
    setupEventListeners();
    initGame();
}

// 页面加载完成后启动游戏
window.addEventListener('load', startGame);