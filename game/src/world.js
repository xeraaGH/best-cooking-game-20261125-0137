// world.js — the kitchen itself: stations, orders, the chef, the shift clock,
// and every interaction (pick up, chop, grill, plate, serve, bin). Pure game
// logic; drawing lives in render.js.

import {
  CANVAS_W, CANVAS_H, HUD_H, SHIFT_SECONDS, MAX_HEARTS, MAX_ORDERS,
  CHEF_SPEED, INTERACT_RANGE, INGREDIENTS, RECIPES,
  orderIntervalAt, orderPatienceAt,
} from './config.js';

let orderSeq = 0;

export function makePlate() {
  return { kind: 'plate', stack: [] };
}

export function isPlate(item) {
  return item && item.kind === 'plate';
}

// A plate matches a recipe when its stack holds exactly the recipe's items.
export function plateMatchesRecipe(plate, recipe) {
  if (!isPlate(plate)) return false;
  const have = [...plate.stack].sort();
  const want = [...recipe.needs].sort();
  return have.length === want.length && have.every((k, i) => k === want[i]);
}

export function recipeForPlate(plate) {
  return RECIPES.find((r) => plateMatchesRecipe(plate, r)) || null;
}

function pickRecipe(elapsed) {
  // Early on, favour the simple dishes; the full menu opens as the shift heats up.
  const pool = elapsed < 25 ? RECIPES.filter((r) => r.id !== 'burger')
    : elapsed < 70 ? RECIPES.filter((r) => r.id !== 'soup')
      : RECIPES;
  return pool[Math.floor(Math.random() * pool.length)];
}

export class World {
  constructor(sounds) {
    this.sounds = sounds;
    this.reset();
  }

  reset() {
    this.screen = 'title'; // title | playing | paused | results
    this.elapsed = 0;
    this.timeLeft = SHIFT_SECONDS;
    this.coins = 0;
    this.served = 0;
    this.expiredCount = 0;
    this.hearts = MAX_HEARTS;
    this.combo = 0;
    this.comboTimer = 0;
    this.bestCombo = 0;
    this.orderTimer = 6; // first order arrives a few seconds in
    this.orders = [];
    this.chef = { x: CANVAS_W / 2, y: 470, dir: 0, held: null, walkPhase: 0, moving: false };
    this.floaters = []; // {x, y, text, color, ttl}
    this.message = null; // {text, ttl} — a short toast under the HUD
    this.servedFlash = 0; // counts down after a serve, for the window glow
    this.lastTickSecond = -1;
    this.stations = buildStations();
    this.passCounter = [null, null]; // two plate slots on the pass counter
  }

  startShift() {
    this.reset();
    this.screen = 'playing';
    this.sounds.ensure();
    this.spawnOrder();
    this.showMessage('Shift started! First order is up — grab a plate.');
  }

  showMessage(text, ttl) {
    this.message = { text, ttl: ttl || 3.2 };
  }

  addFloater(x, y, text, color) {
    this.floaters.push({ x, y, text, color: color || '#fff', ttl: 1.4 });
  }

  spawnOrder() {
    if (this.orders.length >= MAX_ORDERS) return;
    const recipe = pickRecipe(this.elapsed);
    const patience = orderPatienceAt(this.elapsed);
    this.orders.push({
      id: ++orderSeq,
      recipe,
      patience,
      patienceMax: patience,
      born: this.elapsed,
    });
    this.sounds.orderIn();
  }

  // --- stations -----------------------------------------------------------

  stationAt(x, y) {
    let best = null;
    let bestD = Infinity;
    for (const st of this.stations) {
      const d = Math.hypot(st.x - x, st.y - y);
      if (d < bestD) { bestD = d; best = st; }
    }
    return bestD <= INTERACT_RANGE ? best : null;
  }

  nearestStation() {
    return this.stationAt(this.chef.x, this.chef.y);
  }

  // --- chef movement ------------------------------------------------------

  moveChef(vx, vy, dt) {
    const c = this.chef;
    c.x = Math.max(40, Math.min(CANVAS_W - 40, c.x + vx * CHEF_SPEED * dt));
    c.y = Math.max(HUD_H + 118, Math.min(CANVAS_H - 46, c.y + vy * CHEF_SPEED * dt));
    c.moving = vx !== 0 || vy !== 0;
    if (c.moving) {
      c.dir = Math.atan2(vy, vx);
      c.walkPhase += dt * 11;
    }
  }

