import { Assets, Texture } from 'pixi.js';

const modules = import.meta.glob('../../assets/images/**/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});

const urls = {};
for (const [path, url] of Object.entries(modules)) {
  const key = path.replace('../../assets/images/', '').replace(/\.webp$/i, '');
  urls[key] = url;
}

export class AssetSystem {
  async load() {
    await Assets.load(Object.values(urls));
    return this;
  }
  texture(key) { return Texture.from(urls[key]); }
  url(key) { return urls[key]; }
  has(key) { return Boolean(urls[key]); }
  keys() { return Object.keys(urls); }
}
