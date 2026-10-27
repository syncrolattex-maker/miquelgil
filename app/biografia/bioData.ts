export type BioSection = {
  id: string;
  num: string;
  period: string;
  title: string;
  subtitle: string;
  quote: string;
  image: string;
  imageAlt: string;
  summary: string;
  paragraphs: string[];
  tags: string[];
  keyMilestones: { year: string; title: string }[];
};

export const BIO_SECTIONS: BioSection[] = [
  {
    id: "comencar-comencant",
    num: "01",
    period: "1973 — 1985",
    title: "Començar començant",
    subtitle: "Al Tall i la recuperació de la veu d'arrel",
    quote: "Al Tall fou l'escola perfecta per a aprendre les formes de la música tradicional i mediterrània.",
    image: "/images/07-1978-6.jpg",
    imageAlt: "Miquel Gil amb Al Tall, fotografia d'arxiu 1978",
    summary:
      "Amb només 16 anys va cofundar Al Tall al costat de Vicent Torrent i Manolo Miralles, esdevenint la formació clau de la represa cultural i democràtica valenciana.",
    paragraphs: [
      "Amb 16 anys (1973), després de coincidir amb Vicent Torrent a la Universitat Catalana d'Estiu de Prada, Miquel Gil se suma a un projecte que canviaria per sempre la història de la música del nostre país. El 1975 naix oficialment Al Tall, juntament amb Torrent i Manolo Miralles.",
      "Amb una marcada personalitat vocal, Al Tall fou l'escola perfecta per aprendre les formes i els girs del cant tradicional (les jotes, albaes, cants de batre i fandangos). Foren temps convulsos marcats per la clandestinitat, la censura i la lluita social contra la dictadura franquista, que culminaren omplint camps de futbol i places de bous senceres celebrant la recuperació de les llibertats democràtiques.",
      "Amb l'arribada dels nous temps, les gires per l'Europa mediterrània van obrir una consciència de pertinença cultural més ampla: la conca mediterrània. Fruit d'aquestes experiències enregistraren 'Xarq Al-andalus' (1985), un disc històric que reafirmava la vocació mediterrània i va suposar el tancament de la seua etapa com a integrant d'Al Tall."
    ],
    tags: ["Al Tall", "Clandestinitat", "Xarq Al-andalus", "Vicent Torrent", "Manolo Miralles"],
    keyMilestones: [
      { year: "1971", title: "Coneix Vicent Torrent a la UCE de Prada" },
      { year: "1975", title: "Fundació oficial d'Al Tall a Catarroja" },
      { year: "1985", title: "Gravació de 'Xarq Al-andalus' i comiat" }
    ]
  },
  {
    id: "transicio-musical",
    num: "02",
    period: "1986 — 1988",
    title: "Transició musical",
    subtitle: "L'esperit lliure i la recerca d'altres aires",
    quote: "La necessitat de respirar altres aires i transgredir els límits del folk tradicional.",
    image: "/images/miquel-gil-delange-detras.jpg",
    imageAlt: "Miquel Gil en espais de creació i recerca sonora",
    summary:
      "A finals dels huitanta, Miquel Gil emprèn el seu propi camí: abandona el purisme per explorar la fusió, la composició per a teatre, audiovisual i el doblatge.",
    paragraphs: [
      "Ningú no va obligar Miquel Gil a abandonar Al Tall, però, a mitjan anys 80 el cantant de Catarroja va sentir la necessitat fonda de respirar altres aires, transgredir els límits del folk per endinsar-se en els camins de la fusió i el mestissatge, en aquella època molt poc explorats a casa nostra.",
      "Les primeres composicions de Miquel Gil sorgeixen a les acaballes de l’etapa d’Al Tall, però és en emprendre el camí en solitari quan comença a compondre amb regularitat i a signar bandes sonores per a teatre, cinema i televisió, així com treballs com a locutor i director d'actors en doblatge.",
      "Un projecte de recerca lliure, enriquidor i rebel, que servirà per forjar els fonaments sobre els quals es construirà la seua sòlida identitat artística posterior."
    ],
    tags: ["Transició", "Música per a teatre", "Audiovisual", "Doblatge", "Fusió"],
    keyMilestones: [
      { year: "1986", title: "Deixa Al Tall per continuar com a professional lliure" },
      { year: "1986", title: "Guanyador dels 'Encuentros de canción de autor'" },
      { year: "1987", title: "Primeres composicions per a l'escena teatral i televisió" }
    ]
  },
  {
    id: "eclecticisme",
    num: "03",
    period: "1988 — 1994",
    title: "Eclecticisme i fusió",
    subtitle: "Terminal Sur: una dècada avançats a la world music",
    quote: "On acaba el Nord i comença el Sud: sintetitzadors, samplers i instruments ancestrals de doble corda.",
    image: "/images/TerminalSur.jpg",
    imageAlt: "Portada del disc Viajero del grup Terminal Sur",
    summary:
      "Amb Terminal Sur i la complicitat de Vicente Sabater, connecta loops, sintetitzadors i MIDI amb llaüts, bouzoukis i cümbüş, creant 'Viajero' (1988).",
    paragraphs: [
      "Terminal Sur: on acaba el Nord i comença el Sud. Aquesta potent realitat geogràfica i conceptual dona nom al nou projecte de Miquel Gil a finals dels anys 80. Suposà la materialització exacta de les noves possibilitats tècniques i estètiques per on volia transitar.",
      "Amb la complicitat de Vicente Sabater preparen un repertori absolutament eclèctic amb què guanyen, el 1986, els 'Encuentros de canción de autor para jóvenes intérpretes' i el 1988 publiquen l'àlbum 'Viajero' (Plataforma Discos).",
      "Cançons de batre, bressols, fandangos, per la de l’u i el dotze, buleries i rumbes vestides amb seqüències i loops. Sintetitzadors, samplers i controladors MIDI barrejats amb instruments orgànics de doble corda (ut, llaüt, bandúrria, bouzouki, cümbüş). Amb Terminal Sur transgrediren límits estètics i es van avançar una dècada sencera a la irrupció de la world music a Europa."
    ],
    tags: ["Terminal Sur", "Viajero (1988)", "Vicente Sabater", "Loops & MIDI", "World Music"],
    keyMilestones: [
      { year: "1988", title: "Publicació del disc 'Viajero' (Terminal Sur)" },
      { year: "1990", title: "Experimentació pionera amb samplers i arrel" },
      { year: "1994", title: "Bases de la futura etapa en solitari" }
    ]
  },
  {
    id: "organic",
    num: "04",
    period: "1995 — 2003",
    title: "La revolució d'Orgànic",
    subtitle: "En primera persona i punt d'inflexió mediterrani",
    quote: "Quan Miquel Gil canta és la terra mateixa que s’expressa.",
    image: "/images/miquel-gil-juan-miguel-morales-8-scaled.jpg",
    imageAlt: "Retrat de Miquel Gil per Juan Miguel Morales durant l'època Orgànic",
    summary:
      "A les acaballes de 1995 pren forma el projecte definitiu: després de 'Buscando tu olor' arriba 'Orgànic' (2001), l'obra mestra que redefineix la música mediterrània.",
    paragraphs: [
      "A les acaballes de 1995 Miquel Gil comença a donar forma al seu projecte personal, amb la veu i les composicions pròpies com a ingredients principals. El 1997 publica el primer disc amb el seu nom: 'Buscando tu olor' (Seminola).",
      "El projecte 'Orgànic' rescata i posa en primer terme una sèrie d’usos i timbres mediterranis comuns (bordons, polirítmies, polifonies, instruments tradicionals de corda i vent) presents en la tradició musical valenciana, transformant-los per atorgar una visió contemporània i universal a sonoritats locals.",
      "El procés s'inicià a la biblioteca pública de Catarroja, on el poeta Ramon Guillem el nodrí de poesia catalana actual per seleccionar textos capaços de suscitar emocions del present (Enric Casasses, Vicent Andrés Estellés). Després de tres anys de treball minuciós amb la producció d’Efrén López, Toni Xuclà i el mateix Gil, i la publicació amb Florian von Hoyer (Galileo MC), 'Orgànic' (2001) marca un abans i un després absolut en la carrera de Miquel Gil, situant-lo com una de les veus de referència indiscutibles de la música del sud d'Europa."
    ],
    tags: ["Orgànic (2001)", "Buscando tu olor", "Enric Casasses", "Efrén López", "Toni Xuclà", "Galileo MC"],
    keyMilestones: [
      { year: "1997", title: "Primer àlbum en solitari: 'Buscando tu olor'" },
      { year: "2001", title: "Publicació d''Orgànic', referència del gènere" },
      { year: "2002", title: "Gires i consagració de crítica i públic" }
    ]
  },
  {
    id: "kata-projeccio",
    num: "05",
    period: "2004 — Present",
    title: "Katà i projecció universal",
    subtitle: "World Music Charts Europe i mig segle de cançó",
    quote: "La veu d'arrel que no s'atura de viatjar: de les llistes europees fins a 'Viatger'.",
    image: "/images/miquel-gil-juan-miguel-morales-14-scaled.jpg",
    imageAlt: "Miquel Gil en escena, fotografia de Juan Miguel Morales",
    summary:
      "Amb 'Katà' (2004) triomfa a Europa; el segueixen 'Eixos', 'Geometries' i 'Viatger' (2024), refermant 50 anys d'arrel en constant moviment.",
    paragraphs: [
      "Publicat el març del 2004, 'Katà' (prefix grec que indica 'sota, davall') substancia el pas definitiu a 'cantador mediterrani'. Amb la guitarra flamenca de Raül Rodriguez, els vents d’Eduard Navarro i Xavi Lozano, les cordes de Tobal Rentero i la producció d’Òscar Roig, el disc entra a la 'World Music Charts Europe' (posicions 8 i 5, i lloc 36 anual de 900 títols a tot el continent). Les gires per Europa i Amèrica (FIL Guadalajara) esdevenen constants.",
      "L'etapa posterior consolida un catàleg inigualable: 'Eixos' (2006, gran guanyador dels I Premis Ovidi Montllor), el projecte de jazz amb Manel Camp trio i David Pastor (2009), 'Per marcianes' (2011), la participació al Concert per la Llibertat del Camp Nou (2013), i l'exitosa gira 'Nus' al costat de Pep Gimeno «Botifarra» (2015).",
      "El 2019 presenta 'Geometries' al Palau de la Música de València i condueix el programa 'Bambant per casa' a À Punt. El 2024 estrena 'Viatger' al Teatre Principal de València, disc dedicat a Manolo Miralles que reflexiona sobre fer-se gran sense rendir-se mai. El 2025 és nominat als Premis Ovidi pel single col·lectiu per la DANA, i avui continua actuant en directe: mig segle de trajectòria sense aturar el viatge."
    ],
    tags: ["Katà (2004)", "World Music Charts Europe", "Premis Ovidi", "Geometries", "Viatger (2024)", "Botifarra"],
    keyMilestones: [
      { year: "2004", title: "Top 5 a la World Music Charts Europe ('Katà')" },
      { year: "2006", title: "Triomf absolut als I Premis Ovidi Montllor ('Eixos')" },
      { year: "2019", title: "Presentació de 'Geometries' al Palau de la Música" },
      { year: "2024", title: "Estrena de 'Viatger' al Teatre Principal de València" },
      { year: "2026", title: "50 anys de trajectòria musical viva als escenaris" }
    ]
  }
];