  // --- interaction --------------------------------------------------------
  // One press of E / Space / click does the sensible thing at the nearest station.

  interact() {
    if (this.screen !== 'playing') return;
    const st = this.nearestStation();
    if (!st) return;
    this.sounds.ensure();
    const held = this.chef.held;

    if (st.kind === 'crate') {
      this.crateInteract(st, held);
    } else if (st.kind === 'board') {
      this.boardInteract(st, held);
    } else if (st.kind === 'grill') {
      this.grillInteract(st, held);
    } else if (st.kind === 'pot') {
      this.potInteract(st, held);
    } else if (st.kind === 'plates') {
      this.platesInteract(st, held);
    } else if (st.kind === 'pass') {
      this.passInteract(st, held);
    } else if (st.kind === 'window') {
      this.windowInteract(st, held);
    } else if (st.kind === 'bin') {
      this.binInteract(st, held);
    }
  }

  crateInteract(st, held) {
    // A crate hands out its ingredient; holding a plate adds it straight on.
    if (isPlate(held)) {
      held.stack.push(st.item);
      this.sounds.putdown();
      this.addFloater(this.chef.x, this.chef.y - 52, INGREDIENTS[st.item].name, '#ffe9b0');
      return;
    }
    if (held) { this.showMessage('Hands full — serve or bin what you are holding first.'); this.sounds.wrong(); return; }
    this.chef.held = { kind: st.item };
    this.sounds.pickup();
  }

  boardInteract(st, held) {
    if (st.slot) {
      // Something is on the board: chop it, or take it back.
      const item = st.slot;
      if (INGREDIENTS[item.kind] && INGREDIENTS[item.kind].chop) {
        st.progress += 1 / 3;
        this.sounds.chop();
        if (st.progress >= 1) {
          st.slot = { kind: INGREDIENTS[item.kind].into };
          st.progress = 0;
          this.sounds.chopDone();
          this.addFloater(st.x, st.y - 46, 'Chopped!', '#b7f5c0');
        }
      } else if (!held) {
        this.chef.held = st.slot;
        st.slot = null;
        st.progress = 0;
        this.sounds.pickup();
      }
      return;
    }
    if (held && !isPlate(held) && INGREDIENTS[held.kind] && INGREDIENTS[held.kind].chop) {
      st.slot = held;
      st.progress = 0;
      this.chef.held = null;
      this.sounds.putdown();
    } else if (held) {
      this.showMessage('Only fresh tomato, lettuce or onion go on the chopping board.');
      this.sounds.wrong();
    }
  }

  grillInteract(st, held) {
    // The grill has two slots. Drop a grillable item in, or pick a finished one up.
    const slot = st.slots.find((s) => s && s.done && !s.burnt)
      || st.slots.find((s) => s === null);
    if (held && !isPlate(held) && INGREDIENTS[held.kind] && INGREDIENTS[held.kind].grill) {
      const empty = st.slots.findIndex((s) => s === null);
      if (empty === -1) { this.showMessage('The grill is full — wait for a slot.'); this.sounds.wrong(); return; }
      st.slots[empty] = { kind: held.kind, t: 0, done: false, burnt: false };
      this.chef.held = null;
      this.sounds.grillStart();
      return;
    }
    if (slot) {
      if (slot.done) {
        if (!held) {
          this.chef.held = { kind: INGREDIENTS[slot.kind].into };
          st.slots[st.slots.indexOf(slot)] = null;
          this.sounds.pickup();
        } else {
          this.showMessage('Hands full — put something down first.');
          this.sounds.wrong();
        }
      }
      return;
    }
    if (held) {
      this.showMessage('Only patties and sourdough go on the grill.');
      this.sounds.wrong();
    }
  }

