// canvas variables
let canvasX = window.innerWidth;
let canvasY = window.innerHeight;

// game variables
let gameState;
let level;
const LEVELMAX = 5;
let pause;
let pauseComplete = true;
let turnInfo = "";

// control elements
let colorSlider;
let colorVal;
let commandInput;
let commandString = "";
let submitButton;
let rewards;

// position variables for control elements
let controlX;
let controlY;

// player variables
let health;
let regen;
let attack;
let accuracy;
let fuel;
let inventory = [];
inventoryMax = 3;

// enemy variables
let enemies = [];
let listX = [];
let listY = [];
const SIZEFACTOR = 7;

// constant names for items
const POTION = "health potion";
const SPOON = "rusty spoon";
const DAGGER = "dagger"
const SWORD = "sword";
const RING = "ring of regeneration";
const FUEL = "fuel";
const BACKPACK = "backpack";

function submit()
{
  commandString = commandInput.value();

  // if player took turn successfully, then enemy takes turn
  turnInfo = takePlayerTurn(commandString);

  // take enemy turn if player's turn was succesful
  if(turnInfo != "")
  {
    if(accuracy > 70)
    {
      fuel -= int(accuracy *  (7 / 100));
    }
    else if(accuracy <= 70 && accuracy > 50)
    {
      fuel -= int(accuracy *  (5 / 100));
    }
    else if(accuracy <= 50 && accuracy >= 0)
    {
      fuel -= int(accuracy *  (3 / 100));
    }

    turnInfo += takeEnemyTurn();

    // health regen
    health += regen;

    // game over if PLAYER's health falls below 0
    if(health <= 0 || fuel <= 0)
    {
      gameOver();
    }

  }
}

function gameOver()
{
  gameState = 2;
}

function takeEnemyTurn()
{
  let info;
  let sum = 0;

  for(let i = 0; i < enemies.length; i++)
  {
    sum += enemies[i];
  }

  // subtract from player health
  let damage = int(sum * (27 / 100)) + 1
  health -= damage;

  // set and return enemy turn info
  info = "Enemies attacked you for " + damage + " damage.\n";

  return info;
}

function takePlayerTurn(commandString)
{
  let info = "";
  let target = "";
  let acc;

  // format: attack X
  if(commandString.includes("attack", 0))
  {
    target = commandString["attack".length + 1];

    // attack enemy!
    if(target <= enemies.length)
    {
      // attack the enemy, record info
      info += attackEnemy(target);
    }
  }
  else if(commandString.includes("use", 0))
  {
    target = commandString.slice("use".length + 1);

    let targetInd = inventory.indexOf(target);

    if(targetInd != -1)
    {
      info += useItem(targetInd);
    }

  }
  else if(commandString.includes("drop", 0))
  {
    target = commandString.slice("drop".length + 1);

    let targetInd = inventory.indexOf(target);

    if(targetInd != -1)
    {
      info += dropItem(targetInd);
    }
  }

  return info;
}

function attackEnemy(target)
{
  info = "";
  acc = random(0, 100);

  if(acc <= accuracy)
  {
    enemies[target - 1] -= attack;

    info += "You struck enemy " + target + " for " + attack + " damage."
  }
  else
  {
    info += "You mised your strike in the dark!";
  }

  info += '\n';

  return info;
}


function displayInstructions()
{
  // set font
  let fontSize = canvasY / 21;
  fill(255, 255, 255);
  textSize(fontSize);

  // center text
  textAlign(CENTER);

  text("You are Square. Defeat the Circles.", canvasX / 2, canvasY * (.7 / 5));

  text("Enter text commands (attack/use/drop) to survive.", canvasX / 2, canvasY * (1.7 / 5));

  text("Use the slider to change the brightness of your torch, boosting your accuracy.\n This will drain your fuel every turn.", canvasX / 2, canvasY * (2.7 / 5));
}


function keyPressed()
{
  // Start next level
  if(keyCode === ENTER && pause && pauseComplete)
  {
    gameState = 1;

    pause = false;
    pauseComplete = false;

    colorSlider.show();
    commandInput.show();
    submitButton.show();

    if(level >= 1)
    {
      rewards.hide();

      // take item only if there is space
      if(inventory.length < inventoryMax)
      {
        inventory.push(rewards.value());
      }
    }

    level++;
    populateEnemies();

    loop();
  }
}


