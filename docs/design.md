# Profile design

The banner borrows the blue water, diagonal menu lettering, pink selection stripe, and condensed typography from my personal-site design. It uses native SVG and CSS so it can run inside a GitHub README image.

## Update the banner

```sh
npm ci
npm run generate
```

Edit `scripts/generate-assets.mjs`, then commit the four generated files in `assets/`. The generator uses the bundled Barlow Condensed font to convert display lettering into paths; viewers do not need to install a font. The font is distributed under the SIL Open Font License in `assets/fonts/OFL.txt`.

The README chooses a light or dark banner and a separate composition for screens up to 600 px wide. The animated water rings, cursor, and bars all stop when the viewer enables reduced motion. The banner remains complete when animation is unavailable.

Project descriptions stay in HTML/Markdown so they remain selectable, searchable, and accessible. Links go directly to public repositories.

## Contribution animation

`.github/workflows/blank.yml` refreshes the light and dark contribution SVGs daily at 03:17 UTC, or via **Actions → Refresh contribution animation → Run workflow**. Generated SVGs are published to the existing `output` branch. The workflow adds reduced-motion support and uses blue/yellow colors matching the banner.

The banner is served from this repository; the contribution animation uses the same repository's `output` branch. No external stats-card service is needed.
