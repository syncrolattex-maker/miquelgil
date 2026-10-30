# DESIGN.md — Miquel Gil: Arxiu Sonor i Discogràfic Interactiu
<!-- INSPIRAT EN A24 — FILMS (https://a24.raviklaassens.com/) -->

## Mission
Create implementation-ready, token-driven UI guidance for Miquel Gil — Arxiu Sonor i Discogràfic Interactiu that is optimized for consistency, accessibility, and high-performance delivery across the digital ecosystem.

## Brand
- **Product/brand**: Miquel Gil — Arxiu Sonor i Discogràfic Interactiu (1975 — 2026)
- **Inspiration Reference**: A24 — Films (`https://a24.raviklaassens.com/`)
- **URL**: `https://miquelgil.com` (Dev: `http://localhost:3000`)
- **Audience**: Melòmans, programadors culturals de teatres i festivals, premsa especialitzada i públic general
- **Product surface**: Arxiu interactiu d'inici (`/start`), catàleg discogràfic (`/discografia`), contractació institucional (`/contractacio`), agenda (`/agenda`)

---

## 1. Style Foundations & Design Tokens

### Visual Style
Structured, editorial, physical tribut (skeuomorphism modern de vinils de 12 polzades i suport d'arxiu), minimalisme de contrast alt, accessibility-prioritized (WCAG 2.2 AA).

### Typography Foundations & Font Stacks
- **Display monumental**:
  - `font.family.display`: `'Maelstrom Sans', -apple-system, sans-serif`
  - *Regla d'or*: Exclusivament per a encapçalaments de secció gegants, xifres d'arxiu i monogrames heroics. Mai en paràgrafs ni blocs de lectura.
- **Micro-tipografia, UI i lectura tècnica primària**:
  - `font.family.primary`: `'PP Neue Montreal', 'Ppneuemontreal', 'GRAPHIK', Arial, sans-serif` (`/fonts/PPNeueMontreal-Medium.woff2`)
  - *Regla d'or*: Tipografia principal del sistema A24 / Miquel Gil: micro-metadades en caixes altes (`uppercase`) amb tracking obert, navegació de capítols, fitxes tècniques, botons i cos general.
- **Editorial poètic i literari d'arrel**:
  - `font.family.editorial`: `'PP Eiko', 'GRIFINITO L', Georgia, 'Times New Roman', serif` (`/fonts/PPEiko-Regular.woff2`)
  - *Regla d'or*: Títols d'àlbums (*Viatger*, *Geometries*, *Orgànic*, *Katà*), poesia musicada (Estellés, Casasses, Montero), descripcions líriques i cites crítiques.
- **Display històric d'arxiu i museu**:
  - `font.family.archive`: `'PP Museum', 'GRIFINITO L', serif` (`/fonts/PPMuseum-Regular.woff2`)
  - *Regla d'or*: Encapçalaments de contraportada de vinil, catalogació d'institucions i marques patrimonials.
- **Codis i catalogació monoespaiada**:
  - `font.family.mono`: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
  - *Regla d'or*: Codis de matriu (`MG-08 // STEREO`), temporitzadors (`04:07`) i codis de barres.

### Typography Scale
- `font.size.xs`: `10px` — Micro-metadades, tracking: `+0.12em`, `font.weight: 700`, uppercase
- `font.size.sm`: `12px` — Badges d'arxiu, etiquetes tècniques, subtítols de control
- `font.size.base`: `15px` — Cos de text, crèdits, descripcions d'obra, `font.lineHeight: 1.55`
- `font.size.md`: `18px` — Cites editorials, titulars de targeta en Grifinito L
- `font.size.lg`: `28px` a `34px` — Paràgrafs de capçalera lírica, subtítols monumentals
- `font.size.xl`: `48px` a `64px` — Titulars d'obra i capítols d'arxiu
- `font.size.2xl`: `80px` a `160px` — Display d'impacte en Maelstrom Sans (`NINETA`, `VIATGER`, `PRESENTACIÓ`)

### Color Palette Tokens
- `color.text.primary`: `#000000` (en paper cru) / `#FFFFFF` (en fons fosc)
- `color.text.secondary`: `#555A57` (en paper) / `#8E9290` (en fosc)
- `color.text.muted`: `#6C716E` / `#A5A9A7`
- `color.surface.dark`: `#000000` (Negre sutge pur, dark mode cinematogràfic)
- `color.surface.dark.secondary`: `#0C0C0C` / `#111211` (Dock flotant, superfícies de modal)
- `color.surface.light`: `#F8F0E6` (Blanc d'ossos càlid, paper d'arxiu)
- `color.surface.light.pure`: `#FAF9F6` / `#FFFFFF` (Targetes de contingut, fons de contraportada)
- `color.accent.visceral`: `#E20000` (Vermell Miquel Gil: línies de tall, estats actius, vinils)
- `color.accent.vibrant`: `#FF0000` (Pols interactiu, accent de galeta central)
- `color.border.subtle`: `rgba(255, 255, 255, 0.1)` (dark) / `rgba(0, 0, 0, 0.08)` (light)
- `color.border.accent`: `rgba(226, 0, 0, 0.4)`

### Spacing Scale
- `space.1`: `4px` (Micro gaps, padding d'etiquetes)
- `space.2`: `8px` (Pill padding vertical, separació d'icones)
- `space.3`: `12px` (Metadades, gaps de llista)
- `space.4`: `16px` (Padding interior de targetes, espaiat de blocs)
- `space.5`: `24px` (Separació de mòduls, padding de secció mòbil)
- `space.6`: `32px` a `48px` (Contenidors principals, espaiat de columnes)
- `space.7`: `64px` a `96px` (Ritme vertical de secció, alçades d'hero)

### Radius Tokens
- `radius.xs`: `4px` (Badges d'arxiu, cantonades de funda, codis)
- `radius.sm`: `8px` (Quotes editorials, reproductors de vídeo)
- `radius.md`: `16px` (Targetes de format, diàlegs)
- `radius.pill`: `30px` a `40px` (Botons d'acció, dock flotant, pastilles de capítol)
- `radius.full`: `50%` (Vinil de 12 polzades, forat central d'eix, pols de so)

### Motion & Duration Tokens
- `motion.duration.instant`: `120ms` a `160ms` (Compressió tàctil `:active`, feedback de botó)
- `motion.duration.fast`: `200ms` a `250ms` (Canvi de color, hover de pastilles, focus)
- `motion.duration.moderate`: `300ms` a `450ms` (Entrades de modal, transicions d'eix Z)
- `motion.duration.deliberate`: `650ms` a `750ms` (Volteig 3D de 180° de vinil, extracció de disc)
- `motion.ease.out`: `cubic-bezier(0.16, 1, 0.3, 1)` (Desacceleració ràpida per a UI)
- `motion.ease.inOut`: `cubic-bezier(0.77, 0, 0.175, 1)` (Moviment físic 3D entre cares)

---

## 2. Accessibility Standards (WCAG 2.2 AA)

- **Target**: WCAG 2.2 AA obligatori a totes les interfícies.
- **Keyboard-first interactions**:
  - Tota la navegació per capítols i obres ha de ser operable exclusivament amb teclat (`Tab`, `Fletxes`, `1-3`, `Espai`, `Enter`, `Escape`).
  - `Espai`: Volteig de 180° del vinil interactiu de Viatger (Cara A / Cara B).
  - `1`, `2`, `3`: Desplaçament suau (*smooth scroll*) als capítols 01 Nineta, 02 Viatger, 03 Principal.
  - `M` o `S`: Silenci / reproducció de la mostra de so.
  - Els camps de text i inputs aïllen les dreceres per evitar disparadors accidentals.
- **Focus-visible rules**:
  - Tot element interactiu ha de presentar un anell de focus d'alt contrast (`outline: 2px solid #E20000; outline-offset: 3px;`) visible en navegar per teclat.
- **Contrast constraints**:
  - Text normal: ràtio mínima 4.5:1 (Blanc sobre Negre = 21:1, Negre sobre Paper Cru = 16.8:1).
  - Text gran i display: ràtio mínima 3:1 (Vermell `#E20000` sobre Paper Cru = 4.6:1).
- **Reduced motion (`prefers-reduced-motion: reduce`)**:
  - Quan s'activa la preferència de moviment reduït al sistema operatiu:
    - Es desactiven les rotacions 3D (`rotateY(180deg)`), carrusels d'eix Z i lliscaments de vinil.
    - Es substitueixen per una transició d'opacitat creuada (*crossfade*) de 0.2s.
    - Es manté intacte el control per teclat, la reproducció d'àudio i la lectura de dades.

---

## 3. Writing Tone & Content Standards

- **Tone**: Concís, confiat, documental, poètic i orientat a la implementació.
- **Vocabulari d'arxiu d'autor**:
  - Ús de terminologia d'arxiu canònic: `ARXIU #01`, `CATÀLEG MG-08`, `MATRIU STEREO`, `CURTMETRATGE & SINGLE`, `12" LP 33 RPM`.
- **Integritat poètica**:
  - Els versos de Vicent Andrés Estellés, Enric Casasses i Anna Montero han de citar-se textualment, amb cometes tipogràfiques (`&ldquo;...&rdquo;`) i en font **GRIFINITO L**.

---

## 4. Component-Level Rules & State Matrix

Tot component interactiu ha de definir clarament els 7 estats d'interfície:
1. `default`
2. `hover`
3. `focus-visible`
4. `active`
5. `disabled`
6. `loading`
7. `error`

### 4.1. Visor Central de Vinil 3D (`start-vinyl-stage` & `start-vinyl-flipper`)
- **Anatomia**:
  - Funda de cartró 3D amb perspectiva espacial (`perspective: 1400px`).
  - Disc de vinil de 12 polzades (solcs concèntrics radials, reflex anisotròpic, galeta central vermella amb eix).
  - Cara A (Art frontal de coberta i reflex especular).
  - Cara B (Contraportada oficial amb llista de pistes Cara A/B, poesia d'Estellés, crèdits de Borja Penalba, segell Temps Record MG-08 i codi de barres).
- **Matriu d'estats**:
  - `default`: Funda tancada a 0°, vinil inserit a l'interior.
  - `hover`: Funda inclinada `rotateY(-6deg) rotateX(2deg) scale(1.02)`, disc lliscant 55px cap a la dreta amb gir de 45°.
  - `focus-visible`: Anell vermell d'arxiu `outline: 2px solid #E20000; outline-offset: 4px;`.
  - `active`: Compressió física `scale(0.98)` en prémer.
  - `flipped`: Rotació completa `rotateY(180deg)` per explorar la Cara B.
  - `disabled`: En `prefers-reduced-motion: reduce`, la rotació 3D es transforma en transició suau d'opacitat.
  - `loading`: Esquelet de càrrega suau abans de renderitzar els actius d'alta resolució.

### 4.2. Pastilles d'Acció i Botons (`start-action-pill`, `contract-card-btn`)
- **Variants**:
  - `primary` (Vermell visceral `#E20000`, text blanc).
  - `secondary` (Paper cru `#F1EFEA` o blanc pur, vora subtil).
  - `flip` (Vermell d'arxiu amb distintiu de drecera `[Espai]`).
  - `spotify` (Verd institucional `#1DB954`).
- **Matriu d'estats**:
  - `default`: Fons sòlid, text amb tracking obert, cantonades arrodonides `radius.pill`.
  - `hover`: Fons negre (`#000000`), elevació `translateY(-1px)`, ombra dinàmica de 18px.
  - `focus-visible`: `outline: 2px solid #E20000; outline-offset: 3px;`.
  - `active`: Resposta tàctil ràpida `transform: scale(0.97); transition: transform 120ms ease-out;`.
  - `disabled`: `opacity: 0.5; pointer-events: none;`.
  - `loading`: Indicador d'ona sonora o spinner suau.
  - `error`: Vora vermella d'advertència amb retroacció d'estat.

### 4.3. Dock Flotant Inferior d'Arxiu (`start-archive-dock`)
- **Anatomia**:
  - Fixat a la vora inferior (`position: fixed; bottom: 20px`), centrat horitzontalment, amplada màxima 920px.
  - Fons negre translúcid amb vidre esmerilat (`background: rgba(12, 12, 12, 0.88); backdrop-filter: blur(20px)`).
  - Punt d'estat vermell d'alta emissió, indicador de capítol actiu, botons ràpids `01`, `02`, `03` i llegenda de tecles ràpides.
- **Sincronització**:
  - `IntersectionObserver` actiu als contenidors `#sec-nineta`, `#sec-viatger`, `#sec-principal`.

---

## 5. Rules: Do and Don't

### Rules: Do
- **Must** emprar tokens semàntics (`--font-maelstrom`, `--font-grifinito`, `--font-graphik`, `--red`, `--ease-out`) en comptes de valors màgics o propietats disperses.
- **Must** declarar explícitament les propietats animades (`transform`, `opacity`, `background-color`, `border-color`, `box-shadow`) per garantir acceleració íntegra per GPU.
- **Must** condicionar tota animació espacial a `prefers-reduced-motion: reduce`.
- **Must** mantenir el paràgraf únic en Grifinito L per a *Nineta* i *Viatger*, i la divisió en 3 línies monumentals per a *Presentació al Principal*.
- **Should** oferir retroacció acústica (mostres de so d'alta fidelitat o cruixit de vinil) a les experiències d'escolta.

### Rules: Don't
- **Do not** utilitzar `transition: all` sota cap concepte; penalitza el rendiment i provoca recàlculs d'estil innecessaris.
- **Do not** emprar `ease-in` en eixides de modal o tancaments de panells (sempre `ease-out`).
- **Do not** emprar `scale(0)` en cap transició d'aparició (sempre des de `0.92–0.96` a `1.0`).
- **Do not** eliminar els anells de focus (`outline: none`) sense un indicador de focus alternatiu d'alt contrast.
- **Do not** utilitzar Maelstrom Sans per a paràgrafs llargs o blocs de text densos.

---

## 6. Anti-Patterns & Prohibited Implementations

| Anti-patró Prohibit | Raó Tècnica / Artística | Solució Normativa Obligatòria |
|---|---|---|
| `transition: all 0.3s ease` | Força recàlculs de pintura i layout en propietats no compositades per GPU. | `transition: transform 0.25s var(--ease-out), opacity 0.2s ease;` |
| `ease-in` en tancament de modal | Comença lent i genera sensació de retard i lentitud a la UI. | `ease: "power2.out"` o `cubic-bezier(0.16, 1, 0.3, 1)` amb durada $\le 180\text{ms}$. |
| Desaparició d'anell de focus | Incompleix WCAG 2.2 AA per a usuaris de teclat. | `:focus-visible { outline: 2px solid #E20000; outline-offset: 3px; }` |
| Text dens en Maelstrom Sans | Tipografia display reverse-contrast: il·legible en cossos inferiors a 36px. | Reservada exclusivament per a capçaleres $\ge 52\text{px}$. El cos empra Graphik o Grifinito. |
| Volteig 3D forçat en moviment reduït | Provoca vertigen o desorientació en usuaris amb trastorns vestibulars. | Substitució automàtica per *crossfade* suau d'opacitat en `@media (prefers-reduced-motion: reduce)`. |

---

## 7. QA Checklist de Validació

Abans de donar per aprovada qualsevol implementació o canvi d'interfície:

- [ ] **Mecànica**: `npm run build` compila amb 0 errors de TypeScript i genera les rutes netes.
- [ ] **Rendiment**: Totes les transicions s'executen sobre `transform` i `opacity` a 60–120 fps sense salts de frame.
- [ ] **Tipografia**: Maelstrom Sans als grans títols; Grifinito L a la poesia i cites; Graphik a micro-metadades en caixa alta amb tracking obert.
- [ ] **Format Físic**: El vinil de Viatger respon al punter (extracció de 55px) i gira 180° a la Cara B amb la tecla `Espai` o clic.
- [ ] **Teclat**: Operable amb `Tab`, `Fletxes`, `Espai`, `1-3`, `M` i `Escape`.
- [ ] **Contrast**: Tots els textos compleixen WCAG 2.2 AA (mínim 4.5:1 per a text normal, 3:1 per a display).
- [ ] **Accessibilitat**: Amb `prefers-reduced-motion` activat a DevTools Rendering, tots els moviments bruscos s'anul·len i mantenen retroacció d'opacitat.
- [ ] **Responsive**: Provat a resolucions d'escriptori (1440px), tauleta (1024px) i mòbil (390px) sense col·lisió amb el menú hamburguesa.
