[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/xeraaGH/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/xeraaGH/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

# The Copper Ladle — a tiny bistro rush

An original cooking game for the make.fun best-cooking-game bounty. One chef,
one kitchen, one three-minute lunch shift: take orders from the board, chop,
grill and simmer, plate each dish and serve it at the window before the
customer's patience runs out.

## How to play

Open `game/index.html` in a desktop browser (or serve `game/` with any static
server). No network request is made at any point; all art is drawn on canvas
and all sound is synthesized with WebAudio.

- **Move:** WASD or arrow keys. Click the floor to walk there.
- **Use a station:** E or Space when standing next to it, or click the station.
- **Pause:** P or Esc. **Mute:** M. **Start / play again:** Enter or click START.

## The kitchen

- **Ingredient crates** (top row): bun, beef patty, tomato, lettuce, cheese,
  onion, sourdough. Take one, or add it straight onto a plate you are holding.
- **Chopping board:** tomato, lettuce and onion chop here — three presses of E.
- **Grill:** two slots. Patties take 5 s, sourdough 3.5 s. Food left too long
  burns — bin it and start over.
- **Soup pot:** two chopped tomatoes simmer for 5 s into a bowl of Ember Soup.
- **Plates:** grab an empty plate, stack ingredients on it.
- **Pass counter:** park a plate (or an ingredient) while you cook.
- **Serving window:** serve a plate that matches an open order.
- **Bin:** throw away anything burnt or unwanted.

## The menu

| Dish | Recipe | Price |
| --- | --- | --- |
| Sunset Burger | bun + grilled patty + chopped tomato + chopped lettuce | 14 coins |
| Garden Bowl | chopped lettuce + chopped tomato + chopped onion | 10 coins |
| Golden Melt | toasted sourdough + cheese | 11 coins |
| Ember Soup | two chopped tomatoes, simmered in the pot | 12 coins |

Orders arrive faster as the shift goes on and each waits less patiently.
Serving quickly earns a tip; serving several dishes in a row builds a combo
(up to ×1.5). A walked-out order costs one of three hearts — lose all three
and the shift ends early. The shift lasts 3 minutes; stars are awarded at
45 / 80 / 120 coins.

## Files

- `game/index.html` — the page; `game/src/main.js` boots the loop.
- `game/src/config.js` — ingredients, recipes, pacing, star thresholds.
- `game/src/world.js` — stations, orders, chef, interactions, the shift clock.
- `game/src/render.js` — all canvas drawing: kitchen, board, chef, food, HUD.
- `game/src/input.js` — keyboard and mouse.
- `game/src/audio.js` — WebAudio synth: chops, sizzle, serve chime, ticks.
- `game/src/demo.js` — screenshot scenes (`?scene=cover|orders|serve|rush`),
  which stage real game states a player can reach by playing.
- `main.ts` — copies `game/` and `screenshots/` to `/output` and writes the
  dossier with `vendor/makefun-game.ts` (the kit's copy, unchanged).

## Screenshots

Four real renders of the game's own code, taken in headless Chromium:

1. `1-cover.jpg` — mid-shift: three orders, a burger mid-assembly on the pass,
   tomato half-chopped, patties on the grill, timer at 2:14.
2. `2-orders.jpg` — early shift: two fresh orders, chef carrying a tomato.
3. `3-serve.jpg` — a finished Sunset Burger in hand at the serving window.
4. `4-rush.jpg` — the last 28 seconds: four tickets, grill and pot both busy.
