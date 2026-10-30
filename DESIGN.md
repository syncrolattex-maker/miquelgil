# DESIGN.md — Miquel Gil: Arxiu Sonor i Discogràfic Interactiu

Document de directrius de disseny, direcció d'art, arquitectura visual i interacció per a l'ecosistema web i l'experiència interactiva de catàleg de **Miquel Gil** (1975 — 2026).

---

## 1. Filosofia i Direcció d'Art

* **Atmósfera Mediterrània Contemporània & Minimalisme Editorial:**
  * Estètica fosca immersiva (*dark mode* cinematogràfic) combinada amb superfícies d'alta puresa editorial en blanc d'ossos i paper cotó.
  * El focus visual recau íntegrament en el suport físic de les obres (portades originals, serigrafies de galeta, tipografia poètica) i en l'espai negatiu que permet respirar a mig segle de trajectòria.
  * Presència de taques de tinta viva procedural (*InkBloom* amb Three.js/WebGL), al·ludint a la terra, la sang, l'aiguada i la visceralitat de la veu de Miquel Gil.

* **Tribut al Format Físic (Skeuomorphism Orgànic i Modern):**
  * Reinterpretació tàctil i digital del vinil de 12 polzades (LP 33 rpm), la funda de cartró d'alt gramatge amb acabat mat, el disc compacte (digipak) i les cintes de casset històriques (Al Tall / Terminal Sur).
  * Emulació física del lliscament del disc fora de la funda, reflexos especulars anisotròpics sobre els microsolcs d'acetat i la capacitat de donar la volta al suport (180°) per explorar la contraportada: crèdits tècnics, lletres poètiques i notes de producció.

* **Tono Documental d'Autor i Patrimoni Poètic:**
  * Tractament auster i rigorós, inspirat en els catàlegs d'arxius sonors històrics (Folkways de Smithsonian, ECM Records, Edigsa) i el disseny editorial de monografies culturals independents.
  * Diàleg permanent entre la música d'arrel tradicional (albaes, cants de batre, jotes) i l'avantguarda poètica contemporània (Vicent Andrés Estellés, Enric Casasses, Anna Montero, Marc Granell).

---

## 2. Paleta Cromàtica i Materials

* **Fons Principal (Dark Archive):**
  * Negre carbó profund i sutge (`#000000` / `#0A0A0A` / `#111211`), eliminant qualsevol distracció perifèrica durant l'escolta i exploració del catàleg.
* **Superfícies Secundàries i Suport Editorial (Light Paper):**
  * Blanc d'ossos, tela càlida i paper artesanal (`#FAF9F6` / `#F8F0E6` / `#F4F2ED`) per a seccions documentals, fitxes tècniques, riders i lletres completes.
* **Accentuació — Vermell Visceral Miquel Gil:**
  * Vermell sang / carmí d'arrel (`#E20000` / `#B80018` / `#FF0528`), emprat com a fil conductor visual: línies de tensió (`AnimatedDivider`), marcadors de reproducció activa, segells de garantia i *ink blooms*.
* **Textos i Jerarquia Visual:**
  * **Titulars i Estats Actius:** Blanc pur (`#FFFFFF`) en mode fosc; Negre absolut (`#000000`) en superfícies clares.
  * **Metadades i Crèdits:** Grisos minerals neutres (`#6C716E` / `#8E9290` / `#A5A9A7` / `#555A57`) per a segells discogràfics, anys, músics i fitxes de producció.
* **Textures i Materials:**
  * **Acetat de Vinil Negre:** Microsolcs concèntrics amb brillantor especular anisotròpica que reacciona a la llum i al moviment del cursor.
  * **Galeta Central Serigrafiada:** Etiqueta central de 10 cm amb acabat paper mat i perforació central d'eix.
  * **Cartró de Funda:** Efecte de vora envellida, textura de paper d'art i lleugera ombra de relleu (*contact shadow*).

---

## 3. Tipografia i Jerarquia Visual

El sistema tipogràfic oficial del projecte s'estructura en tres nivells amb rols clarament diferenciats:

* **1. Maelstrom Sans (Klim Type Foundry) — Titulars Heroics Monumentals:**
  * Tipografia display *reverse-contrast* de màxim impacte visual i arrel trencadora.
  * **Regla d'or:** Ús exclusiu i altament contingut en grans encapçalaments de secció (`DISCOGRAFIA`, `CONTRACTACIÓ`, `AGENDA`), xifres històriques d'arxiu i monogrames.
  * *Tracking* condensat i ajustat; mai emprada en paràgrafs ni en blocs densos de text.
* **2. GRIFINITO L — Literatura, Títols d'Obra i Cites Poètiques:**
  * Serifa condensada d'alta elegància i respiració literària.
  * Emprada per a títols d'àlbums (*Viatger*, *Geometries*, *Orgànic*, *Katà*, *Eixos*), versos de poetes musicats, subtítols evocadors i declaracions artístiques de Miquel Gil.
* **3. GRAPHIK — Arquitectura Editorial, Microtipografia i UI:**
  * Sans-serif contemporània de geometria suïssa i excel·lent llegibilitat técnica.
  * **Micro-metadades:** Caixes altes (`uppercase`) amb espaiat obert (`letter-spacing: 0.1em` a `0.15em`) en cossos petits (9px a 12px) per a etiquetes invariables: `SEGELL`, `CATÀLEG MG-08`, `ANY`, `PRODUCCIÓ`, `DURADA`.
  * **Blocs de Text i Ressenyes:** Cossos regulars (14px a 16px) amb alçada de línia relaxada (`line-height: 1.6`) per a biografies, anàlisis i notes d'arxiu.
  * **Dades Numèriques i Codis:** Numeració de pistes, cronòmetre de reproducció (`03:42 / 48:15`) i codis de matriu en font monoespaiada per reforçar la condició de registre arxivístic.
