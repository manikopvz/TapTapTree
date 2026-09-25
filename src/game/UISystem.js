import { upgrades, skills, achievements, stages } from './data.js';

export class UISystem {
  constructor(root, game) {
    this.g = game;
    this.root = root;
    this.tab = 'upgrades';
    this.renderShell();
    this.bindShell();
  }

  format(value) {
    const n = Number(value) || 0;
    if (n < 1_000) return Math.floor(n).toLocaleString();
    const units = [['Qa', 1e15], ['T', 1e12], ['B', 1e9], ['M', 1e6], ['K', 1e3]];
    for (const [suffix, base] of units) if (n >= base) return `${(n / base).toFixed(n >= base * 100 ? 0 : 1)}${suffix}`;
    return Math.floor(n).toLocaleString();
  }

  image(key, alt = '') {
    const url = this.g.assets.url(key);
    return `<img src="${url}" alt="${alt}" draggable="false">`;
  }

  renderShell() {
    const a = this.g.assets;
    const style = this.root.style;
    style.setProperty('--ui-panel', `url("${a.url('ui/large_panel')}")`);
    style.setProperty('--ui-title', `url("${a.url('ui/title_panel')}")`);
    style.setProperty('--ui-button', `url("${a.url('ui/button_gold')}")`);
    style.setProperty('--ui-selected', `url("${a.url('ui/button_selected')}")`);
    style.setProperty('--ui-slot', `url("${a.url('ui/slot')}")`);
    style.setProperty('--ui-progress', `url("${a.url('ui/progress_orange')}")`);

    this.root.insertAdjacentHTML('beforeend', `
      <header class="topbar">
        <div class="brand"><span>TAP TAP TREE</span><small>THE TREE REMEMBERS</small></div>
        <div class="currencies">
          <div class="currency apple-wallet">${this.image('items/apple', 'Apple')}<div><strong id="money">0</strong><small id="aps">0 / sec</small></div></div>
          <div class="currency seed-wallet">${this.image('icons/skills/roots', 'Seed')}<div><strong id="seeds">0</strong><small>SEEDS</small></div></div>
        </div>
        <button id="audio" class="sound-button" type="button">SOUND ON</button>
      </header>

      <nav class="game-nav" aria-label="Game panels">
        ${this.navButton('upgrades', 'icons/upgrades/tap', 'Upgrades')}
        ${this.navButton('skills', 'icons/skills/roots', 'Skills')}
        ${this.navButton('evolution', 'icons/skills/growth', 'Evolution')}
        ${this.navButton('achievements', 'icons/achievements/crown', 'Achievements')}
        ${this.navButton('stats', 'icons/achievements/crystal', 'Stats')}
      </nav>

      <section class="tree-hud">
        <div class="stage-name" id="stage-name">Young Tree</div>
        <div class="stage-progress"><i id="stage-progress"></i></div>
        <div class="tree-stats"><span id="combo">COMBO x0</span><span id="tap-power">+1 / TAP</span></div>
      </section>

      <section class="frenzy-card">
        <div><b>TREE FRENZY</b><span id="frenzy-time">Charge the tree</span></div>
        <div class="frenzy-track"><i id="meter"></i></div>
      </section>

      <aside class="side-panel">
        <div class="panel-title"><span id="panel-title">UPGRADES</span><small id="panel-subtitle">Grow faster with every tap</small></div>
        <div id="panel-content" class="panel-content"></div>
        <div class="rebirth-card">
          <div>${this.image('icons/skills/growth', 'Rebirth')}<span><b>REBIRTH</b><small>Reset upgrades. Keep permanent skills.</small></span></div>
          <button id="rebirth" type="button"></button>
        </div>
      </aside>

      <div id="toast" class="toast"></div>
    `);
  }

  navButton(id, icon, label) {
    return `<button class="nav-button" data-tab="${id}" type="button">${this.image(icon, label)}<span>${label}</span></button>`;
  }

  bindShell() {
    this.root.querySelector('#audio').addEventListener('click', event => {
      const on = this.g.audio.toggle();
      event.currentTarget.textContent = on ? 'SOUND ON' : 'SOUND OFF';
    });
    this.root.querySelector('#rebirth').addEventListener('click', () => this.g.rebirth());
    this.root.querySelectorAll('.nav-button').forEach(button => button.addEventListener('click', () => {
      this.tab = button.dataset.tab;
      this.render();
    }));
  }

  render() {
    this.renderQuick();
    this.root.querySelectorAll('.nav-button').forEach(button => button.classList.toggle('active', button.dataset.tab === this.tab));
    const content = this.root.querySelector('#panel-content');
    const title = this.root.querySelector('#panel-title');
    const subtitle = this.root.querySelector('#panel-subtitle');

    const panel = {
      upgrades: ['UPGRADES', 'Spend apples to strengthen this life', () => this.renderUpgrades()],
      skills: ['PERMANENT SKILLS', 'Spend Seeds · retained after rebirth', () => this.renderSkills()],
      evolution: ['TREE EVOLUTION', 'One tree · seven forms', () => this.renderEvolution()],
      achievements: ['ACHIEVEMENTS', `${this.g.s.ach.length}/${achievements.length} discovered`, () => this.renderAchievements()],
      stats: ['TREE RECORDS', 'Everything this tree remembers', () => this.renderStats()],
    }[this.tab];

    title.textContent = panel[0];
    subtitle.textContent = panel[1];
    content.innerHTML = panel[2]();
    this.bindPanel();
  }

  bindPanel() {
    this.root.querySelectorAll('[data-buy-upgrade]').forEach(button => button.addEventListener('click', () => this.g.buy(button.dataset.buyUpgrade)));
    this.root.querySelectorAll('[data-buy-skill]').forEach(button => button.addEventListener('click', () => this.g.buySkill(button.dataset.buySkill)));
  }

