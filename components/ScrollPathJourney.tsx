"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { BIO_SECTIONS, type BioSection } from "@/app/biografia/bioData";
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

// 18 passos al llarg del Railway on a cada vèrtex els elements (imatges a una banda, textos a l'altra) apareixen de forma orgànica i dinàmica pels dos laterals
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

// Mapa dels punts de progrés de cada gran etapa per al navegador superior
const STAGE_PROGRESS_MAP: Record<string, number> = {
  "comencar-comencant": 0.1339,
  "transicio-musical": 0.2461,
  "eclecticisme": 0.3022,
  "organic": 0.4144,
  "kata-projeccio": 0.4705,
};

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
  const stRef = useRef<ScrollTrigger | null>(null);
  const [showFullArchive, setShowFullArchive] = useState(false);
  const [activeStageId, setActiveStageId] = useState<string>(BIO_SECTIONS[0].id);
  const [expandedStepIds, setExpandedStepIds] = useState<Record<string, boolean>>({});
  const [modalSection, setModalSection] = useState<BioSection | null>(null);

  const toggleStepNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedStepIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const cleanupFns: Array<() => void> = [];

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth <= 768;
      const pathSelector = isMobile
        ? '[data-journey-path="mobile"]'
        : '[data-journey-path="desktop"]';
      const progressSelector = isMobile
        ? '[data-journey-progress="mobile"]'
        : '[data-journey-progress="desktop"]';

      const motionPath = containerRef.current?.querySelector<SVGPathElement>(pathSelector);
      const progressBar = containerRef.current?.querySelector<SVGPathElement>(progressSelector);
      const marker = containerRef.current?.querySelector<HTMLElement>("[data-journey-marker]");
      const progressText = containerRef.current?.querySelector<HTMLElement>("[data-journey-progress-text]");
      const checkpointElements = containerRef.current?.querySelectorAll<HTMLElement>("[data-journey-checkpoint]");

      if (!motionPath || !progressBar || !marker) return;

      const pathLength = motionPath.getTotalLength();
      gsap.set(progressBar, { strokeDasharray: pathLength, strokeDashoffset: pathLength });

      const tl = gsap.timeline({ paused: true });
      tl.to(progressBar, { strokeDashoffset: 0, duration: 1, ease: "none" }, 0);
      tl.to(
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

      // ============================================================
      // MOTOR D'ANIMACIÓ CONTÍNUA AMB EL SCROLL + ELEMENTS MOVIBLES
      // Inspirat en bleibtgleich.dev:
      // 1. Entrada lateral contínua lligada al scroll (x, y, rotation, scale)
      // 2. Blur-to-sharp fade-in (filter: blur(18px) -> blur(0px), opacity: 0 -> 1)
      // 3. Clip-path uncurtaining per a les fotografies i línies divisòries
      // 4. Física interactiva: arrossegament lliure amb el punter (draggable) + inclinació 3D
      // ============================================================
      interface StepAnimator {
        cp: HTMLElement;
        targetP: number;
        side: "left" | "right";
        visualScroll: HTMLElement | null;
        editorialScroll: HTMLElement | null;
        imgWrap: HTMLElement | null;
        imgEl: HTMLElement | null;
        yearEl: HTMLElement | null;
        badgeEl: HTMLElement | null;
        titleEl: HTMLElement | null;
        subEl: HTMLElement | null;
        ruleEl: HTMLElement | null;
        textEl: HTMLElement | null;
        extEl: HTMLElement | null;
        tagsEl: HTMLElement | null;
        actionsEl: HTMLElement | null;
        pinLine: HTMLElement | null;
      }

      const stepAnimators: StepAnimator[] = [];

      checkpointElements?.forEach((cp) => {
        const targetP = parseFloat(cp.dataset.progress || "0");
        const side = (cp.dataset.side as "left" | "right") || "right";

        stepAnimators.push({
          cp,
          targetP,
          side,
          visualScroll: cp.querySelector<HTMLElement>("[data-visual-scroll]"),
          editorialScroll: cp.querySelector<HTMLElement>("[data-editorial-scroll]"),
          imgWrap: cp.querySelector<HTMLElement>(".checkpoint-visual__img-wrap"),
          imgEl: cp.querySelector<HTMLElement>(".checkpoint-visual__img-wrap img"),
          yearEl: cp.querySelector<HTMLElement>(".checkpoint-editorial__year"),
          badgeEl: cp.querySelector<HTMLElement>(".checkpoint-editorial__badge"),
          titleEl: cp.querySelector<HTMLElement>(".checkpoint-editorial__title"),
          subEl: cp.querySelector<HTMLElement>(".checkpoint-editorial__subtitle"),
          ruleEl: cp.querySelector<HTMLElement>(".checkpoint-editorial__rule"),
          textEl: cp.querySelector<HTMLElement>(".checkpoint-editorial__text"),
          extEl: cp.querySelector<HTMLElement>(".checkpoint-editorial__extended"),
          tagsEl: cp.querySelector<HTMLElement>(".checkpoint-editorial__tags"),
          actionsEl: cp.querySelector<HTMLElement>(".checkpoint-editorial__actions"),
          pinLine: cp.querySelector<HTMLElement>(".checkpoint-pin__line"),
        });

        // Inicialitzar física interactiva movible (Draggable + 3D Magnetic Tilt) en els blocs movibles
        const movableNodes = cp.querySelectorAll<HTMLElement>("[data-movable-node]");
        movableNodes.forEach((node) => {
          gsap.set(node, { transformPerspective: 1000, transformStyle: "preserve-3d" });

          const xTo = gsap.quickTo(node, "x", { duration: 0.45, ease: "power3.out" });
          const yTo = gsap.quickTo(node, "y", { duration: 0.45, ease: "power3.out" });
          const rotXTo = gsap.quickTo(node, "rotationX", { duration: 0.55, ease: "power3.out" });
          const rotYTo = gsap.quickTo(node, "rotationY", { duration: 0.55, ease: "power3.out" });
          const scaleTo = gsap.quickTo(node, "scale", { duration: 0.4, ease: "power3.out" });

          let isDragging = false;
          let dragMoved = false;
          let startPointerX = 0;
          let startPointerY = 0;
          let baseOffsetX = 0;
          let baseOffsetY = 0;
          let currentOffsetX = 0;
          let currentOffsetY = 0;

          const onPointerDown = (e: PointerEvent) => {
            // No iniciar drag si es fa clic en un botó o enllaç d'acció
            const target = e.target as HTMLElement;
            if (target.closest("button, a")) return;

            isDragging = true;
            dragMoved = false;
            startPointerX = e.clientX;
            startPointerY = e.clientY;
            node.classList.add("is-dragging");
            scaleTo(1.035);
            try {
              node.setPointerCapture(e.pointerId);
            } catch {}
          };

          const onPointerMove = (e: PointerEvent) => {
            const rect = node.getBoundingClientRect();
            if (isDragging) {
              const dx = e.clientX - startPointerX;
              const dy = e.clientY - startPointerY;
              if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
                dragMoved = true;
                node.dataset.justDragged = "true";
              }
              currentOffsetX = gsap.utils.clamp(-240, 240, baseOffsetX + dx);
              currentOffsetY = gsap.utils.clamp(-160, 160, baseOffsetY + dy);
              xTo(currentOffsetX);
              yTo(currentOffsetY);
              rotYTo(gsap.utils.clamp(-14, 14, dx * 0.08));
              rotXTo(gsap.utils.clamp(-14, 14, -dy * 0.08));
              return;
            }

            if (isMobile || !rect.width || !rect.height) return;
            // Efecte magnètic i tilt 3D reactiu al cursor (com bleibtgleich.dev initTiltCursor)
            const relX = (e.clientX - rect.left) / rect.width - 0.5;
            const relY = (e.clientY - rect.top) / rect.height - 0.5;
            xTo(baseOffsetX + relX * 22);
            yTo(baseOffsetY + relY * 18);
            rotYTo(relX * 14);
            rotXTo(-relY * 12);
          };

          const finishDrag = (e: PointerEvent) => {
            if (!isDragging) return;
            isDragging = false;
            node.classList.remove("is-dragging");
            scaleTo(1);
            // Conservem l'offset mogut per l'usuari perquè l'element siga realment movible a la pàgina,
            // i amb doble clic torna al seu lloc original amb efecte elàstic.
            baseOffsetX = currentOffsetX;
            baseOffsetY = currentOffsetY;
            rotXTo(0);
            rotYTo(0);
            try {
              if (node.hasPointerCapture(e.pointerId)) {
                node.releasePointerCapture(e.pointerId);
              }
            } catch {}
            if (dragMoved) {
              setTimeout(() => {
                delete node.dataset.justDragged;
              }, 120);
            }
          };

          const onMouseLeave = () => {
            if (isDragging) return;
            xTo(baseOffsetX);
            yTo(baseOffsetY);
            rotXTo(0);
            rotYTo(0);
            scaleTo(1);
          };

          const onDoubleClick = (e: MouseEvent) => {
            e.stopPropagation();
            baseOffsetX = 0;
            baseOffsetY = 0;
            currentOffsetX = 0;
            currentOffsetY = 0;
            gsap.to(node, {
              x: 0,
              y: 0,
              rotationX: 0,
              rotationY: 0,
              scale: 1,
              duration: 0.75,
              ease: "elastic.out(1, 0.55)",
              overwrite: "auto",
            });
          };

          node.addEventListener("pointerdown", onPointerDown);
          node.addEventListener("pointermove", onPointerMove);
          node.addEventListener("pointerup", finishDrag);
          node.addEventListener("pointercancel", finishDrag);
          node.addEventListener("mouseleave", onMouseLeave);
          node.addEventListener("dblclick", onDoubleClick);

          cleanupFns.push(() => {
            node.removeEventListener("pointerdown", onPointerDown);
            node.removeEventListener("pointermove", onPointerMove);
            node.removeEventListener("pointerup", finishDrag);
            node.removeEventListener("pointercancel", finishDrag);
            node.removeEventListener("mouseleave", onMouseLeave);
            node.removeEventListener("dblclick", onDoubleClick);
          });
        });
      });

      const smoothstep = (edge0: number, edge1: number, x: number) => {
        const t = gsap.utils.clamp(0, 1, (x - edge0) / (edge1 - edge0));
        return t * t * (3 - 2 * t);
      };

      const updateCheckpoints = (p: number) => {
        if (progressText) {
          progressText.textContent = `${Math.round(p * 100)}%`;
        }

        if (p < 0.21) {
          setActiveStageId("comencar-comencant");
        } else if (p < 0.28) {
          setActiveStageId("transicio-musical");
        } else if (p < 0.34) {
          setActiveStageId("eclecticisme");
        } else if (p < 0.45) {
          setActiveStageId("organic");
        } else {
          setActiveStageId("kata-projeccio");
        }

        const entryWindow = 0.068; // Finestra de scroll on els elements entren progressivament des dels laterals

        stepAnimators.forEach((item, index) => {
          const {
            cp,
            targetP,
            side,
            visualScroll,
            editorialScroll,
            imgWrap,
            imgEl,
            yearEl,
            badgeEl,
            titleEl,
            subEl,
            ruleEl,
            textEl,
            extEl,
            tagsEl,
            actionsEl,
            pinLine,
          } = item;

          const delta = p - targetP;
          const isActive = Math.abs(delta) < 0.036;
          const isPassed = p >= targetP - 0.008;

          // Progrés continu d'entrada (0 -> 1) lligat al scroll mentre el punter s'acosta al vèrtex
          // El primer pas comença ja visible però amb parallax viu
          const rawEntry =
            index === 0
              ? smoothstep(-0.02, 0.022, p)
              : smoothstep(targetP - entryWindow, targetP - 0.004, p);

          const isRevealed = rawEntry > 0.15;
          cp.classList.toggle("is-active", isActive);
          cp.classList.toggle("is-revealed", isRevealed);
          cp.classList.toggle("is-passed", isPassed);

          // 1. Parallax vertical continu mentre es fa scroll per la pàgina
          const parallaxY = isMobile ? 0 : gsap.utils.clamp(-55, 75, -delta * 420);

          // 2. Moviment lateral continu des dels dos costats de la pantalla + Fade-in + Blur-to-sharp
          // Quan side === 'right', la foto entra des de l'esquerra (-190px -> 0) i el text entra des de la dreta (+190px -> 0)
          // Quan side === 'left', la foto entra des de la dreta (+190px -> 0) i el text entra des de l'esquerra (-190px -> 0)
          const visualLateralSign = side === "right" ? -1 : 1;
          const editorialLateralSign = side === "right" ? 1 : -1;

          const visualStartShift = isMobile ? 45 : 185;
          const editorialStartShift = isMobile ? 55 : 175;

          const visualX = (1 - rawEntry) * visualStartShift * visualLateralSign;
          const visualY = (1 - rawEntry) * 52 + parallaxY * 0.85;
          const visualRot = (1 - rawEntry) * 6.5 * visualLateralSign;
          const visualScale = 0.86 + 0.14 * rawEntry;
          const visualBlur = (1 - rawEntry) * 16;

          if (visualScroll && !isMobile) {
            visualScroll.style.opacity = `${rawEntry}`;
            visualScroll.style.transform = `translate3d(${visualX.toFixed(1)}px, ${visualY.toFixed(
              1
            )}px, 0) rotate(${visualRot.toFixed(2)}deg) scale(${visualScale.toFixed(3)})`;
            visualScroll.style.filter =
              visualBlur > 0.25 ? `blur(${visualBlur.toFixed(1)}px)` : "none";
          }

          // Clip-path d'obertura lateral en la fotografia (estil bleibtgleich animateClipReveal)
          if (imgWrap && !isMobile) {
            const clipPct = Math.round((1 - rawEntry) * 100);
            imgWrap.style.clipPath =
              side === "right"
                ? `inset(0% ${clipPct}% 0% 0%)`
                : `inset(0% 0% 0% ${clipPct}%)`;
          }

          if (imgEl && !isMobile) {
            const imgScale = 1.24 - 0.24 * rawEntry + (isActive ? 0.04 : 0);
            imgEl.style.transform = `scale(${imgScale.toFixed(3)})`;
          }

          // 3. Bloc Editorial Obert: entra des del lateral oposat amb revelat esglaonat (staggered) per cada subelement
          const edEntry =
            index === 0
              ? smoothstep(-0.02, 0.025, p)
              : smoothstep(targetP - entryWindow * 0.95, targetP, p);

          const edX = (1 - edEntry) * editorialStartShift * editorialLateralSign;
          const edY = (1 - edEntry) * 44 + parallaxY * 0.55;
          const edBlur = (1 - edEntry) * 14;

          if (editorialScroll) {
            editorialScroll.style.opacity = `${edEntry}`;
            editorialScroll.style.transform = `translate3d(${edX.toFixed(1)}px, ${edY.toFixed(
              1
            )}px, 0)`;
            editorialScroll.style.filter =
              edBlur > 0.25 ? `blur(${edBlur.toFixed(1)}px)` : "none";
          }

          // Línia del pin que es dibuixa cap al text
          if (pinLine) {
            pinLine.style.transform = `scaleX(${edEntry.toFixed(3)})`;
            pinLine.style.opacity = `${0.25 + 0.75 * edEntry}`;
          }

          // Sub-elements esglaonats (Any gegant, Títol, Línia divisòria, Cos de text, Tags, Accions)
          const subStagger = (offset: number) =>
            index === 0
              ? 1
              : smoothstep(
                  targetP - entryWindow * (0.92 - offset),
                  targetP - entryWindow * (0.12 - offset * 0.15),
                  p
                );

          const yProg = subStagger(0.0);
          if (yearEl) {
            const yShift = (1 - yProg) * 55 * editorialLateralSign;
            const yBlur = (1 - yProg) * 18;
            yearEl.style.opacity = `${yProg}`;
            yearEl.style.transform = `translate3d(${yShift.toFixed(1)}px, ${(
              (1 - yProg) *
              18
            ).toFixed(1)}px, 0)`;
            yearEl.style.filter = yBlur > 0.3 ? `blur(${yBlur.toFixed(1)}px)` : "none";
          }

          if (badgeEl) {
            badgeEl.style.opacity = `${yProg}`;
            badgeEl.style.transform = `translate3d(${((1 - yProg) * 32 * editorialLateralSign).toFixed(
              1
            )}px, 0, 0)`;
          }

          const titleProg = subStagger(0.14);
          if (titleEl) {
            const tBlur = (1 - titleProg) * 12;
            titleEl.style.opacity = `${titleProg}`;
            titleEl.style.transform = `translate3d(${(
              (1 - titleProg) *
              48 *
              editorialLateralSign
            ).toFixed(1)}px, ${((1 - titleProg) * 20).toFixed(1)}px, 0)`;
            titleEl.style.filter = tBlur > 0.3 ? `blur(${tBlur.toFixed(1)}px)` : "none";
          }

          const subProg = subStagger(0.22);
          if (subEl) {
            subEl.style.opacity = `${subProg}`;
            subEl.style.transform = `translate3d(${(
              (1 - subProg) *
              36 *
              editorialLateralSign
            ).toFixed(1)}px, ${((1 - subProg) * 14).toFixed(1)}px, 0)`;
          }

          const ruleProg = subStagger(0.28);
          if (ruleEl) {
            ruleEl.style.transform = `scaleX(${ruleProg.toFixed(3)})`;
            ruleEl.style.opacity = `${ruleProg}`;
          }

          const textProg = subStagger(0.35);
          if (textEl) {
            const pBlur = (1 - textProg) * 10;
            textEl.style.opacity = `${textProg}`;
            textEl.style.transform = `translate3d(${(
              (1 - textProg) *
              42 *
              editorialLateralSign
            ).toFixed(1)}px, ${((1 - textProg) * 22).toFixed(1)}px, 0)`;
            textEl.style.filter = pBlur > 0.3 ? `blur(${pBlur.toFixed(1)}px)` : "none";
          }

          const extProg = subStagger(0.42);
          if (extEl) {
            extEl.style.opacity = `${extProg}`;
            extEl.style.transform = `translate3d(${(
              (1 - extProg) *
              36 *
              editorialLateralSign
            ).toFixed(1)}px, ${((1 - extProg) * 18).toFixed(1)}px, 0)`;
          }

          const footerProg = subStagger(0.48);
          if (tagsEl) {
            tagsEl.style.opacity = `${footerProg}`;
            tagsEl.style.transform = `translate3d(${(
              (1 - footerProg) *
              28 *
              editorialLateralSign
            ).toFixed(1)}px, ${((1 - footerProg) * 12).toFixed(1)}px, 0)`;
          }
          if (actionsEl) {
            actionsEl.style.opacity = `${footerProg}`;
            actionsEl.style.transform = `translate3d(${(
              (1 - footerProg) *
              24 *
              editorialLateralSign
            ).toFixed(1)}px, ${((1 - footerProg) * 12).toFixed(1)}px, 0)`;
          }
        });
      };

      // Revelar l'estat inicial al carregar
      updateCheckpoints(0.025);

      const st = ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        animation: tl,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          updateCheckpoints(self.progress);
        },
      });

      stRef.current = st;
    }, containerRef);

    return () => {
      cleanupFns.forEach((fn) => fn());
      ctx.revert();
    };
  }, []);

  // Tancar el modal amb Escape
  useEffect(() => {
    if (!modalSection) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalSection(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalSection]);

  const jumpToProgress = (targetP: number, e?: React.MouseEvent<HTMLElement>) => {
    if (e) {
      const movable = (e.currentTarget as HTMLElement).querySelector<HTMLElement>(
        "[data-movable-node]"
      );
      if (
        movable?.dataset.justDragged === "true" ||
        (e.target as HTMLElement)?.closest("[data-movable-node]")?.getAttribute("data-just-dragged") ===
          "true"
      ) {
        return;
      }
    }
    const st = stRef.current;
    if (!st) return;
    const targetScroll = st.start + (st.end - st.start) * targetP;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  const handleStageTabClick = (stage: BioSection) => {
    setActiveStageId(stage.id);
    const targetP = STAGE_PROGRESS_MAP[stage.id] ?? 0.0217;
    jumpToProgress(targetP);
  };

  const openStageModal = (stageId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const found = BIO_SECTIONS.find((s) => s.id === stageId);
    if (found) {
      setModalSection(found);
    }
  };

  const activeStageObj = BIO_SECTIONS.find((s) => s.id === activeStageId) || BIO_SECTIONS[0];

  return (
    <div className="journey-scroll" ref={containerRef} data-path-journey id="cronologia">
      <div className="divider-horizontal" />

      {/* Barra superior sticky A24 en tema clar editorial */}
      <div className="journey-bar">
        <div className="journey-bar__left">
          <span className="journey-bar__kicker">GUIA INTERACTIVA · 18 PASSOS EN MOVIMENT</span>
          <span className="journey-bar__sep">—</span>
          <span className="journey-bar__stage">
            ETAPA {activeStageObj.num}: {activeStageObj.title.toUpperCase()} ({activeStageObj.period})
          </span>
        </div>

        <div className="journey-bar__stages-pills" role="tablist" aria-label="Saltar a etapa">
          {BIO_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => handleStageTabClick(sec)}
              className={`journey-bar__pill ${activeStageId === sec.id ? "is-active" : ""}`}
              title={`Anar a Etapa ${sec.num}: ${sec.title} (${sec.period})`}
            >
              <span>ETAPA {sec.num}</span>
              <span className="journey-bar__pill-name">· {sec.title}</span>
            </button>
          ))}
        </div>

        <span className="journey-bar__progress">
          TRAJECTÒRIA <span data-journey-progress-text>0%</span>
        </span>
      </div>

      {/* Capçalera editorial A24 sobre fons clar */}
      <header className="journey-head">
        <div className="journey-head__title">
          <p className="journey-kicker">03 / LES 5 ETAPES I CRONOLOGIA INTERACTIVA (1956 — 2026)</p>
          <h2>CINC ETAPES, UNA VIDA DE MÚSICA</h2>
        </div>
        <div className="journey-head__intro">
          <p className="journey-lede">
            De la fundació d&apos;Al Tall el 1975 a la revolució d&apos;<em>Orgànic</em>, l&apos;èxit europeu de <em>Katà</em> i l&apos;estrena de <em>Viatger</em>: a mesura que el punter baixa per la guia central, els elements apareixen dinàmicament dels laterals i responen al teu moviment.
          </p>
          <p className="journey-prompt">
            <span className="journey-prompt__dot" aria-hidden="true"></span>
            <strong>FES SCROLL PER VEURE APARÈIXER ELS ELEMENTS DELS COSTATS</strong>
            <span>· POTS ARROSSEGAR I MOURE LLIUREMENT LES IMATGES I TEXTOS (DOBLE CLIC PER CENTRAR)</span>
          </p>
        </div>
      </header>

      <div className="divider-horizontal" />

      {/* Índex de les 5 Grans Etapes com a línia editorial oberta (sense caixes tancades) */}
      <div className="journey-stages-index" role="tablist" aria-label="Les 5 etapes">
        {BIO_SECTIONS.map((sec) => {
          const isCurrent = activeStageId === sec.id;
          return (
            <div
              key={sec.id}
              className={`journey-stage-item ${isCurrent ? "is-active" : ""}`}
              onClick={() => handleStageTabClick(sec)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleStageTabClick(sec);
                }
              }}
            >
              <div className="journey-stage-item__top">
                <span className="journey-stage-item__num">ETAPA {sec.num}</span>
                <span className="journey-stage-item__period">{sec.period}</span>
              </div>
              <h3 className="journey-stage-item__title">{sec.title}</h3>
              <p className="journey-stage-item__sub">{sec.subtitle}</p>
              <p className="journey-stage-item__summary">{sec.summary}</p>
              <div className="journey-stage-item__actions">
                <span className="journey-stage-item__goto">BAIXAR AL PAS ↓</span>
                <button
                  type="button"
                  className="journey-stage-item__read"
                  onClick={(e) => openStageModal(sec.id, e)}
                >
                  DOSSIER ↗
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="divider-horizontal" />

      {/* Escenari del Railway amb Punter Guia i Elements Laterals Dinàmics i Movibles */}
      <div className="journey-stage">
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

        {/* 18 Passos Dinàmics i Movibles: a cada vèrtex del Railway la imatge i el text entren dels laterals amb fade-in, blur i clip-path */}
        <ol className="checkpoint-list">
          {CHECKPOINTS.map((cp) => {
            const isNoteExpanded = !!expandedStepIds[cp.id];
            return (
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

                {/* ELEMENT VISUAL FLOTANT I MOVIBLE (Entra des del lateral amb clip-path, blur i parallax; es pot arrossegar i moure) */}
                <figure
                  className="checkpoint-visual"
                  onClick={(e) => jumpToProgress(cp.progress, e)}
                >
                  <div className="checkpoint-visual__scroll" data-visual-scroll>
                    <div
                      className="checkpoint-visual__movable"
                      data-movable-node
                      title="Arrossega per moure la imatge · Doble clic per centrar"
                    >
                      <div className="checkpoint-visual__drag-hint" aria-hidden="true">
                        <span>✥ MOURE</span>
                        <span>{cp.year}</span>
                      </div>
                      <div className="checkpoint-visual__img-wrap">
                        <img
                          src={cp.media}
                          alt={cp.title}
                          width={520}
                          height={340}
                          loading="lazy"
                          decoding="async"
                          draggable={false}
                        />
                      </div>
                      <figcaption className="checkpoint-visual__caption">
                        <span>{cp.mediaCaption}</span>
                        <span>PAS {cp.stepNum}</span>
                      </figcaption>
                    </div>
                  </div>
                </figure>

                {/* ELEMENT EDITORIAL DE TEXT OBERT I MOVIBLE (Entra des del lateral oposat amb fade-in i revelat per capes) */}
                <div
                  className="checkpoint-editorial"
                  onClick={(e) => jumpToProgress(cp.progress, e)}
                >
                  <div className="checkpoint-editorial__scroll" data-editorial-scroll>
                    <div
                      className="checkpoint-editorial__movable"
                      data-movable-node
                      title="Arrossega per moure el bloc · Doble clic per centrar"
                    >
                      <div className="checkpoint-editorial__meta">
                        <span className="checkpoint-editorial__year">{cp.year}</span>
                        <span className="checkpoint-editorial__badge">{cp.badge}</span>
                        <span className="checkpoint-editorial__drag-pill" aria-hidden="true">
                          ✥ MOVIBLE
                        </span>
                      </div>

                      <div className="checkpoint-editorial__mobile-media">
                        <img
                          src={cp.media}
                          alt={cp.title}
                          width={420}
                          height={270}
                          loading="lazy"
                          decoding="async"
                          draggable={false}
                        />
                      </div>

                      <h3 className="checkpoint-editorial__title">{cp.title}</h3>
                      <p className="checkpoint-editorial__subtitle">{cp.subtitle}</p>

                      <div className="checkpoint-editorial__rule" />

                      <p className="checkpoint-editorial__text">{cp.text}</p>

                      {(isNoteExpanded || cp.isMajorStage) && (
                        <div className="checkpoint-editorial__extended">
                          <p className="checkpoint-editorial__extended-p">{cp.extendedNote}</p>
                          {cp.quote && (
                            <blockquote className="checkpoint-editorial__quote">
                              “{cp.quote}”
                            </blockquote>
                          )}
                        </div>
                      )}

                      <div className="checkpoint-editorial__tags">
                        {cp.tags.map((tag) => (
                          <span key={tag} className="checkpoint-editorial__tag">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="checkpoint-editorial__actions">
                        {!cp.isMajorStage && (
                          <button
                            type="button"
                            className="checkpoint-editorial__btn"
                            onClick={(e) => toggleStepNote(cp.id, e)}
                          >
                            {isNoteExpanded ? "MENYS DETALL −" : "AMPLIAR HISTÒRIA +"}
                          </button>
                        )}

                        <button
                          type="button"
                          className="checkpoint-editorial__link"
                          onClick={(e) => openStageModal(cp.stageId, e)}
                        >
                          LLEGIR CAPÍTOL {cp.stageNum} COMPLET ↗
                        </button>

                        {cp.albumLink && (
                          <Link
                            href={cp.albumLink.href}
                            className="checkpoint-editorial__album"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {cp.albumLink.label}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
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

      {/* MODAL EDITORIAL A24 DE CRÒNICA COMPLETA DE L'ETAPA */}
      {modalSection && (
        <div
          className="journey-modal-backdrop"
          onClick={() => setModalSection(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="journey-modal-title"
        >
          <div
            className="journey-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="journey-modal__top">
              <div className="journey-modal__meta">
                <span className="subheading-xs">
                  DOSSIER BIOGRÀFIC · ETAPA {modalSection.num} ({modalSection.period})
                </span>
              </div>
              <button
                type="button"
                className="journey-modal__close"
                onClick={() => setModalSection(null)}
                aria-label="Tancar crònica"
              >
                TANCAR [ESC] ✕
              </button>
            </div>

            <div className="journey-modal__scroll">
              <div className="journey-modal__header">
                <span className="subheading-xs">{modalSection.subtitle}</span>
                <h2 id="journey-modal-title" className="heading-m">
                  {modalSection.num}. {modalSection.title}
                </h2>
              </div>

              <div className="journey-modal__grid">
                <div className="journey-modal__media-col">
                  <figure className="journey-modal__figure">
                    <img
                      src={modalSection.image}
                      alt={modalSection.imageAlt}
                      className="journey-modal__img"
                    />
                  </figure>
                  <div className="journey-modal__caption">
                    <span className="subheading-xs">{modalSection.imageAlt}</span>
                    <span className="subheading-xs">{modalSection.period}</span>
                  </div>

                  {modalSection.quote && (
                    <blockquote className="journey-modal__quote">
                      “{modalSection.quote}”
                    </blockquote>
                  )}

                  <div className="journey-modal__tags">
                    {modalSection.tags.map((tag) => (
                      <span key={tag} className="journey-modal__tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="journey-modal__text-col">
                  <p className="paragraph-xl" style={{ margin: 0 }}>
                    {modalSection.summary}
                  </p>

                  <div className="divider-local" />

                  <div className="journey-modal__paragraphs">
                    {modalSection.paragraphs.map((p, i) => (
                      <p key={i} className="paragraph-l" style={{ margin: 0 }}>
                        {p}
                      </p>
                    ))}
                  </div>

                  {modalSection.keyMilestones.length > 0 && (
                    <div className="journey-modal__milestones">
                      <span className="subheading-xs">
                        FITES CLAU DE L&apos;ETAPA ({modalSection.period})
                      </span>
                      {modalSection.keyMilestones.map((m, idx) => (
                        <div key={idx} className="journey-modal__milestone-row">
                          <span className="journey-modal__milestone-year">{m.year}</span>
                          <span className="paragraph-m">{m.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="journey-modal__footer">
                {BIO_SECTIONS.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setModalSection(sec)}
                    className={`journey-modal__stage-switch ${
                      modalSection.id === sec.id ? "is-active" : ""
                    }`}
                  >
                    <span className="subheading-xs">ETAPA {sec.num}</span>
                    <span className="journey-modal__stage-switch-title">{sec.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