* **Cites i Ressenyes Crítiques:**
  * Format editorial destacat per a la crítica especialitzada (*Enderrock*, *Levante-EMV*, *VilaWeb*, *MondoSonoro*, *El Temps*) i premis oficials (Premis Ovidi Montllor, Premis Carles Santos).

---

## 4. Arquitectura d'Interacció i UX

* **Navegació Espacial 3D (Z-Axis Carousel & Vinyl Rack):**
  * Els treballs discogràfics s'ordenen en profunditat espacial (eix Z) simulant una caixa de vinils o expositor d'arxiu d'autor.
  * En transicionar entre títols, l'àlbum enfocat avança cap al primer pla mentre els discos anteriors i posteriors es desenfoquen lleugerament (`depth of field`) i perden intensitat lumínica.
  * El vinil pot lliscar 45px fora de la seua funda en estat *hover* o selecció activa, revelant els solcs i la galeta serigrafiada.

* **Control Dual Universal (Punter/Tactil + Teclat per a Melòmans):**
  * `←` / `→` (Fletxes horitzontals): Desplaçament seqüencial cronològic pel catàleg (1996 → 2024).
  * `Barra espaciadora` (`Space`): Volteig complet de 180° (*card flip*) del disc i la funda per alternar entre:
    * **Cara Frontal (Art):** Obra visual, títol, tipografia d'autor i any.
    * **Cara Posterior (Arxiu & Crèdits):** Pistes (Cara A / Cara B), músics acompanyants, poetes, ressenyes de premsa i premis.
  * `Enter`: Confirmació de selecció, obertura de la fitxa completa d'àlbum o activació de la reproducció de la pista principal.
  * `M` o `S`: Silenci / reproducció de la mostra acústica (*Sound toggle*).

* **Disseny Sonor Integrat (Textura Acústica de l'Arxiu):**
  * **Feedback tàctil i auditiu:**
    * Fricció d'agulla i caiguda subtil sobre el solc (*needle drop*) en carregar un disc.
    * Crepitació càlida i gairebé imperceptible de vinil (*vinyl crackle* a -28dB).
  * **Mostres sonores directes:** Reproductor d'alta fidelitat connectat a Spotify Web API i mostres locals d'àudio (guitarra acústica, veu nua d'albaes, dolçaina, percussions mediterrànies).
  * **Feedback visual d'ona sonora:** Visualitzador d'ones (*waveform*) o espectrograma minimalista en color vermell visceral (`#E20000`).

---

## 5. Components Clau de la Interfície

1. **Capçalera Minimalista d'Arxiu:**
   * Logotip i identitat de secció: `MIQUEL GIL // ARXIU DISCOGRÀFIC OFICIAL`.
   * Selector de categories de catalogació:
     * `Tots els Treballs`
     * `Àlbums d'Estudi`
     * `Directes & En Concert`
     * `Col·laboracions & Projectes Especials`
     * `Singles & Inèdits`

2. **Visor Central del Vinil (3D Interactive Sleeve & Disc):**
   * Renderització interactiva d'alta resolució de la funda i el vinil extraïble.
   * Shader de reflex de llum rotatori que reacciona a la posició del punter del ratolí o a la inclinació del giroscopi en dispositius mòbils.
   * Transició 3D suau i interrompible entre la cara frontal i la cara posterior.

3. **Mòdul de Fitxa Tècnica i Literatura Poètica:**
   * Panell editorial desplegable o lateral amb:
     * Títol de l'obra en **GRIFINITO L** i any de llançament.
     * Fitxa canònica: Direcció musical, producció (Borja Penalba, etc.), arranjaments i segell discogràfic.
     * Antologia poètica: Poemes musicats de Vicent Andrés Estellés, Enric Casasses, etc.
     * Cites de la premsa cultural i reconeixements.
     * Pistes amb durades i botó d'escolta immediata per pista.

4. **Dock Inferior / Barra de Reproducció Persistent (`AudioPlayerBottom`):**
   * Reproductor fixat a la part inferior de la pantalla sincronitzat amb la pista actual.
   * Controls de transport (Play/Pause, anterior, següent, control de volum, accés directe a Spotify).
   * Llegenda permanent d'accessibilitat i tecles de navegació (`[← / →] Navegar · [Espai] Girar · [Enter] Escoltar`).

---

## 6. Criteris de Rendiment, Accessibilitat i Assets

* **Optimització d'Imatges (Next/Image & Modern Formats):**
  * Portades i galetes de vinil servides en formats WebP i AVIF amb `sizes` adaptatius i compressió d'alta definició per a pantalles Retina.
  * Càrrega progressiva amb esquelet de càrrega suau (*blur placeholder*).

* **Acceleració per Hardware (GPU-Only Transitions):**
  * Totes les animacions de profunditat (eix Z), rotació (180°) i lliscament del disc s'executen exclusivament mitjançant transformacions compostades per GPU (`transform: translate3d()`, `rotateY()`, `scale()`) i `opacity`.
  * Absència total de `transition: all` per garantir una taxa sostinguda de 60–120 fps en dispositius d'escriptori i mòbils.

* **Accessibilitat Universal (`prefers-reduced-motion`):**
  * Per a usuaris amb preferència de moviment reduït activa al sistema operatiu:
    * Se suprimeix el volteig 3D, el carrusel espacial d'eix Z i el lliscament ràpid del vinil.
    * Es reemplacen per una transició d'opacitat creuada (*crossfade*) suau de 0.2s entre caràtula i fitxa de dades.
    * Es manté intacte el control per teclat, la reproducció d'àudio i la lectura completa de metadades.
