# Accessibility-Audit nach WCAG 2.2

**Geprüft:** `index.html`, `src/main.js`, `src/style.css`
**Maßstab:** WCAG 2.2, Konformitätsstufe AA (AAA-Kriterien sind als solche markiert)
**Methode:** Manuelles Code-Review (statische Analyse von Markup, CSS und JavaScript)

> **Kontext:** Die Seite stellt offenbar den Artikel von Manuel Matuzović nach – _„Building the most inaccessible site possible with a perfect Lighthouse score“_. Die Probleme sind also gewollt. Gerade deshalb ist sie ein gutes Beispiel: Ein automatisiertes Tool wie Lighthouse/axe meldet hier wenig bis nichts, und trotzdem ist die Seite für praktisch **alle** Nutzergruppen unbenutzbar.

---

## Übersicht

| #   | Problem                                                      | Datei / Zeile           | WCAG-Kriterium               | Schweregrad |
| --- | ------------------------------------------------------------ | ----------------------- | ---------------------------- | ----------- |
| 1   | Gesamter Inhalt mit `aria-hidden="true"` versteckt           | `index.html:12`         | 1.3.1, 4.1.2, 1.1.1          | Kritisch    |
| 2   | Globales `keydown`-`preventDefault()` blockiert die Tastatur | `src/main.js:3-5`       | 2.1.1, 2.1.2                 | Kritisch    |
| 3   | `tabindex="-1"` auf allen interaktiven Elementen             | `index.html:19, 51, 53` | 2.1.1, 2.4.3                 | Kritisch    |
| 4   | `pointer-events: none` auf `body` blockiert Maus/Touch       | `src/style.css:27`      | Prinzip 2 „Bedienbar“, 2.5.x | Kritisch    |
| 5   | `filter: opacity(0.3)` → Kontrast ca. 2,1 : 1                | `src/style.css:28`      | 1.4.3, 1.4.11                | Kritisch    |
| 6   | Fokusindikator global entfernt                               | `src/style.css:37-39`   | 2.4.7 (AA), 2.4.13 (AAA)     | Hoch        |
| 7   | Hochkontrastmodus: Textfarbe = Hintergrundfarbe              | `src/style.css:31-35`   | 1.4.3, 1.4.11                | Hoch        |
| 8   | Mauszeiger ausgeblendet (`cursor: none`)                     | `src/style.css:21-24`   | Prinzip 2, Best Practice     | Hoch        |
| 9   | Klicks werden per JS verhindert (Fallback)                   | `src/main.js:7-18`      | 2.1.1, Prinzip 2             | Hoch        |
| 10  | Falsche Seitensprache (`lang="de"` bei englischem Inhalt)    | `index.html:2`          | 3.1.1                        | Mittel      |
| 11  | Leeres `<nav>`-Landmark                                      | `index.html:11`         | 1.3.1, 2.4.1                 | Mittel      |
| 12  | Nichtssagendes Label / fehlendes Formular-Feedback           | `index.html:48-54`      | 2.4.6, 3.3.2, 4.1.3          | Mittel      |
| 13  | Liste ohne Überschrift/Kontext                               | `index.html:35-46`      | 1.3.1, 2.4.6                 | Niedrig     |
| 14  | Linkziel nicht eindeutig                                     | `index.html:16-23`      | 2.4.4                        | Niedrig     |
| 15  | Seitentitel nicht beschreibend / irreführend                 | `index.html:7`          | 2.4.2                        | Niedrig     |

---

## Kritisch

### 1. Gesamter Seiteninhalt ist für assistive Technologien unsichtbar

**Datei:** `index.html:12`

```html
<div aria-hidden="true">
  <h1>100% accessible</h1>
  …
</div>
```

**Problem:**
`aria-hidden="true"` entfernt das Element **und alle Nachfahren** aus dem Accessibility Tree. Screenreader (NVDA, JAWS, VoiceOver, TalkBack) bekommen die Überschrift, die Texte, die Liste, den Link und das Formular nicht mitgeteilt. Für Screenreader-Nutzende ist die Seite leer – nur ein leeres `main` und ein leeres `nav` bleiben übrig.

