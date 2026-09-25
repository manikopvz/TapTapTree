# Tap Tap Tree raster art pipeline

The game uses committed PNG/WebP-style raster textures through PixiJS Assets, Texture and Sprite. Vector artwork is prohibited.

The production workflow:
1. Generate the complete WebP set with `scripts/generate-art.py`.
2. Validate every required category with `npm run verify:art`.
3. Build with Vite.
4. Verify the production output contains the complete raster set.
5. Commit generated art and hashed production bundles back to `main` for GitHub Pages.

Required runtime folders:
- assets/images/backgrounds
- assets/images/trees
- assets/images/items
- assets/images/environment
- assets/images/icons/upgrades
- assets/images/icons/skills
- assets/images/icons/achievements
- assets/images/fx
- assets/images/ui

WorldRenderer uses raster sprites for all visible world art. PixiJS Graphics is permitted only for the invisible tree pointer hit area.
