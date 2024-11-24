let playerHealth = 100;
let enemyHealth = 100;

const playerHealthElem = document.getElementById('player-health');
const enemyHealthElem = document.getElementById('enemy-health');
const battleLog = document.getElementById('battle-log');

function logMessage(message) {
  const p = document.createElement('p');
  p.textContent = message;
  battleLog.appendChild(p);
  battleLog.scrollTop = battleLog.scrollHeight;
}

document.getElementById('attack-btn').addEventListener('click', () => {
  const damage = Math.floor(Math.random() * 20) + 5; // 5-25 damage
  enemyHealth -= damage;
  logMessage(`Player attacks for ${damage} damage!`);
  enemyHealthElem.textContent = Math.max(enemyHealth, 0);

  if (enemyHealth <= 0) {
    logMessage('Enemy defeated! You win!');
    endGame();
    return;
  }

  enemyTurn();
});

document.getElementById('defend-btn').addEventListener('click', () => {
  logMessage('Player defends! Damage taken reduced on next attack.');
  enemyTurn(true);
});

function enemyTurn(playerDefended = false) {
  setTimeout(() => {
    const damage = Math.floor(Math.random() * 15) + 5; // 5-20 damage
    const finalDamage = playerDefended ? Math.floor(damage / 2) : damage;
    playerHealth -= finalDamage;
    logMessage(`Enemy attacks for ${finalDamage} damage!`);
    playerHealthElem.textContent = Math.max(playerHealth, 0);

    if (playerHealth <= 0) {
      logMessage('You are defeated! Game over.');
      endGame();
    }
  }, 1000);
}

function endGame() {
  document.getElementById('attack-btn').disabled = true;
  document.getElementById('defend-btn').disabled = true;
}
