document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.cell');
    const boardElement = document.querySelector('.board');
    let statusDisplay = document.querySelector('.status');

    let isVsAI = false;
    let aiDifficulty = 'easy';
    let aiTurn = false;

    let currentPlayer = 'X';
    let gameState = ["", "", "", "", "", "", "", "", ""];
    let gameActive = true;
    let xMoves = [];
    let oMoves = [];

    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8], 
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8], 
        [0, 4, 8],
        [2, 4, 6]  
    ];

    const checkWin = (board, player) => {
        return winningConditions.some(condition => {
            return condition.every(index => {
                return board[index] === player;
            });
        });
    };

    const handleResultValidation = () => {
        let roundWon = false;
        let winningLine = [];

        for (let i = 0; i <= 7; i++) {
            const winCondition = winningConditions[i];
            const a = gameState[winCondition[0]];
            const b = gameState[winCondition[1]];
            const c = gameState[winCondition[2]];

            if (a === '' || b === '' || c === '') {
                continue;
            }

            if (a === b && b === c) {
                roundWon = true;
                winningLine = winCondition;
                break;
            }
        }

        if (roundWon) {
            statusDisplay.innerText = `Player ${currentPlayer} Wins!`;
            gameActive = false;
            highlightWinningCells(winningLine);
            confetti({
                particleCount: 300,
                spread: 90,
                origin: { y: 0.5 }
            });
            return;
        }

        handlePlayerChange();
    };

    const highlightWinningCells = (winningLine) => {
        winningLine.forEach(index => {
            cells[index].classList.add('win');
        });
    };

    const handlePlayerChange = () => {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        statusDisplay.innerText = `It's ${currentPlayer}'s turn`;

        if (isVsAI && currentPlayer === 'O' && gameActive) {
            aiTurn = true;
            setTimeout(makeAIMove, 500);
        } else {
            aiTurn = false;
        }
    };

    // AI Logika
    const makeAIMove = () => {
        if (!gameActive) return;

        let moveIndex;

        if (aiDifficulty === 'easy') {
            moveIndex = getRandomMove();
        } else if (aiDifficulty === 'medium') {
            moveIndex = getBestMove(false);
        } else if (aiDifficulty === 'hard') {
            moveIndex = getBestMove(true);
        }

        if (moveIndex !== undefined) {
             const cell = document.getElementById((moveIndex + 1).toString());
             handleCellPlayed(cell, moveIndex);
             handleResultValidation();
        }
    };

    const getRandomMove = () => {
        const availableMoves = [];

        for (let i = 0; i < gameState.length; i++) {
            if (gameState[i] === "") {
                availableMoves.push(i);
            }
        }

        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    };

    const simulateState = (tempState, tempX, tempO, moveIdx, player) => {
        let newState = [...tempState];
        let newX = [...tempX];
        let newO = [...tempO];

        newState[moveIdx] = player;
        if (player === 'X') {
            newX.push(moveIdx);
            if (newX.length > 3) {
                const removed = newX.shift();
                newState[removed] = "";
            }
        } else {
            newO.push(moveIdx);
            if (newO.length > 3) {
                const removed = newO.shift();
                newState[removed] = "";
            }
        }
        return newState;
    };

    const getBestMove = (isHard) => {
        const availableMoves = [];

        for (let i = 0; i < gameState.length; i++) {
            if (gameState[i] === "") {
                availableMoves.push(i);
            }
        }
        
        for (let move of availableMoves) {
            const nextState = simulateState(gameState, xMoves, oMoves, move, 'O');
            if (checkWin(nextState, 'O')) return move;
        }

        for (let move of availableMoves) {
            const nextState = simulateState(gameState, xMoves, oMoves, move, 'X');
            if (checkWin(nextState, 'X')) return move;
        }

        if (!isHard) {
            return getRandomMove();
        }

        if (gameState[4] === "") return 4;
        
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(idx => gameState[idx] === "");
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }

        return getRandomMove();
    };

    const handleCellPlayed = (clickedCell, clickedCellIndex) => {
        gameState[clickedCellIndex] = currentPlayer;
        clickedCell.innerText = currentPlayer;
        clickedCell.classList.add(currentPlayer.toLowerCase(), 'pop');
        
        if (currentPlayer === 'X') {
            xMoves.push(clickedCellIndex);
            if (xMoves.length > 3) {
                const removedIndex = xMoves.shift();
                removeMoveHelper(removedIndex);
            }
        } else {
            oMoves.push(clickedCellIndex);
            if (oMoves.length > 3) {
                const removedIndex = oMoves.shift();
                removeMoveHelper(removedIndex);
            }
        }
    };

    const removeMoveHelper = (index) => {
        gameState[index] = "";
        const cellToRemove = document.getElementById((index + 1).toString());
        if (cellToRemove) {
            cellToRemove.innerText = "";
            cellToRemove.classList.remove('x', 'o', 'pop');
        }
    };

    const handleCellClick = (clickedCellEvent) => {
        if (aiTurn || !gameActive) return;

        const clickedCell = clickedCellEvent.target;
        const clickedCellIndex = parseInt(clickedCell.id) - 1;

        if (gameState[clickedCellIndex] !== "") {
            return;
        }

        handleCellPlayed(clickedCell, clickedCellIndex);
        handleResultValidation();
    };

    const handleCellKeydown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault(); 
            handleCellClick(event);
        }
    };

    const handleRestartGame = () => {
        gameActive = true;
        currentPlayer = 'X';
        aiTurn = false;
        gameState = ["", "", "", "", "", "", "", "", ""];
        xMoves = [];
        oMoves = [];
        statusDisplay.innerText = `It's ${currentPlayer}'s turn`;
        boardElement.classList.remove('draw');

        cells.forEach(cell => {
            cell.innerText = "";
            cell.classList.remove('x', 'o', 'win', 'pop');
        });
    };

    cells.forEach(cell => {
        cell.setAttribute('tabindex', '0');
        cell.addEventListener('click', handleCellClick);
        cell.addEventListener('keydown', handleCellKeydown);
    });

    const resetButton = document.querySelector('#reset');
    resetButton.addEventListener('click', handleRestartGame);
    
    const pvpBtn = document.getElementById('pvp-btn');
    const pveBtn = document.getElementById('pve-btn');
    const difficultySelect = document.getElementById('difficulty-select');
    const difficultyDropdown = document.getElementById('difficulty');

    if (pvpBtn && pveBtn && difficultySelect) {
        pvpBtn.addEventListener('click', () => {
            isVsAI = false;
            pvpBtn.classList.add('active');
            pveBtn.classList.remove('active');
            difficultySelect.classList.add('hidden');
            handleRestartGame();
        });

        pveBtn.addEventListener('click', () => {
            isVsAI = true;
            pveBtn.classList.add('active');
            pvpBtn.classList.remove('active');
            difficultySelect.classList.remove('hidden');
            handleRestartGame();
        });

        if (difficultyDropdown) {
            difficultyDropdown.addEventListener('change', (e) => {
                aiDifficulty = e.target.value;
                handleRestartGame();
            });
        }
    }

    const themeToggleButton = document.getElementById('theme-toggle');


    themeToggleButton.addEventListener('click', () => {
        const currentTheme = document.body.classList.contains('dark');
        if (currentTheme) {
            document.body.classList.remove('dark');
            themeToggleButton.innerText = '🌓';
        } else {
            document.body.classList.add('dark');
            themeToggleButton.innerText = '🌞';
        }
    });

    statusDisplay.innerText = `It's ${currentPlayer}'s turn`;
});
