export type Social = {
  name: string;
  href: string;
  icon: "facebook" | "twitter" | "instagram" | "spotify" | "linkedin" | "youtube";
};

export const socials: Social[] = [
  { name: "Facebook", href: "https://www.facebook.com/miquelgil.oficial", icon: "facebook" },
  { name: "Twitter", href: "https://twitter.com/miquelgil_ofic", icon: "twitter" },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/miquel-gil-alfonso-34938143/", icon: "linkedin" },
  { name: "Instagram", href: "https://www.instagram.com/miquelgil.oficial/", icon: "instagram" },
  { name: "Spotify", href: "https://open.spotify.com/intl-es/artist/3wgWeRgIV5sU41Yqz6V7qn", icon: "spotify" },
  { name: "YouTube", href: "https://www.youtube.com/watch?v=kNwJUff7NlU", icon: "youtube" },
];

export const nav = [
  { label: "Inici", href: "/start", index: "01" },
  { label: "Música", href: "/discografia", index: "02" },
  { label: "Directes", href: "/agenda", index: "03" },
  { label: "Contractació", href: "/contractacio", index: "04" },
  { label: "Biografia", href: "/biografia", index: "05" },
  { label: "Contacte", href: "/contacte", index: "06" },
  { label: "Premsa & Media", href: "/media", index: "07" },
  { label: "Cronologia", href: "/cronologia", index: "08" },
  { label: "Mural Sonor", href: "/mural-sonor", index: "09" },
  { label: "Descàrregues", href: "/descarregues", index: "10" },
];

export const siteKeyMessage = {
  tagline: "La veu d'arrel que no s'atura de viatjar",
  motto: "Tradició que mira cap endavant",
  whoIs:
    "Cantant i compositor de Catarroja (Horta Sud, València, 1956). Cofundador d'Al Tall el 1975 amb Vicent Torrent i Manolo Miralles. Una veu inconfusible que fusiona la tradició oral mediterrània amb jazz, electrònica i poesia contemporània.",
  shortBio250:
    "Miquel Gil (Catarroja, 1956) és una de les veus de referència de la música d'arrel mediterrània, amb mig segle de trajectòria artística guiada per una pulsió inesgotable d'exploració. Va cofundar Al Tall el 1975 al costat de Vicent Torrent i Manolo Miralles, participant de forma decisiva en la recuperació i dignificació de la música tradicional valenciana en plena transició democràtica. A mitjan anys huitanta va iniciar la seua etapa en solitari, primer amb el projecte pioner de fusió Terminal Sur i, des de finals dels noranta, consolidant una carrera personal de prestigi internacional.\n\nAmb discos canònics com 'Orgànic' (2001) o 'Katà' (2004) —amb què va assolir les primeres posicions a les World Music Charts Europe—, Gil ha sabut construir un llenguatge propi on les jotes, albaes i fandangos conviuen amb el jazz, l'electrònica i els versos de grans poetes com Enric Casasses o Vicent Andrés Estellés. Guardonat en múltiples ocasions, el seu darrer disc, 'Viatger' (2024), dedicat a Manolo Miralles, reafirma una premissa innegociable: la tradició com a matèria viva que sempre camina cap endavant.",
};

export type LiveFormat = {
  id: string;
  name: string;
  musicians: string;
  description: string;
  recentExample?: string;
  duration?: string;
};

