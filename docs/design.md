# Profile design

The banner borrows the blue water, diagonal menu lettering, pink selection stripe, and condensed typography from my personal-site design. It uses native SVG and CSS so it can run inside a GitHub README image.

## Update the banner

```sh
npm ci
npm run generate
```

Edit `scripts/generate-assets.mjs`, then commit the four generated files in `assets/`. The generator uses the bundled Barlow Condensed font to convert display lettering into paths; viewers do not need to install a font. The font is distributed under the SIL Open Font License in `assets/fonts/OFL.txt`.

The README chooses a light or dark banner and a separate composition for screens up to 600 px wide. The animated water rings, cursor, and bars all stop when the viewer enables reduced motion. The banner remains complete when animation is unavailable.

Project information stays in HTML/Markdown so it remains selectable, searchable, and accessible. Links go directly to public repositories.

## Recent public projects

`.github/workflows/recent-work.yml` refreshes the four most recently pushed public projects daily at 03:21 UTC. It can also be run from **Actions → Refresh recent public projects → Run workflow**. Repository names, available descriptions, primary languages, and push dates come from the GitHub API. Forks, archived/disabled or empty repositories, and this profile repository are excluded.

For a local refresh, run `npm run update:recent`; `GITHUB_TOKEN` is optional for public API access. Run `npm test` to check filtering, HTML escaping, pagination, and safe updates.

The updater replaces only the `RECENT-WORK` block in the README. API errors preserve the previous content, and unchanged data creates no commit. Education, research interests, and hobbies are edited directly outside that block.

## Contribution animation

`.github/workflows/blank.yml` refreshes the light and dark contribution SVGs daily at 03:17 UTC, or via **Actions → Refresh contribution animation → Run workflow**. Generated SVGs are published to the existing `output` branch. The workflow adds reduced-motion support and uses blue/yellow colors matching the banner.

The banner is served from this repository; the contribution animation uses the same repository's `output` branch. No external stats-card service is needed.
