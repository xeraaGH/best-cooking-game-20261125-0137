// main.js — boot and the game loop. Wires input, world, sound and rendering
// together and owns the screen state machine (title -> playing -> results).

import { CANVAS_W, CANVAS_H, TIPS } from './config.js';
import { World } from './world.js';
import { Input } from './input.js';
import { SoundBank } from './audio.js';
import { render } from './render.js';
import { applyScene } from './demo.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;

const sounds = new SoundBank();
const world = new World(sounds);
const input = new Input(canvas);

// Exposed for the screenshot scenes (?scene=cover|orders|serve|rush) and for
// debugging in the console: window.__game.world, .startShift, .interact.
window.__game = { world, sounds, input, startShift: () => world.startShift() };

const params = new URLSearchParams(location.search);
const scene = params.get('scene');
if (scene) {
  applyScene(world, scene);
}

let last = performance.now();
let tipTimer = 0;

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const t = now / 1000;

  // Global keys: mute, pause, start / restart.
  if (input.pressed.has('m')) {
    const muted = sounds.toggleMute();
    world.showMessage(muted ? 'Sound off.' : 'Sound on.');
  }
  if (input.pressed.has('p') || input.pressed.has('escape')) {
    if (world.screen === 'playing') { world.screen = 'paused'; sounds.stopSizzle(); }
    else if (world.screen === 'paused') world.screen = 'playing';
  }
  if (input.pressed.has('enter')) {
    if (world.screen === 'title') { sounds.ensure(); sounds.click(); world.startShift(); }
    else if (world.screen === 'results') { sounds.click(); world.startShift(); }
  }

  // Mouse: clicking the START button starts; clicking a station uses it;
  // clicking open floor walks the chef there.
  const click = input.consumeClick();
  if (click && world.screen === 'playing') {
    const st = world.stationAt(click.x, click.y);
    if (st) {
      // Close enough: use it now. Otherwise walk up to it and use it on arrival.
      const d = Math.hypot(st.x - world.chef.x, st.y - world.chef.y);
      if (d <= 70) world.interact();
      else {
        input.moveTarget = { x: st.x, y: Math.min(st.y + 64, CANVAS_H - 50) };
        input.pendingInteract = st;
      }
    } else if (click.y > 150) {
      input.moveTarget = { x: click.x, y: click.y };
    }
  } else if (click && world.screen === 'title') {
    const bx = CANVAS_W / 2;
    if (Math.abs(click.x - bx) < 150 && Math.abs(click.y - 452) < 26) {
      sounds.ensure(); sounds.click(); world.startShift();
    }
  } else if (click && world.screen === 'results') {
    sounds.click(); world.startShift();
  }

  // A rotating tip on the title screen, for players reading before they start.
  if (world.screen === 'title') {
    tipTimer += dt;
    if (tipTimer > 6) tipTimer = 0;
  }

  world.update(dt, input);
  // Arrived at a clicked station: use it now.
  if (input.pendingInteract && !input.moveTarget) {
    const st = input.pendingInteract;
    input.pendingInteract = null;
    if (world.nearestStation() === st) world.interact();
  }
  render(ctx, world, t);
  input.endFrame();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
