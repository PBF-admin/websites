# SMOTRA PBF — static reconstruction

A plain HTML, CSS and JavaScript reconstruction of the supplied WordPress export. No WordPress installation, PHP, database server, bundler, framework, or npm dependencies are required.

## Build and preview

Requires Node.js 22 or later:

```sh
npm run build
npm start
```

Open <http://localhost:4173>. To choose another preview port:

```sh
npm start -- --port 8080
```

`npm run build` reads the SQL dump locally and generates the deployable website in [dist/](./dist/). It copies only referenced public uploads, not the entire media library. Build errors explicitly report any missing media or unsupported referenced shortcodes.

```sh
npm test
npm run check
```

Tests cover the database reader, UTF-8 serialized settings, page coverage, local references, legacy links, menus, archive accordions, all 48 smoothie combinations, and the calorimetry content.

## What is preserved

- All eight published pages and the original published blog post, with their original Croatian content.
- The Avada header banner, homepage illustration, menu order, social links, and a refreshed responsive visual system. Original fonts are retained locally with their OFL licenses.
- The original page slugs and additional `/o-nama/`, `/studiji/`, `/prehrambena-tehnologija/`, and `/smotre/` aliases.
- Legacy `/?page_id=…` and `/?p=…` links, which redirect in the browser to the appropriate static page.
- Galleries and captions, with a keyboard-accessible photo viewer.
- Nine archive accordions, rebuilt with native HTML `details` elements.
- The supplied standalone smoothie quiz, with local confetti and keyboard-accessible ingredient choices.
- The referenced H5P calorimetry video, rebuilt in vanilla JavaScript with timed text, paused multiple-choice questions, retry feedback, and a final summary. Questions are also accessible independently of video playback.
- YouTube embeds, Google Maps, external university links, and responsive mobile navigation.

The original theme hides the page-title bar and footer; the reconstruction follows those settings. The homepage illustration additionally provides three accessible links to the studies. The slider's single image scales without cropping on small screens. The smoothie quiz uses the local PT Sans font instead of its third-party font CDN.

## Files and editing

- [scripts/build.mjs](./scripts/build.mjs): SQL-to-HTML exporter and page templates.
- [scripts/database.mjs](./scripts/database.mjs): non-executing SQL reader and PHP-serialization reader.
- [static/site.css](./static/site.css): layout, typography, block styles, and responsive behavior.
- [static/site.js](./static/site.js): navigation, lightbox, tables, and back-to-top button.
- [static/interactive-video.js](./static/interactive-video.js): calorimetry interaction player.
- [uploads/kviz/](./uploads/kviz/): original smoothie quiz source.
- [dist/migration-report.json](./dist/migration-report.json): generated routes, media counts, and migration notes.

Change the templates or files in `static/`, then rebuild. Edits made directly in `dist/` are overwritten. Retain the supplied export privately if you want to rebuild.

## Deployment

Publish **only the contents of `dist/`** on any static web host, at the domain root. Directory `index.html` support is required. Do not publish this export's workspace root: it contains the original database and WordPress configuration.

The output contains no PHP or SQL, credentials, user accounts, revisions, analytics, tracking records, or WordPress administration. The preview server deliberately serves only `dist/`. Unrelated remote-content code present in the supplied PHP header is not executed or reproduced.

The included `_redirects` file maps `/index.php` to `/` on compatible hosts. On other hosts configure the equivalent redirect **preserving the query string**, so `/index.php?page_id=71` reaches `/?page_id=71`. Root `?page_id=` URLs work without any special server configuration when JavaScript is enabled. Clean static URLs work without JavaScript.

YouTube videos and Google Maps still require internet access and remain subject to the original providers' availability. No video files are fetched or mirrored. WordPress editing, accounts, comment submission, server-side quiz tracking, and plugin administration are intentionally not recreated. The unused H5P demo content and unused question-bank records are not exposed.

Fonts are included under their respective OFL licenses in [static/fonts/](./static/fonts/). Original content and media retain their original ownership.