Normalerweise würde axe hier „aria-hidden elements contain focusable elements“ melden. Das wird gezielt mit `tabindex="-1"` umgangen (siehe #3), deshalb bleibt Lighthouse grün.

**Verletzte Kriterien:**

- **1.3.1 Info und Beziehungen (A)** – Struktur (Überschrift, Liste, Formular) ist programmatisch nicht verfügbar.
- **4.1.2 Name, Rolle, Wert (A)** – Link, Eingabefeld und Button haben für AT weder Name noch Rolle.
- **1.1.1 / 1.3.1** – Visuell sichtbarer Inhalt hat keine programmatisch ermittelbare Entsprechung.

**Fix:**
`aria-hidden` ersatzlos entfernen. Mit `aria-hidden` sollte nur rein dekorativer, redundanter Inhalt versteckt werden (z. B. Icons neben einem Textlabel) – nie interaktive Elemente oder Hauptinhalt.

```html
<main>
  <h1>100% accessible</h1>
  …
</main>
```

---

### 2. Die gesamte Tastatureingabe wird blockiert

**Datei:** `src/main.js:3-5`

```js
document.addEventListener("keydown", function (e) {
  e.preventDefault();
});
```

**Problem:**
Jeder Tastendruck wird verworfen. Dadurch funktionieren unter anderem nicht:

- `Tab` / `Shift+Tab` (Fokus weitergeben),
- `Enter` / `Space` (Link oder Button auslösen),
- Texteingabe im Formularfeld,
- Scrollen mit Pfeiltasten, `Space`, `Page Up/Down`, `Home/End`,
- je nach Browser auch Tastenkürzel wie Zoomen mit `Strg/Cmd +` (dann zusätzlich relevant für **1.4.4 Textgröße ändern**).

Betroffen sind alle, die keine Maus nutzen: Menschen mit motorischen Einschränkungen, Nutzende von Schaltern, Sprachsteuerung (die oft Tastaturereignisse simuliert), Power-User und Screenreader-Nutzende im Fokusmodus.

**Verletzte Kriterien:**

- **2.1.1 Tastatur (A)** – Funktionalität ist nicht per Tastatur bedienbar.
- **2.1.2 Keine Tastaturfalle (A)** – Der Fokus kann per Tastatur nicht mehr bewegt werden, der Nutzer „sitzt fest“.

**Fix:**
Den Listener entfernen. Wenn wirklich eigene Tastenkürzel gebraucht werden, nur genau diese Tasten abfangen und nur dort, wo sie gebraucht werden:

```js
// Nur gezielt abfangen, nie global alles blockieren
dialog.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeDialog();
  }
});
```

---

### 3. Alle interaktiven Elemente sind aus der Tab-Reihenfolge entfernt

**Datei:** `index.html:19` (Link), `index.html:51` (Input), `index.html:53` (Button)

```html
<a href="…" tabindex="-1">Read the article</a>
<input type="text" id="text" tabindex="-1" … />
<button type="submit" tabindex="-1">Send</button>
```

**Problem:**
`tabindex="-1"` nimmt native, eigentlich fokussierbare Elemente aus der sequenziellen Tab-Reihenfolge. Mit `Tab` erreicht man sie nicht mehr. Zusammen mit #1 bewirkt es außerdem, dass automatisierte Tests die Kombination „versteckt, aber fokussierbar“ nicht melden.

**Verletzte Kriterien:**

- **2.1.1 Tastatur (A)**
- **2.4.3 Fokus-Reihenfolge (A)** – Die bedienbaren Elemente fehlen in der Fokus-Reihenfolge.

**Fix:**
`tabindex="-1"` von allen drei Elementen entfernen. Native Elemente (`a[href]`, `input`, `button`) sind von sich aus fokussierbar, sie brauchen kein `tabindex`. `tabindex="-1"` gehört nur auf Elemente, die _programmatisch_ fokussiert werden sollen (z. B. eine Überschrift nach einem Seitenwechsel in einer SPA).

---

### 4. Maus- und Touch-Bedienung ist komplett deaktiviert

**Datei:** `src/style.css:26-27`

```css
body {
  pointer-events: none;
}
```

**Problem:**
`pointer-events: none` auf `body` vererbt sich an alle Elemente. Klicks, Taps, Hover und Textauswahl gehen ins Leere. Link, Eingabefeld und Button lassen sich weder mit Maus noch mit Touch, Stift oder Sprachsteuerung bedienen (Sprachsteuerung wie Dragon oder Voice Control simuliert Klicks).

**Verletzte Kriterien:**

- **Prinzip 2 „Bedienbar“** – WCAG verlangt Tastaturbedienbarkeit, setzt aber stillschweigend voraus, dass Zeigereingaben funktionieren. Die Kriterien unter **2.5 Eingabemodalitäten** (z. B. 2.5.2 Zeigerabbruch, 2.5.3 Beschriftung im Namen) laufen ins Leere, wenn Zeigereingaben gar nicht möglich sind.
- Zusammen mit #2 gibt es **keine einzige** funktionierende Eingabemethode mehr. Damit ist **2.1.1** erst recht nicht erfüllt, und die Seite ist für alle unbedienbar.

**Fix:**
Die Regel entfernen. `pointer-events: none` nur punktuell einsetzen, etwa für dekorative Overlays, die Klicks an darunterliegende Elemente durchreichen sollen.

```css
body {
  /* kein pointer-events: none */
}
```

---

### 5. Kontrast der gesamten Seite auf ca. 2,1 : 1 reduziert

**Datei:** `src/style.css:28`

```css
body {
  filter: opacity(0.3);
}
```

**Problem:**
Der Filter macht die gesamte Seite zu 70 % transparent. Standard-Schwarz (`#000`) auf Weiß wird so effektiv zu etwa `#B3B3B3` auf `#FFFFFF`, das ergibt ein Kontrastverhältnis von **ca. 2,1 : 1**. Gefordert sind 4,5 : 1 für normalen Text und 3 : 1 für großen Text und UI-Komponenten. Der Standard-Linkblau und die Rahmen von Eingabefeld und Button liegen ebenfalls deutlich unter den Mindestwerten.

Automatisierte Tools werten `filter` meist nicht aus und messen weiter Schwarz auf Weiß (21 : 1). Darum fällt das Problem in Lighthouse nicht auf.

Betroffen: Menschen mit Sehbehinderung, ältere Menschen, alle bei Sonnenlicht auf dem Smartphone.

**Verletzte Kriterien:**

- **1.4.3 Kontrast (Minimum) (AA)** – Text unter 4,5 : 1.
- **1.4.11 Nicht-Text-Kontrast (AA)** – Begrenzungen von Input und Button unter 3 : 1.
- (AAA: 1.4.6 Kontrast (erhöht), 7 : 1)

**Fix:**
Filter entfernen und Farben bewusst mit ausreichendem Kontrast definieren. Am besten als Custom Properties, die gleich mit dem auskommentierten Dark-Mode-Block kombiniert werden:

```css
:root {
  --text: #1f2937; /* auf #fff: ca. 14,7 : 1 */
  --bg: #ffffff;
}

body {
  color: var(--text);
  background: var(--bg);
}
```

Hinweis zum auskommentierten Dark-Mode (`src/style.css:1-18`): Wenn er wieder aktiviert wird, Kontraste prüfen. `#9ca3af` auf `#16171d` ergibt ca. 7 : 1 und ist damit in Ordnung, sollte aber bei Änderungen erneut nachgemessen werden.

---

## Hoch

### 6. Sichtbarer Fokusindikator global entfernt

**Datei:** `src/style.css:37-39`

```css
*:focus {
  outline: 0 !important;
}
```

**Problem:**
Ohne Outline sehen Tastaturnutzende nicht, welches Element gerade fokussiert ist. Durch `!important` lässt sich das auch per Komponenten-CSS kaum noch überschreiben.

**Verletzte Kriterien:**

- **2.4.7 Fokus sichtbar (AA)**
- **2.4.13 Fokus-Erscheinungsbild (AAA, neu in 2.2)** – Mindestgröße und 3 : 1 Kontrast für den Fokusindikator.

**Fix:**
Regel entfernen und einen gut sichtbaren, eigenen Fokusstil definieren. Mit `:focus-visible` erscheint er nur bei Tastaturbedienung und nicht bei jedem Mausklick:

```css
:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

Zusätzlich auf **2.4.11 Fokus nicht verdeckt (Minimum) (AA, neu in 2.2)** achten, sobald Sticky-Header oder Cookie-Banner dazukommen.

---

### 7. Im Hochkontrastmodus wird der Text unsichtbar

**Datei:** `src/style.css:31-35`

```css
@media screen and (-ms-high-contrast: active) {
  * {
    color: window !important;
  }
}
```

**Problem:**
`window` ist die System-Farbe für den **Fensterhintergrund**. Wer den Windows-Hochkontrastmodus nutzt (meist Menschen mit Sehbehinderung, die genau dafür auf maximale Lesbarkeit angewiesen sind), bekommt Text in der Farbe des Hintergrunds, also unsichtbaren Text.

Außerdem ist `-ms-high-contrast` veraltet (nur Legacy-Edge/IE). Der Standard heißt heute `forced-colors`.

**Verletzte Kriterien:**

- **1.4.3 Kontrast (Minimum) (AA)** – Kontrast 1 : 1 im Hochkontrastmodus.
- **1.4.11 Nicht-Text-Kontrast (AA)**
- WCAG schreibt keine Unterstützung des Hochkontrastmodus vor. Diese Regel _sabotiert_ aber gezielt eine Einstellung der Nutzenden und verschlechtert den Kontrast aktiv.

**Fix:**
Block entfernen. Im Normalfall ist **nichts** zu tun, weil der Browser im Forced-Colors-Modus die Systemfarben selbst setzt. Wenn eigene Anpassungen nötig sind, die korrekten Systemfarben verwenden:

```css
@media (forced-colors: active) {
  .custom-control {
    color: CanvasText;
    background: Canvas;
    border: 1px solid ButtonText;
  }
}
```

---

### 8. Mauszeiger auf allen Elementen ausgeblendet

**Datei:** `src/style.css:21-24`

```css
*,
*:hover {
  cursor: none;
}
```

**Problem:**
Mausnutzende sehen nicht mehr, wo sich der Zeiger befindet. Für Menschen mit Sehbehinderung (z. B. mit Bildschirmlupe), mit motorischen Einschränkungen (Tremor) oder kognitiven Einschränkungen wird präzises Zeigen unmöglich. Auch die Rückmeldung „hier ist etwas klickbar“ (`cursor: pointer`) und „hier kann Text eingegeben werden“ (`cursor: text`) fällt weg.

**Verletzte Kriterien:**

- Kein einzelnes Erfolgskriterium deckt `cursor: none` direkt ab. Es widerspricht aber **Prinzip 2 „Bedienbar“** und der Leitlinie **2.5 Eingabemodalitäten**. In der Praxis ist es ein schwerer Usability- und Accessibility-Fehler.

**Fix:**
Regel entfernen. Der Browser setzt passende Cursor selbst (`auto`, `pointer`, `text`).

---

### 9. Klick-Events werden per JavaScript verhindert (Fallback)

**Datei:** `src/main.js:7-18`

```js
function removeA11y() {
  if ("pointerEvents" in document.body.style) {
    console.log("pointer-events supported");
    return;
  }
  document.addEventListener("click", function (e) {
    e.preventDefault();
  });
}
```

**Problem:**
In Browsern ohne `pointer-events`-Support wird jeder Klick global unterdrückt. Das ist der Fallback zu #4 und sorgt dafür, dass Links und Buttons wirklich in _keinem_ Browser funktionieren. Weil `click` auch bei `Enter`/`Space` auf Links und Buttons ausgelöst wird, wäre auch die Tastaturbedienung betroffen.

Nebenbei: Der Funktionsname `removeA11y` zeigt die Absicht, und das `console.log` gehört nicht in Produktionscode.

**Verletzte Kriterien:**

- **2.1.1 Tastatur (A)** (Aktivierung per Tastatur löst `click` aus)
- **Prinzip 2 „Bedienbar“**

**Fix:**
Die Funktion und ihren Aufruf komplett entfernen. Wenn `main.js` danach nur noch das CSS importiert, bleibt:

```js
import "./style.css";
```

---

## Mittel

### 10. Falsche Sprachangabe der Seite

**Datei:** `index.html:2`

```html
<html lang="de"></html>
```

**Problem:**
Die Seite ist als Deutsch ausgezeichnet, der gesamte Inhalt (Titel, Überschrift, Fließtext, Liste, Formular) ist aber Englisch. Screenreader nutzen dann die deutsche Sprachausgabe für englischen Text, was zu einer kaum verständlichen Aussprache führt. Auch Übersetzungstools, Silbentrennung (`hyphens: auto`) und Rechtschreibprüfung richten sich nach `lang`.

**Verletzte Kriterien:**

- **3.1.1 Sprache der Seite (A)**
- Wenn später gemischte Inhalte entstehen: **3.1.2 Sprache von Teilen (AA)**

**Fix:**

```html
<html lang="en"></html>
```

Oder alternativ den Inhalt ins Deutsche übersetzen und `lang="de"` beibehalten. Einzelne fremdsprachige Passagen mit `lang` auszeichnen, z. B. `<span lang="en">…</span>`.

---

### 11. Leeres Navigations-Landmark

**Datei:** `index.html:11`

```html
<nav></nav>
```

**Problem:**
Screenreader kündigen „Navigation“ als Landmark an und listen es im Landmark-Menü auf, finden darin aber nichts. Das kostet Zeit und verwirrt. Außerdem steht `<nav>` hier **innerhalb** von `<main>`. Die globale Navigation gehört semantisch davor (z. B. in `<header>`).

Nebenbei: `class=""` auf `<main>` (`index.html:10`) ist überflüssig.

**Verletzte Kriterien:**

- **1.3.1 Info und Beziehungen (A)** – Eine Struktur wird behauptet, die es nicht gibt.
- **2.4.1 Bereiche überspringen (A)** – Landmarks sollen das Navigieren erleichtern, ein leeres Landmark tut das Gegenteil.

**Fix:**
Leeres `<nav>` entfernen oder mit Inhalt füllen und vor `<main>` platzieren. Bei mehreren Navigationen jede mit `aria-label` unterscheiden:

```html
<header>
  <nav aria-label="Hauptnavigation">
    <ul>
      <li><a href="/">Start</a></li>
    </ul>
  </nav>
</header>
<main>…</main>
```

---

### 12. Formular: unklares Label, kein Ziel, kein Feedback

**Datei:** `index.html:48-54`

```html
<form action="#form">
  <p>
    <label for="text">Dummy form</label><br />
    <input type="text" id="text" tabindex="-1" autocomplete="off" />
  </p>
  <button type="submit" tabindex="-1">Send</button>
</form>
```

**Probleme:**

- **Label beschreibt nicht, was eingegeben werden soll.** „Dummy form“ ist der Name des Formulars, nicht des Feldes. Nutzende wissen nicht, welche Eingabe erwartet wird.
- **`action="#form"`** verweist auf eine ID, die es nicht gibt. Nach dem Absenden passiert sichtbar nichts, und es gibt keine Statusmeldung (Erfolg/Fehler).
- **`autocomplete="off"`**: Hier unkritisch, weil das Feld keine persönlichen Daten abfragt. Sobald es echte Felder wie Name oder E-Mail sind, muss der passende `autocomplete`-Wert gesetzt werden (**1.3.5 Zweck der Eingabe bestimmen (AA)**).
- `<br />` zur Layout-Steuerung ist unschön, aber kein Accessibility-Fehler.

**Verletzte Kriterien:**

- **2.4.6 Überschriften und Beschriftungen (AA)** – Beschriftung beschreibt den Zweck nicht.
- **3.3.2 Beschriftungen oder Anweisungen (A)**
- **4.1.3 Statusmeldungen (AA)** – Fehlende, programmatisch angekündigte Rückmeldung nach dem Absenden (sobald das Formular echt ist).

**Fix:**

```html
<form action="/subscribe" method="post">
  <div>
    <label for="email">E-Mail-Adresse</label>
    <input type="email" id="email" name="email" autocomplete="email" required />
  </div>
  <button type="submit">Absenden</button>
  <p role="status" id="form-status"></p>
</form>
```

Erfolgs- und Fehlermeldungen in das `role="status"`-Element schreiben, damit Screenreader sie ansagen.

---

## Niedrig

### 13. Liste ohne Kontext

**Datei:** `index.html:35-46`

**Problem:**
Die Liste („CSS only“, „JS only“, „Screen reader users“, …) hat keine Überschrift und keine Einleitung. Ohne visuellen Kontext ist nicht klar, wofür die Begriffe stehen (vermutlich: Nutzergruppen bzw. Testszenarien, die von der Seite ausgeschlossen werden). Auch die Seite selbst hat außer `<h1>` keine Überschriftenstruktur, nach der Screenreader-Nutzende navigieren könnten.

**Verletzte Kriterien:**

- **1.3.1 Info und Beziehungen (A)**
- **2.4.6 Überschriften und Beschriftungen (AA)**

**Fix:**

```html
<h2>Wer wird ausgeschlossen?</h2>
<ul>
  <li>CSS only</li>
  …
</ul>
```

Auch die Textabschnitte und das Formular mit passenden `<h2>` gliedern.

---

### 14. Linkzweck nicht eindeutig

**Datei:** `index.html:16-23`

```html
<a href="https://www.matuzo.at/blog/…" rel="noopener">Read the article</a>
```

**Problem:**
„Read the article“ sagt nicht, _welcher_ Artikel gemeint ist. In der Linkliste eines Screenreaders (Links ohne umgebenden Text) ist der Link nicht von anderen „Read the article“-Links zu unterscheiden. Außerdem führt er auf eine externe Seite, ohne dass das angekündigt wird.

`rel="noopener"` ohne `target="_blank"` ist wirkungslos, aber kein Accessibility-Problem.

**Verletzte Kriterien:**

- **2.4.4 Linkzweck (im Kontext) (A)** – im aktuellen Kontext grenzwertig, weil es kaum umgebenden Text gibt.
- (AAA: **2.4.9 Linkzweck (nur Linktext)**)

**Fix:**

```html
<a
  href="https://www.matuzo.at/blog/building-the-most-inaccessible-site-possible-with-a-perfect-lighthouse-score/"
>
  Read the article “Building the most inaccessible site possible with a perfect
  Lighthouse score” by Manuel Matuzović
</a>
```

---

### 15. Seitentitel beschreibt den Inhalt nicht

**Datei:** `index.html:7`, `src/demo.html:7`

```html
<title>100% accessible</title>
```

**Problem:**
Beide Seiten haben denselben Titel. In Tabs, im Verlauf, in Lesezeichen und bei der Ansage durch Screenreader lassen sie sich nicht unterscheiden. Zudem ist der Titel inhaltlich irreführend.

**Verletzte Kriterien:**

- **2.4.2 Seite mit Titel versehen (A)** – Titel müssen Thema oder Zweck beschreiben.

**Fix:**
Eindeutige, beschreibende Titel vergeben, z. B.:

```html
<!-- index.html -->
<title>Demo: Unzugängliche Website trotz perfektem Lighthouse-Score</title>
<!-- demo.html -->
<title>Listen-Demo – Ungültige Listenstruktur</title>
```

---

## Was bereits gut ist

- `<meta name="viewport" content="width=device-width, initial-scale=1.0">` blockiert das Zoomen **nicht** (kein `user-scalable=no` / `maximum-scale=1`), **1.4.4** und **1.4.10** sind von dieser Seite aus also nicht verletzt.
- `<main>`-Landmark ist vorhanden.
- Das Eingabefeld ist korrekt mit `<label for>` verknüpft.
- Native HTML-Elemente (`<a>`, `<button>`, `<input>`) statt nachgebauter `div`-Controls. Sobald die Sabotage (#1–#9) entfernt ist, funktioniert die Grundsemantik.
- Es gibt keine Animationen und keine zeitbasierten Inhalte, damit auch keine Probleme mit **2.2.x** oder **2.3.x**.

---

## Empfohlene Reihenfolge der Behebung

1. **#1, #2, #3, #4, #9** entfernen. Danach ist die Seite überhaupt wieder bedienbar und wahrnehmbar (alles reine Löschungen, wenige Minuten Aufwand).
2. **#5, #6, #7, #8** im CSS entfernen bzw. ersetzen (Kontrast, Fokus, Hochkontrast, Cursor).
3. **#10, #11, #16** korrigieren (Sprache, Landmarks, valides Markup).
4. **#12–#15, #17** verbessern (Beschriftungen, Überschriften, Titel, Linktexte).

## Lehre für den Testprozess

Diese Seite zeigt, warum automatisierte Tests **nicht reichen**: Lighthouse/axe finden nur einen Bruchteil der Probleme (Schätzungen: 30–40 % der WCAG-Kriterien sind automatisch prüfbar). Empfohlen:

- **Tastatur-Test:** Die Seite einmal komplett nur mit `Tab`, `Shift+Tab`, `Enter`, `Space` und den Pfeiltasten bedienen.
- **Screenreader-Test:** VoiceOver (macOS: `Cmd+F5`) oder NVDA (Windows, kostenlos), Überschriften- und Landmark-Navigation durchspielen.
- **Zoom-Test:** 200 % und 400 % (Reflow bei 320 px Breite).
- **Forced-Colors-Test:** Chrome DevTools → Rendering → „Emulate CSS media feature forced-colors: active“.
- **Kontrast:** Mit echten, _gerenderten_ Farben messen (z. B. Colour Contrast Analyser mit Pipette), nicht nur mit den CSS-Werten, siehe `filter` in #5.