  potInteract(st, held) {
    // Two chopped tomatoes in the pot simmer into a bowl of Ember Soup.
    if (st.soup && st.soup.done) {
      if (!held) {
        this.chef.held = { kind: 'soup' };
        st.soup = null;
        this.sounds.pickup();
      } else {
        this.showMessage('Hands full — put something down first.');
        this.sounds.wrong();
      }
      return;
    }
    if (held && held.kind === 'choppedTomato' && !isPlate(held)) {
      st.tomatoes = (st.tomatoes || 0) + 1;
      this.chef.held = null;
      this.sounds.putdown();
      if (st.tomatoes >= 2) {
        st.soup = { t: 0, done: false };
        st.tomatoes = 0;
        this.sounds.grillStart();
        this.addFloater(st.x, st.y - 46, 'Soup simmering…', '#ffb27a');
      }
      return;
    }
    if (held) {
      this.showMessage('The pot only takes chopped tomato — two of them.');
      this.sounds.wrong();
    }
  }

  platesInteract(st, held) {
    if (held) { this.showMessage('Hands full — put something down first.'); this.sounds.wrong(); return; }
    this.chef.held = makePlate();
    this.sounds.pickup();
  }

  passInteract(st, held) {
    // The pass counter parks a plate (or a single item) while you cook.
    const idx = st.slotIndex;
    if (held && this.passCounter[idx] === null) {
      this.passCounter[idx] = held;
      this.chef.held = null;
      this.sounds.putdown();
      return;
    }
    if (!held && this.passCounter[idx]) {
      this.chef.held = this.passCounter[idx];
      this.passCounter[idx] = null;
      this.sounds.pickup();
    }
  }

  windowInteract(st, held) {
    // Serve a plate (or a lone soup bowl) that matches an open order.
    if (!held) return;
    let dish = null;
    if (isPlate(held)) dish = recipeForPlate(held);
    else if (held.kind === 'soup') dish = RECIPES.find((r) => r.id === 'soup');
    if (!dish) {
      this.showMessage('That plate does not match any order yet — check the board.');
      this.sounds.wrong();
      return;
    }
    const order = this.orders.find((o) => o.recipe.id === dish.id);
    if (!order) {
      this.showMessage(`No one ordered a ${dish.name} right now.`);
      this.sounds.wrong();
      return;
    }
    this.serveOrder(order, dish);
  }

  binInteract(st, held) {
    if (!held) return;
    this.chef.held = null;
    this.sounds.putdown();
    this.addFloater(st.x, st.y - 46, 'Binned', '#c9c9c9');
  }

  serveOrder(order, dish) {
    this.orders = this.orders.filter((o) => o.id !== order.id);
    this.chef.held = null;
    const patienceRatio = Math.max(0, order.patience / order.patienceMax);
    const tip = Math.round(dish.price * 0.6 * patienceRatio);
    this.combo += 1;
    this.comboTimer = 20;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    const mult = 1 + Math.min(2, this.combo - 1) * 0.25;
    const earned = Math.round((dish.price + tip) * mult);
    this.coins += earned;
    this.served += 1;
    this.servedFlash = 1.2;
    this.sounds.serve();
    this.addFloater(1090, 520, `+${earned} coins${this.combo > 1 ? `  x${mult.toFixed(2).replace(/\.?0+$/, '')} combo` : ''}`, '#ffd94d');
    this.showMessage(`Served a ${dish.name}! +${earned} coins${tip > 0 ? ` (tip ${tip})` : ''}.`);
  }

  expireOrder(order) {
    this.orders = this.orders.filter((o) => o.id !== order.id);
    this.expiredCount += 1;
    this.hearts -= 1;
    this.combo = 0;
    this.comboTimer = 0;
    this.sounds.expired();
    this.showMessage(`An order walked out — a ${order.recipe.name} went cold. (${this.hearts} ${this.hearts === 1 ? 'heart' : 'hearts'} left)`);
    if (this.hearts <= 0) this.endShift('The dinner rush wore the kitchen out.');
  }

  endShift(reason) {
    if (this.screen !== 'playing') return;
    this.screen = 'results';
    this.endReason = reason || 'Shift over!';
    this.sounds.stopSizzle();
    this.sounds.shiftEnd();
  }

  // --- per-frame update ---------------------------------------------------