export const liveFormats: LiveFormat[] = [
  {
    id: "duo",
    name: "Duo",
    musicians: "Miquel Gil (guitarra i veu) i Eduard Navarro (vents i corda polsada)",
    description: "Format íntim, directe i d'arrel pura, amb un col·laborador clau des dels temps d'Orgànic.",
    recentExample: "Can Soler (Mataró), festival 2 Terços (octubre 2026).",
    duration: "60-75 minuts",
  },
  {
    id: "trio",
    name: "Trio",
    musicians: "Miquel Gil (guitarra i veu), Nelo Alfonso (teclats i cors) i Gusmà Gil (baix)",
    description: "Format versàtil i dinàmic, ideal per a teatres i auditoris de mitjà aforament.",
    recentExample: "Teatre Kursaal de Manresa (abril 2024).",
    duration: "~70 minuts",
  },
  {
    id: "banda",
    name: "Banda Completa",
    musicians: "Miquel Gil, Toni Porcar (guitarra), Eduard Navarro (vents), Nelo Alfonso (teclats), José María Reillo (percussió) i Gusmà Gil (baix)",
    description: "La màxima potència sonora i riquesa tímbrica de la discografia de Miquel Gil per a festivals i grans escenaris.",
    recentExample: "Gira 20 anys d'Orgànic, festival ETNO de València (abril 2023).",
    duration: "90 minuts",
  },
  {
    id: "nus",
    name: "Nus (amb Botifarra)",
    musicians: "Miquel Gil i Pep Gimeno «Botifarra» (veus, guitarra i xicotetes percussions tradicionals)",
    description: "L'encontre i complicitat entre dos gegants de la música d'arrel valenciana, despullat d'artificis.",
    recentExample: "Gira de més de tres anys arreu del territori.",
    duration: "75 minuts",
  },
  {
    id: "estrena",
    name: "Estrena amb Convidats",
    musicians: "Banda ampliada amb col·laboracions especials de l'escena musical",
    description: "Producció especial per a grans teatres i esdeveniments inaugurals.",
    recentExample: "Palau de la Música de València (2019) i Teatre Principal de València (2024).",
    duration: "90-100 minuts",
  },
];

export const bookingInfo = {
  managementEmail: "managementgusma@gmail.com",
  agency: "PPF",
  featuredVenues: [
    "Palau de la Música de València",
    "Teatre Principal de València",
    "Barnasants (Barcelona)",
    "Tradicionàrius (Barcelona)",
    "Strenes (Girona)",
    "Fira Mediterrània (Manresa)",
    "Glatt & Verkehrt (Àustria)",
    "FIL Guadalajara (Mèxic)",
  ],
};

export type ChronoFita = {
  year: string;
  text: string;
};

export const chronologyFites: ChronoFita[] = [
  { year: "1956", text: "Naix a Catarroja (Horta Sud, València)." },
  { year: "h. 1971", text: "Als 15 anys coneix Vicent Torrent a la Universitat Catalana d'Estiu de Prada; Torrent li proposa formar un grup." },
  { year: "1975", text: "Funda Al Tall amb Vicent Torrent i Manolo Miralles, peça clau en la recuperació de la música tradicional valenciana." },
  { year: "1986", text: "Deixa Al Tall per continuar en solitari. Guanya els 'Encuentros de canción de autor para jóvenes intérpretes'." },
  { year: "1988", text: "Amb el grup Terminal Sur grava 'Viajero' (Plataforma Discos), obrint vies a la fusió i la world music." },
  { year: "1997", text: "Primer disc en solitari amb el seu nom: 'Buscando tu olor' (Seminola)." },
  { year: "2001", text: "'Orgànic' (Sonifolk / Galileo MC): punt d'inflexió clau de la seua etapa d'arrel mediterrània contemporània." },
  { year: "2004", text: "'Katà' (Galileo MC): entra al World Music Charts Europe (núms. 8 i 5) i actua a la FIL de Guadalajara (Mèxic)." },
  { year: "2006", text: "'Eixos' (producció de Borja Penalba). Gran guanyador en la primera edició dels Premis Ovidi Montllor." },
  { year: "2009", text: "Disc de jazz amb Manel Camp trio i David Pastor, amb edició limitada d'autor il·lustrada per Jordi Albinyana." },
  { year: "2011", text: "'Per marcianes' (Temps Record): darrer disc en solitari abans d'un parèntesi reflexiu de set anys." },
  { year: "2013", text: "Participa en el Concert per la Llibertat al Camp Nou davant de 90.000 espectadors." },
  { year: "2015", text: "Quaranta anys de carrera: estrena de la gira 'Matèria' i espectacle íntim 'Nus' amb Pep Gimeno «Botifarra»." },
  { year: "2019", text: "'Geometries' (Temps Record), presentat al Palau de la Música de València. Presenta 'Bambant per casa' a À Punt." },
  { year: "2021–23", text: "Gira '20 anys d'Orgànic', inaugurant el festival ETNO de València a l'abril de 2023." },
  { year: "2024", text: "'Viatger', dedicat a la memòria de Manolo Miralles; estrena al Teatre Principal de València el 9 de març." },
  { year: "2024–25", text: "Single col·lectiu solidari per la DANA amb Vicent Torrent, Botifarra, Titana i La Maria, nominat als Premis Ovidi 2025." },
  { year: "2026", text: "Continua en directe: duo amb Eduard Navarro a Can Soler (Mataró), dins del festival 2 Terços." },
];

