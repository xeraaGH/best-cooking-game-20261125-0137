// demo.js — screenshot scenes. Each scene starts a real shift through the
// game's own startShift machinery and then arranges the same state a player
// could reach by playing: orders on the board, food on the grill and board,
// a plate mid-assembly, a finished plate at the window. The screenshots are
// real renders of the game's own code, just staged.

import { RECIPES } from './config.js';
import { makePlate } from './world.js';

function station(world, kind, item) {
  return world.stations.find((s) => s.kind === kind && (item === undefined || s.item === item));
}

function giveOrder(world, recipeId, patienceRatio) {
  const recipe = RECIPES.find((r) => r.id === recipeId);
  const patienceMax = 70;
  world.orders.push({
    id: 900 + world.orders.length,
    recipe,
    patience: patienceMax * patienceRatio,
    patienceMax,
    born: world.elapsed,
  });
}

export function applyScene(world, scene) {
  world.startShift();
  world.orders = [];

  if (scene === 'cover') {
    // The fullest moment: three orders, a burger mid-assembly, grill + board busy.
    world.elapsed = 46;
    world.timeLeft = 134;
    world.coins = 38;
    world.served = 2;
    world.combo = 2;
    world.comboTimer = 14;
    giveOrder(world, 'burger', 0.72);
    giveOrder(world, 'soup', 0.55);
    giveOrder(world, 'salad', 0.85);
    const plate = makePlate();
    plate.stack.push('bun', 'grilledPatty', 'choppedTomato');
    world.passCounter[0] = plate;
    const board = station(world, 'board');
    board.slot = { kind: 'tomato' };
    board.progress = 0.55;
    const grill = station(world, 'grill');
    grill.slots[0] = { kind: 'patty', t: 3.6, done: false, burnt: false };
    grill.slots[1] = { kind: 'bread', t: 3.4, done: true, burnt: false };
    world.chef.x = 560;
    world.chef.y = 480;
    world.chef.held = { kind: 'choppedLettuce' };
    world.showMessage('Burger on the pass — add lettuce, then serve it!');
  } else if (scene === 'orders') {
    // Early shift: two fresh orders, chef carrying a tomato from the crates.
    world.elapsed = 12;
    world.timeLeft = 168;
    giveOrder(world, 'burger', 0.95);
    giveOrder(world, 'melt', 0.9);
    world.chef.x = 620;
    world.chef.y = 250;
    world.chef.held = { kind: 'tomato' };
    world.showMessage('New order! Chop the tomato, grill the patty.');
  } else if (scene === 'serve') {
    // A finished Sunset Burger in hand, its ticket waiting at the window.
    world.elapsed = 96;
    world.timeLeft = 84;
    world.coins = 71;
    world.served = 5;
    world.combo = 3;
    world.comboTimer = 16;
    giveOrder(world, 'burger', 0.45);
    giveOrder(world, 'soup', 0.7);
    const plate = makePlate();
    plate.stack.push('bun', 'grilledPatty', 'choppedTomato', 'choppedLettuce');
    world.chef.x = 880;
    world.chef.y = 480;
    world.chef.held = plate;
    world.addFloater(1090, 520, '+21 coins  x1.5 combo', '#ffd94d');
    world.showMessage('Burger complete — serve it at the window!');
  } else if (scene === 'rush') {
    // Late shift: four tickets, low timer, grill and pot both running.
    world.elapsed = 152;
    world.timeLeft = 28;
    world.coins = 96;
    world.served = 8;
    world.combo = 4;
    world.comboTimer = 9;
    world.hearts = 2;
    giveOrder(world, 'burger', 0.4);
    giveOrder(world, 'salad', 0.28);
    giveOrder(world, 'melt', 0.6);
    giveOrder(world, 'soup', 0.5);
    const grill = station(world, 'grill');
    grill.slots[0] = { kind: 'patty', t: 4.2, done: false, burnt: false };
    grill.slots[1] = { kind: 'patty', t: 5.0, done: true, burnt: false };
    const pot = station(world, 'pot');
    pot.soup = { t: 3.8, done: false };
    const plate = makePlate();
    plate.stack.push('choppedLettuce', 'choppedTomato');
    world.passCounter[0] = plate;
    world.chef.x = 700;
    world.chef.y = 460;
    world.chef.held = { kind: 'choppedOnion' };
    world.showMessage('28 seconds left — the rush is on!');
  }
}
