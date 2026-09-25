export const stages = [
  { key: 'young', name: 'Young Tree', threshold: 0 },
  { key: 'apple', name: 'Apple Tree', threshold: 1_000 },
  { key: 'mature', name: 'Mature Tree', threshold: 25_000 },
  { key: 'ancient', name: 'Ancient Tree', threshold: 250_000 },
  { key: 'mystic', name: 'Mystic Tree', threshold: 2_500_000 },
  { key: 'cosmic', name: 'Cosmic Tree', threshold: 25_000_000 },
  { key: 'reality', name: 'Reality Tree', threshold: 250_000_000 },
];

export const upgrades = [
  { id: 'tap', iconKey: 'icons/upgrades/tap', name: 'Stronger Finger', description: '+1 base apple per tap.', base: 10, scale: 1.48 },
  { id: 'auto', iconKey: 'icons/upgrades/faster', name: 'Faster Hands', description: '+1 automatic apple per second.', base: 30, scale: 1.56 },
  { id: 'crit', iconKey: 'icons/upgrades/critical', name: 'Heavy Branches', description: '+2% critical chance. Critical taps are x5.', base: 90, scale: 1.64 },
  { id: 'echo', iconKey: 'icons/upgrades/echo', name: 'Apple Echo', description: 'Adds a chance for a tap to echo its reward.', base: 240, scale: 1.7 },
  { id: 'rain', iconKey: 'icons/upgrades/rain', name: 'Apple Rain', description: 'Raises the chance of a huge apple shower.', base: 800, scale: 1.78 },
  { id: 'gold', iconKey: 'icons/upgrades/gold', name: 'Golden Touch', description: 'Raises Golden Apple chance. Golden taps are x100.', base: 2200, scale: 1.86 },
  { id: 'frenzy', iconKey: 'icons/upgrades/frenzy', name: 'Frenzy Mastery', description: 'Tree Frenzy lasts longer.', base: 6500, scale: 1.94 },
];

export const skills = [
  { id: 'roots', iconKey: 'icons/skills/roots', name: 'Deep Roots', cost: 1, description: '+25% idle production and offline gains per level.', max: 5 },
  { id: 'trunk', iconKey: 'icons/skills/trunk', name: 'Iron Trunk', cost: 1, description: '+20% manual tap power per level.', max: 5 },
  { id: 'branch', iconKey: 'icons/skills/branch', name: 'Lucky Branches', cost: 2, description: '+1.5% critical chance per level.', max: 5 },
  { id: 'leaves', iconKey: 'icons/skills/leaves', name: 'Living Leaves', cost: 2, description: '+20% automatic production per level.', max: 5 },
  { id: 'lucky', iconKey: 'icons/skills/lucky', name: 'Fortune Bloom', cost: 3, description: '+0.08% Golden Apple chance per level.', max: 5 },
  { id: 'fruit', iconKey: 'icons/skills/fruit', name: 'Heavy Fruit', cost: 3, description: '+15% all apple rewards per level.', max: 5 },
  { id: 'growth', iconKey: 'icons/skills/growth', name: 'Endless Growth', cost: 4, description: '+8% global production per level.', max: 5 },
  { id: 'abundance', iconKey: 'icons/skills/abundance', name: 'Abundance', cost: 5, description: 'Apple Echo becomes stronger and more frequent.', max: 5 },
  { id: 'rainMastery', iconKey: 'icons/skills/rain', name: 'Rain Mastery', cost: 5, description: 'Apple Rain occurs more often and pays more.', max: 5 },
];

export const achievements = [
  { id: 'first', iconKey: 'icons/achievements/first_apple', name: 'First Apple', description: 'Collect your first apple.', test: s => s.lifetime >= 1 },
  { id: 'seriously', iconKey: 'icons/achievements/crown', name: 'Seriously?', description: 'Tap the tree 1,000 times.', test: s => s.taps >= 1_000 },
  { id: 'pleaseStop', iconKey: 'icons/achievements/sun', name: 'Please Stop', description: 'Reach a 100-tap combo.', test: s => s.best >= 100 },
  { id: 'treeFine', iconKey: 'icons/achievements/tree_master', name: 'The Tree Is Fine', description: 'Trigger Tree Frenzy 10 times.', test: s => (s.frenzies || 0) >= 10 },
  { id: 'infinite', iconKey: 'icons/achievements/purple_star', name: 'Infinite Apples', description: 'Collect 1,000,000 lifetime apples.', test: s => s.lifetime >= 1_000_000 },
  { id: 'newton', iconKey: 'icons/achievements/crystal', name: 'Newton Would Be Proud', description: 'Find 10 Golden Apples.', test: s => s.goldens >= 10 },
  { id: 'grass', iconKey: 'icons/achievements/diamond', name: 'Touch Grass', description: 'Play for one hour.', test: s => s.playTime >= 3600 },
  { id: 'rebirth', iconKey: 'icons/achievements/star', name: 'Begin Again', description: 'Rebirth once.', test: s => s.rebirths >= 1 },
  { id: 'rain', iconKey: 'icons/achievements/mystery', name: 'Apple Weather', description: 'Trigger Apple Rain once.', test: s => s.rains >= 1 },
];
