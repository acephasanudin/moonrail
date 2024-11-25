// Initialize hit counters for all characters
let playerHitCount = [0, 0]; // Assuming 2 players
let enemyHitCount = [0, 0]; // Assuming 2 enemies
let currentPlayer = 0; // Start with Player 1
let currentEnemy = 0; // Start with Enemy 1
let playerTeam = [
  { id: "player1", health: 100, defending: false },
  { id: "player2", health: 100, defending: false },
];
let enemyTeam = [
  { id: "enemy1", health: 100, defending: false },
  { id: "enemy2", health: 100, defending: false },
];
let turnCounter = 0; // Tracks turns within the current team
let isPlayerTurn = true; // Tracks whether it's the player's turn

// Ensure event listeners are only added once
function setUpPlayerTurn() {
  // Disable all buttons by default
  document.getElementById('attack-btn').disabled = true;
  document.getElementById('defend-btn').disabled = true;
  document.getElementById('special-btn').disabled = true;

  // Enable action buttons for the player to choose
  document.getElementById('attack-btn').disabled = false;
  document.getElementById('defend-btn').disabled = false;
  document.getElementById('special-btn').disabled = false;

  // Attach event listeners only if they are not already attached
  const attackButton = document.getElementById('attack-btn');
  const defendButton = document.getElementById('defend-btn');
  const specialButton = document.getElementById('special-btn');

  attackButton.removeEventListener('click', attackHandler);
  defendButton.removeEventListener('click', defendHandler);
  specialButton.removeEventListener('click', specialHandler);

  attackButton.addEventListener('click', attackHandler);
  defendButton.addEventListener('click', defendHandler);
  specialButton.addEventListener('click', specialHandler);
}

// Attack button handler
function attackHandler() {
  const target = enemyTeam[currentEnemy];
  const damage = Math.floor(Math.random() * 15) + 5; // Random damage between 5-20
  const finalDamage = target.defending ? Math.floor(damage / 2) : damage;

  target.health -= finalDamage;
  if(target.health < finalDamage) target.health = 0;
  console.log("target health : "+ target.health);
  console.log("Final damage : "+ finalDamage)
  
  playerHitCount[currentPlayer]++; // Increment hit counter for the player

  logMessage(`Player ${currentPlayer + 1} attacks Enemy ${currentEnemy + 1} for ${finalDamage} damage!`);

  // Apply hit animation to the enemy
  applyHitAnimation(target.id);
  updateHealth(enemyTeam, currentEnemy);

  // Check if the enemy is defeated
  if (target.health <= 0) {
    logMessage(`Enemy ${currentEnemy + 1} is defeated!`);
    enemyTeam.splice(currentEnemy, 1); // Remove defeated enemy
    if (enemyTeam.length === 0) {
      logMessage('All enemies defeated! You win!');
      endGame(); // End game if all enemies are defeated
      return;
    }
  }

  // Proceed to the next turn
  nextTurn();
}

// Defend button handler
function defendHandler() {
  // Defend action (reduces damage received)
  logMessage(`Player ${currentPlayer + 1} is defending!`);

  // Set player to defend
  playerTeam[currentPlayer].defending = true;

  // Proceed to the next turn
  nextTurn();
  updateHealth(enemyTeam, currentEnemy);
}

// Special Ability button handler
function specialHandler() {
  // Special Ability action
  const healAmount = Math.floor(Math.random() * 20) + 10; // Random heal between 10-30

  // Heal the player or apply special ability
  playerTeam[currentPlayer].health = Math.min(playerTeam[currentPlayer].health + healAmount, 100); // Cap at 100

  logMessage(`Player ${currentPlayer + 1} uses Special Ability to heal ${healAmount} HP!`);

  // Proceed to the next turn
  nextTurn();
  updateHealth(enemyTeam, currentEnemy);
}

// Function to handle the player's turn
function playerTurn() {
  // Check if the player is stunned
  if (playerHitCount[currentPlayer] >= 3) {
    logMessage(`Player ${currentPlayer + 1} is stunned and cannot act!`);
    playerHitCount[currentPlayer] = 0; // Reset hit counter after stun
    nextTurn(); // Skip player's turn if stunned
    return;
  }

  // Enable action buttons for the player to choose
  setUpPlayerTurn();
}

function nextTurn() {
  // Disable action buttons after the player's turn
  document.getElementById('attack-btn').disabled = true;
  document.getElementById('defend-btn').disabled = true;
  document.getElementById('special-btn').disabled = true;

  // Increment turn counter and switch between teams if needed
  turnCounter++;
  if (turnCounter === 2) {
    turnCounter = 0; // Reset turn counter
    isPlayerTurn = !isPlayerTurn; // Switch turn between player and enemy teams
  }

  // Check if all players or enemies are defeated
  if (playerTeam.length === 0) {
    logMessage("All players defeated! Game over.");
    endGame();
    return;
  }
  if (enemyTeam.length === 0) {
    logMessage("All enemies defeated! You win!");
    endGame();
    return;
  }

  // Update the current actor for the turn
  if (isPlayerTurn) {
    currentPlayer = turnCounter % playerTeam.length;
    playerTurn();
  } else {
    currentEnemy = turnCounter % enemyTeam.length;
    enemyTurn();
  }
}