export type Album = {
  slug: string;
  title: string;
  label: string;
  year: string;
  cover: string;
  description: string;
  tracks: string[];
};

export const albums: Album[] = [
  {
    slug: "viatger",
    title: "Viatger",
    label: "Temps Record",
    year: "2024",
    cover: "/images/portadaCD.webp",
    description:
      "Dedicat a la memòria de Manolo Miralles i finançat mitjançant micromecenatge a Verkami. Un disc fet a mà amb producció digital que reflexiona sobre fer-se major sense rendir-se. Combina lletres pròpies, un romanç tradicional, un poema de Teresa Pasqual i un homenatge a Joan Baptista Humet, capturant la saviesa i la transformació d'un viatge vital ininterromput.",
    tracks: [
      "Nineta",
      "La resposta",
      "Ai Ramon!!",
      "Sa Serena",
      "La Veritat",
      "Racons",
      "Rusaffi",
      "Cecilia",
      "Viatger",
      "Otoño en Navarrés",
    ],
  },
  {
    slug: "geometries",
    title: "Geometries",
    label: "Temps Record",
    year: "2019",
    cover: "/images/Captura-de-pantalla-2018-09-05-a-las-14.38.38.png",
    description:
      "Deu cançons amb producció musical de Borja Penalba i finançament col·laboratiu. Una celebració poètica que posa música als versos d'Enric Casasses, Imma Màñez, Joanjo Garcia, Anna Montero i Vicent Andrés Estellés, presentada solemnement al Palau de la Música de València.",
    tracks: [
      "Llei Horària",
      "Hotel París",
      "Canvi De Clima",
      "#Copla 42",
      "Copeo",
      "Mort Petita",
      "Terra",
      "Tempesta",
      "La Que Diu",
      "Geometries",
    ],
  },
  {
    slug: "marcianes",
    title: "Per marcianes",
    label: "Temps Record",
    year: "2011",
    cover: "/images/Captura-de-pantalla-2018-09-05-a-las-14.38.11.png",
    description:
      "Darrer treball en solitari abans d'un parèntesi de set anys. Cançó d'autor i maduresa compositiva amb una marcada personalitat mediterrània, arranjaments acústics refinats i col·laboracions líriques de gran volada.",
    tracks: [
      "De la Mar",
      "Rosa de Paper",
      "X Marcianes",
      "En Acabant",
      "La Cileta",
      "Vesprades",
      "Com Més",
      "Les Xiquetes",
      "Somriures",
      "Mirant la Llum",
      "Ferida",
    ],
  },
  {
    slug: "jazz-manel-camp",
    title: "Miquel Gil & Manel Camp trio + David Pastor",
    label: "Edició d'autor",
    year: "2009",
    cover: "/images/Captura-de-pantalla-2018-09-05-a-las-14.37.55.png",
    description:
      "Fusió de jazz i arrel mediterrània al costat del pianista Manel Camp i el trompetista David Pastor. Edició limitada de col·leccionista il·lustrada per l'artista Jordi Albinyana.",
    tracks: [
      "Intro Jazz",
      "Cançó de Bressol",
      "Fandango Improv",
      "Estellés en Blau",
      "Nocturn",
      "Arrel i Swing",
    ],
  },
  {
    slug: "eixos",
    title: "Eixos",
    label: "Temps Record",
    year: "2006",
    cover: "/images/Captura-de-pantalla-2018-09-05-a-las-14.37.55.png",
    description:
      "Producció de Borja Penalba que va consagrar Miquel Gil com el gran guanyador en la primera edició dels Premis Ovidi Montllor. Obra madura que entrellaça les formes d'arrel amb la força del cant contemporani.",
    tracks: [
      "Tinc Una Pena",
      "Fil De Vint",
      "De La China",
      "Dels Meus Ulls",
      "Gola Ampla",
      "Pensant Maneres",
      "Pepe Tono",
      "Tic Tac",
      "Parea",
      "Eix Tort",
      "Homenatge Per Marcianes",
    ],
  },
  {
    slug: "en-concert",
    title: "En Concert",
    label: "Galileo Music",
    year: "2006",
    cover: "/images/Captura-de-pantalla-2018-09-05-a-las-14.37.22.png",
    description:
      "Amb una selecció de les seves cançons més estimades interpretades en directe, aquest àlbum ofereix una experiència immersiva que et transporta directament al cor del seu univers musical. Amb la seva veu expressiva i la seva habilitat amb la guitarra, Miquel Gil ens guia a través d'un viatge emocionant per les emocions i les històries que defineixen la seva música. Cada pista és una celebració de la passió i l'art de l'actuació en viu.",
    tracks: [
      "Bandereta",
      "Tornada",
      "Tic-Tac",
      "Amaga L'Arbre",
      "Van Tres",
      "Katá",
      "L'Amor Es Deu En Barca",
      "Memòria",
      "Adieu Paure Carnavas / Wa Habibi",
      "Cançó Dels Traginers",
      "Ballo Sardo / Cavall D'Arabia",
    ],
  },
  {
    slug: "kata",
    title: "Katà",
    label: "Temps Record",
    year: "2004",
    cover: "/images/Captura-de-pantalla-2018-09-05-a-las-14.36.46.png",
    description:
      "«Katà» és una obra captivadora que fusiona les melodies tradicionals mediterrànies amb una moderna exploració musical. Amb la seva combinació única de gèneres com granaïnes, fandangos, rembetika i més, ens transporta a través d'un viatge sonor ple d'emoció i descobriment. Amb la col·laboració de talentosos músics i la guitarra enèrgica de Raül Rodríguez, aquest àlbum captura l'essència del cant valencià amb una energia i una passió contagioses.",
    tracks: [
      "Bandereta",
      "Tornada",
      "Katà",
      "Memòria",
      "Fandango",
      "I Giren",
      "Fènix",
      "Saturnàlia",
      "Un Bolero (A L'Alcudia)",
      "Cavall D'Arabia",
      "S'amaga",
    ],
  },
  {
    slug: "organic",
    title: "Orgànic",
    label: "Sonifolk",
    year: "2001",
    cover: "/images/939x0w.jpg",
    description:
      "«Orgànic» és una obra mestra musical que ens endinsa en les profunditats de les melodies tradicionals mediterrànies amb una perspectiva contemporània. A través d'una fusió de sonoritats autèntiques i innovadores, aquest àlbum captura l'ànima del Mediterrani amb la veu inconfusible de Miquel Gil al capdavant. Des de les tonalitats del flamenc fins a les influències més exòtiques, cada cançó és una narració apassionant sobre la riquesa cultural i la diversitat sonora del nostre patrimoni.",
    tracks: [
      "Amaga L'arbre",
      "L'amor És Déu En Barca",
      "Línia De Flotació",
      "Primavera",
      "Com Si L'aigua",
      "I Dotze",
      "Van Tres",
      "Un Silenci",
      "Mire La Mar",
      "Cançó Dels Traginers",
      "Bec De Gavina",
    ],
  },
  {
    slug: "buscando-tu-olor",
    title: "Buscando tu olor",
    label: "Seminola",
    year: "1997",
    cover: "/images/disco_1.jpg",
    description:
      "Primer treball publicat en solitari amb el seu propi nom, que va obrir camí cap a la maduresa artística i la posterior eclosió d'Orgànic.",
    tracks: [
      "Buscando tu olor",
      "Calle de la Mar",
      "Nana del marinero",
      "Viento del Sur",
      "Por la orilla",
    ],
  },
  {
    slug: "terminal-sur",
    title: "Viajero (Terminal Sur)",
    label: "Plataforma Discos",
    year: "1988",
    cover: "/images/TerminalSur.jpg",
    description:
      "Etapa d'obertura estètica i transició entre Al Tall i la carrera en solitari. Fruit de guanyar el 1986 els Encuentros de canción de autor para jóvenes intérpretes, fusiona ritmes mediterranis, seqüenciadors i instruments orgànics avançant-se a la world music.",
    tracks: [
      "Viajero",
      "Dinero Negro",
      "Sahariana",
      "Bon Matí",
      "Vampiro",
      "Esa Oscura Voz En Off",
      "Blau",
    ],
  },
];

