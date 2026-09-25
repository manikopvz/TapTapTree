import { Container, Sprite, Graphics } from 'pixi.js';

const LAYERS = [
  ['backgrounds/sky', 0],
  ['backgrounds/mountains', 5],
  ['backgrounds/islands', 10],
  ['backgrounds/lake', 14],
  ['backgrounds/forest', 20],
  ['backgrounds/foreground', 28],
];

export class WorldRenderer {
  constructor(app, assets, onTap) {
    this.app = app;
    this.assets = assets;
    this.onTap = onTap;
    this.pointer = { x: 0, y: 0 };
    this.shake = 0;
    this.stageKey = 'young';
    this.background = new Container();
    this.scene = new Container();
    this.fx = new Container();
    app.stage.addChild(this.background, this.scene, this.fx);
    this.buildBackground();
    this.buildTree();
    this.bindPointer();
    this.resize();
  }

  sprite(key, anchor = 0.5) {
    const sprite = new Sprite(this.assets.texture(key));
    sprite.anchor.set(anchor);
    return sprite;
  }

  buildBackground() {
    this.layers = LAYERS.map(([key, parallax]) => {
      const sprite = this.sprite(key);
      sprite.parallax = parallax;
      this.background.addChild(sprite);
      return sprite;
    });
  }

  buildTree() {
    this.treeGroup = new Container();
    this.scene.addChild(this.treeGroup);

    this.magicGlow = this.sprite('fx/magic_glow');
    this.magicGlow.alpha = 0;
    this.magicGlow.blendMode = 'add';
    this.treeGroup.addChild(this.magicGlow);

    this.tree = this.sprite('trees/young');
    this.treeGroup.addChild(this.tree);

    this.grassLeft = this.sprite('environment/grass');
    this.grassRight = this.sprite('environment/grass');
    this.rockLeft = this.sprite('environment/rock');
    this.rockRight = this.sprite('environment/rock');
    this.scene.addChild(this.rockLeft, this.rockRight, this.grassLeft, this.grassRight);

    this.hit = new Graphics().ellipse(0, -70, 180, 250).fill({ color: 0xffffff, alpha: 0.001 });
    this.hit.eventMode = 'static';
    this.hit.cursor = 'pointer';
    this.hit.on('pointerdown', event => this.onTap(event.global));
    this.scene.addChild(this.hit);
  }

  bindPointer() {
    const canvas = this.app.canvas;
    canvas.addEventListener('pointermove', event => {
      const rect = canvas.getBoundingClientRect();
      this.pointer.x = ((event.clientX - rect.left) / Math.max(1, rect.width) - 0.5) * 2;
      this.pointer.y = ((event.clientY - rect.top) / Math.max(1, rect.height) - 0.5) * 2;
    }, { passive: true });
    canvas.addEventListener('pointerleave', () => { this.pointer.x = 0; this.pointer.y = 0; }, { passive: true });
  }

  setStage(key) {
    if (!key || key === this.stageKey) return;
    this.stageKey = key;
    this.tree.texture = this.assets.texture(`trees/${key}`);
    this.treeGroup.scale.set(this.treeScale * 0.92);
    this.shake = 0.22;
    this.magicGlow.alpha = ['mystic', 'cosmic', 'reality'].includes(key) ? 0.62 : key === 'ancient' ? 0.2 : 0;
  }