// Function to handle the enemy turn (AI logic)
function enemyTurn() {
  setTimeout(() => {
    // Check if the enemy is stunned
    if (enemyHitCount[currentEnemy] >= 3) {
      logMessage(`Enemy ${currentEnemy + 1} is stunned and cannot act!`);
      enemyHitCount[currentEnemy] = 0;
      nextTurn(); // Move to next turn
      return;
    }

    // Randomly decide between attack, defend, or use special ability
    const action = getRandomAIAction();

    if (action === 'attack') {
      const damage = Math.floor(Math.random() * 15) + 5;
      const target = playerTeam[currentPlayer];
      const finalDamage = target.defending ? Math.floor(damage / 2) : damage;

      target.health -= finalDamage;
      applyHitAnimation(target.id);
      logMessage(`Enemy ${currentEnemy + 1} attacks Player ${currentPlayer + 1} for ${finalDamage} damage!`);
      updateHealth(playerTeam, currentPlayer);

      if (target.health <= 0) {
        logMessage(`Player ${currentPlayer + 1} is defeated!`);
        playerTeam.splice(currentPlayer, 1);
        if (playerTeam.length === 0) {
          logMessage('All players defeated! Game over.');
          endGame();
          return;
        }
      }
    } else if (action === 'defend') {
      logMessage(`Enemy ${currentEnemy + 1} is defending!`);
    } else if (action === 'special') {
      const healAmount = Math.floor(Math.random() * 20) + 10;
      const target = enemyTeam[currentEnemy];
      target.health = Math.min(target.health + healAmount, 100);
      logMessage(`Enemy ${currentEnemy + 1} uses Special Ability to heal ${healAmount} HP!`);
      updateHealth(enemyTeam, currentEnemy);
    }

    nextTurn();
  }, 1000);
}

// Function to log messages (top to bottom)
function logMessage(message) {
  const logElem = document.getElementById('game-log');
  
  // Create a new message element
  const newMessage = document.createElement('div');
  newMessage.textContent = message;

  // Insert the new message at the top of the log
  logElem.prepend(newMessage);
}

// Function to update health
function updateHealth(team, index) {
  const character = team[index];
  console.log(team)
  const healthElem = document.getElementById(`${character.id}-hp`);
  
  healthElem.textContent = `Health: ${character.health}`;
  console.log(character.health)

  // Get the health bar element (the container)
  const healthBar = document.getElementById(`${character.id}-health-bar`);

  // Ensure the health bar element exists
  if (healthBar) {
    const healthPercentage = (character.health / 100) * 100;
    
    // Update the width of the health bar
    healthBar.style.width = `${healthPercentage}%`;
  }
}

// Function to apply hit animation
function applyHitAnimation(characterId) {
  const characterElem = document.getElementById(characterId);
  if (!characterElem) {
    console.warn(`Element with ID "${characterId}" not found.`);
    return;
  }
  characterElem.classList.add('hit');
  setTimeout(() => characterElem.classList.remove('hit'), 300);
}

// Get a random action for the enemy
function getRandomAIAction() {
  if(currentPlayer > playerTeam.length) currentPlayer = playerTeam.length;
  if(currentEnemy > enemyTeam.length) currentEnemy = enemyTeam.length;
  const playerHealth = playerTeam[currentPlayer].health;
  const enemyHealth = enemyTeam[currentEnemy].health;

  if (enemyHealth < 30) {
    return 'special'; // Enemy heals when low on health
  } else if (playerHealth < 40) {
    return 'attack'; // Enemy attacks if the player is low on health
  } else {
    return Math.random() < 0.5 ? 'attack' : 'defend'; // Random choice between attack or defend
  }
}

// End the game
function endGame() {
  logMessage('Game Over');

  const popup = document.getElementById('game-popup');
  const title = document.getElementById('popup-title');
  const message = document.getElementById('popup-message');

  if (playerTeam.length === 0) {
    title.textContent = 'Game Over!';
    message.textContent = 'All your characters were defeated. Better luck next time!';
  } else if (enemyTeam.length === 0) {
    title.textContent = 'Victory!';
    message.textContent = 'Congratulations! You defeated all enemies!';
  }

  // Show the popup
  popup.classList.remove('hidden');
}

// Restart Game Button
document.getElementById('popup-restart').addEventListener('click', () => {
  location.reload(); // Reload the page to restart the game
});

playerTurn()