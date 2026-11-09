"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { chronologyFites } from "@/lib/site";
import "./ScrollPathJourney.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
}

interface CheckpointData {
  id: string;
  stepNum: string;
  year: string;
  badge: string;
  stageNum: string;
  stageId: string;
  isMajorStage?: boolean;
  title: string;
  subtitle: string;
  text: string;
  extendedNote: string;
  quote?: string;
  media: string;
  mediaCaption: string;
  tags: string[];
  albumLink?: { label: string; href: string };
  progress: number;
  pinX: string;
  pinY: string;
  side: "left" | "right";
}

// 18 passos al llarg del Railway amb la història completa de cada fita integrada directament en la cronologia
const CHECKPOINTS: CheckpointData[] = [
  {
    id: "step-01-1956",
    stepNum: "01 / 18",
    year: "1956",
    badge: "ETAPA 01 · 1956 · CATARROJA (HORTA SUD)",
    stageNum: "01",
    stageId: "comencar-comencant",
    title: "Bressol d'arrel a l'Horta Sud",
    subtitle: "Naixement i memòria oral a Catarroja",
    text: "Miquel Gil naix a Catarroja (Horta Sud, València), en un entorn on el cant d'estil, les albaes, els cants de batre i la cultura popular de l'Albufera formen part del paisatge sonor quotidià.",
    extendedNote: "Aquesta primera empremta sonora —la veu nua, el melisma lliure i el ritme de la terra— esdevindrà la matèria primera sobre la qual construirà mig segle d'experimentació musical.",
    media: "/images/07-1978-6.jpg",
    mediaCaption: "Arxiu familiar i primeres arrels a l'Horta Sud",
    tags: ["Catarroja", "Horta Sud", "Tradició Oral", "L'Albufera"],
    progress: 0.0217,
    pinX: "27%",
    pinY: "4.26%",
    side: "right",
  },
  {
    id: "step-02-1971",
    stepNum: "02 / 18",
    year: "h. 1971",
    badge: "ETAPA 01 · H. 1971 · PRADA DE CONFLENT",
    stageNum: "01",
    stageId: "comencar-comencant",
    title: "La trobada amb Vicent Torrent",
    subtitle: "Universitat Catalana d'Estiu de Prada",
    text: "Amb tot just 15 anys coincideix amb Vicent Torrent a la Universitat Catalana d'Estiu de Prada. En aquelles tertúlies d'inquietud cultural i política es gesta la llavor d'un nou moviment musical.",
    extendedNote: "Torrent li proposa sumar la seua jove i potent veu a un projecte que buscava dignificar la música tradicional valenciana i portar-la al segle XX amb consciència crítica.",
    media: "/images/trobada-vicent-torrent.png",
    mediaCaption: "Trobada fundacional amb Vicent Torrent (h. 1971)",
    tags: ["Prada de Conflent", "Vicent Torrent", "Nova Cançó", "Gènesi"],
    progress: 0.0778,
    pinX: "73%",
    pinY: "9.57%",
    side: "left",
  },
  {
    id: "step-03-1975",
    stepNum: "03 / 18",
    year: "1975",
    badge: "ETAPA 01 · 1975 · FUNDACIÓ D'AL TALL",
    stageNum: "01",
    stageId: "comencar-comencant",
    isMajorStage: true,
    title: "Començar començant: Al Tall",
    subtitle: "Clandestinitat, censura i recuperació del cant valencià",
    text: "El 1975 cofunda oficialment Al Tall juntament amb Vicent Torrent i Manolo Miralles. Són anys convulsos de concerts sota vigilància, censura franquista i compromís democràtic.",
    extendedNote: "Al Tall es converteix en l'escola definitiva on Miquel Gil domina els girs vocals de les jotes, fandangos, romanços i cants de batre, passant de la clandestinitat a omplir places de bous i camps de futbol.",
    quote: "Al Tall fou l'escola perfecta per a aprendre les formes de la música tradicional i mediterrània.",
    media: "/images/07-1978-6.jpg",
    mediaCaption: "Miquel Gil amb Al Tall durant els anys setanta",
    tags: ["Al Tall", "Manolo Miralles", "Vicent Torrent", "Represa Cultural"],
    progress: 0.1339,
    pinX: "27%",
    pinY: "14.89%",
    side: "right",
  },
  {
    id: "step-04-1985",
    stepNum: "04 / 18",
    year: "1985",
    badge: "ETAPA 01 · 1985 · XARQ AL-ANDALUS",
    stageNum: "01",
    stageId: "comencar-comencant",
    title: "'Xarq Al-andalus' i l'horitzó mediterrani",
    subtitle: "Connexió amb el Magrib i tancament d'etapa",
    text: "Fruit de les gires per l'Europa mediterrània i l'encontre amb l'ensemble Muluk el-Hwa de Marràqueix, Al Tall enregistra el llegendari disc 'Xarq Al-andalus' (1985).",
    extendedNote: "Aquesta obra mestra reafirma la pertinença a una àrea cultural mediterrània comuna i tanca el cicle de Miquel Gil dins d'Al Tall després d'una dècada decisiva.",
    media: "/images/miquel_gil_inicio.jpg",
    mediaCaption: "Obertura cap a les sonoritats de la conca mediterrània (1985)",
    tags: ["Xarq Al-andalus", "Muluk el-Hwa", "Mediterrània", "Comiat d'Al Tall"],
    progress: 0.1900,
    pinX: "73%",
    pinY: "20.21%",
    side: "left",
  },
  {
    id: "step-05-1986",
    stepNum: "05 / 18",
    year: "1986",
    badge: "ETAPA 02 · 1986 — 1988 · EN SOLITARI",
    stageNum: "02",
    stageId: "transicio-musical",
    isMajorStage: true,
    title: "Transició musical i esperit lliure",
    subtitle: "Nous llenguatges, teatre, audiovisual i doblatge",
    text: "El 1986 emprèn el seu camí com a creador independent per respirar altres aires i transgredir els límits del folk ortodox cap al mestissatge i la contemporaneïtat.",
    extendedNote: "Guanya els 'Encuentros de canción de autor para jóvenes intérpretes' i desenvolupa una intensa tasca com a compositor de bandes sonores per a teatre, cinema i televisió, així com actor i director de doblatge.",
    quote: "La necessitat fonda de respirar altres aires i transgredir els límits del folk tradicional.",
    media: "/images/miquel-gil-delange-detras.jpg",
    mediaCaption: "Miquel Gil en l'etapa d'experimentació i recerca en solitari",
    tags: ["Camí Propi", "Arts Escèniques", "Bandes Sonores", "Doblatge"],
    progress: 0.2461,
    pinX: "27%",
    pinY: "25.53%",
    side: "right",
  },
  {
    id: "step-06-1988",
    stepNum: "06 / 18",
    year: "1988",
    badge: "ETAPA 03 · 1988 — 1994 · TERMINAL SUR",
    stageNum: "03",
    stageId: "eclecticisme",
    isMajorStage: true,
    title: "Eclecticisme i fusió: Terminal Sur",
    subtitle: "'Viajero' (Plataforma Discos, 1988)",
    text: "Amb la complicitat de Vicente Sabater crea Terminal Sur ('on acaba el Nord i comença el Sud') i publica l'àlbum 'Viajero', avançant-se una dècada a l'explosió europea de la world music.",
    extendedNote: "Sintetitzadors, samplers, seqüenciadors i controladors MIDI dialoguen per primera vegada amb llaüts, bandúrries, bouzoukis, cümbüş, buleries i cants de batre.",
    quote: "On acaba el Nord i comença el Sud: sintetitzadors, samplers i instruments ancestrals de doble corda.",
    media: "/images/TerminalSur.jpg",
    mediaCaption: "Portada original de 'Viajero' amb Terminal Sur (1988)",
    tags: ["Terminal Sur", "Viajero", "Vicente Sabater", "Samplers & Llaüt"],
    albumLink: { label: "FITXA DE VIAJERO ↗", href: "/discografia/terminal-sur/" },
    progress: 0.3022,
    pinX: "73%",
    pinY: "30.85%",
    side: "left",
  },
  {
    id: "step-07-1997",
    stepNum: "07 / 18",
    year: "1997",
    badge: "ETAPA 04 · 1997 · SEMINOLA DISCOS",
    stageNum: "04",
    stageId: "organic",
    title: "'Buscando tu olor': En primera persona",
    subtitle: "Primer disc signat amb el seu propi nom",
    text: "Després de musicar poemes de Mario Benedetti i experimentar amb ritmes d'anada i tornada al costat d'Efrén López, el 1997 publica 'Buscando tu olor' sota el seu nom: Miquel Gil.",
    extendedNote: "Aquest disc posa la veu i la composició pròpia en primer pla i prepara el laboratori sonor d'on brollarà la revolució d'Orgànic.",
    media: "/images/buscando-tu-olor-1997.jpg",
    mediaCaption: "'Buscando tu olor' (1997), inici de la discografia amb nom propi",
    tags: ["Buscando tu olor", "Seminola", "Mario Benedetti", "Efrén López"],
    albumLink: { label: "FITXA DEL DISC ↗", href: "/discografia/buscando-tu-olor/" },
    progress: 0.3583,
    pinX: "27%",
    pinY: "36.17%",
    side: "right",
  },
  {
    id: "step-08-2001",
    stepNum: "08 / 18",
    year: "2001",
    badge: "ETAPA 04 · 2001 · PUNT D'INFLEXIÓ HISTÒRIC",
    stageNum: "04",
    stageId: "organic",
    isMajorStage: true,
    title: "La revolució d'Orgànic",
    subtitle: "Sonifolk / Galileo MC · Producció d'Efrén López i Toni Xuclà",
    text: "Gestat durant tres anys a partir de les lectures poètiques amb Ramon Guillem a la biblioteca de Catarroja (Estellés, Enric Casasses), 'Orgànic' (2001) transforma l'arrel valenciana en llenguatge universal.",
    extendedNote: "Bordons, polirítmies i timbres ancestrals s'entrellacen amb una producció contemporània exquisida que situa Miquel Gil com una de les grans veus de la Mediterrània.",
    quote: "Quan Miquel Gil canta és la terra mateixa que s’expressa.",
    media: "/images/939x0w.jpg",
    mediaCaption: "Portada d''Orgànic' (2001), obra capital de la música mediterrània",
    tags: ["Orgànic (2001)", "Enric Casasses", "Estellés", "Toni Xuclà", "Galileo MC"],
    albumLink: { label: "FITXA D'ORGÀNIC ↗", href: "/discografia/organic/" },
    progress: 0.4144,
    pinX: "73%",
    pinY: "41.49%",
    side: "left",
  },
  {
    id: "step-09-2004",
    stepNum: "09 / 18",
    year: "2004",
    badge: "ETAPA 05 · 2004 · PROJECCIÓ INTERNACIONAL",
    stageNum: "05",
    stageId: "kata-projeccio",
    isMajorStage: true,
    title: "Katà: La porta d'entrada a Europa",
    subtitle: "Top 5 a la World Music Charts Europe & FIL Guadalajara",
    text: "Publicat el març del 2004 amb producció d'Òscar Roig i la guitarra flamenca de Raül Rodríguez, 'Katà' escala fins a les posicions 8 i 5 de la World Music Charts Europe.",
    extendedNote: "Granaïnes, fandangos, rembetika i bolero mallorquí conviuen amb gaides búlgares, duducs i guitarrons, impulsant gires constants per Europa i Mèxic (FIL de Guadalajara).",
    quote: "La veu d'arrel que no s'atura de viatjar: de les llistes europees fins a 'Viatger'.",
    media: "/images/disco_6.png",
    mediaCaption: "'Katà' (2004), reconeixement internacional a les llistes europees",
    tags: ["Katà (2004)", "World Music Charts Europe", "Raül Rodríguez", "Òscar Roig"],
    albumLink: { label: "FITXA DE KATÀ ↗", href: "/discografia/kata/" },
    progress: 0.4705,
    pinX: "27%",
    pinY: "46.81%",
    side: "right",
  },
  {
    id: "step-10-2006",
    stepNum: "10 / 18",
    year: "2006",
    badge: "ETAPA 05 · 2006 · EIXOS & EN CONCERT",
    stageNum: "05",
    stageId: "kata-projeccio",
    title: "'Eixos' i triomf als Premis Ovidi Montllor",
    subtitle: "Producció de Borja Penalba i àlbum 'En Concert' (Galileo MC)",
    text: "L'any 2006 publica 'Eixos' —amb què esdevé el gran guanyador de la primera edició dels Premis Ovidi Montllor— i el disc en viu 'En Concert' per al segell alemany Galileo Music.",
    extendedNote: "Una etapa d'alta plenitud escènica que consolida la seua banda habitual i la projecció als principals festivals europeus com Glatt & Verkehrt (Àustria).",
    media: "/images/disco_5.png",
    mediaCaption: "'Eixos' (2006), guardonat als I Premis Ovidi Montllor",
    tags: ["Eixos (2006)", "Premis Ovidi Montllor", "Borja Penalba", "En Concert"],
    albumLink: { label: "FITXA D'EIXOS ↗", href: "/discografia/eixos/" },
    progress: 0.5266,
    pinX: "73%",
    pinY: "52.13%",
    side: "left",
  },
  {
    id: "step-11-2009",
    stepNum: "11 / 18",
    year: "2009",
    badge: "ETAPA 05 · 2009 · JAZZ & EXPERIMENTACIÓ",
    stageNum: "05",
    stageId: "kata-projeccio",
    title: "Diàleg amb el Jazz: Manel Camp Trio & David Pastor",
    subtitle: "Edició limitada d'autor il·lustrada per Jordi Albinyana",
    text: "El 2009 s'endinsa en la improvisació jazzística al costat del pianista Manel Camp i el trompetista David Pastor en una edició d'art per a col·leccionistes.",
    extendedNote: "Fandangos i cançons de bressol es revesteixen d'harmonies de jazz contemporani i swing mediterrani, demostrant la versatilitat inesgotable del seu registre vocal.",
    media: "/images/Captura-de-pantalla-2018-09-05-a-las-14.37.55.png",
    mediaCaption: "Projecte amb Manel Camp Trio i David Pastor (2009)",
    tags: ["Jazz Mediterrani", "Manel Camp", "David Pastor", "Jordi Albinyana"],
    albumLink: { label: "FITXA DEL DISC ↗", href: "/discografia/jazz-manel-camp/" },
    progress: 0.5827,
    pinX: "27%",
    pinY: "57.45%",
    side: "right",
  },
  {
    id: "step-12-2011",
    stepNum: "12 / 18",
    year: "2011",
    badge: "ETAPA 05 · 2011 · TEMPS RECORD",
    stageNum: "05",
    stageId: "kata-projeccio",
    title: "'Per marcianes': Maduresa d'autor",
    subtitle: "Onze noves composicions abans d'un parèntesi reflexiu",
    text: "Amb 'Per marcianes' (Temps Record, 2011), Miquel Gil signa un disc de cançó d'autor mediterrània amb arranjaments acústics depurats i una profunda càrrega poètica.",
    extendedNote: "Aquest treball obre un període de set anys sense publicar disc en solitari, dedicat intensament als directes, les col·laboracions i la recerca escènica.",
    media: "/images/disco_3.png",
    mediaCaption: "'Per marcianes' (Temps Record, 2011)",
    tags: ["Per marcianes", "Temps Record", "Cançó d'Autor", "Acústic"],
    albumLink: { label: "FITXA DE PER MARCIANES ↗", href: "/discografia/marcianes/" },
    progress: 0.6388,
    pinX: "73%",
    pinY: "62.77%",
    side: "left",
  },
  {
    id: "step-13-2013",
    stepNum: "13 / 18",
    year: "2013",
    badge: "ETAPA 05 · 2013 · CAMP NOU (BARCELONA)",
    stageNum: "05",
    stageId: "kata-projeccio",
    title: "Concert per la Llibertat davant 90.000 persones",
    subtitle: "Clamor col·lectiu i presència als grans esdeveniments",
    text: "El juny del 2013 participa en l'històric Concert per la Llibertat a l'estadi del Camp Nou davant de 90.000 espectadors, portant el cant valencià a un escenari d'abast internacional.",
    extendedNote: "Durant aquests anys multiplica les col·laboracions amb formacions de tot el domini lingüístic i de la conca mediterrània, superant el centenar d'enregistraments col·lectius.",
    media: "/images/2002espai2.jpg",
    mediaCaption: "Actuació en grans auditoris i esdeveniments multitudinaris",
    tags: ["Camp Nou", "90.000 espectadors", "Directe", "Compromís"],
    progress: 0.6949,
    pinX: "27%",
    pinY: "68.09%",
    side: "right",
  },
  {
    id: "step-14-2015",
    stepNum: "14 / 18",
    year: "2015",
    badge: "ETAPA 05 · 2015 · 40 ANYS D'ESCENARIS",
    stageNum: "05",
    stageId: "kata-projeccio",
    title: "40 anys de carrera: 'Matèria' i 'Nus' amb Botifarra",
    subtitle: "Cimera de les dos grans veus de l'arrel valenciana",
    text: "Celebra quaranta anys damunt dels escenaris amb l'estrena de la gira 'Matèria' i l'espectacle íntim 'Nus' al costat del seu gran amic i mestre del cant d'estil Pep Gimeno «Botifarra».",
    extendedNote: "L'espectacle 'Nus', despullat d'artificis i sostingut per la complicitat de dos veus irrepetibles, recorre teatres i places durant més de tres anys d'èxit absolut.",
    media: "/images/miquel-gil-juan-miguel-morales-13-scaled.jpg",
    mediaCaption: "Miquel Gil en escena durant la celebració dels 40 anys de trajectòria",
    tags: ["40 Anys", "Gira Matèria", "Nus", "Pep Gimeno Botifarra"],
    progress: 0.7510,
    pinX: "73%",
    pinY: "73.40%",
    side: "left",
  },
  {
    id: "step-15-2019",
    stepNum: "15 / 18",
    year: "2019",
    badge: "ETAPA 05 · 2019 · PALAU DE LA MÚSICA & À PUNT",
    stageNum: "05",
    stageId: "kata-projeccio",
    title: "'Geometries' i 'Bambant per casa'",
    subtitle: "Poesia contemporània i divulgació televisiva a À Punt",
    text: "Publica 'Geometries' (Temps Record, 2019), presentat solemnement al Palau de la Música de València, musicant versos d'Enric Casasses, Imma Màñez, Joanjo Garcia, Anna Montero i Estellés.",
    extendedNote: "El mateix any condueix el programa 'Bambant per casa' a la televisió pública valenciana À Punt, recorrent el territori a través de la seua música i la seua gent.",
    media: "/images/disco_2.png",
    mediaCaption: "'Geometries' (2019), estrenat al Palau de la Música de València",
    tags: ["Geometries (2019)", "Palau de la Música", "Bambant per casa", "À Punt"],
    albumLink: { label: "FITXA DE GEOMETRIES ↗", href: "/discografia/geometries/" },
    progress: 0.8071,
    pinX: "27%",
    pinY: "78.72%",
    side: "right",
  },
  {
    id: "step-16-2021",
    stepNum: "16 / 18",
    year: "2021–23",
    badge: "ETAPA 05 · 2021 — 2023 · ANIVERSARI D'ORGÀNIC",
    stageNum: "05",
    stageId: "kata-projeccio",
    title: "Gira '20 anys d'Orgànic' i Mural Sonor",
    subtitle: "Inauguració del Festival ETNO de València (2023)",
    text: "Commemora les dos dècades del disc que va canviar la música mediterrània amb la gira '20 anys d'Orgànic', inaugurant el festival ETNO de València a l'abril del 2023.",
    extendedNote: "Paral·lelament encapçala l'espectacle 'Arrel' dins del cicle Mural Sonor (50è aniversari d'ACPV) juntament amb Noèlia Llorens «Titana», connectant generacions del cançoner tradicional.",
    media: "/images/miquel-gil-juan-miguel-morales-8-scaled.jpg",
    mediaCaption: "Celebració dels 20 anys d''Orgànic' amb la banda completa",
    tags: ["20 Anys d'Orgànic", "Festival ETNO", "Mural Sonor", "Titana"],
    progress: 0.8632,
    pinX: "73%",
    pinY: "84.04%",
    side: "left",
  },
  {
    id: "step-17-2024",
    stepNum: "17 / 18",
    year: "2024",
    badge: "ETAPA 05 · 9 DE MARÇ DE 2024 · TEATRE PRINCIPAL",
    stageNum: "05",
    stageId: "kata-projeccio",
    isMajorStage: true,
    title: "'Viatger': Homenatge a Manolo Miralles",
    subtitle: "Artesania digital, memòria viva i estrena al Teatre Principal",
    text: "El 9 de març del 2024 estrena al Teatre Principal de València 'Viatger' (Temps Record), un disc fet a mà amb producció digital dedicat a la memòria del seu company d'Al Tall Manolo Miralles.",
    extendedNote: "Finançat amb el suport de la comunitat a Verkami, inclou lletres pròpies, un romanç tradicional, versos de Teresa Pasqual i un sentit homenatge a Joan Baptista Humet.",
    media: "/images/MiquelGilViatger_Principal.webp",
    mediaCaption: "Estrena de 'Viatger' al Teatre Principal de València (2024)",
    tags: ["Viatger (2024)", "Manolo Miralles", "Teatre Principal", "Teresa Pasqual"],
    albumLink: { label: "FITXA DE VIATGER ↗", href: "/discografia/viatger/" },
    progress: 0.9193,
    pinX: "27%",
    pinY: "89.36%",
    side: "right",
  },
  {
    id: "step-18-2026",
    stepNum: "18 / 18",
    year: "2025–26",
    badge: "ETAPA 05 · 2025 — 2026 · MIG SEGLE EN MOVIMENT",
    stageNum: "05",
    stageId: "kata-projeccio",
    title: "Solidaritat amb l'Horta Sud i mig segle en viu",
    subtitle: "Premis Ovidi 2025 i continuïtat als escenaris (2026)",
    text: "Impulsa el single col·lectiu solidari per la DANA al costat de Vicent Torrent, Pep Gimeno «Botifarra», Titana i La Maria (nominat als Premis Ovidi 2025).",
    extendedNote: "El 2026 continua en actiu arreu del territori —com el duo amb Eduard Navarro al festival 2 Terços de Mataró—, fidel a la seua premissa vital: la tradició és matèria viva que sempre camina cap endavant.",
    media: "/images/portadaCD.webp",
    mediaCaption: "Miquel Gil (2024–2026): cinquanta anys de viatge sonor ininterromput",
    tags: ["Horta Sud · DANA", "Premis Ovidi 2025", "Eduard Navarro", "Mig Segle en Viu"],
    albumLink: { label: "VEURE AGENDA DE DIRECTES ↗", href: "/agenda/" },
    progress: 0.9698,
    pinX: "50%",
    pinY: "95.21%",
    side: "left",
  },
];

