// render.js — everything the player sees, drawn on one canvas: the kitchen,
// the order board, the chef, the food, the HUD and the title/results screens.

import { CANVAS_W, CANVAS_H, HUD_H, SHIFT_SECONDS, MAX_HEARTS, MAX_ORDERS, INGREDIENTS, ingredientName } from './config.js';

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align, weight) {
  ctx.fillStyle = color || '#fff';
  ctx.font = `${weight || 600} ${size}px "Trebuchet MS", "Segoe UI", sans-serif`;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// --- food, drawn as little vector dishes -----------------------------------

export function drawIngredient(ctx, kind, cx, cy, s) {
  // s is roughly the diameter in px.
  ctx.save();
  ctx.translate(cx, cy);
  const u = s / 40;
  if (kind === 'bun') {
    ctx.fillStyle = '#e9bd6d';
    ctx.beginPath(); ctx.arc(0, 2 * u, 17 * u, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#c98f3d'; ctx.fillRect(-17 * u, 0, 34 * u, 4 * u);
    ctx.fillStyle = '#fff3d0';
    [[-9, -8], [0, -12], [9, -8]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x * u, y * u, 1.8 * u, 0, Math.PI * 2); ctx.fill(); });
  } else if (kind === 'patty' || kind === 'grilledPatty') {
    ctx.fillStyle = kind === 'grilledPatty' ? '#6b4429' : '#8a5a3b';
    roundRect(ctx, -18 * u, -7 * u, 36 * u, 14 * u, 7 * u); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1.5 * u;
    ctx.beginPath(); ctx.moveTo(-12 * u, -2 * u); ctx.lineTo(12 * u, -2 * u); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-12 * u, 3 * u); ctx.lineTo(8 * u, 3 * u); ctx.stroke();
    if (kind === 'grilledPatty') {
      ctx.strokeStyle = '#3d2412'; ctx.lineWidth = 2 * u;
      [[-8, -4], [0, -3], [8, -4]].forEach(([x, y]) => { ctx.beginPath(); ctx.moveTo(x * u, y * u); ctx.lineTo((x + 4) * u, (y + 6) * u); ctx.stroke(); });
    }
  } else if (kind === 'tomato' || kind === 'choppedTomato') {
    ctx.fillStyle = '#e04747';
    ctx.beginPath(); ctx.arc(0, 0, 15 * u, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3f9e4d';
    ctx.beginPath(); ctx.moveTo(0, -6 * u); ctx.lineTo(-6 * u, -13 * u); ctx.lineTo(0, -10 * u); ctx.lineTo(6 * u, -13 * u); ctx.lineTo(0, -6 * u); ctx.fill();
    if (kind === 'choppedTomato') {
      ctx.strokeStyle = '#b02a2a'; ctx.lineWidth = 1.6 * u;
      ctx.beginPath(); ctx.moveTo(-10 * u, -4 * u); ctx.lineTo(10 * u, 4 * u); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-10 * u, 4 * u); ctx.lineTo(10 * u, -4 * u); ctx.stroke();
    }
  } else if (kind === 'lettuce' || kind === 'choppedLettuce') {
    ctx.fillStyle = '#58b368';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath(); ctx.arc(-10 * u + i * 10 * u, (i % 2 ? 2 : -2) * u, 9 * u, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = '#2f7a3c'; ctx.lineWidth = 1.5 * u;
    ctx.beginPath(); ctx.moveTo(-12 * u, 0); ctx.quadraticCurveTo(0, -6 * u, 12 * u, 0); ctx.stroke();
  } else if (kind === 'cheese') {
    ctx.fillStyle = '#f2c94c';
    ctx.beginPath(); ctx.moveTo(-16 * u, 8 * u); ctx.lineTo(16 * u, 8 * u); ctx.lineTo(16 * u, -6 * u); ctx.lineTo(-16 * u, -6 * u); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d9a91f';
    [[-8, 0], [4, 2], [10, -2]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x * u, y * u, 2.4 * u, 0, Math.PI * 2); ctx.fill(); });
  } else if (kind === 'onion' || kind === 'choppedOnion') {
    ctx.fillStyle = '#e8dff2';
    ctx.beginPath(); ctx.arc(0, 0, 14 * u, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#b48ec9'; ctx.lineWidth = 2 * u;
    ctx.beginPath(); ctx.arc(0, 0, 9 * u, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 4 * u, 0, Math.PI * 2); ctx.stroke();
    if (kind === 'choppedOnion') {
      ctx.strokeStyle = '#8d6aa8'; ctx.lineWidth = 1.6 * u;
      ctx.beginPath(); ctx.moveTo(-9 * u, -9 * u); ctx.lineTo(9 * u, 9 * u); ctx.stroke();
    }
  } else if (kind === 'bread' || kind === 'toastedBread') {
    ctx.fillStyle = kind === 'toastedBread' ? '#b97a2e' : '#d9a05b';
    roundRect(ctx, -15 * u, -13 * u, 30 * u, 26 * u, 6 * u); ctx.fill();
    ctx.fillStyle = kind === 'toastedBread' ? '#8a5a1d' : '#f0cf9a';
    roundRect(ctx, -11 * u, -9 * u, 22 * u, 18 * u, 4 * u); ctx.fill();
  } else if (kind === 'soup') {
    ctx.fillStyle = '#f4f1e8';
    ctx.beginPath(); ctx.arc(0, 4 * u, 16 * u, 0, Math.PI); ctx.fill();
    ctx.fillStyle = '#e2703a';
    ctx.beginPath(); ctx.ellipse(0, 2 * u, 14 * u, 5 * u, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c94f1e';
    [[-6, 0], [3, 2], [7, -1]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x * u, y * u, 1.8 * u, 0, Math.PI * 2); ctx.fill(); });
  }
  ctx.restore();
}

