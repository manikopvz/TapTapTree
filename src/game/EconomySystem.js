import { upgrades, skills } from './data.js';

export class EconomySystem {
  constructor(state) { this.s = state; }

  cost(id) {
    const upgrade = upgrades.find(item => item.id === id);
    return Math.floor(upgrade.base * upgrade.scale ** (this.s.up[id] || 0));
  }

  skillLevel(id) { return this.s.skills[id] || 0; }

  skillCost(id) {
    const skill = skills.find(item => item.id === id);
    return skill.cost + this.skillLevel(id);
  }

  permanentMultiplier() {
    return 1 + (this.s.seedTotal || 0) * 0.12 + this.skillLevel('growth') * 0.08;
  }

  fruitMultiplier() { return 1 + this.skillLevel('fruit') * 0.15; }
  tapSkillMultiplier() { return 1 + this.skillLevel('trunk') * 0.2; }
  autoSkillMultiplier() { return 1 + this.skillLevel('leaves') * 0.2; }
  idleSkillMultiplier() { return 1 + this.skillLevel('roots') * 0.25; }

  tap() {
    const base = 1 + (this.s.up.tap || 0);
    const combo = 1 + Math.min(150, this.s.combo || 0) * 0.01;
    const frenzy = this.s.frenzy > 0 ? 10 : 1;
    return base * combo * frenzy * this.permanentMultiplier() * this.fruitMultiplier() * this.tapSkillMultiplier();
  }

  aps() {
    const base = this.s.up.auto || 0;
    const frenzy = this.s.frenzy > 0 ? 5 : 1;
    return base * frenzy * this.permanentMultiplier() * this.fruitMultiplier() * this.autoSkillMultiplier() * this.idleSkillMultiplier();
  }

  critChance() { return Math.min(0.7, 0.05 + (this.s.up.crit || 0) * 0.02 + this.skillLevel('branch') * 0.015); }
  goldChance() { return Math.min(0.08, 0.002 + (this.s.up.gold || 0) * 0.0015 + this.skillLevel('lucky') * 0.0008); }
  echoChance() { return Math.min(0.65, (this.s.up.echo || 0) * 0.035 + this.skillLevel('abundance') * 0.035); }
  echoMultiplier() { return 0.65 + this.skillLevel('abundance') * 0.12; }
  rainChance() { return Math.min(0.06, 0.0015 + (this.s.up.rain || 0) * 0.0005 + this.skillLevel('rainMastery') * 0.001); }
  rainMultiplier() { return 80 * (1 + this.skillLevel('rainMastery') * 0.25); }

  buy(id) {
    const price = this.cost(id);
    if (this.s.apples < price) return false;
    this.s.apples -= price;
    this.s.up[id] = (this.s.up[id] || 0) + 1;
    return true;
  }

  buySkill(id) {
    const skill = skills.find(item => item.id === id);
    if (!skill) return false;
    const level = this.skillLevel(id);
    if (level >= skill.max) return false;
    const price = this.skillCost(id);
    if (this.s.seeds < price) return false;
    this.s.seeds -= price;
    this.s.skills[id] = level + 1;
    return true;
  }

  rebirthReward() {
    return Math.floor(Math.sqrt(Math.max(0, this.s.apples) / 30_000));
  }
}
