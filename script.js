// Game state
const gameState = {
    cookies: 0,
    cookiesPerSecond: 0,
    cookiesPerClick: 1,
    upgrades: {
        // Click upgrades
        "better-clicks": {
            name: "Sticky Fingers",
            cost: 20,
            owned: 0,
            effect: 1,
            type: "click"
        },
        "double-clicks": {
            name: "Cookie Gloves",
            cost: 100,
            owned: 0,
            effect: 2, // Multiplier
            type: "click"
        },
        
        // Auto-clicker upgrades
        "cursor": {
            name: "Cursor",
            cost: 10,
            owned: 0,
            effect: 1,
            type: "auto"
        },
        "grandma": {
            name: "Grandma",
            cost: 50,
            owned: 0,
            effect: 5,
            type: "auto"
        },
        "bakery": {
            name: "Bakery",
            cost: 200,
            owned: 0,
            effect: 10,
            type: "auto"
        },
        "factory": {
            name: "Cookie Factory",
            cost: 500,
            owned: 0,
            effect: 20,
            type: "auto"
        },
        "mine": {
            name: "Chocolate Mine",
            cost: 2000,
            owned: 0,
            effect: 50,
            type: "auto"
        }
    }
};

// DOM elements
const cookieElement = document.getElementById('cookie');
const cookiesElement = document.getElementById('cookies');
const cpsElement = document.getElementById('cookies-per-second');
const cpcElement = document.getElementById('cookies-per-click');

// Load saved game
function loadGame() {
    const savedGame = localStorage.getItem('cookieClickerSave');
    if (savedGame) {
        const parsed = JSON.parse(savedGame);
        gameState.cookies = parsed.cookies || 0;
        gameState.cookiesPerSecond = parsed.cookiesPerSecond || 0;
        gameState.cookiesPerClick = parsed.cookiesPerClick || 1;
        gameState.upgrades = parsed.upgrades || gameState.upgrades;
    }
    updateUI();
}

// Save game
function saveGame() {
    localStorage.setItem('cookieClickerSave', JSON.stringify({
        cookies: gameState.cookies,
        cookiesPerSecond: gameState.cookiesPerSecond,
        cookiesPerClick: gameState.cookiesPerClick,
        upgrades: gameState.upgrades
    }));
}

// Update the UI
function updateUI() {
    cookiesElement.textContent = Math.floor(gameState.cookies);
    cpsElement.textContent = gameState.cookiesPerSecond;
    cpcElement.textContent = gameState.cookiesPerClick;
    
    // Update upgrade buttons
    for (const [id, upgrade] of Object.entries(gameState.upgrades)) {
        const element = document.getElementById(id);
        if (element) {
            element.querySelector('.cost').textContent = upgrade.cost;
            element.querySelector('.owned').textContent = upgrade.owned;
            
            const button = element.querySelector('.buy-btn');
            button.disabled = gameState.cookies < upgrade.cost;
        }
    }
}

// Handle cookie click
cookieElement.addEventListener('click', (e) => {
    const clickValue = gameState.cookiesPerClick;
    gameState.cookies += clickValue;
    
    // Show click effect
    const clickEffect = document.createElement('div');
    clickEffect.className = 'click-effect';
    clickEffect.textContent = `+${clickValue}`;
    clickEffect.style.left = `${e.offsetX}px`;
    clickEffect.style.top = `${e.offsetY}px`;
    cookieElement.appendChild(clickEffect);
    
    setTimeout(() => {
        clickEffect.remove();
    }, 1000);
    
    updateUI();
    saveGame();
});

// Handle upgrade purchases
document.querySelectorAll('.buy-btn').forEach(button => {
    button.addEventListener('click', () => {
        const upgradeId = button.closest('.upgrade').id;
        const upgrade = gameState.upgrades[upgradeId];
        
        if (gameState.cookies >= upgrade.cost) {
            gameState.cookies -= upgrade.cost;
            upgrade.owned += 1;
            
            if (upgrade.type === "click") {
                if (upgradeId === "double-clicks") {
                    gameState.cookiesPerClick *= upgrade.effect;
                } else {
                    gameState.cookiesPerClick += upgrade.effect;
                }
            } else {
                gameState.cookiesPerSecond += upgrade.effect;
            }
            
            // Increase cost by 20% each purchase
            upgrade.cost = Math.floor(upgrade.cost * 1.2);
            
            updateUI();
            saveGame();
        }
    });
});

// Game loop for passive cookie generation
setInterval(() => {
    if (gameState.cookiesPerSecond > 0) {
        gameState.cookies += gameState.cookiesPerSecond / 10;
        updateUI();
        saveGame();
    }
}, 100);

// Console cheat commands
window.gameCheats = {
    // Add cookies
    addCookies: function(amount) {
        if (typeof amount !== 'number' || amount <= 0) {
            console.error('Please specify a positive number of cookies to add');
            return;
        }
        gameState.cookies += amount;
        updateUI();
        saveGame();
        console.log(`Added ${amount} cookies! Total: ${gameState.cookies}`);
    },
    
    // Set cookies to specific amount
    setCookies: function(amount) {
        if (typeof amount !== 'number' || amount < 0) {
            console.error('Please specify a non-negative number of cookies');
            return;
        }
        gameState.cookies = amount;
        updateUI();
        saveGame();
        console.log(`Set cookies to ${amount}!`);
    },
    
    // Unlock all upgrades
    unlockAll: function() {
        for (const [id, upgrade] of Object.entries(gameState.upgrades)) {
            upgrade.owned = 10;
            upgrade.cost = 0;
            
            if (upgrade.type === "click") {
                if (id === "double-clicks") {
                    gameState.cookiesPerClick *= Math.pow(upgrade.effect, 10);
                } else {
                    gameState.cookiesPerClick += upgrade.effect * 10;
                }
            } else {
                gameState.cookiesPerSecond += upgrade.effect * 10;
            }
        }
        updateUI();
        saveGame();
        console.log('All upgrades unlocked and maxed out!');
    },
    
    // Reset game
    resetGame: function() {
        if (confirm('Are you sure you want to reset ALL game progress?')) {
            localStorage.removeItem('cookieClickerSave');
            location.reload();
        }
    },
    
    // Show help
    help: function() {
        console.log('Available cheat commands:');
        console.log('gameCheats.addCookies(amount) - Add cookies');
        console.log('gameCheats.setCookies(amount) - Set cookie count');
        console.log('gameCheats.unlockAll() - Unlock all upgrades');
        console.log('gameCheats.resetGame() - Reset all progress');
        console.log('gameCheats.help() - Show this help');
    }
};

// Initialize cheats
console.log('Cheat commands available! Type gameCheats.help() for options.');

// Initialize the game
loadGame();