  update(dt, input) {
    if (this.screen === 'title' || this.screen === 'results') return;
    if (this.screen === 'paused') return;

    this.elapsed += dt;
    this.timeLeft = Math.max(0, SHIFT_SECONDS - this.elapsed);
    const sec = Math.ceil(this.timeLeft);
    if (sec !== this.lastTickSecond) {
      this.lastTickSecond = sec;
      if (sec <= 10 && sec > 0) this.sounds.tick();
    }
    if (this.timeLeft <= 0) { this.endShift('Shift over — the dinner rush is done!'); return; }

    // Combo decay.
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.combo = 0;
    }
    if (this.servedFlash > 0) this.servedFlash -= dt;
    if (this.message) {
      this.message.ttl -= dt;
      if (this.message.ttl <= 0) this.message = null;
    }
    for (const f of this.floaters) { f.ttl -= dt; f.y -= 26 * dt; }
    this.floaters = this.floaters.filter((f) => f.ttl > 0);

    // New orders.
    this.orderTimer -= dt;
    if (this.orderTimer <= 0) {
      this.spawnOrder();
      this.orderTimer = orderIntervalAt(this.elapsed) * (0.85 + Math.random() * 0.3);
    }

    // Orders lose patience.
    for (const o of [...this.orders]) {
      o.patience -= dt;
      if (o.patience <= 0) this.expireOrder(o);
    }

    // Grill slots cook; left too long, food burns.
    let grilling = false;
    for (const st of this.stations) {
      if (st.kind === 'grill') {
        for (const slot of st.slots) {
          if (!slot) continue;
          grilling = true;
          slot.t += dt;
          const need = INGREDIENTS[slot.kind].grillSecs;
          if (!slot.done && slot.t >= need) { slot.done = true; this.sounds.grillDone(); }
          if (slot.done && slot.t >= need + 7 && !slot.burnt) {
            slot.burnt = true;
            this.sounds.burnt();
            this.showMessage('Something burned on the grill! Bin it and start over.');
          }
        }
      }
      if (st.kind === 'pot' && st.soup && !st.soup.done) {
        st.soup.t += dt;
        if (st.soup.t >= 5) { st.soup.done = true; this.sounds.grillDone(); }
      }
    }
    if (grilling) this.sounds.startSizzle(); else this.sounds.stopSizzle();

    // Movement: keyboard first, otherwise walk to a mouse click target.
    const mv = input.moveVector();
    if (mv.x !== 0 || mv.y !== 0) {
      input.moveTarget = null;
      input.pendingInteract = null;
      this.moveChef(mv.x, mv.y, dt);
    } else if (input.moveTarget) {
      const dx = input.moveTarget.x - this.chef.x;
      const dy = input.moveTarget.y - this.chef.y;
      const d = Math.hypot(dx, dy);
      if (d < 8) input.moveTarget = null;
      else this.moveChef(dx / d, dy / d, dt);
    }

    if (input.interactPressed()) this.interact();
  }
}

// --- the kitchen layout ---------------------------------------------------

function buildStations() {
  const stations = [];
  const crateY = 150;
  const crates = ['bun', 'patty', 'tomato', 'lettuce', 'cheese', 'onion', 'bread'];
  const crateX0 = 392;
  crates.forEach((item, i) => {
    stations.push({
      kind: 'crate', item, x: crateX0 + i * 118, y: crateY, w: 100, h: 76,
      label: INGREDIENTS[item].name,
    });
  });
  stations.push({ kind: 'board', x: 430, y: 300, w: 150, h: 92, label: 'Chopping Board', slot: null, progress: 0 });
  stations.push({ kind: 'grill', x: 650, y: 300, w: 190, h: 92, label: 'Grill', slots: [null, null] });
  stations.push({ kind: 'pot', x: 890, y: 300, w: 150, h: 92, label: 'Soup Pot', tomatoes: 0, soup: null });
  stations.push({ kind: 'plates', x: 1090, y: 300, w: 110, h: 92, label: 'Plates' });
  stations.push({ kind: 'bin', x: 1210, y: 300, w: 64, h: 92, label: 'Bin' });
  // The pass counter parks plates; two slots, each its own click target.
  stations.push({ kind: 'pass', slotIndex: 0, x: 470, y: 590, w: 170, h: 84, label: 'Pass Counter' });
  stations.push({ kind: 'pass', slotIndex: 1, x: 660, y: 590, w: 170, h: 84, label: 'Pass Counter' });
  stations.push({ kind: 'window', x: 1060, y: 590, w: 260, h: 84, label: 'Serving Window' });
  return stations;
}
