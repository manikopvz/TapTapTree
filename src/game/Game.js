import { Application } from 'pixi.js';
import { SaveSystem } from './SaveSystem.js';
import { EconomySystem } from './EconomySystem.js';
import { AudioSystem } from './AudioSystem.js';
import { AssetSystem } from './AssetSystem.js';
import { WorldRenderer } from './WorldRenderer.js';
import { UISystem } from './UISystem.js';
import { achievements, stages } from './data.js';

export class Game {
  constructor(root) {
    this.root = root;
    this.save = new SaveSystem();
    this.s = this.save.load();
    this.eco = new EconomySystem(this.s);
    this.audio = new AudioSystem();
    this.lastTapAt = 0;
    this.currentStage = null;
  }

  async start() {
    this.app = new Application();
    await this.app.init({
      resizeTo: window,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      background: 0x426b55,
      autoDensity: true,
    });
    this.root.appendChild(this.app.canvas);

    this.assets = await new AssetSystem().load();
    this.world = new WorldRenderer(this.app, this.assets, point => this.tap(point));
    this.ui = new UISystem(this.root, this);

    const offlineSeconds = this.save.offlineSeconds(this.s);
    const offlineGain = this.eco.aps() * offlineSeconds;
    if (offlineGain > 1) {
      this.s.apples += offlineGain;
      this.s.lifetime += offlineGain;
      this.ui.toast(`Welcome back · +${this.ui.format(offlineGain)} apples`);
    }

    this.syncStage(true);
    this.app.ticker.add(ticker => this.tick(ticker.deltaMS / 1000));
    window.addEventListener('resize', () => this.world.resize());
    setInterval(() => { this.save.save(this.s); this.ui.render(); }, 500);
    this.ui.render();
  }

  stageIndex() {
    let index = 0;
    for (let i = 0; i < stages.length; i++) if (this.s.lifetime >= stages[i].threshold) index = i;
    return index;
  }

  stage() { return stages[this.stageIndex()]; }
  nextStage() { return stages[Math.min(stages.length - 1, this.stageIndex() + 1)]; }

  syncStage(force = false) {
    const stage = this.stage();
    if (force || this.currentStage !== stage.key) {
      const changed = this.currentStage && this.currentStage !== stage.key;
      this.currentStage = stage.key;
      this.world.setStage(stage.key);
      if (changed) this.ui.toast(`Tree evolved · ${stage.name}`);
    }
  }

  tap(point) {
    const now = performance.now();
    if (now - this.lastTapAt > 1150) this.s.combo = 0;
    this.lastTapAt = now;
    this.s.combo = Math.min(150, this.s.combo + 1);
    this.s.best = Math.max(this.s.best, this.s.combo);

    const crit = Math.random() < this.eco.critChance();
    const golden = Math.random() < this.eco.goldChance();
    let amount = this.eco.tap() * (crit ? 5 : 1) * (golden ? 100 : 1);
    if (Math.random() < this.eco.echoChance()) amount *= 1 + this.eco.echoMultiplier();

    this.s.apples += amount;
    this.s.lifetime += amount;
    this.s.taps += 1;
    this.s.bestTap = Math.max(this.s.bestTap || 0, amount);
    if (crit) this.s.crits += 1;
    if (golden) this.s.goldens += 1;

    this.s.meter = Math.min(100, this.s.meter + 3);
    if (this.s.meter >= 100) {
      this.s.meter = 0;
      this.s.frenzy = 8 + (this.s.up.frenzy || 0);
      this.s.frenzies = (this.s.frenzies || 0) + 1;
      this.ui.toast('TREE FRENZY · x10 tap power');
    }

    if (Math.random() < this.eco.rainChance()) {
      const rainReward = this.eco.tap() * this.eco.rainMultiplier();
      this.s.rains += 1;
      this.s.apples += rainReward;
      this.s.lifetime += rainReward;
      this.world.rain();
      this.ui.toast(`APPLE RAIN · +${this.ui.format(rainReward)}`);
    }

    this.world.hitTree();
    this.world.burst(point, golden, crit);
    this.audio.play(golden ? 900 : crit ? 520 : 180);
    this.checkAchievements();
    this.syncStage();
    this.ui.renderQuick();
  }

  buy(id) {
    if (!this.eco.buy(id)) return;
    this.audio.play(420, 0.08);
    this.ui.render();
  }

  buySkill(id) {
    if (!this.eco.buySkill(id)) return;
    this.audio.play(620, 0.1);
    this.ui.toast('Permanent skill upgraded');
    this.ui.render();
  }

  rebirth() {
    const reward = this.eco.rebirthReward();
    if (!reward) return;
    this.s.seeds += reward;
    this.s.seedTotal += reward;
    this.s.rebirths += 1;
    this.s.apples = 0;
    this.s.combo = 0;
    this.s.meter = 0;
    this.s.frenzy = 0;
    this.s.up = {};
    this.audio.play(720, 0.15);
    this.ui.toast(`TREE REBORN · +${reward} Seeds`);
    this.checkAchievements();
    this.ui.render();
  }

  checkAchievements() {
    for (const achievement of achievements) {
      if (!this.s.ach.includes(achievement.id) && achievement.test(this.s)) {
        this.s.ach.push(achievement.id);
        this.ui.toast(`Achievement · ${achievement.name}`);
      }
    }
  }

  tick(dt) {
    if (!this.world) return;
    const autoGain = this.eco.aps() * dt;
    this.s.apples += autoGain;
    this.s.lifetime += autoGain;
    this.s.playTime += dt;
    if (this.s.frenzy > 0) this.s.frenzy = Math.max(0, this.s.frenzy - dt);
    if (this.s.combo > 0 && performance.now() - this.lastTapAt > 1150) this.s.combo = Math.max(0, this.s.combo - dt * 26);
    this.world.update(Math.min(2.2, dt * 60));
    this.syncStage();
  }
}