const DESKTOP_RAILWAY_PATH = `
  M 270 150
  C 270 250, 270 300, 270 400
  C 270 650, 730 650, 730 900
  C 730 1150, 270 1150, 270 1400
  C 270 1650, 730 1650, 730 1900
  C 730 2150, 270 2150, 270 2400
  C 270 2650, 730 2650, 730 2900
  C 730 3150, 270 3150, 270 3400
  C 270 3650, 730 3650, 730 3900
  C 730 4150, 270 4150, 270 4400
  C 270 4650, 730 4650, 730 4900
  C 730 5150, 270 5150, 270 5400
  C 270 5650, 730 5650, 730 5900
  C 730 6150, 270 6150, 270 6400
  C 270 6650, 730 6650, 730 6900
  C 730 7150, 270 7150, 270 7400
  C 270 7650, 730 7650, 730 7900
  C 730 8150, 270 8150, 270 8400
  C 270 8680, 500 8720, 500 8950
`;

export default function ScrollPathJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  const [showFullArchive, setShowFullArchive] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !stageRef.current) return;

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth <= 768;
      const pathSelector = isMobile
        ? '[data-journey-path="mobile"]'
        : '[data-journey-path="desktop"]';
      const progressSelector = isMobile
        ? '[data-journey-progress="mobile"]'
        : '[data-journey-progress="desktop"]';

      const motionPath = stageRef.current?.querySelector<SVGPathElement>(pathSelector);
      const progressBar = stageRef.current?.querySelector<SVGPathElement>(progressSelector);
      const marker = stageRef.current?.querySelector<HTMLElement>("[data-journey-marker]");
      const checkpointElements = stageRef.current?.querySelectorAll<HTMLElement>("[data-journey-checkpoint]");

      if (!motionPath || !progressBar || !marker) return;

      // 1. Animació d'entrada de la capçalera "CINC ETAPES, UNA VIDA DE MÚSICA" (estil cortina A24)
      const headEl = containerRef.current?.querySelector<HTMLElement>(".journey-head");
      if (headEl) {
        const kicker = headEl.querySelector<HTMLElement>(".journey-kicker");
        const title = headEl.querySelector<HTMLElement>("h2");
        const lede = headEl.querySelector<HTMLElement>(".journey-lede");
        const prompt = headEl.querySelector<HTMLElement>(".journey-prompt");

        const headTl = gsap.timeline({
          scrollTrigger: {
            trigger: headEl,
            start: "top 82%",
            toggleActions: "play none none reverse",
          },
          defaults: { ease: "power3.out" },
        });

        if (kicker) {
          headTl.fromTo(kicker, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.65 }, 0);
        }
        if (title) {
          headTl.fromTo(
            title,
            { opacity: 0, y: 42, filter: "blur(10px)" },
            { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.85 },
            0.08
          );
        }
        if (lede) {
          headTl.fromTo(lede, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.75 }, 0.22);
        }
        if (prompt) {
          headTl.fromTo(prompt, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.65 }, 0.36);
        }
      }

      // 2. Sincronització exacta del Railway i el Punter amb el centre de la pantalla ("top 55%" -> "bottom 55%")
      // Així la punta de la línia i el punter sempre viatgen exactament a l'alçada dels ulls de l'usuari!
      const pathLength = motionPath.getTotalLength();
      gsap.set(progressBar, { strokeDasharray: pathLength, strokeDashoffset: pathLength });

      const railTl = gsap.timeline({ paused: true });
      railTl.to(progressBar, { strokeDashoffset: 0, duration: 1, ease: "none" }, 0);
      railTl.to(
        marker,
        {
          motionPath: {
            path: motionPath,
            align: motionPath,
            alignOrigin: [0.5, 0.5],
            autoRotate: true,
          },
          duration: 1,
          ease: "none",
        },
        0
      );

      const st = ScrollTrigger.create({
        trigger: stageRef.current,
        start: "top 58%",
        end: "bottom 58%",
        scrub: 0.35,
        animation: railTl,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          checkpointElements?.forEach((cp) => {
            const targetP = parseFloat(cp.dataset.progress || "0");
            const isActive = Math.abs(p - targetP) < 0.035;
            const isPassed = p >= targetP - 0.008;
            cp.classList.toggle("is-active", isActive);
            cp.classList.toggle("is-passed", isPassed);
          });
        },
      });

      stRef.current = st;

      // 3. ANIMACIÓ DE CORTINA SINCRONITZADA A24 + ENTRADA LATERAL PER CADA DATA
      // Cada fila (.checkpoint-row) dispara la seua pròpia seqüència quan entra en pantalla ("top 84%"),
      // exactament igual que les fitxes dels CDs (de dalt a baix + aparició lateral d'imatge i textos):
      //   - Pin i línia horitzontal (scaleX: 0 -> 1)
      //   - Fotografia lateral: apareix des del costat exterior amb obertura de cortina (clip-path), zoom suau i fade-in
      //   - Any gegant i etapa: pugen des de baix i llisquen del lateral (y: 38 -> 0, x -> 0, blur -> 0)
      //   - Títol principal: puja des de baix com a les fitxes de CD (y: 36 -> 0, opacity: 0 -> 1)
      //   - Subtítol: puja des de baix (y: 26 -> 0, opacity: 0 -> 1)
      //   - Línia divisòria horitzontal: es desplega d'un costat a l'altre (scaleX: 0 -> 1)
      //   - Paràgraf principal i nota històrica ampliada: pugen de baix cap a dalt en cascada
      //   - Cita destacada, etiquetes (#tags) i botó de fitxa del disc: tanquen la cortina
      checkpointElements?.forEach((cp) => {
        const side = (cp.dataset.side as "left" | "right") || "right";
        const visualLateralShift = side === "right" ? -110 : 110;
        const editorialLateralShift = side === "right" ? 90 : -90;

        const pinLine = cp.querySelector<HTMLElement>(".checkpoint-pin__line");
        const visualWrap = cp.querySelector<HTMLElement>(".checkpoint-visual__scroll");
        const imgWrap = cp.querySelector<HTMLElement>(".checkpoint-visual__img-wrap");
        const imgEl = cp.querySelector<HTMLElement>(".checkpoint-visual__img-wrap img");
        const imgCaption = cp.querySelector<HTMLElement>(".checkpoint-visual__caption");

        const metaRow = cp.querySelector<HTMLElement>(".checkpoint-editorial__meta");
        const mobileMedia = cp.querySelector<HTMLElement>(".checkpoint-editorial__mobile-media");
        const titleEl = cp.querySelector<HTMLElement>(".checkpoint-editorial__title");
        const subEl = cp.querySelector<HTMLElement>(".checkpoint-editorial__subtitle");
        const ruleEl = cp.querySelector<HTMLElement>(".checkpoint-editorial__rule");
        const textEl = cp.querySelector<HTMLElement>(".checkpoint-editorial__text");
        const extP = cp.querySelector<HTMLElement>(".checkpoint-editorial__extended-p");
        const quoteEl = cp.querySelector<HTMLElement>(".checkpoint-editorial__quote");
        const tagItems = cp.querySelectorAll<HTMLElement>(".checkpoint-editorial__tag");
        const actionsEl = cp.querySelector<HTMLElement>(".checkpoint-editorial__actions");

        const stepTl = gsap.timeline({
          scrollTrigger: {
            trigger: cp,
            start: "top 84%",
            end: "top 25%",
            toggleActions: "play none none reverse",
          },
          defaults: { ease: "power3.out" },
        });

        // A) Línia del pin que connecta amb el bloc
        if (pinLine) {
          stepTl.fromTo(
            pinLine,
            { scaleX: 0, opacity: 0 },
            { scaleX: 1, opacity: 1, duration: 0.65 },
            0
          );
        }

        // B) Fotografia lateral (entra del costat + obertura de màscara clip-path + fade-in + zoom)
        if (visualWrap && !isMobile) {
          stepTl.fromTo(
            visualWrap,
            {
              opacity: 0,
              x: visualLateralShift,
              y: 42,
              filter: "blur(14px)",
            },
            {
              opacity: 1,
              x: 0,
              y: 0,
              filter: "blur(0px)",
              duration: 1.05,
            },
            0.02
          );
        }

        if (imgWrap && !isMobile) {
          const startClip =
            side === "right" ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)";
          stepTl.fromTo(
            imgWrap,
            { clipPath: startClip },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.05, ease: "power3.inOut" },
            0.02
          );
        }

        if (imgEl && !isMobile) {
          stepTl.fromTo(
            imgEl,
            { scale: 1.24 },
            { scale: 1, duration: 1.25, ease: "power3.out" },
            0.02
          );
        }

        if (imgCaption && !isMobile) {
          stepTl.fromTo(
            imgCaption,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.65 },
            0.42
          );
        }

        // C) Cortina sincronitzada de textos (com en les fitxes de CD: de dalt a baix + desplaçament lateral)
        // 1. Any gegant i etiqueta d'etapa
        if (metaRow) {
          stepTl.fromTo(
            metaRow,
            {
              opacity: 0,
              y: 38,
              x: isMobile ? 0 : editorialLateralShift * 0.65,
              filter: "blur(10px)",
            },
            {
              opacity: 1,
              y: 0,
              x: 0,
              filter: "blur(0px)",
              duration: 0.8,
            },
            0.06
          );
        }

        if (mobileMedia && isMobile) {
          stepTl.fromTo(
            mobileMedia,
            { opacity: 0, y: 28, clipPath: "inset(0% 100% 0% 0%)" },
            { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 0.85 },
            0.14
          );
        }

        // 2. Títol de l'etapa / fita (de baix cap a dalt + entrada lateral)
        if (titleEl) {
          stepTl.fromTo(
            titleEl,
            {
              opacity: 0,
              y: 36,
              x: isMobile ? 0 : editorialLateralShift * 0.5,
              filter: "blur(8px)",
            },
            {
              opacity: 1,
              y: 0,
              x: 0,
              filter: "blur(0px)",
              duration: 0.82,
            },
            0.18
          );
        }

        // 3. Subtítol (de baix cap a dalt)
        if (subEl) {
          stepTl.fromTo(
            subEl,
            {
              opacity: 0,
              y: 26,
              x: isMobile ? 0 : editorialLateralShift * 0.35,
            },
            {
              opacity: 1,
              y: 0,
              x: 0,
              duration: 0.72,
            },
            0.3
          );
        }

        // 4. Línia divisòria horitzontal (d'un costat a l'altre com a les fitxes de CD)
        if (ruleEl) {
          stepTl.fromTo(
            ruleEl,
            {
              scaleX: 0,
              transformOrigin: side === "right" ? "left center" : "right center",
            },
            {
              scaleX: 1,
              duration: 0.78,
              ease: "power3.inOut",
            },
            0.38
          );
        }

        // 5. Paràgraf principal (de baix cap a dalt)
        if (textEl) {
          stepTl.fromTo(
            textEl,
            {
              opacity: 0,
              y: 28,
              x: isMobile ? 0 : editorialLateralShift * 0.25,
            },
            {
              opacity: 1,
              y: 0,
              x: 0,
              duration: 0.75,
            },
            0.48
          );
        }

        // 6. Explicació històrica ampliada (sempre visible en cada data i animada en cascada)
        if (extP) {
          stepTl.fromTo(
            extP,
            {
              opacity: 0,
              y: 24,
              x: isMobile ? 0 : editorialLateralShift * 0.2,
            },
            {
              opacity: 1,
              y: 0,
              x: 0,
              duration: 0.72,
            },
            0.58
          );
        }

        // 7. Cita destacada
        if (quoteEl) {
          stepTl.fromTo(
            quoteEl,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.68 },
            0.66
          );
        }

        // 8. Tags en cascada (com les metadades de les fitxes de CD)
        if (tagItems && tagItems.length) {
          stepTl.fromTo(
            tagItems,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.55, stagger: 0.06 },
            0.72
          );
        }

        // 9. Enllaç al disc si en té
        if (actionsEl) {
          stepTl.fromTo(
            actionsEl,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.6 },
            0.8
          );
        }

        // D) Moviment Parallax continu suau mentre es fa scroll per la pantalla
        if (!isMobile && visualWrap) {
          gsap.fromTo(
            visualWrap,
            { yPercent: 14 },
            {
              yPercent: -14,
              ease: "none",
              scrollTrigger: {
                trigger: cp,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const jumpToProgress = (targetP: number) => {
    const st = stRef.current;
    if (!st) return;
    const targetScroll = st.start + (st.end - st.start) * targetP;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  return (
    <div className="journey-scroll" ref={containerRef} data-path-journey id="cronologia">
      <div className="divider-horizontal" />

      {/* Capçalera editorial A24 sobre fons clar (només el bloc CINC ETAPES, UNA VIDA DE MÚSICA) */}
      <header className="journey-head">
        <div className="journey-head__title">
          <p className="journey-kicker">03 / CRONOLOGIA INTERACTIVA (1956 — 2026)</p>
          <h2>CINC ETAPES, UNA VIDA DE MÚSICA</h2>
        </div>
        <div className="journey-head__intro">
          <p className="journey-lede">
            De la fundació d&apos;Al Tall el 1975 a la revolució d&apos;<em>Orgànic</em>, l&apos;èxit europeu de <em>Katà</em> i l&apos;estrena de <em>Viatger</em>: recorre mig segle de música d&apos;arrel en moviment a través de cada data clau.
          </p>
        </div>
      </header>

      <div className="divider-horizontal" />

      {/* Escenari del Railway amb Punter Guia Sincronitzat i Cortina d'Aparició en cada Data */}
      <div className="journey-stage" ref={stageRef}>
        {/* Ruta Sinuosa Desktop SVG (18 passos / 9400px viewBox) */}
        <svg
          className="journey-map journey-map--desktop"
          viewBox="0 0 1000 9400"
          aria-hidden="true"
          focusable="false"
        >
          <path className="route-shadow" d={DESKTOP_RAILWAY_PATH} />
          <path
            className="route-progress"
            data-journey-progress="desktop"
            d={DESKTOP_RAILWAY_PATH}
          />
          <path
            className="route-motion"
            data-journey-path="desktop"
            d={DESKTOP_RAILWAY_PATH}
          />
        </svg>

        {/* Ruta Lineal Mòbil SVG */}
        <svg
          className="journey-map journey-map--mobile"
          viewBox="0 0 380 9400"
          aria-hidden="true"
          focusable="false"
        >
          <path className="route-shadow" d="M 44 120 L 44 9000" />
          <path className="route-progress" data-journey-progress="mobile" d="M 44 120 L 44 9000" />
          <path className="route-motion" data-journey-path="mobile" d="M 44 120 L 44 9000" />
        </svg>

        {/* Punter Guia en Moviment (Marker Bead amb direcció) */}
        <span className="journey-marker" data-journey-marker aria-hidden="true">
          <span className="journey-marker__nose"></span>
        </span>

        {/* 18 Dates Històriques: cadascuna explica completament la seua etapa i es desplega com una cortina sincronitzada al fer scroll */}
        <ol className="checkpoint-list">
          {CHECKPOINTS.map((cp) => (
            <li
              key={cp.id}
              className={`checkpoint-row checkpoint-row--${cp.side} ${
                cp.isMajorStage ? "checkpoint-row--major" : ""
              }`}
              data-journey-checkpoint
              data-progress={cp.progress}
              data-side={cp.side}
              style={
                {
                  "--pin-x": cp.pinX,
                  "--pin-y": cp.pinY,
                  "--pin-x-m": "44px",
                  "--pin-y-m": cp.pinY,
                } as React.CSSProperties
              }
            >
              {/* Punt de connexió sobre la guia del Railway */}
              <button
                type="button"
                className="checkpoint-pin"
                onClick={() => jumpToProgress(cp.progress)}
                aria-label={`Saltar a ${cp.year}: ${cp.title}`}
              >
                <span className="checkpoint-pin__line" aria-hidden="true" />
              </button>

              {/* ELEMENT VISUAL LATERAL (Apareix des del costat amb clip-path i fade-in al fer scroll) */}
              <figure className="checkpoint-visual">
                <div className="checkpoint-visual__scroll" data-visual-scroll>
                  <div className="checkpoint-visual__img-wrap">
                    <img
                      src={cp.media}
                      alt={cp.title}
                      width={520}
                      height={340}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <figcaption className="checkpoint-visual__caption">
                    <span>{cp.mediaCaption}</span>
                    <span>PAS {cp.stepNum}</span>
                  </figcaption>
                </div>
              </figure>

              {/* ELEMENT EDITORIAL DE TEXT OBERT (Es desplega com una cortina sincronitzada de dalt a baix com en les fitxes dels CDs) */}
              <div className="checkpoint-editorial">
                <div className="checkpoint-editorial__scroll" data-editorial-scroll>
                  <div className="checkpoint-editorial__meta">
                    <span className="checkpoint-editorial__year">{cp.year}</span>
                    <span className="checkpoint-editorial__badge">{cp.badge}</span>
                  </div>

                  <div className="checkpoint-editorial__mobile-media">
                    <img
                      src={cp.media}
                      alt={cp.title}
                      width={420}
                      height={270}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <h3 className="checkpoint-editorial__title">{cp.title}</h3>
                  <p className="checkpoint-editorial__subtitle">{cp.subtitle}</p>

                  <div className="checkpoint-editorial__rule" />

                  <p className="checkpoint-editorial__text">{cp.text}</p>

                  <div className="checkpoint-editorial__extended">
                    <p className="checkpoint-editorial__extended-p">{cp.extendedNote}</p>
                    {cp.quote && (
                      <blockquote className="checkpoint-editorial__quote">
                        “{cp.quote}”
                      </blockquote>
                    )}
                  </div>

                  <div className="checkpoint-editorial__tags">
                    {cp.tags.map((tag) => (
                      <span key={tag} className="checkpoint-editorial__tag">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {cp.albumLink && (
                    <div className="checkpoint-editorial__actions">
                      <Link
                        href={cp.albumLink.href}
                        className="checkpoint-editorial__album"
                      >
                        {cp.albumLink.label}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="divider-horizontal" style={{ marginTop: "4rem" }} />

      {/* Botó A24 per desplegar l'índex tabular complet de les 18 fites */}
      <div className="journey-archive-toggle">
        <button
          type="button"
          className="btn a24-btn"
          onClick={() => setShowFullArchive((prev) => !prev)}
        >
          <div className="btn__divider" />
          <span className="btn__p-mask">
            <span
              className="btn__p"
              data-hover-inner
              data-text={
                showFullArchive
                  ? "AMAGAR TAULA RESUM DE LES 18 FITES ↑"
                  : "VEURE TAULA RESUM DE LES 18 FITES HISTÒRIQUES ↓"
              }
            >
              <span>
                {showFullArchive
                  ? "AMAGAR TAULA RESUM DE LES 18 FITES ↑"
                  : "VEURE TAULA RESUM DE LES 18 FITES HISTÒRIQUES ↓"}
              </span>
            </span>
          </span>
          <div className="btn__divider" />
        </button>
      </div>

      {/* Quadre Editorial Complet de les 18 Fites */}
      {showFullArchive && (
        <div className="journey-full-ledger">
          <div className="journey-full-ledger__head">
            <span className="subheading-xs">QUADRE CRONOLÒGIC VERIFICAT (1956 — 2026)</span>
            <span className="subheading-xs">18 FITES OFICIALS</span>
          </div>
          {chronologyFites.map((fita, idx) => (
            <div
              key={`${fita.year}-${idx}`}
              className="ledger-row"
              onClick={() => {
                const targetCp = CHECKPOINTS[idx];
                if (targetCp) jumpToProgress(targetCp.progress);
              }}
              role="button"
              tabIndex={0}
            >
              <span className="ledger-idx">
                PAS {idx + 1 < 10 ? `0${idx + 1}` : idx + 1} / {chronologyFites.length}
              </span>
              <span className="ledger-year">{fita.year}</span>
              <span className="ledger-text">{fita.text}</span>
              <span className="ledger-goto">ANAR A LA GUIA ↑</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
