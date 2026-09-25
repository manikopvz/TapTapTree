import { Assets, Texture } from 'pixi.js';
import appleUrl from '../../assets/images/apple.webp?url';
import goldenAppleUrl from '../../assets/images/golden-apple.webp?url';
import leafUrl from '../../assets/images/leaf.webp?url';

export const ASSET_URLS = { apple: appleUrl, goldenApple: goldenAppleUrl, leaf: leafUrl };

export class AssetSystem {
  async load() {
    await Assets.load(Object.values(ASSET_URLS));
    return this;
  }
  texture(key) {
    return Texture.from(ASSET_URLS[key]);
  }
}
