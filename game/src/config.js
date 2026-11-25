// config.js — every tunable number, ingredient and recipe for The Copper Ladle.
// One clear job: the game's data. No logic lives here.

export const CANVAS_W = 1280;
export const CANVAS_H = 720;
export const HUD_H = 64;
export const SHIFT_SECONDS = 180;
export const MAX_HEARTS = 3;
export const MAX_ORDERS = 4;

export const CHEF_SPEED = 300; // px per second
export const INTERACT_RANGE = 70; // px from a station's centre; rows sit 150px apart, so zones never overlap

// Ingredients. `chop` / `grill` say which station transforms them, `into` is the result.
export const INGREDIENTS = {
  bun:     { name: 'Bun',            color: '#e9bd6d', chop: false, grill: false },
  patty:   { name: 'Beef Patty',     color: '#8a5a3b', chop: false, grill: true,  grillSecs: 5.0, into: 'grilledPatty' },
  tomato:  { name: 'Tomato',         color: '#e04747', chop: true,  chopSecs: 2.2, into: 'choppedTomato' },
  lettuce: { name: 'Lettuce',        color: '#58b368', chop: true,  chopSecs: 2.2, into: 'choppedLettuce' },
  cheese:  { name: 'Cheese',         color: '#f2c94c', chop: false, grill: false },
  onion:   { name: 'Onion',          color: '#c9a7d8', chop: true,  chopSecs: 2.2, into: 'choppedOnion' },
  bread:   { name: 'Sourdough',      color: '#d9a05b', chop: false, grill: true,  grillSecs: 3.5, into: 'toastedBread' },
};

export const COOKED = {
  grilledPatty:   { name: 'Grilled Patty',  color: '#6b4429' },
  choppedTomato:  { name: 'Chopped Tomato', color: '#e04747' },
  choppedLettuce: { name: 'Chopped Lettuce', color: '#58b368' },
  choppedOnion:   { name: 'Chopped Onion',  color: '#c9a7d8' },
  toastedBread:   { name: 'Toasted Bread',  color: '#b97a2e' },
  soup:           { name: 'Ember Soup',     color: '#e2703a' },
};

export function ingredientName(kind) {
  if (INGREDIENTS[kind]) return INGREDIENTS[kind].name;
  if (COOKED[kind]) return COOKED[kind].name;
  if (kind === 'plate') return 'Plate';
  return kind;
}

// Recipes: what a finished plate must hold (order of items does not matter).
export const RECIPES = [
  {
    id: 'burger', name: 'Sunset Burger', price: 14,
    needs: ['bun', 'grilledPatty', 'choppedTomato', 'choppedLettuce'],
    blurb: 'bun + grilled patty + tomato + lettuce',
  },
  {
    id: 'salad', name: 'Garden Bowl', price: 10,
    needs: ['choppedLettuce', 'choppedTomato', 'choppedOnion'],
    blurb: 'lettuce + tomato + onion, chopped',
  },
  {
    id: 'melt', name: 'Golden Melt', price: 11,
    needs: ['toastedBread', 'cheese'],
    blurb: 'toasted sourdough + cheese',
  },
  {
    id: 'soup', name: 'Ember Soup', price: 12,
    needs: ['soup'],
    blurb: 'two chopped tomatoes, simmered in the pot',
  },
];

// Order pacing: as the shift goes on, orders arrive faster and wait less patiently.
export function orderIntervalAt(elapsedSecs) {
  return Math.max(11, 21 - elapsedSecs / 14);
}
export function orderPatienceAt(elapsedSecs) {
  return Math.max(48, 74 - elapsedSecs / 6);
}

// Star thresholds for the end-of-shift results screen.
export const STAR_COINS = [45, 80, 120];

export const TIPS = [
  'Tip: chop while the patty grills — never stand still.',
  'Tip: a plate can wait on the pass counter while you cook.',
  'Tip: serve fast for a bigger tip. Patience is money.',
  'Tip: burnt food goes in the bin. Watch the grill ring.',
];