export const biographyIntro =
  "Miquel Gil és un artista dotat d'un treball innegable però de difícil catalogació: fugisser, erràtic, inquiet… Cantant i compositor, productor, músic de sessió, tècnic de so, director i actor de doblatge i teatre, presentador de TV, amb una llarga trajectòria en el món discogràfic, audiovisual i teatral.";

export type Chapter = {
  number: string;
  title: string;
  paragraphs: string[];
};

export const chapters: Chapter[] = [
  {
    number: "1",
    title: "Biografia",
    paragraphs: [
      "Signa vint-i-tres treballs discogràfics propis i més de cent col·laboracions amb altres artistes, en projectes que van de la música d'arrel a la música improvisada contemporània, del R&R al flamenc passant pel jazz o la música àrab culta, projectes on aporta la seua saó mediterrània.",
      "Amb 16 anys, el 1973, junt a Vicent Torrent i Manolo Miralles, va fundar «Al Tall», el grup més influent en la música valenciana d'arrel del segle XX. Amb una marcada component vocal, Al Tall fou l'escola perfecta per a aprendre les formes de la música valenciana d'arrel i per extensió mediterrània.",
      "Els primers anys d'Al Tall van ser temps convulsos, que començaren amb la clandestinitat, la censura i la lluita social contra la dictadura franquista i acabaren tocant en camps de futbol i places de bous plenes de gent festejant la conquesta de la democràcia.",
      "Amb l'arribada dels nous temps, les gires per l'Europa mediterrània i el contacte amb altres artistes de l'àrea mediterrània van aportar una visió de pertinença a un àrea cultural més ampla: la mediterrània. Fruit d'estes experiències graven «Xarq Al-andalus», treball que reafirma la seua vocació mediterrània; aquest va ser el darrer treball de Miquel Gil com a membre d'Al Tall.",
    ],
  },
  {
    number: "2",
    title: "Transició musical",
    paragraphs: [
      "Ningú no va obligar Miquel Gil a abandonar Al Tall, però a finals dels anys 80 el cantant de Catarroja va sentir la necessitat de respirar altres aires, transgredir els límits del folk per endinsar-se en els camins de la fusió i el mestissatge, en aquella època poc explorats, i experimentar amb les músiques d'arrel.",
      "Les primeres composicions de Miquel Gil són de finals de l'època d'Al Tall; és en abandonar-lo quan comença a compondre amb regularitat i a fer música per a teatre, cine i TV.",
      "Un projecte efímer, però molt enriquidor, del qual només ha quedat gravat un disc, «Terminal Sur», fruit de la necessitat d'explorar nous pressupostos estètics i musicals, que al seu torn seran els fonaments damunt dels quals es construirà el projecte personal de Miquel Gil.",
    ],
  },
  {
    number: "3",
    title: "Fusionant sons i arts",
    paragraphs: [
      "«Terminal Sur», on acaba el Nord i comença el Sud. Una realitat geogràfica que dona nom al nou projecte de Miquel Gil i que suposa la materialització de les possibilitats estètiques i tècniques, dels nous aires i els nous camins per on volia transitar.",
      "Amb la complicitat de Vicente Sabater preparen un repertori absolutament eclèctic amb el qual guanyen, l'any 1986, els «Encuentros de canción de autor para jóvenes intérpretes». Cançons de batre, bressols, fandangos, per la de l'u i el dotze, buleries, rumbes, polirítmies, polifonies… vestides amb seqüències i loops.",
      "Sintetitzadors, samplers, seqüenciadors, controladors MIDI… barrejats amb instruments orgànics de doble corda (ut, llaüt, bandúrria, bouzouki, cumbüss). Amb «Terminal Sur» transgrediren límits i, potser, es van avançar a l'arribada de la world music.",
    ],
  },
  {
    number: "4",
    title: "En primera persona",
    paragraphs: [
      "A les acaballes de 1995 Miquel Gil comença a donar forma al seu projecte personal, amb la veu i les composicions pròpies com a ingredients principals. Com a exercici de composició posa música al poemari de Mario Benedetti «Poemas de la oficina / Poemas del hoyporhoy».",
      "Grava amb Efrén López un grapat de cançons basades en els ritmes de «ida y vuelta», però amb instrumentació i sonoritat mediterrània. Compon molta música «per encàrrec»: publicitat, bandes sonores… Mentre, va seleccionant textos i amanint músiques per a crear les cançons del seu projecte personal: «Orgànic».",
      "«Orgànic» rescata i posa en primer pla una sèrie d'usos i sons mediterranis comuns (bordons, polirítmies, polifonies, instruments tradicionals) presents en la tradició musical valenciana, transformant-los amb la intenció de donar una visió contemporània i universal a músiques locals.",
      "El treball comença a la biblioteca pública de Catarroja, on Ramon Guillem el nodreix de poesia catalana actual amb la intenció d'anar seleccionant poemes capaços de suscitar emocions contemporànies. Passaran tres anys fins que, amb la producció musical d'Efrén López, Toni Xuclà i el mateix Miquel Gil, i gràcies a la producció executiva de Lluís Puig i discogràfica de Florian von Hoyer (Galileo Music), «Orgànic» apareix publicat.",
      "Aquest treball suposa un abans i un després en la carrera de Miquel Gil: catapulta la seua trajectòria en l'univers de les músiques d'arrel i el situa com una de les veus de referència de la música mediterrània.",
    ],
  },
  {
    number: "5",
    title: "Katà, la porta d'entrada a Europa",
    paragraphs: [
      "«Katà» (prefix grec: sota, davall) vol significar la intenció de buscar la matèria primera per fer música entre les capes superposades en què s'estratifica la música tradicional, escollint gèneres on substanciar el pas definitiu a «cantaor mediterrani» (granaïnes, fandangos, rembetika, soleá por bulería, bolero, picat mallorquí…).",
      "La presència a la guitarra de Raül Rodríguez concreta la intenció: compartir amb l'energia de la guitarra flamenca les formes del cant valencià. Era un repte pendent, eixa energia «flamenca» que sempre ens ha arribat via «cantos de Levante», fer-la conviure amb les gaides búlgares, duducs, neis, moxenyos, gralles i dolçaines d'Eduard Navarro i Xavi Lozano, amb els guitarrons i les dolçaines, les cordes i dobles cordes amb trast o sense de Tobal Rentero.",
      "Amb la producció musical, mirada atenta i l'oïda fina d'Òscar Roig, «Katà» es publica el març del 2004. En els mesos d'abril i maig entra en la «World Music Charts Europe», en les posicions 8 i 5 respectivament, afegint una important projecció internacional al treball.",
      "Al resum anual de l'esmentada llista («World Music Charts Europe, preview Year 2004»), «Katà» queda en la posició 36 d'un total de 900 títols. Les gires per Europa i Amèrica es fan habituals.",
    ],
  },
];