function pauseGame()
{
  background(0);

  pause = true;

  colorSlider.hide();
  commandInput.hide();
  submitButton.hide();

  // set font
  fill(255, 255, 255);
  let fontSize = canvasY / 21;
  textSize(fontSize);

  // center text
  textAlign(CENTER);

  text("Press Enter to continue...", canvasX / 2, canvasY * (4.5 / 5));

  noLoop();
}


function displayGameInfo()
{
  fill(255, 0, 0);

  rect(canvasX * (3 / 5), canvasY * (3.5 / 5), canvasX * (2 / 5), canvasY * (1.5 / 5));

  // set font
  let fontSize = canvasY / 35;
  let spacing = fontSize + 7;
  fill(0);
  textSize(fontSize);
  textAlign(LEFT);

  // print info
  text("Health: " + health, canvasX * (3 / 5) + 5, canvasY * (3.5 / 5) + spacing * 1);

  text("Attack: " + attack, canvasX * (3 / 5) + 5, canvasY * (3.5 / 5) + spacing * 2);

  text("Accuracy: " + int(accuracy) + "%", canvasX * (3 / 5) + 5, canvasY * (3.5 / 5) + spacing * 3);

  text("Fuel: " + int(fuel), canvasX * (3 / 5) + 5, canvasY * (3.5 / 5) + spacing * 4);

  // generate inventory info
  let inventoryString = "Inventory (Max - " + inventoryMax + "): ";
  let pixelLength = inventoryString.length;
  let pixelMax = canvasX * (2 / 5) ;


  for(let i = 0; i < inventory.length; i++)
  {
    pixelLength += (inventory[i].length + 2) * fontSize;

    if(pixelLength >= pixelMax)
    {
      inventoryString += '\n';
      pixelLength = (inventory[i] + 2) * fontSize;

      inventoryString += inventory[i];
    }
    else
    {
      inventoryString += inventory[i];
    }

    if(i != inventory.length - 1)
    {
      inventoryString += ", ";
    }

  }

  text(inventoryString, canvasX * (3 / 5) + 5, canvasY * (3.5 / 5) + spacing * 5.5);
}

function displayBattle()
{

  // display player
  fill(0, 0, 255);
  rect(canvasX * (20 / 100), canvasY * (40 / 100), 100, 100);

  // display ENEMIES
  let fontSize = canvasY / 35;
  textSize(fontSize);
  textAlign(CENTER, CENTER);


  for(let i = 0; i < enemies.length; i++)
  {
    fill(255, 0, 0);
    ellipse(listX[i], listY[i], enemies[i] * SIZEFACTOR);

    fill(0);
    text(i + 1,listX[i], listY[i]);
  }

}


function populateEnemies()
{
  let randStrength;
  let rangeStrength = [level * 3, level * 4];

  for(let i = 0; i < 1 + int(level / 2); i++)
  {
    randStrength = random(rangeStrength);

    enemies.push(randStrength);
  }


  // create a location for each enemy
  let distance;

  for(let i = 0; i < enemies.length; i++)
  {
    randX = random(canvasX * (30 / 100), canvasX * (80 / 100));
    randY = random(canvasY * (20 / 100), canvasY * (59 / 100));

    // check if randX, randY, overlap with existing positions
    for(let searchInd = 0; searchInd < listX.length; searchInd++)
    {
      distance = abs(dist(randX, randY, listX[searchInd], listY[searchInd]));

      // find new random position if circles overlap
      if(distance <= (enemies[searchInd] * SIZEFACTOR / 2) + (enemies[i] * SIZEFACTOR / 2))
      {
        searchInd = 0;

        randX = random(canvasX * (50 / 100), canvasX * (70 / 100));
        randY = random(canvasY * (20 / 100), canvasY * (59 / 100));
      }
    }

    listX.push(randX);
    listY.push(randY);

  }
}


function endLevel()
{
  // show interlevel content and prepare next level
  if(level != LEVELMAX)
  {
    pauseGame();

    displayEsotericText();

    displayReward();
  }
  else // player won!!!
  {
    gameState = 3;
  }
}