export function drawPlate(ctx, plate, cx, cy, s) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = '#f7f5ef';
  ctx.beginPath(); ctx.ellipse(0, 0, s * 0.52, s * 0.36, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#c9c2ae'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, s * 0.52, s * 0.36, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#e3ddcb';
  ctx.beginPath(); ctx.ellipse(0, 0, s * 0.34, s * 0.22, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // Stack the ingredients on the plate, smallest on top.
  const stack = plate.stack || [];
  stack.forEach((kind, i) => {
    drawIngredient(ctx, kind, cx, cy - 4 - i * 7, Math.max(18, s * 0.62 - i * 4));
  });
}

function drawHeldItem(ctx, held, cx, cy) {
  // The item floats above the chef's toque; its name sits below the chef, on
  // clear floor, so it never collides with a station label.
  if (!held) return;
  if (held.kind === 'plate') drawPlate(ctx, held, cx, cy, 44);
  else drawIngredient(ctx, held.kind, cx, cy, 36);
  const baseY = cy + 72 + 40;
  text(ctx, ingredientName(held.kind), cx, baseY, 12, '#fff', 'center', 700);
  if (held.kind === 'plate' && held.stack.length > 0) {
    text(ctx, `${held.stack.length} on plate`, cx, baseY + 15, 11, '#ffe9b0', 'center');
  }
}

// --- the chef ---------------------------------------------------------------

function drawChef(ctx, chef, t) {
  const bob = chef.moving ? Math.sin(chef.walkPhase) * 2.5 : Math.sin(t * 2) * 1;
  ctx.save();
  ctx.translate(chef.x, chef.y + bob * 0.4);
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.ellipse(0, 26, 22, 7, 0, 0, Math.PI * 2); ctx.fill();
  // body / apron
  ctx.fillStyle = '#f2ede2';
  roundRect(ctx, -16, -6, 32, 34, 10); ctx.fill();
  ctx.fillStyle = '#3f7d8c';
  roundRect(ctx, -12, 2, 24, 26, 8); ctx.fill();
  ctx.fillStyle = '#3f7d8c';
  ctx.fillRect(-12, -8, 4, 12); ctx.fillRect(8, -8, 4, 12);
  // head + toque
  ctx.fillStyle = '#f2c9a0';
  ctx.beginPath(); ctx.arc(0, -18, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(-7, -30, 7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -33, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(7, -30, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-11, -30, 22, 5);
  // face
  ctx.fillStyle = '#26221c';
  ctx.beginPath(); ctx.arc(-5, -19, 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(5, -19, 1.6, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#26221c'; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(0, -14, 4, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  // arms point toward the facing direction
  const reach = chef.moving ? 6 : 0;
  ctx.fillStyle = '#f2c9a0';
  ctx.beginPath(); ctx.arc(-16, 6 + reach, 5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(16, 6 + reach, 5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// --- stations ----------------------------------------------------------------

function stationBase(ctx, st, fill, border) {
  ctx.fillStyle = fill;
  roundRect(ctx, st.x - st.w / 2, st.y - st.h / 2, st.w, st.h, 12);
  ctx.fill();
  ctx.strokeStyle = border || 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function progressRing(ctx, x, y, r, frac, color) {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.arc(x, y, r + 4, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = color;
  ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2); ctx.stroke();
}

function drawStations(ctx, world, t) {
  for (const st of world.stations) {
    const hovered = world.nearestStation() === st && world.screen === 'playing';
    if (st.kind === 'crate') {
      stationBase(ctx, st, '#8a5a33', '#6b4423');
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(st.x - st.w / 2 + 6, st.y - st.h / 2 + 6, st.w - 12, 10);
      drawIngredient(ctx, st.item, st.x, st.y - 6, 44);
      text(ctx, st.label, st.x, st.y + st.h / 2 - 10, 12, '#fff', 'center', 700);
    } else if (st.kind === 'board') {
      stationBase(ctx, st, '#d9b380', '#b98d55');
      ctx.fillStyle = '#c9a06a';
      ctx.fillRect(st.x - st.w / 2 + 10, st.y - 4, st.w - 20, 8);
      if (st.slot) {
        drawIngredient(ctx, st.slot.kind, st.x, st.y - 8, 40);
        if (st.progress > 0) progressRing(ctx, st.x + 52, st.y - 28, 12, st.progress, '#58b368');
      } else {
        text(ctx, 'CHOP', st.x, st.y - 2, 15, '#7a5a2e', 'center', 800);
        text(ctx, 'tomato · lettuce · onion', st.x, st.y + 18, 11, '#7a5a2e', 'center');
      }
      text(ctx, st.label, st.x, st.y + st.h / 2 + 14, 12, '#e8dcc4', 'center', 700);
    } else if (st.kind === 'grill') {
      stationBase(ctx, st, '#4a4a52', '#2e2e33');
      ctx.strokeStyle = '#8f8f98'; ctx.lineWidth = 3;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath(); ctx.moveTo(st.x - st.w / 2 + 14, st.y - 22 + i * 14); ctx.lineTo(st.x + st.w / 2 - 14, st.y - 22 + i * 14); ctx.stroke();
      }
      st.slots.forEach((slot, i) => {
        const sx = st.x - 42 + i * 84;
        if (!slot) return;
        if (slot.burnt) {
          ctx.fillStyle = '#1c1c1c';
          ctx.beginPath(); ctx.arc(sx, st.y - 4, 16, 0, Math.PI * 2); ctx.fill();
          text(ctx, 'BURNT', sx, st.y + 22, 11, '#ff7a6b', 'center', 800);
          return;
        }
        drawIngredient(ctx, slot.kind, sx, st.y - 4, 38);
        const need = INGREDIENTS[slot.kind].grillSecs;
        const frac = Math.min(1, slot.t / need);
        progressRing(ctx, sx + 24, st.y - 26, 10, frac, slot.done ? '#58d68d' : '#f2a541');
        if (slot.done) text(ctx, 'READY', sx, st.y + 24, 11, '#7dff9e', 'center', 800);
      });
      text(ctx, st.label, st.x, st.y + st.h / 2 + 14, 12, '#e8dcc4', 'center', 700);
    } else if (st.kind === 'pot') {
      stationBase(ctx, st, '#5b5f6b', '#3c3f48');
      ctx.fillStyle = '#33363e';
      ctx.beginPath(); ctx.ellipse(st.x, st.y - 6, 46, 14, 0, 0, Math.PI * 2); ctx.fill();
      if (st.soup) {
        ctx.fillStyle = st.soup.done ? '#e2703a' : '#c96a3a';
        ctx.beginPath(); ctx.ellipse(st.x, st.y - 6, 38, 10, 0, 0, Math.PI * 2); ctx.fill();
        if (!st.soup.done) {
          progressRing(ctx, st.x + 52, st.y - 26, 10, st.soup.t / 5, '#f2a541');
        } else {
          text(ctx, 'SOUP READY', st.x, st.y + 24, 11, '#7dff9e', 'center', 800);
        }
        // bubbles
        const b = (t * 2 + st.x) % 1;
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath(); ctx.arc(st.x - 14 + b * 28, st.y - 12 - b * 8, 2.5, 0, Math.PI * 2); ctx.fill();
      } else if (st.tomatoes > 0) {
        text(ctx, `tomatoes ${st.tomatoes}/2`, st.x, st.y - 4, 13, '#ffd9a0', 'center', 700);
      } else {
        text(ctx, 'SOUP POT', st.x, st.y - 4, 13, '#c9cdd6', 'center', 800);
        text(ctx, '2 chopped tomatoes', st.x, st.y + 14, 11, '#9aa0ad', 'center');
      }
      text(ctx, st.label, st.x, st.y + st.h / 2 + 14, 12, '#e8dcc4', 'center', 700);
    } else if (st.kind === 'plates') {
      stationBase(ctx, st, '#7a6a55', '#5d4f3e');
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = '#f7f5ef';
        ctx.beginPath(); ctx.ellipse(st.x, st.y - 12 + i * 9, 30, 7, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#c9c2ae'; ctx.lineWidth = 1.5; ctx.stroke();
      }
      text(ctx, st.label, st.x, st.y + st.h / 2 + 14, 12, '#e8dcc4', 'center', 700);
    } else if (st.kind === 'bin') {
      stationBase(ctx, st, '#3d4a3d', '#2c362c');
      ctx.fillStyle = '#222b22';
      roundRect(ctx, st.x - 18, st.y - 22, 36, 40, 6); ctx.fill();
      ctx.strokeStyle = '#5d705d'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(st.x - 14, st.y - 12); ctx.lineTo(st.x + 14, st.y - 12); ctx.stroke();
      text(ctx, 'BIN', st.x, st.y + 30, 11, '#a9bfa9', 'center', 800);
    } else if (st.kind === 'pass') {
      stationBase(ctx, st, '#a87c4f', '#8a5f36');
      ctx.fillStyle = 'rgba(255,255,255,0.10)';
      ctx.fillRect(st.x - st.w / 2 + 8, st.y - st.h / 2 + 8, st.w - 16, 12);
      const parked = world.passCounter[st.slotIndex];
      if (parked) {
        if (parked.kind === 'plate') drawPlate(ctx, parked, st.x, st.y - 2, 52);
        else drawIngredient(ctx, parked.kind, st.x, st.y - 2, 36);
      } else {
        text(ctx, 'PASS', st.x, st.y - 6, 14, '#e8d0a8', 'center', 800);
        text(ctx, 'park a plate here', st.x, st.y + 14, 11, '#c9a06a', 'center');
      }
    } else if (st.kind === 'window') {
      const glow = world.servedFlash > 0 ? 0.35 + 0.65 * world.servedFlash : 0;
      stationBase(ctx, st, '#6b4a2f', '#54371f');
      ctx.fillStyle = `rgba(255, 217, 77, ${0.12 + glow * 0.25})`;
      roundRect(ctx, st.x - st.w / 2 + 8, st.y - st.h / 2 + 8, st.w - 16, st.h - 16, 8); ctx.fill();
      ctx.fillStyle = '#2e2013';
      ctx.fillRect(st.x - st.w / 2 + 8, st.y - st.h / 2 + 8, st.w - 16, 10);
      text(ctx, '★ SERVING WINDOW ★', st.x, st.y - 6, 16, '#ffd94d', 'center', 800);
      text(ctx, 'serve matching plates here', st.x, st.y + 16, 12, '#e8cfa0', 'center');
    }
    if (hovered) {
      ctx.strokeStyle = '#ffd94d';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      roundRect(ctx, st.x - st.w / 2 - 5, st.y - st.h / 2 - 5, st.w + 10, st.h + 10, 14);
      ctx.stroke();
      ctx.setLineDash([]);
      text(ctx, 'E — use', st.x, st.y - st.h / 2 - 14, 12, '#ffd94d', 'center', 800);
    }
  }
}

// --- order board -------------------------------------------------------------

function drawOrderBoard(ctx, world) {
  // A vertical column of tickets on the left: one ticket per order, stacked.
  const x0 = 16;
  const y0 = HUD_H + 10;
  const bw = 300;
  const th = 56;
  const bh = 40 + MAX_ORDERS * (th + 6) + 6;
  ctx.fillStyle = 'rgba(43, 30, 18, 0.85)';
  roundRect(ctx, x0, y0, bw, bh, 12); ctx.fill();
  ctx.strokeStyle = '#8a6a42'; ctx.lineWidth = 2; ctx.stroke();
  text(ctx, 'ORDER BOARD', x0 + 16, y0 + 20, 15, '#ffd94d', 'left', 800);
  text(ctx, `${world.orders.length}/${MAX_ORDERS} tickets`, x0 + bw - 16, y0 + 20, 12, '#c9b48a', 'right');
  if (world.orders.length === 0) {
    text(ctx, 'No orders yet —', x0 + 16, y0 + 62, 13, '#d8c9a8', 'left');
    text(ctx, 'the lunch crowd is coming…', x0 + 16, y0 + 84, 13, '#d8c9a8', 'left');
    return;
  }
  world.orders.forEach((o, i) => {
    const tx = x0 + 8;
    const ty = y0 + 36 + i * (th + 6);
    const ratio = Math.max(0, o.patience / o.patienceMax);
    const urgent = ratio < 0.35;
    ctx.fillStyle = urgent && Math.floor(world.elapsed * 3) % 2 === 0 ? '#7a2e22' : '#f7f1e3';
    roundRect(ctx, tx, ty, bw - 16, th, 8); ctx.fill();
    ctx.strokeStyle = urgent ? '#ff6b57' : '#c9b48a'; ctx.lineWidth = 2; ctx.stroke();
    const r = o.recipe;
    text(ctx, r.name, tx + 10, ty + 14, 14, '#2b1e12', 'left', 800);
    text(ctx, `${r.price}c`, tx + bw - 26, ty + 14, 13, '#8a6a1f', 'right', 800);
    text(ctx, r.blurb, tx + 10, ty + 32, 11, '#6b5a44', 'left');
    ctx.fillStyle = '#d8cfb8';
    roundRect(ctx, tx + 10, ty + 43, bw - 36, 7, 3); ctx.fill();
    ctx.fillStyle = ratio > 0.5 ? '#58b368' : ratio > 0.25 ? '#f2a541' : '#e04747';
    if (ratio > 0) { roundRect(ctx, tx + 10, ty + 43, (bw - 36) * ratio, 7, 3); ctx.fill(); }
  });
}

// --- HUD ---------------------------------------------------------------------

function fmtTime(secs) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function drawHUD(ctx, world) {
  ctx.fillStyle = '#2b1e12';
  ctx.fillRect(0, 0, CANVAS_W, HUD_H);
  ctx.fillStyle = '#3d2b1a';
  ctx.fillRect(0, HUD_H - 4, CANVAS_W, 4);
  text(ctx, 'THE COPPER LADLE', 18, 22, 22, '#ffd94d', 'left', 800);
  text(ctx, 'a tiny bistro rush', 18, 46, 12, '#c9b48a', 'left');
  // timer
  const urgent = world.timeLeft <= 30;
  ctx.fillStyle = urgent ? '#7a2e22' : '#4a3421';
  roundRect(ctx, CANVAS_W / 2 - 90, 10, 180, 44, 10); ctx.fill();
  ctx.strokeStyle = urgent ? '#ff6b57' : '#8a6a42'; ctx.lineWidth = 2; ctx.stroke();
  text(ctx, '⏱ ' + fmtTime(world.timeLeft), CANVAS_W / 2, 33, 24, urgent ? '#ffb3a6' : '#fff', 'center', 800);
  // coins / served / combo
  text(ctx, `🪙 ${world.coins} coins`, 830, 24, 17, '#ffd94d', 'left', 800);
  text(ctx, `🍽 ${world.served} served`, 830, 46, 13, '#e8dcc4', 'left');
  text(ctx, `combo x${world.combo}`, 990, 24, 15, world.combo > 1 ? '#7dff9e' : '#9a8a70', 'left', 800);
  if (world.comboTimer > 0 && world.combo > 0) {
    ctx.fillStyle = '#3d2b1a';
    roundRect(ctx, 990, 36, 110, 7, 3); ctx.fill();
    ctx.fillStyle = '#7dff9e';
    roundRect(ctx, 990, 36, 110 * (world.comboTimer / 20), 7, 3); ctx.fill();
  }
  // hearts
  for (let i = 0; i < MAX_HEARTS; i++) {
    text(ctx, i < world.hearts ? '♥' : '♡', 1150 + i * 26, 30, 20, i < world.hearts ? '#ff6b57' : '#5d4a38', 'left');
  }
  text(ctx, 'M mute · P pause', 1150, 50, 11, '#9a8a70', 'left');
}

// --- screens -----------------------------------------------------------------

function drawTitle(ctx, world, t) {
  ctx.fillStyle = 'rgba(20, 12, 6, 0.55)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#f7f1e3';
  roundRect(ctx, CANVAS_W / 2 - 330, 96, 660, 480, 18); ctx.fill();
  ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 3; ctx.stroke();
  text(ctx, '🍳 THE COPPER LADLE', CANVAS_W / 2, 150, 40, '#8a5a1d', 'center', 800);
  text(ctx, 'a tiny bistro rush — one chef, one lunch crowd, no mercy', CANVAS_W / 2, 186, 16, '#6b5a44', 'center');
  const lines = [
    ['Orders appear on the board. Cook what they ask, serve it hot.', '#2b1e12'],
    ['WASD / arrows — move      E / Space — use a station', '#2b1e12'],
    ['Mouse — click a station to use it, click the floor to walk', '#2b1e12'],
    ['Chop tomato, lettuce, onion · Grill patties & sourdough', '#2b1e12'],
    ['Simmer 2 chopped tomatoes for Ember Soup · Park plates on the pass', '#2b1e12'],
    ['Serve matching plates at the window before patience runs out.', '#2b1e12'],
    ['3 hearts — a walked-out order costs one. 3-minute shift.', '#2b1e12'],
  ];
  lines.forEach(([s, c], i) => text(ctx, s, CANVAS_W / 2, 232 + i * 26, 15, c, 'center', i === 0 ? 700 : 600));
  // pulsing start button
  const pulse = 1 + Math.sin(t * 3) * 0.04;
  ctx.save();
  ctx.translate(CANVAS_W / 2, 452);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = '#c96a2e';
  roundRect(ctx, -150, -26, 300, 52, 12); ctx.fill();
  ctx.strokeStyle = '#8a4a1d'; ctx.lineWidth = 2; ctx.stroke();
  text(ctx, '▶  START THE SHIFT', 0, 2, 20, '#fff', 'center', 800);
  ctx.restore();
  text(ctx, 'Click START or press Enter — M mutes the kitchen sounds', CANVAS_W / 2, 500, 13, '#8a7a5e', 'center');
  text(ctx, 'Recipes on the board: Sunset Burger · Garden Bowl · Golden Melt · Ember Soup', CANVAS_W / 2, 528, 13, '#8a7a5e', 'center');
  text(ctx, 'An original game — its own kitchen, recipes, art and sounds.', CANVAS_W / 2, 556, 12, '#b0a080', 'center', 600);
}

function drawResults(ctx, world) {
  ctx.fillStyle = 'rgba(20, 12, 6, 0.6)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#f7f1e3';
  roundRect(ctx, CANVAS_W / 2 - 300, 130, 600, 420, 18); ctx.fill();
  ctx.strokeStyle = '#c9a227'; ctx.lineWidth = 3; ctx.stroke();
  text(ctx, 'SHIFT OVER', CANVAS_W / 2, 180, 36, '#8a5a1d', 'center', 800);
  text(ctx, world.endReason || '', CANVAS_W / 2, 214, 15, '#6b5a44', 'center');
  const stars = world.coins >= 120 ? 3 : world.coins >= 80 ? 2 : world.coins >= 45 ? 1 : 0;
  text(ctx, '★'.repeat(stars) + '☆'.repeat(3 - stars), CANVAS_W / 2, 258, 34, '#e8a91c', 'center');
  const rows = [
    ['Coins earned', `${world.coins}`],
    ['Dishes served', `${world.served}`],
    ['Orders walked out', `${world.expiredCount}`],
    ['Best combo', `x${world.bestCombo}`],
    ['Shift length', fmtTime(SHIFT_SECONDS)],
  ];
  rows.forEach(([k, v], i) => {
    text(ctx, k, CANVAS_W / 2 - 130, 306 + i * 28, 16, '#5d4a38', 'left');
    text(ctx, v, CANVAS_W / 2 + 130, 306 + i * 28, 16, '#2b1e12', 'right', 800);
  });
  text(ctx, stars === 3 ? 'A flawless lunch service. The regulars are already back.'
    : stars === 2 ? 'A strong service — the pass ran hot and the tips flowed.'
    : stars === 1 ? 'The kitchen survived. Tomorrow, faster hands.'
    : 'Rough shift. The board is already filling again — one more go?', CANVAS_W / 2, 470, 14, '#6b5a44', 'center');
  text(ctx, 'Press Enter to play again', CANVAS_W / 2, 512, 15, '#8a5a1d', 'center', 700);
}

function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(20, 12, 6, 0.55)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  text(ctx, 'PAUSED', CANVAS_W / 2, CANVAS_H / 2 - 10, 44, '#fff', 'center', 800);
  text(ctx, 'Press P or Esc to keep cooking', CANVAS_W / 2, CANVAS_H / 2 + 32, 16, '#e8dcc4', 'center');
}

// --- main render ---------------------------------------------------------------

export function render(ctx, world, t) {
  // Floor: warm checker tiles.
  ctx.fillStyle = '#b98d5f';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  const tile = 64;
  for (let y = HUD_H; y < CANVAS_H; y += tile) {
    for (let x = 0; x < CANVAS_W; x += tile) {
      const even = ((x / tile) + (y / tile)) % 2 === 0;
      ctx.fillStyle = even ? '#c9a06a' : '#bd9260';
      ctx.fillRect(x, y, tile, tile);
    }
  }
  // Back wall band under the HUD.
  ctx.fillStyle = '#8a6a4a';
  ctx.fillRect(0, HUD_H, CANVAS_W, 66);
  ctx.fillStyle = '#7a5a3e';
  for (let x = 0; x < CANVAS_W; x += 46) ctx.fillRect(x, HUD_H + 58, 30, 8);
  // (The back wall is left plain so the crates and board read at a glance.)

  drawOrderBoard(ctx, world);
  drawStations(ctx, world, t);
  drawChef(ctx, world.chef, t);
  drawHeldItem(ctx, world.chef.held, world.chef.x, world.chef.y - 72);

  // Floaters (+coins popups).
  for (const f of world.floaters) {
    ctx.globalAlpha = Math.min(1, f.ttl);
    text(ctx, f.text, f.x, f.y, 17, f.color, 'center', 800);
    ctx.globalAlpha = 1;
  }
  // Toast message under the HUD.
  if (world.message) {
    ctx.globalAlpha = Math.min(1, world.message.ttl);
    ctx.fillStyle = 'rgba(43, 30, 18, 0.9)';
    const w = ctx.measureText(world.message.text).width + 28;
    roundRect(ctx, CANVAS_W / 2 - w / 2 - 120, HUD_H + 8, w + 240, 30, 8);
    ctx.fill();
    text(ctx, world.message.text, CANVAS_W / 2, HUD_H + 24, 14, '#ffe9b0', 'center', 700);
    ctx.globalAlpha = 1;
  }

  drawHUD(ctx, world);
  if (world.screen === 'title') drawTitle(ctx, world, t);
  else if (world.screen === 'results') drawResults(ctx, world);
  else if (world.screen === 'paused') drawPaused(ctx);
}