export const mural = {
  intro:
    "Acció Cultural del País Valencià compleix enguany el 50è aniversari i per a celebrar-ho ha organitzat quatre espectacles musicals al voltant de l'antologia «Mural Sonor», que esdevindran quatre gires arreu del nostre territori.",
  intro2:
    "Amb aquests espectacles es pretén fer un homenatge transversal en estils, paritari en sexes, representatiu territorialment i intergeneracional a la música que ha parit el País Valencià: folk o música tradicional, cançó, pop-rock i música festiva o mestissatge.",
  shows: [
    {
      tag: "Espectacle folk",
      title: "Arrel",
      body: [
        "El reconegut i consolidat Miquel Gil, juntament amb Noèlia Llorens «Titana», veu emergent del panorama de la música tradicional valenciana, són els conductors d'aquest espectacle. Representants de generacions diferents, els dos connecten en la passió i el coneixement erudit del cançoner tradicional.",
        "És un viatge per les comarques on Gil adapta músiques patrimonials i realitza noves composicions per a lletres originals, escrites a propòsit per a l'ocasió per més de vint noms de l'escena poètica valenciana en llengua pròpia.",
      ],
      contract: ["info@cercavila.com", "Cercavila — 696 324 322"],
    },
    {
      tag: "Espectacle música festiva o de mestissatge",
      title: "Carrer",
      body: [
        "L'artèria que circula pels nostres pobles i ciutats dona títol a l'espectacle dedicat a la música festiva, un gènere que en realitat és un cresol d'estils cosits per l'esperit alegre i combatiu.",
        "Una superbanda, No Falla, mostra tot un calidoscopi de ritmes i sons amb components de Mafalda, The Dance Crashers, Candela Roots, Smoking Souls, Funkiwis, El Diluvi, Sedajazz, Nina Dinamita i la Swing Milicia, i Freak Fandango Orchestra.",
      ],
      contract: ["projectes@golaseca.com", "Gola Seca — 692 814 227"],
    },
    {
      tag: "Espectacle de cançó",
      title: "Pell",
      body: [
        "L'òrgan que millor reflecteix l'emoció és el títol de l'espectacle dedicat a la cançó. Ens acostem a la intimitat, a la delicadesa i a la implicació amb la societat dels nostres grans estendards de la música durant dècades.",
        "Borja Penalba i Mireia Vives seran els guies en aquest viatge pel temps que va de Raimon a Clara Andrés, recuperant també les veus que van mantindre la flama durant els setanta i huitanta.",
      ],
      contract: ["management@metronom.cat", "Metrònom — 644 829 171"],
    },
    {
      tag: "Espectacle de pop-rock",
      title: "Veta",
      body: [
        "Una veta és una ratlla que, per la seua consistència o color, es diferencia d'allò que l'envolta. Eixe serà el títol de l'espectacle dedicat al pop-rock en valencià, perquè això ha esdevingut el gènere: una raresa, un camí divergent, un tresor ocult.",
        "Conduït per la banda Tardor i per May Ibáñez, veu del grup valencià Badlands, l'espectacle arranja temes de grans referents de les últimes dècades, alguns dels quals són joies estranyes per al gran públic.",
      ],
      contract: ["info@primaveradh.com", "Primavera d'hivern — 620 713 386"],
    },
  ],
};

