const selectors = {
    boardContainer: document.querySelector('.board-container'),
    board: document.querySelector('.board'),
    moves: document.querySelector('.moves'),
    timer: document.querySelector('.timer'),
    start: document.querySelector('button'),
    win: document.querySelector('.win')
}

const state = {
    gameStarted: false,
    flippedCards: 0,
    totalFlips: 0,
    totalTime: 0,
    loop: null
}

const shuffle = array => {
    const clonedArray = [...array];
    for (let i = clonedArray.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [clonedArray[i], clonedArray[randomIndex]] = [clonedArray[randomIndex], clonedArray[i]];
    }
    return clonedArray;
}

const pickRandom = (array, items) => {
    const clonedArray = [...array];
    const randomPicks = [];
    for (let i = 0; i < items; i++) {
        const randomIndex = Math.floor(Math.random() * clonedArray.length);
        randomPicks.push(clonedArray[randomIndex]);
        clonedArray.splice(randomIndex, 1);
    }
    return randomPicks;
}

const generateGame = () => {
    const dimensions = parseInt(selectors.board.getAttribute('data-dimension'));
    if (dimensions % 2 !== 0) {
        throw new Error("The dimension of the board must be an even number.");
    }

    const emojis = ['🥔', '🍒', '🥑', '🌽', '🥕', '🍇', '🍉', '🍌', '🥭', '🍍'];
    const picks = pickRandom(emojis, (dimensions * dimensions) / 2);
    const items = shuffle([...picks, ...picks]);
    
    selectors.board.innerHTML = ''; 
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        cardBack.textContent = item;
        card.appendChild(cardFront);
        card.appendChild(cardBack);
        selectors.board.appendChild(card);
    });
}

const startGame = () => {
    if (state.gameStarted) {
        resetGame();
    }

    state.gameStarted = true;
    selectors.start.classList.add('disabled');

    state.loop = setInterval(() => {
        state.totalTime++;
        selectors.timer.innerText = `Time: ${state.totalTime} sec`;
    }, 1000);
}

const resetGame = () => {
    state.gameStarted = false;
    state.flippedCards = 0;
    state.totalFlips = 0;
    state.totalTime = 0;
    clearInterval(state.loop);

    selectors.moves.innerText = '0 moves';
    selectors.timer.innerText = 'Time: 0 sec';
    selectors.win.innerHTML = '';
    selectors.boardContainer.classList.remove('flipped');

    generateGame();
}

const flipCard = card => {
    if (!state.gameStarted) {
        startGame();
    }

    if (state.flippedCards < 2) {
        card.classList.add('flipped');
        state.flippedCards++;
        
        if (state.flippedCards === 2) {
            const flippedCards = document.querySelectorAll('.flipped:not(.matched)');
            if (flippedCards[0].querySelector('.card-back').textContent === flippedCards[1].querySelector('.card-back').textContent) {
                flippedCards.forEach(card => card.classList.add('matched'));
            }

            setTimeout(() => {
                flipBackCards();
            }, 1000);
        }
    }
}

const flipBackCards = () => {
    document.querySelectorAll('.card.flipped:not(.matched)').forEach(card => {
        card.classList.remove('flipped');
    });
    state.flippedCards = 0;

    if (document.querySelectorAll('.card:not(.matched)').length === 0) {
        setTimeout(() => {
            selectors.boardContainer.classList.add('flipped');
            selectors.win.innerHTML = `
                <span class="win-text">
                    You won!<br />
                    with <span class="highlight">${state.totalFlips}</span> moves<br />
                    under <span class="highlight">${state.totalTime}</span> seconds
                </span>
            `;
            clearInterval(state.loop);
        }, 1000);
    }
}

selectors.board.addEventListener('click', event => {
    const card = event.target.closest('.card');
    if (card && !card.classList.contains('flipped') && !card.classList.contains('matched')) {
        flipCard(card);
        state.totalFlips++;
        selectors.moves.innerText = `${state.totalFlips} moves`;
    }
});

selectors.start.addEventListener('click', startGame);
selectors.win.addEventListener('click', resetGame);

generateGame();