function displayEsotericText()
{
  // set font
  let fontSize = canvasY / 28;
  textSize(fontSize);
  fill(0, 255, 0);

  // center text
  textAlign(CENTER);

  // create message based on level that was completed
  let esotericText = "";

  // texts 1, 2, and 4 are adapted directly from Thomas O. Lambdin's translation of the gnostic gospel of Thomas
  if(level == 1)
  {
    esotericText = "And the quadrilateral said, \n\"Let the square who seeks continue seeking until they find.\n When they find, they will become troubled. \nWhen they becomes troubled, they will be astonished, \nand they will rule over the shapes.\"";
  }
  else if(level == 2)
  {
    esotericText = "The quadrilateral said, \n\"The kingdom of the progenitor is like a certain shape who wanted to kill\n a powerful shape. In their own house they drew their sword \nand stuck it into the wall in order \nto find out whether their hand could carry through. \nThen they slew the powerful shape.\"";
  }
  else if(level == 3)
  {
    esotericText = "The quadrilateral said, \n\"Though a circle's face is always equidistant from its center,\n its mind is ever fluctuating around lucidity.\"";
  }
  else if(level == 4)
  {
    esotericText = "The quadrilateral said, \n\"Blessed is the circle which becomes polygonal when consumed by a polygon; \nand cursed is the polygon whom the circle consumes, \nand the circle becomes polygonal.\"";
  }

  // display message
  text(esotericText, canvasX / 2, canvasY * (14 / 100));
}

function displayReward()
{
  // set font
  let fontSize = canvasY / 21;
  textSize(fontSize);
  fill(255, 255, 255);

  // center text
  textAlign(CENTER);

  // re-create rewards selection to reset options
  rewards = createSelect();
  rewards.position(canvasX * (4.5 / 10), canvasY * (4 / 10) + fontSize * 3.5);

  // set css color
  rewards.style('background-color', 'green');

  // label rewards
  text("Choose a Reward...", canvasX * (5 / 10), canvasY * (4 / 10));

  // declare variables for creating random loot
  let randIndex;
  let consumableIndices = [0, 1, 2];
  let gearIndices = [0, 1, 2, 3];
  const randomConsumable = [POTION, FUEL, BACKPACK];
  const randomGear = [SPOON, DAGGER, SWORD, RING];
  let rewardHistory = [];

  // establish maximum reward #
  let rewardMax = ((1 + (level - 1) * 2) < 5) ? (1 + (level - 1) * 2) : 5;

  // create random rewards to choose from
  for(let i = 0; i < rewardMax; i++)
  {
    // set a consumable every other iteration
    if(i % 2 == 0)
    {
      randIndex = random(consumableIndices);

      // if it's the first level, prevent a backpack from being dropped
      if(level == 1)
      {
        randIndex %= 2;
      }

      while(rewardHistory.includes(randomConsumable[randIndex]))
      {
        randIndex = random(consumableIndices);

        // if it's the first level, prevent a backpack from being dropped
        if(level == 1)
        {
          randIndex %= 2;
        }
      }

      rewards.option(randomConsumable[randIndex]);
      rewardHistory.push(randomConsumable[randIndex]);

    }

    // otherwise, set a piece of gear
    if(i % 2 == 1)
    {
      randIndex = random(gearIndices);

      while(rewardHistory.includes(randomGear[randIndex]))
      {
        randIndex = random(gearIndices);
      }

      rewards.option(randomGear[randIndex]);
      rewardHistory.push(randomGear[randIndex]);
    }
  }

  // show rewards
  rewards.show();

  // ensure that rewards have loaded in before unpausing
  pauseComplete = true;
}

function setStats()
{
  // generate regen
  regen = 0;

  for(let i = 0; i < inventory.length; i++)
  {
    if(inventory[i] == RING)
    {
      regen += 2;
    }
  }

  if(health > 100)
    health = 100;

  // generate attack
  attack = 0;

  for(let i = 0; i < inventory.length; i++)
  {
    if(inventory[i] == SPOON)
    {
      attack += 2;
    }
    else if(inventory[i] == DAGGER)
    {
      attack += 3;
    }
    else if(inventory[i] == SWORD)
    {
      attack += 5;
    }
  }

  // generate accuracy
  accuracy = map(colorVal, 0, 255, 0, 100);

  // update enemies
  for(let i = 0; i < enemies.length; i++)
  {
    if(enemies[i] <= 0)
    {
      enemies.splice(i, 1);
      listX.splice(i, 1);
      listY.splice(i, 1);
    }
  }

}