  renderQuick() {
    const { s, eco } = this.g;
    this.root.querySelector('#money').textContent = this.format(s.apples);
    this.root.querySelector('#aps').textContent = `${this.format(eco.aps())} / sec`;
    this.root.querySelector('#seeds').textContent = this.format(s.seeds);
    this.root.querySelector('#meter').style.width = `${Math.min(100, s.meter)}%`;
    this.root.querySelector('#combo').textContent = `COMBO x${Math.floor(s.combo || 0)}`;
    this.root.querySelector('#tap-power').textContent = `+${this.format(eco.tap())} / TAP`;

    const stageIndex = this.g.stageIndex();
    const stage = stages[stageIndex];
    const next = stages[Math.min(stages.length - 1, stageIndex + 1)];
    this.root.querySelector('#stage-name').textContent = stage.name;
    let progress = 100;
    if (stageIndex < stages.length - 1) {
      progress = ((s.lifetime - stage.threshold) / Math.max(1, next.threshold - stage.threshold)) * 100;
    }
    this.root.querySelector('#stage-progress').style.width = `${Math.max(0, Math.min(100, progress))}%`;
    this.root.querySelector('#frenzy-time').textContent = s.frenzy > 0 ? `${s.frenzy.toFixed(1)}s · ACTIVE` : `${Math.floor(s.meter)}% CHARGED`;
    this.root.querySelector('.frenzy-card').classList.toggle('active', s.frenzy > 0);

    const reward = eco.rebirthReward();
    const rebirth = this.root.querySelector('#rebirth');
    rebirth.disabled = !reward;
    rebirth.textContent = reward ? `REBIRTH +${reward} SEEDS` : '30K APPLES REQUIRED';
  }

  renderUpgrades() {
    const { s, eco } = this.g;
    return `<div class="upgrade-list">${upgrades.map(upgrade => {
      const price = eco.cost(upgrade.id);
      const disabled = s.apples < price;
      return `<button class="shop-card" data-buy-upgrade="${upgrade.id}" ${disabled ? 'disabled' : ''} type="button">
        <span class="shop-icon">${this.image(upgrade.iconKey, upgrade.name)}</span>
        <span class="shop-copy"><b>${upgrade.name}</b><small>${upgrade.description}</small><em>LEVEL ${s.up[upgrade.id] || 0}</em></span>
        <span class="price">${this.image('items/apple', '')}<b>${this.format(price)}</b></span>
      </button>`;
    }).join('')}</div>`;
  }

  renderSkills() {
    const { s, eco } = this.g;
    return `<div class="skill-grid">${skills.map(skill => {
      const level = eco.skillLevel(skill.id);
      const maxed = level >= skill.max;
      const price = eco.skillCost(skill.id);
      const disabled = maxed || s.seeds < price;
      return `<button class="skill-card" data-buy-skill="${skill.id}" ${disabled ? 'disabled' : ''} type="button">
        ${this.image(skill.iconKey, skill.name)}
        <b>${skill.name}</b>
        <small>${skill.description}</small>
        <span>Lv ${level}/${skill.max}</span>
        <em>${maxed ? 'MAXED' : `${price} SEEDS`}</em>
      </button>`;
    }).join('')}</div>`;
  }

  renderEvolution() {
    const current = this.g.stageIndex();
    return `<div class="evolution-list">${stages.map((stage, index) => {
      const unlocked = this.g.s.lifetime >= stage.threshold;
      return `<article class="evolution-card ${index === current ? 'current' : ''} ${unlocked ? 'unlocked' : 'locked'}">
        <div class="tree-thumb">${this.image(`trees/${stage.key}`, stage.name)}</div>
        <div><b>${stage.name}</b><small>${index === 0 ? 'The journey begins.' : `${this.format(stage.threshold)} lifetime apples`}</small><em>${index === current ? 'CURRENT FORM' : unlocked ? 'DISCOVERED' : 'LOCKED'}</em></div>
      </article>`;
    }).join('')}</div>`;
  }

  renderAchievements() {
    return `<div class="achievement-grid">${achievements.map(achievement => {
      const unlocked = this.g.s.ach.includes(achievement.id);
      return `<article class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
        ${this.image(achievement.iconKey, achievement.name)}
        <div><b>${achievement.name}</b><small>${achievement.description}</small><em>${unlocked ? 'UNLOCKED' : 'UNDISCOVERED'}</em></div>
      </article>`;
    }).join('')}</div>`;
  }

  renderStats() {
    const s = this.g.s;
    const hours = Math.floor(s.playTime / 3600);
    const minutes = Math.floor((s.playTime % 3600) / 60);
    const rows = [
      ['Lifetime Apples', this.format(s.lifetime)],
      ['Current Apples', this.format(s.apples)],
      ['Total Taps', this.format(s.taps)],
      ['Highest Combo', this.format(s.best)],
      ['Critical Taps', this.format(s.crits)],
      ['Golden Apples', this.format(s.goldens)],
      ['Apple Rains', this.format(s.rains)],
      ['Tree Frenzies', this.format(s.frenzies)],
      ['Highest Apples / Tap', this.format(s.bestTap)],
      ['Rebirths', this.format(s.rebirths)],
      ['Seeds Earned', this.format(s.seedTotal)],
      ['Play Time', `${hours}h ${minutes}m`],
    ];
    return `<div class="stats-grid">${rows.map(([label, value]) => `<div><span>${label}</span><b>${value}</b></div>`).join('')}</div>`;
  }

  toast(text) {
    const toast = this.root.querySelector('#toast');
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
  }
}