  resize() {
    const w = this.app.screen.width;
    const h = this.app.screen.height;
    const cover = Math.max(w / 1200, h / 675) * 1.035;
    for (const layer of this.layers) {
      layer.scale.set(cover);
      layer.baseX = w / 2;
      layer.baseY = h / 2;
      layer.position.set(layer.baseX, layer.baseY);
    }

    const desktop = w > 900;
    const centerX = w * (desktop ? 0.43 : 0.5);
    const baseY = h * (desktop ? 0.78 : 0.69);
    this.treeScale = Math.min(1.08, Math.max(0.56, Math.min(w / 720, h / 650)));
    this.treeGroup.position.set(centerX, baseY);
    this.treeGroup.scale.set(this.treeScale);
    this.tree.position.set(0, -250);
    this.magicGlow.position.set(0, -250);
    this.magicGlow.width = 520;
    this.magicGlow.height = 520;

    this.hit.position.set(centerX, baseY - 130 * this.treeScale);
    this.hit.scale.set(this.treeScale);

    const decoScale = Math.min(1, Math.max(0.55, this.treeScale));
    this.grassLeft.scale.set(decoScale * 0.85);
    this.grassRight.scale.set(decoScale * 0.85);
    this.rockLeft.scale.set(decoScale * 0.55);
    this.rockRight.scale.set(decoScale * 0.48);
    this.grassLeft.position.set(centerX - 190 * decoScale, baseY - 20);
    this.grassRight.position.set(centerX + 190 * decoScale, baseY - 14);
    this.rockLeft.position.set(centerX - 195 * decoScale, baseY - 42);
    this.rockRight.position.set(centerX + 210 * decoScale, baseY - 30);
  }

  hitTree() {
    this.shake = Math.max(this.shake, 0.16);
  }

  spawn(key, x, y, size = 28, options = {}) {
    const sprite = this.sprite(key);
    sprite.x = x;
    sprite.y = y;
    sprite.width = size;
    sprite.height = size;
    sprite.vx = options.vx ?? (Math.random() - 0.5) * 8;
    sprite.vy = options.vy ?? (-4 - Math.random() * 7);
    sprite.gravity = options.gravity ?? 0.16;
    sprite.life = options.life ?? 75;
    sprite.spin = options.spin ?? sprite.vx * 0.015;
    this.fx.addChild(sprite);
    return sprite;
  }

  burst(point, golden = false, crit = false) {
    const appleKey = golden ? 'items/golden_apple' : 'items/apple';
    const count = golden ? 18 : 12;
    for (let i = 0; i < count; i++) {
      const key = i % 4 === 0 ? 'fx/leaf' : appleKey;
      this.spawn(key, point.x, point.y, golden ? 34 : 23);
    }
    if (crit || golden) {
      const spark = this.spawn(golden ? 'fx/gold_swirl' : 'fx/spark', point.x, point.y, golden ? 120 : 78, { vx: 0, vy: 0, gravity: 0, life: 28, spin: golden ? 0.04 : 0 });
      spark.alpha = 0.92;
    }
  }

  rain() {
    for (let i = 0; i < 55; i++) {
      const golden = Math.random() < 0.06;
      this.spawn(golden ? 'items/golden_apple' : 'items/apple', Math.random() * this.app.screen.width, -Math.random() * 520, 22 + Math.random() * 18, {
        vx: (Math.random() - 0.5) * 1.7,
        vy: 4 + Math.random() * 6,
        gravity: 0.04,
        life: 190,
      });
    }
  }

  update(dt = 1) {
    for (const layer of this.layers) {
      layer.x = layer.baseX - this.pointer.x * layer.parallax;
      layer.y = layer.baseY - this.pointer.y * layer.parallax * 0.45;
    }

    const t = performance.now() / 1000;
    const sway = Math.sin(t * 1.35) * 0.006;
    if (this.shake > 0.001) {
      this.shake *= 0.82;
      this.treeGroup.rotation = sway + Math.sin(t * 55) * this.shake * 0.14;
      this.treeGroup.scale.set(this.treeScale * (1 + this.shake * 0.12));
    } else {
      this.treeGroup.rotation = sway;
      this.treeGroup.scale.set(this.treeScale);
    }
    if (this.magicGlow.alpha > 0) this.magicGlow.rotation += 0.0015 * dt;

    for (let i = this.fx.children.length - 1; i >= 0; i--) {
      const particle = this.fx.children[i];
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += particle.gravity * dt;
      particle.rotation += particle.spin * dt;
      particle.life -= dt;
      if (particle.life < 22) particle.alpha = Math.max(0, particle.life / 22);
      if (particle.life <= 0) {
        this.fx.removeChild(particle);
        particle.destroy();
      }
    }
  }
}