function setup()
{
  createCanvas(canvasX, canvasY);

  // initialize GAME variables
  gameState = 0;
  level = 0;

  // initialize PLAYER variables
  health = 100;
  regen = 2;
  fuel = 100;
  inventory.push(SPOON);

  controlX = canvasX / 4;
  controlY = canvasY * (7 / 10);

  colorSlider = createSlider(0, 255, 0);

  commandInput = createInput();

  submitButton = createButton("Submit");
  submitButton.mousePressed(submit);

  rewards = createSelect();

  let fontSize = canvasY / 21;

  rewards.position(canvasX * (4.5 / 10), canvasY * (4 / 10) + fontSize * 3.5);
  rewards.hide();

  colorSlider.position(controlX, controlY);
  commandInput.position(controlX + colorSlider.width + 35, controlY);
  submitButton.position(controlX + colorSlider.width +  35 + commandInput.width + 35, controlY);

  // set css color styles
  commandInput.style('background-color', 'white');
  submitButton.style('color', 'red');

  pause = false;
}


function displayTurnInfo()
{
  fill(255, 0, 0);

  // create dialogue box
  rect(0, canvasY * (3.7 / 5), canvasX * (3 / 5), canvasY * (1.3 / 5));

  // set font
  let fontSize = canvasY / 35;
  let spacing = fontSize + 7;

  fill(0);
  textSize(fontSize);
  textAlign(LEFT);

  text(turnInfo, 0 + 5, canvasY * (3.7 / 5) + fontSize * 1.98);
}


function useItem(targetInd)
{
  info = "";

  if(inventory[targetInd] == POTION)
  {
    let healthRegain = (50 < (100 - health))? 50: (100 - health);

    health += healthRegain;

    info += "You used a potion and regained " + healthRegain + " health.\n";

    inventory.splice(targetInd, 1);
  }
  else if(inventory[targetInd] == FUEL)
  {
    fuel += 70;

    info += "You have regained 70 fuel.\n";

    inventory.splice(targetInd, 1);
  }
  else if(inventory[targetInd] == BACKPACK)
  {
    inventoryMax += 2;

    info += "You put on a backpack and can now carry 2 more items.\n";

    inventory.splice(targetInd, 1);
  }

  return info;
}


function dropItem(targetInd)
{
  info = "You dropped a " + inventory[targetInd] + ".\n";

  inventory.splice(targetInd, 1);

  return info;
}


function draw()
{
  // instructions
  if(gameState == 0)
  {
    pauseGame();

    displayInstructions();
  }
  else if(gameState == 1) // play level loop (NOTE: each turn is driven by the submit function )
  {
    colorVal = colorSlider.value();
    background(colorVal);

    // establish stats
    setStats();

    // display game info
    displayGameInfo();

    // display most recent turn info
    displayTurnInfo();

    // draw player and enemies
    displayBattle();

    // display level #
    fill(255, 0, 0);
    textSize(canvasY / 28);
    textAlign(LEFT);
    text("Level: " + level, 0 + canvasX * (1 / 100), 0 + canvasY * (3 / 100))

    if(enemies.length == 0)
    {
      endLevel();
    }
  }
  else if(gameState == 2) // end
  {
    // pause game, erase prompt text
    pauseGame();
    background(0);

    // set font
    let fontSize = canvasY / 21;
    fill(255, 255, 255);
    textSize(fontSize);

    // center text
    textAlign(CENTER);

    // display game over text
    if(health <= 0)
    {
      text("You Died...", canvasX / 2, canvasY / 2);
    }
    else
    {
      text("You ran out of fuel...", canvasX / 2, canvasY / 2);
    }
  }
  else if(gameState == 3) // end
  {
    // pause game, erase prompt text
    pauseGame();
    background(0);

    // set font
    let fontSize = canvasY / 14;
    fill(255, 0, 0);
    textSize(fontSize);

    // center text
    textAlign(CENTER);

    // display victory text
    text("You Won...", canvasX / 2, canvasY / 2);
  }
  else // sanity check
  {
    fill(0, 255, 0);
    textSize(35);
    text("HMMMMM", 0, 0);
  }
}
