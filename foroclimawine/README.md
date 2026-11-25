# FoRoClimaWINE

Static Croatian-language website. Serve this directory with Python 3:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Open http://127.0.0.1:8080/dissemination.html.

The dissemination page retains its full article list, ordered newest first.
Title links open the corresponding full article in a new tab, preserving its
existing article ID. Display order is independent of URL IDs;
the November 2025 MEMTEK event appears before the October 2025 Bordeaux training.
Only individual dissemination articles with multiple photos have a responsive,
swipeable photo carousel; all article text and external links remain available.

Use the arrow buttons, touch scrolling, or focus the carousel and press Left/Right
or Home/End. There is no automatic rotation, and reduced-motion preferences are
respected. Article data and interface labels live in `locales/hr.js`; no build
or package installation is required.