export const downloads = [
  {
    title: "Dossier Geometries",
    links: [
      {
        label: "Dossier Geometries",
        href: "https://miquelgil.com/wp-content/uploads/2020/02/Miquel-Gil-GEOMETRIES-2019-2020.pdf.pdf",
      },
    ],
  },
  {
    title: "Dossier de premsa",
    links: [
      {
        label: "Dossier Premsa",
        href: "https://drive.google.com/open?id=10-DT3j9vXiNWuduEu2x3eBJZhVWB3CSq",
      },
    ],
  },
  {
    title: "Imatges",
    links: [
      {
        label: "Foto 1",
        href: "https://drive.google.com/file/d/1HLnTspYBWFxYWELL0u09pRfEvcncuFRi/view?usp=drivesdk",
      },
      {
        label: "Foto 2",
        href: "https://drive.google.com/file/d/1ae_aWZYInrpl85CV4evgExBQClbsWh7v/view?usp=drivesdk",
      },
      {
        label: "Foto 3",
        href: "https://drive.google.com/file/d/1sj7haq6_yR7Fig4qfsaq_45fn64YPxP_/view?usp=drivesdk",
      },
    ],
  },
  {
    title: "Material CD",
    links: [
      {
        label: "Portada CD",
        href: "https://drive.google.com/open?id=1Y0tb-4V_nbW6JgpZMK_AW_bdTSxROA-T",
      },
    ],
  },
  {
    title: "Vídeos",
    links: [
      { label: "Vídeo 1", href: "https://www.youtube.com/watch?v=GzIg30r1138" },
      { label: "Vídeo 2", href: "https://youtu.be/sYk3-0GPWmU" },
    ],
  },
  {
    title: "Riders",
    links: [
      {
        label: "Rider 1",
        href: "https://drive.google.com/open?id=1R9nioosA6mmmuegtHsc2TClQRR1iIFDl",
      },
      {
        label: "Rider 2",
        href: "https://drive.google.com/open?id=1SfJ6nymMaJlXS7g4FYKcYQZH_S6gi8a1",
      },
    ],
  },
];
