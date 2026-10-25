# inaccessible

**Eine Website mit 100 Punkten im Lighthouse-Accessibility-Score, die trotzdem für praktisch niemanden benutzbar ist.**

Live-Demo: https://teilkraftdigital.github.io/inaccessible/

> [!WARNING]
> Diese Seite ist **absichtlich** unzugänglich. Sie ist ein Lehrbeispiel – bitte keinen Code daraus übernehmen.

## Worum geht es?

Automatisierte Tools wie Lighthouse oder axe sind nützlich, aber sie prüfen nur einen Teil der WCAG-Kriterien (Schätzungen: 30–40 %). Ein grüner Score heißt nicht „barrierefrei“.

Dieses Projekt dient als Live-Demo für Vorträge und Workshops: Erst zeigt das Tool 100 Punkte, dann scheitert die Seite an Tastatur, Maus, Screenreader und Kontrast. Die Botschaft: **Verlasst euch nicht blind auf Tools – testet manuell.**

## Originalquelle

Die Idee und die verwendeten Techniken stammen von **Manuel Matuzović**:

> [Building the most inaccessible site possible with a perfect Lighthouse score](https://www.matuzo.at/blog/building-the-most-inaccessible-site-possible-with-a-perfect-lighthouse-score/) – matuzo.at

Dieses Repo ist eine Nachstellung seines Beispiels mit Vite, ergänzt um ein deutschsprachiges WCAG-2.2-Audit.

## Demo-Ablauf

1. Seite öffnen (live oder lokal, siehe [Lokal starten](#lokal-starten)).
2. **Chrome DevTools → Lighthouse → Accessibility** ausführen: 100 Punkte. Optional zusätzlich [axe DevTools](https://www.deque.com/axe/devtools/): kaum oder keine Befunde.
3. **Tastatur:** `Tab` drücken – nichts passiert. Jeder Tastendruck wird per JavaScript verworfen.
4. **Maus:** Auf „Read the article“ klicken – nichts passiert, kein Cursor sichtbar.
5. **Screenreader:** VoiceOver (`Cmd+F5`) oder NVDA starten – die Seite ist leer.
6. **Kontrast:** Mit einer Pipette (z. B. [Colour Contrast Analyser](https://www.tpgi.com/color-contrast-checker/)) messen – ca. 2,1 : 1 statt der von Tools angenommenen 21 : 1.
7. **Auflösung:** Alle Befunde mit WCAG-Bezug und Fix stehen in [`issues.md`](./issues.md).

## Was steckt dahinter?

| Technik                                         | Datei           | Wirkung                                         |
| ----------------------------------------------- | --------------- | ----------------------------------------------- |
| `aria-hidden="true"` auf dem gesamten Inhalt    | `index.html`    | Screenreader sehen nichts                       |
| `tabindex="-1"` auf Link, Input, Button         | `index.html`    | Nicht per Tab erreichbar, axe bleibt still      |
| `keydown` → `preventDefault()`                  | `src/main.js`   | Tastatur komplett blockiert                     |
| `pointer-events: none` auf `body`               | `src/style.css` | Maus und Touch wirkungslos                      |
| `filter: opacity(0.3)` auf `body`               | `src/style.css` | Kontrast ca. 2,1 : 1                            |
| `cursor: none`                                  | `src/style.css` | Mauszeiger unsichtbar                           |
| `outline: 0 !important` bei `:focus`            | `src/style.css` | Kein Fokusindikator                             |
| `color: window` bei `-ms-high-contrast: active` | `src/style.css` | Text im (alten) Windows-Hochkontrast unsichtbar |

Das vollständige Audit inklusive Schweregrad, WCAG-Kriterien und Korrekturen: [`issues.md`](./issues.md).

## Lokal starten

Voraussetzung: Node.js (getestet mit v22).

```bash
npm install
npm run dev       # Entwicklungsserver
npm run build     # Produktions-Build nach dist/
npm run preview   # Build lokal ansehen
```

## Deployment

Jeder Push auf `main` baut die Seite per GitHub Actions ([`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)) und veröffentlicht sie auf GitHub Pages. Der Pfad `/inaccessible/` ist in [`vite.config.js`](./vite.config.js) als `base` hinterlegt.

---

Ein Projekt von [teil:kraft digital](https://teilkraft.digital).
