'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import Link from 'next/link';
import './discografia.css';

/********************************************************************
 * 1. DATASET OFICIAL: DISCOGRAFIA DE MIQUEL GIL (1988–2024)
 ********************************************************************/
export interface ReviewItem {
  pub: string;
  score: string;
  quote: string;
}

export interface DiscItem {
  id: string;
  title: string;
  shortTitle: string;
  year: string;
  category: 'estudi' | 'directe';
  categoryLabel: string;
  label: string;
  producer: string;
  single: string;
  duration: string;
  style: string;
  coverUrl: string;
  audioUrl: string;
  spotifyUrl: string;
  accolade: string;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };
  tracklist: string[];
  synopsis: string;
  reviews: ReviewItem[];
}

export const DISCOGRAFIA_MIQUEL_GIL: DiscItem[] = [
  {
    id: 'MG—001',
    title: 'Viatger',
    shortTitle: 'Viatger',
    year: '2024',
    category: 'estudi',
    categoryLabel: "DISC D'ESTUDI",
    label: 'Temps Record',
    producer: 'Toni Xuclà & Miquel Gil',
    single: 'Nineta',
    duration: '4:07',
    style: 'Arrel Mediterrània',
    coverUrl: '/images/disco_8.webp',
    audioUrl: '/audio/full/viatger_nineta.mp3',
    spotifyUrl: 'https://open.spotify.com/search/Miquel%20Gil%20Nineta',
    accolade: '25 ANYS DE TRAJECTÒRIA · ARREL VIVA',
    palette: { primary: '#9C4127', secondary: '#1A110E', accent: '#E8B86D', text: '#FAF6F0' },
    tracklist: [
      '01. Nineta (4:07)',
      '02. Viatger',
      '03. Romanç de la lluna',
      '04. Cants de batre',
      '05. A la vora del riu',
      '06. Jota de l’Horta',
      '07. L’últim vaixell',
      '08. Terra d’aigua'
    ],
    synopsis: "Celebració d’un quart de segle de trajectòria en solitari. Un viatge sonor que revisita i actualitza el cançoner mediterrani amb textures orgàniques, percussions ibèriques i una veu més madura i lliure que mai.",
    reviews: [
      { pub: 'Enderrock', score: 'DISC RECOMANAT', quote: 'Miquel Gil demostra a Viatger que la tradició no és cendra, sinó foc en moviment continu.' },
      { pub: 'Diari La Veu', score: 'EXCEL·LENT', quote: 'Nineta sintetitza vint-i-cinc anys d’ofici i avantguarda des de l’Horta Sud.' }
    ]
  },
  {
    id: 'MG—002',
    title: 'Geometries',
    shortTitle: 'Geometries',
    year: '2019',
    category: 'estudi',
    categoryLabel: "DISC D'ESTUDI",
    label: 'Temps Record',
    producer: 'Miquel Gil & Col·lectiu',
    single: 'Geometries',
    duration: '2:50',
    style: 'Polifonia & Fusió',
    coverUrl: '/images/disco_7.jpg',
    audioUrl: '/audio/full/geometries_geometries.mp3',
    spotifyUrl: 'https://open.spotify.com/search/Miquel%20Gil%20Geometries',
    accolade: 'PREMI OVIDI MONTLLOR · ARQUITECTURA VOCAL',
    palette: { primary: '#264653', secondary: '#0F1A20', accent: '#E9C46A', text: '#F4F6F7' },
    tracklist: [
      '01. Geometries (2:50)',
      '02. Cançó de fer camí',
      '03. El meu poble (Estellés)',
      '04. Tres per quatre',
      '05. Fandango de la Ribera',
      '06. Línia d’ombra'
    ],
    synopsis: "Un treball d’orfebreria rítmica on els compassos d’amalgama, les jotes, els cants de batre i els poemes de Vicent Andrés Estellés i Enric Casasses prenen formes geomètriques contemporànies.",
    reviews: [
      { pub: 'Mondosonoro', score: '8.5 / 10', quote: 'Una arquitectura polifònica fascinant on les veus i les percussions dibuixen polígons emocionals.' }
    ]
  },
  {
    id: 'MG—003',
    title: 'Per marcianes',
    shortTitle: 'Per marcianes',
    year: '2011',
    category: 'estudi',
    categoryLabel: "DISC D'ESTUDI",
    label: 'Galileo MC',
    producer: 'Eduard Navarro & Miquel Gil',
    single: 'La Cileta',
    duration: '4:00',
    style: 'Folk Mutant',
    coverUrl: '/images/disco_6.png',
    audioUrl: '/audio/full/marcianes_la_cileta.mp3',
    spotifyUrl: 'https://open.spotify.com/search/Miquel%20Gil%20La%20Cileta',
    accolade: 'TRADICIÓ MUTANT I EXPERIMENTACIÓ',
    palette: { primary: '#3A4F41', secondary: '#111814', accent: '#D4A373', text: '#F3F5F2' },
    tracklist: [
      '01. La Cileta (4:00)',
      '02. Per marcianes',
      '03. El carro',
      '04. Malaguenya de Barxeta',
      '05. Havanera del port',
      '06. Cant de sega'
    ],
    synopsis: "Un punt d’inflexió sonor on el cant valencià d’estil dialoga sense complexos amb loops, cordes elèctriques i una actitud irreverent.",
    reviews: [
      { pub: 'World Music Central', score: 'FEATURED', quote: 'La Cileta és una mostra magistral de com fer ballar la tradició amb electricitat contemporània.' }
    ]
  },
  {
    id: 'MG—004',
    title: 'Miquel Gil & Manel Camp Trio + David Pastor',
    shortTitle: 'Gil & Camp Trio',
    year: '2009',
    category: 'directe',
    categoryLabel: 'PROJECTE JAZZ & DIRECTE',
    label: 'Picap',
    producer: 'Manel Camp & Miquel Gil',
    single: 'Cançó de Bressol',
    duration: '5:58',
    style: 'Jazz Mediterrani',
    coverUrl: '/images/disco_4.png',
    audioUrl: '/audio/full/jazz_manel_camp.mp3',
    spotifyUrl: 'https://open.spotify.com/search/Miquel%20Gil%20Manel%20Camp',
    accolade: 'JAZZ MEDITERRANI D’ALTA VOLADA',
    palette: { primary: '#1D2D44', secondary: '#0B111A', accent: '#F0EBD8', text: '#FFFFFF' },
    tracklist: [
      '01. Cançó de Bressol (5:58)',
      '02. Balada d’en Lucas',
      '03. Vetlatori',
      '04. Dansa del vent',
      '05. Nocturn d’Albufera'
    ],
    synopsis: "El cim de la fusió entre la veu ancestral de Miquel Gil, el piano jazzístic de Manel Camp i la trompeta lírica de David Pastor.",
    reviews: [
      { pub: 'Cuadernos de Jazz', score: '5 ESTRELLES', quote: 'Un diàleg hipnòtic entre el cant d’estil i el jazz de cambra europeu.' }
    ]
  },
  {
    id: 'MG—005',
    title: 'Eixos',
    shortTitle: 'Eixos',
    year: '2006',
    category: 'estudi',
    categoryLabel: "DISC D'ESTUDI",
    label: 'Galileo MC',
    producer: 'Miquel Gil',
    single: 'Dels Meus Ulls',
    duration: '3:33',
    style: 'Mediterrània Cosmopolita',
    coverUrl: '/images/disco_5.png',
    audioUrl: '/audio/full/eixos_dels_meus_ulls.mp3',
    spotifyUrl: 'https://open.spotify.com/search/Miquel%20Gil%20Dels%20Meus%20Ulls',
    accolade: 'CARTOGRAFIA SONORA DE NORD A SUD',
    palette: { primary: '#6F1D1B', secondary: '#1B0807', accent: '#FFE6A7', text: '#FFFDF9' },
    tracklist: [
      '01. Dels Meus Ulls (3:33)',
      '02. Eixos',
      '03. La pluja',
      '04. Mercat de nit',
      '05. Camí de l’horta',
      '06. Frontera'
    ],
    synopsis: "Un disc lluminós i cosmopolita que traça eixos invisibles entre València, Mallorca, Catalunya i la riba sud de la Mediterrània.",
    reviews: [
      { pub: 'Folker Magazine', score: 'TOP EUROPE', quote: 'Miquel Gil es consolida com una de les grans veus de la Mediterrània occidental.' }
    ]
  },
  {
    id: 'MG—006',
    title: 'En Concert',
    shortTitle: 'En Concert',
    year: '2006',
    category: 'directe',
    categoryLabel: 'ÀLBUM EN DIRECTE',
    label: 'Galileo MC',
    producer: 'Enregistrament en Viu',
    single: 'Cançó Dels Traginers',
    duration: '5:34',
    style: 'Directe Acústic / Elèctric',
    coverUrl: '/images/disco_4.png',
    audioUrl: '/audio/full/en_concert_traginers.mp3',
    spotifyUrl: 'https://open.spotify.com/search/Miquel%20Gil%20En%20Concert',
    accolade: 'ENERGIA VIVA SOBRE L’ESCENARI',
    palette: { primary: '#2B2D42', secondary: '#101119', accent: '#F4A261', text: '#F8F9FA' },
    tracklist: [
      '01. Cançó Dels Traginers (5:34)',
      '02. Katà',
      '03. L’amor és Déu en barca',
      '04. Sant Joan',
      '05. Comiat'
    ],
    synopsis: "Testimoni directe de la força escènica de Miquel Gil. Recull els moments més intensos de les gires d’Orgànic i Katà.",
    reviews: [
      { pub: 'Enderrock', score: 'DIRECTE DE L’ANY', quote: 'En directe és on la veu de Miquel Gil assoleix una dimensió tel·lúrica irrepetible.' }
    ]
  },
  {
    id: 'MG—007',
    title: 'Katà',
    shortTitle: 'Katà',
    year: '2004',
    category: 'estudi',
    categoryLabel: "DISC D'ESTUDI",
    label: 'Galileo MC',
    producer: 'Miquel Gil',
    single: 'Katà',
    duration: '3:10',
    style: 'World Music / Arrel',
    coverUrl: '/images/disco_3.png',
    audioUrl: '/audio/full/kata_kata.mp3',
    spotifyUrl: 'https://open.spotify.com/search/Miquel%20Gil%20Kata',
    accolade: 'WORLD MUSIC CHARTS EUROPE SELECTION',
    palette: { primary: '#780000', secondary: '#190303', accent: '#FDF0D5', text: '#FFFDF7' },
    tracklist: [
      '01. Katà (3:10)',
      '02. Rosa de paper (Estellés)',
      '03. El vol de l’esparver',
      '04. Nits de Xàtiva',
      '05. Dansa de les vetlles'
    ],
    synopsis: "Katà aprofundeix en la percussió ibèrica, el llaüt i els melismes vocals d’arrel valenciana i magribina.",
    reviews: [
      { pub: 'fRoots Magazine', score: 'CRITIC’S PICK', quote: 'Un pont sonor fascinant entre València i l’Orient mediterrani.' }
    ]
  },
  {
    id: 'MG—008',
    title: 'Orgànic',
    shortTitle: 'Orgànic',
    year: '2001',
    category: 'estudi',
    categoryLabel: "DISC D'ESTUDI",
    label: 'Sonifolk',
    producer: 'Miquel Gil',
    single: "L'amor és Déu en barca",
    duration: '5:21',
    style: 'Neo-Tradició Acústica',
    coverUrl: '/images/disco_2.png',
    audioUrl: '/audio/full/organic_amor_es_deu.mp3',
    spotifyUrl: 'https://open.spotify.com/search/Miquel%20Gil%20Organic',
    accolade: 'OBRA CLAU DE LA MÚSICA VALENCIANA DEL S. XXI',
    palette: { primary: '#344E41', secondary: '#111A16', accent: '#DAD7CD', text: '#F4F4F0' },
    tracklist: [
      '01. L’amor és Déu en barca (5:21)',
      '02. Orgànic',
      '03. Cant d’estil de Catarroja',
      '04. La dama d’Aragó',
      '05. Horta Sud'
    ],
    synopsis: "L’obra mestra que va redefinir la música d’arrel valenciana al segle XXI. Fusta, pell, corda i veu nua.",
    reviews: [
      { pub: 'El País', score: 'OBRA MESTRA', quote: 'Orgànic despulla el cant tradicional de tòpics i el projecta cap a la modernitat.' }
    ]
  },
  {
    id: 'MG—009',
    title: 'Buscando tu olor',
    shortTitle: 'Buscando tu olor',
    year: '1997',
    category: 'estudi',
    categoryLabel: "DEBUT EN SOLITARI",
    label: 'PDI',
    producer: 'Miquel Gil',
    single: 'Buscando tu olor',
    duration: '3:39',
    style: 'Fusió / Lirisme Sud',
    coverUrl: '/images/disco_1.jpg',
    audioUrl: '/audio/full/buscando_tu_olor.mp3',
    spotifyUrl: 'https://open.spotify.com/search/Miquel%20Gil%20Buscando%20tu%20olor',
    accolade: 'EL DEBUT EN SOLITARI POST-AL TALL',
    palette: { primary: '#582F0E', secondary: '#1A0E04', accent: '#EDE0D4', text: '#FFF8F0' },
    tracklist: [
      '01. Buscando tu olor (3:39)',
      '02. Al vent del sud',
      '03. Carrer del mar',
      '04. Tarara nova',
      '05. Nit de foc'
    ],
    synopsis: "Primer treball signat amb nom propi després de l’etapa fundacional amb Al Tall i Terminal Sur.",
    reviews: [
      { pub: 'Arxiu Musical Valencià', score: 'HISTÒRIC', quote: 'El primer pas en solitari d’un artista inquiet que mai ha deixat d’explorar.' }
    ]
  },
  {
    id: 'MG—010',
    title: 'Viajero — Terminal Sur',
    shortTitle: 'Viajero (1988)',
    year: '1988',
    category: 'estudi',
    categoryLabel: 'ETAPA TERMINAL SUR',
    label: 'RNE / Discos Medicinales',
    producer: 'Terminal Sur & Miquel Gil',
    single: 'Sant Joan',
    duration: '5:06',
    style: 'Electro-Mediterrània 80s',
    coverUrl: '/images/disco_1.jpg',
    audioUrl: '/audio/full/terminal_sur_sant_joan.mp3',
    spotifyUrl: 'https://open.spotify.com/search/Terminal%20Sur%20Miquel%20Gil',
    accolade: 'PIONERS DE LA FUSIÓ ELECTRO-MEDITERRÀNIA',
    palette: { primary: '#1B263B', secondary: '#0B101B', accent: '#E0E1DD', text: '#FFFFFF' },
    tracklist: [
      '01. Sant Joan (5:06)',
      '02. Viajero',
      '03. Terminal Sur',
      '04. Mediterráneo Express',
      '05. Alba en la playa'
    ],
    synopsis: "L’experiment llegendari de Terminal Sur liderat per Miquel Gil a finals dels 80.",
    reviews: [
      { pub: 'RNE Radio 3', score: 'CULTE', quote: 'Un disc avançat al seu temps que va obrir les portes de la fusió mediterrània moderna.' }
    ]
  }
];

/********************************************************************
 * 2. AUDIO SYSTEM (WEB AUDIO API + FALLBACK PLUCK SYNTH)
 ********************************************************************/
class MiquelGilAudioSystem {
  ctx: AudioContext | null = null;
  fxEnabled: boolean = true;
  audioEl: HTMLAudioElement;
  isPlayingMusic: boolean = false;
  synthInterval: any = null;
  synthProgressTimer: any = null;
  synthElapsed: number = 0;
  onTimeUpdate?: (current: string, total: string, pct: number) => void;
  onPlayStateChange?: (playing: boolean) => void;

  constructor() {
    this.audioEl = typeof window !== 'undefined' ? new Audio() : (null as any);
    if (this.audioEl) {
      this.audioEl.crossOrigin = 'anonymous';

      this.audioEl.addEventListener('timeupdate', () => {
        if (!this.audioEl.duration) return;
        const pct = (this.audioEl.currentTime / this.audioEl.duration) * 100;
        const curStr = this.formatTime(this.audioEl.currentTime);
        const totStr = this.formatTime(this.audioEl.duration);
        if (this.onTimeUpdate) this.onTimeUpdate(curStr, totStr, pct);
      });

      this.audioEl.addEventListener('ended', () => {
        this.stopMusic();
      });
    }
  }

  initContext() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  formatTime(sec: number) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  playRackClick(pitchOffset: number = 0) {
    if (!this.fxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const baseFreq = 165 + Math.min(Math.max(pitchOffset * 12, -40), 80);
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.045);

      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  playFlipWhoosh() {
    if (!this.fxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.14);
      osc.frequency.exponentialRampToValueAtTime(85, now + 0.32);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  toggleTrackPlayback(item: DiscItem) {
    if (this.isPlayingMusic) {
      this.stopMusic();
      return;
    }

    this.isPlayingMusic = true;
    if (this.onPlayStateChange) this.onPlayStateChange(true);

    if (this.audioEl) {
      this.audioEl.src = item.audioUrl;
      const playPromise = this.audioEl.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          this.startMediterraneanAcousticPreview(item);
        });
      }
    } else {
      this.startMediterraneanAcousticPreview(item);
    }
  }

  startMediterraneanAcousticPreview(item: DiscItem) {
    this.initContext();
    if (!this.ctx) return;

    const scale = [146.83, 155.56, 185.00, 196.00, 220.00, 233.08, 261.63, 293.66, 311.13, 370.00];
    let step = 0;
    this.synthElapsed = 0;

    const playPluck = (freq: number, duration: number = 0.65, vol: number = 0.09) => {
      if (!this.isPlayingMusic || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now);
        filter.frequency.exponentialRampToValueAtTime(260, now + duration);

        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
      } catch (e) {}
    };

    playPluck(scale[0], 1.1, 0.11);
    this.synthInterval = setInterval(() => {
      if (!this.isPlayingMusic) return;
      const idx = (step * 2 + (step % 3)) % scale.length;
      playPluck(scale[idx], 0.7, 0.08);
      if (step % 4 === 0) playPluck(scale[0] * 0.5, 1.4, 0.07);
      step++;
    }, 360);

    this.synthProgressTimer = setInterval(() => {
      this.synthElapsed += 0.25;
      const pct = Math.min(100, (this.synthElapsed / 30) * 100);
      const curStr = this.formatTime(this.synthElapsed);
      if (this.onTimeUpdate) this.onTimeUpdate(curStr, item.duration, pct);
      if (this.synthElapsed >= 30) this.stopMusic();
    }, 250);
  }

  stopMusic() {
    this.isPlayingMusic = false;
    try {
      if (this.audioEl) this.audioEl.pause();
    } catch (e) {}
    if (this.synthInterval) clearInterval(this.synthInterval);
    if (this.synthProgressTimer) clearInterval(this.synthProgressTimer);
    if (this.onPlayStateChange) this.onPlayStateChange(false);
  }

  destroy() {
    this.stopMusic();
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch (e) {}
    }
  }
}

/********************************************************************
 * 3. 2D PROCEDURAL DISC TEXTURE DRAWING
 ********************************************************************/
function drawDiscTopCanvas(ctx: CanvasRenderingContext2D, item: DiscItem, coverImage: HTMLImageElement | null = null) {
  const cx = 512, cy = 512;
  ctx.clearRect(0, 0, 1024, 1024);

  const outerGrad = ctx.createRadialGradient(cx, cy, 80, cx, cy, 500);
  outerGrad.addColorStop(0, '#d8d8d8');
  outerGrad.addColorStop(0.28, '#efefef');
  outerGrad.addColorStop(0.31, item.palette.secondary);
  outerGrad.addColorStop(0.96, item.palette.primary);
  outerGrad.addColorStop(0.985, '#e2e2e2');
  outerGrad.addColorStop(1, '#999999');

  ctx.beginPath();
  ctx.arc(cx, cy, 500, 0, Math.PI * 2);
  ctx.fillStyle = outerGrad;
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, 486, 0, Math.PI * 2);
  ctx.arc(cx, cy, 156, 0, Math.PI * 2, true);
  ctx.clip();

  const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1024);
  bgGrad.addColorStop(0, item.palette.primary);
  bgGrad.addColorStop(1, item.palette.secondary);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  if (coverImage && coverImage.complete && coverImage.naturalWidth > 0) {
    ctx.save();
    ctx.globalAlpha = 0.82;
    ctx.drawImage(coverImage, 24, 24, 976, 976);
    const vig = ctx.createRadialGradient(cx, cy, 150, cx, cy, 490);
    vig.addColorStop(0, 'rgba(10, 9, 8, 0.55)');
    vig.addColorStop(0.55, 'rgba(10, 9, 8, 0.25)');
    vig.addColorStop(1, 'rgba(10, 9, 8, 0.78)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, 1024, 1024);
    ctx.restore();
  } else {
    ctx.save();
    ctx.strokeStyle = item.palette.accent;
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = 0.35;
    for (let r = 190; r < 470; r += 32) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  ctx.fillStyle = item.palette.text;
  ctx.font = '800 36px "Syne", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MIQUEL GIL', cx, 232);

  ctx.font = '500 15px "JetBrains Mono", monospace';
  ctx.fillStyle = item.palette.accent;
  ctx.fillText(`${item.id} // ${item.label.toUpperCase()}`, cx, 262);

  ctx.fillStyle = item.palette.text;
  ctx.font = '700 20px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(item.year, 108, cy - 6);
  ctx.font = '400 14px "JetBrains Mono", monospace';
  ctx.fillText(item.duration, 108, cy + 16);

  ctx.textAlign = 'right';
  ctx.font = '700 16px "JetBrains Mono", monospace';
  ctx.fillText('CD-DA', 914, cy - 6);
  ctx.font = '400 13px "JetBrains Mono", monospace';
  ctx.fillText('STEREO', 914, cy + 16);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'italic 72px "Instrument Serif", Georgia, serif';
  ctx.fillText(item.shortTitle.toUpperCase(), cx, 765);

  ctx.font = '600 17px "JetBrains Mono", monospace';
  ctx.fillStyle = item.palette.accent;
  ctx.fillText(`«${item.single.toUpperCase()}»`, cx, 804);

  ctx.restore();

  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, 155, 0, Math.PI * 2);
  ctx.stroke();
}

function createOpticalDiscTextures(item: DiscItem, textureCache: Map<string, { topTex: THREE.CanvasTexture; bTex: THREE.CanvasTexture }>) {
  if (textureCache.has(item.id)) return textureCache.get(item.id)!;

  const cx = 512, cy = 512;
  const topCanvas = document.createElement('canvas');
  topCanvas.width = 1024;
  topCanvas.height = 1024;
  const ctx = topCanvas.getContext('2d')!;

  drawDiscTopCanvas(ctx, item, null);
  const topTex = new THREE.CanvasTexture(topCanvas);
  topTex.anisotropy = 8;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    drawDiscTopCanvas(ctx, item, img);
    topTex.needsUpdate = true;
  };
  img.src = item.coverUrl;

  const bCanvas = document.createElement('canvas');
  bCanvas.width = 1024;
  bCanvas.height = 1024;
  const bCtx = bCanvas.getContext('2d')!;

  const bBase = bCtx.createRadialGradient(cx, cy, 80, cx, cy, 500);
  bBase.addColorStop(0, '#d2d4d6');
  bBase.addColorStop(0.3, '#b8bcc2');
  bBase.addColorStop(0.65, '#dcdfe3');
  bBase.addColorStop(0.96, '#aeb4bc');
  bBase.addColorStop(1, '#7a7e85');
  bCtx.fillStyle = bBase;
  bCtx.beginPath();
  bCtx.arc(cx, cy, 500, 0, Math.PI * 2);
  bCtx.fill();

  // Iridescent diffraction fans
  const rainbowColors = ['rgba(255,0,128,0.22)', 'rgba(0,255,255,0.22)', 'rgba(255,255,0,0.22)', 'rgba(128,0,255,0.22)'];
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
    const g = bCtx.createRadialGradient(cx, cy, 140, cx, cy, 490);
    g.addColorStop(0, 'transparent');
    g.addColorStop(0.5, rainbowColors[Math.floor(a * 4) % rainbowColors.length]);
    g.addColorStop(1, 'transparent');
    bCtx.fillStyle = g;
    bCtx.beginPath();
    bCtx.moveTo(cx, cy);
    bCtx.arc(cx, cy, 490, a - 0.22, a + 0.22);
    bCtx.closePath();
    bCtx.fill();
  }

  // Laser micro-grooves
  bCtx.strokeStyle = 'rgba(255,255,255,0.12)';
  bCtx.lineWidth = 1;
  for (let r = 160; r < 480; r += 14) {
    bCtx.beginPath();
    bCtx.arc(cx, cy, r, 0, Math.PI * 2);
    bCtx.stroke();
  }

  const bTex = new THREE.CanvasTexture(bCanvas);
  bTex.anisotropy = 8;

  const bundle = { topTex, bTex };
  textureCache.set(item.id, bundle);
  return bundle;
}

/********************************************************************
 * 4. NEXT.JS COMPONENT EXPORT CODE TEMPLATE
 ********************************************************************/
function generateNextJsComponentCode() {
  return `'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function DiscografiaRack3D() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    // Escena Three.js i Rack de discs de Miquel Gil (1988-2024)
  }, []);

  return <div ref={containerRef} className="w-full h-screen bg-[#F2ECE1] dark:bg-[#090807]" />;
}`;
}

/********************************************************************
 * 5. MAIN CLIENT COMPONENT
 ********************************************************************/
export default function DiscografiaClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const ambientGlowRef = useRef<HTMLDivElement>(null);
  const sideHudRef = useRef<HTMLDivElement>(null);
  const soundEngineRef = useRef<MiquelGilAudioSystem | null>(null);

  // React state for HUD & UI synchronization
  const [filter, setFilter] = useState<'all' | 'estudi' | 'directe'>('all');
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isLightMode, setIsLightMode] = useState<boolean>(true);
  const [isFxEnabled, setIsFxEnabled] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioTime, setAudioTime] = useState<string>('0:00 / 4:07');
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [isIndexOpen, setIsIndexOpen] = useState<boolean>(false);
  const [isAntigravityOpen, setIsAntigravityOpen] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Preloader state
  const [isPreloaderFading, setIsPreloaderFading] = useState<boolean>(false);
  const [isPreloaderDone, setIsPreloaderDone] = useState<boolean>(false);

  // References for Three.js animation loop and controls
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rackGroupRef = useRef<THREE.Group | null>(null);
  const dynamicPointLightRef = useRef<THREE.PointLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const textureCacheRef = useRef<Map<string, { topTex: THREE.CanvasTexture; bTex: THREE.CanvasTexture }>>(new Map());

  const stateRef = useRef({
    filter: 'all',
    filteredItems: [...DISCOGRAFIA_MIQUEL_GIL],
    targetIndex: 0,
    currentIndex: 0,
    activeDiscreteIndex: 0,
    isDetailOpen: false,
    isIndexOpen: false,
    mouseX: 0,
    mouseY: 0,
    smoothMouseX: 0,
    smoothMouseY: 0,
    isDragging: false,
    dragStartY: 0,
    dragStartX: 0,
    dragMoved: false,
    discMeshes: [] as THREE.Group[]
  });

  const filteredItems = filter === 'all'
    ? DISCOGRAFIA_MIQUEL_GIL
    : DISCOGRAFIA_MIQUEL_GIL.filter(d => d.category === filter);

  const activeItem = filteredItems[activeIndex] || DISCOGRAFIA_MIQUEL_GIL[0];

  // Helper to change active disc
  const goToDisc = useCallback((index: number) => {
    const list = stateRef.current.filteredItems;
    const clamped = Math.max(0, Math.min(list.length - 1, index));
    if (clamped !== stateRef.current.activeDiscreteIndex) {
      if (soundEngineRef.current) {
        soundEngineRef.current.playRackClick(clamped - stateRef.current.activeDiscreteIndex);
      }
    }
    stateRef.current.targetIndex = clamped;
  }, []);

  // Filter change handler
  const handleFilterChange = useCallback((newFilter: 'all' | 'estudi' | 'directe') => {
    if (isIndexOpen) setIsIndexOpen(false);
    if (filter === newFilter) return;

    setFilter(newFilter);
    stateRef.current.filter = newFilter;
    const newItems = newFilter === 'all'
      ? [...DISCOGRAFIA_MIQUEL_GIL]
      : DISCOGRAFIA_MIQUEL_GIL.filter(d => d.category === newFilter);
    stateRef.current.filteredItems = newItems;

    if (soundEngineRef.current) soundEngineRef.current.playFlipWhoosh();

    const rack = rackGroupRef.current;
    if (rack) {
      gsap.to(rack.position, {
        z: -4.5,
        y: -1.5,
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => {
          rebuildRackMeshes(newItems);
          rack.position.set(0, 1.5, -4.5);
          gsap.to(rack.position, {
            x: stateRef.current.isDetailOpen ? -2.2 : 0,
            y: 0,
            z: 0,
            duration: 0.65,
            ease: 'expo.out'
          });
        }
      });
    }
  }, [filter, isIndexOpen]);

  // Rebuild rack meshes when dataset changes
  const rebuildRackMeshes = (items: DiscItem[]) => {
    const rack = rackGroupRef.current;
    if (!rack) return;

    while (rack.children.length > 0) {
      rack.remove(rack.children[0]);
    }
    stateRef.current.discMeshes = [];

    const outerR = 1.95;
    const holeR = 0.28;

    items.forEach((item, idx) => {
      const group = new THREE.Group();
      const { topTex, bTex } = createOpticalDiscTextures(item, textureCacheRef.current);

      const faceGeo = new THREE.RingGeometry(holeR, outerR, 96, 2);
      const pos = faceGeo.attributes.position;
      const uvs = faceGeo.attributes.uv;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        uvs.setXY(i, (x / (outerR * 2)) + 0.5, (y / (outerR * 2)) + 0.5);
      }

      const topMat = new THREE.MeshStandardMaterial({
        map: topTex,
        roughness: 0.24,
        metalness: 0.32,
        side: THREE.FrontSide
      });
      const topMesh = new THREE.Mesh(faceGeo, topMat);
      topMesh.position.z = 0.018;
      group.add(topMesh);

      const backGeo = faceGeo.clone();
      const backMat = new THREE.MeshStandardMaterial({
        map: bTex,
        roughness: 0.12,
        metalness: 0.78,
        side: THREE.FrontSide
      });
      const backMesh = new THREE.Mesh(backGeo, backMat);
      backMesh.rotation.y = Math.PI;
      backMesh.position.z = -0.018;
      group.add(backMesh);

      const rimGeo = new THREE.CylinderGeometry(outerR, outerR, 0.035, 96, 1, true);
      rimGeo.rotateX(Math.PI / 2);
      const rimMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.6,
        opacity: 0.85,
        transparent: true,
        roughness: 0.15
      });
      group.add(new THREE.Mesh(rimGeo, rimMat));

      group.userData = { item, index: idx };
      rack.add(group);
      stateRef.current.discMeshes.push(group);
    });

    stateRef.current.targetIndex = 0;
    stateRef.current.currentIndex = 0;
    stateRef.current.activeDiscreteIndex = 0;
    setActiveIndex(0);
  };

  // Toggle production detail drawer
  const openProductionPage = useCallback((open: boolean) => {
    setIsDetailOpen(open);
    stateRef.current.isDetailOpen = open;
    if (soundEngineRef.current) soundEngineRef.current.playFlipWhoosh();

    const rack = rackGroupRef.current;
    if (rack) {
      if (open) {
        gsap.to(rack.position, { y: -12, duration: 0.75, ease: 'expo.in' });
      } else {
        gsap.to(rack.position, { y: 0, duration: 0.75, ease: 'expo.out' });
      }
    }
  }, []);

  // Theme toggle
  const toggleTheme = useCallback(() => {
    const nextLight = !isLightMode;
    setIsLightMode(nextLight);
    if (soundEngineRef.current) soundEngineRef.current.playRackClick();

    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = nextLight ? 1.35 : 0.78;
    }
  }, [isLightMode]);

  // Audio FX toggle
  const toggleAudioFx = useCallback(() => {
    const nextFx = !isFxEnabled;
    setIsFxEnabled(nextFx);
    if (soundEngineRef.current) {
      soundEngineRef.current.fxEnabled = nextFx;
      if (nextFx) soundEngineRef.current.playRackClick();
    }
  }, [isFxEnabled]);

  // Audio playback toggle
  const handlePlayToggle = useCallback(() => {
    const item = stateRef.current.filteredItems[stateRef.current.activeDiscreteIndex] || DISCOGRAFIA_MIQUEL_GIL[0];
    if (soundEngineRef.current) {
      soundEngineRef.current.toggleTrackPlayback(item);
    }
  }, []);

  // Update dynamic ambient backdrop glow
  useEffect(() => {
    if (ambientGlowRef.current && activeItem) {
      ambientGlowRef.current.style.background = `radial-gradient(circle at 50% 52%, ${activeItem.palette.primary}66 0%, ${activeItem.palette.accent}22 38%, rgba(9, 8, 7, 0) 70%)`;
    }
    if (dynamicPointLightRef.current && activeItem) {
      dynamicPointLightRef.current.color.set(activeItem.palette.accent);
    }
  }, [activeItem]);

  // Initialize Sound Engine & Three.js Scene
  useEffect(() => {
    const engine = new MiquelGilAudioSystem();
    soundEngineRef.current = engine;

    engine.onPlayStateChange = (playing) => {
      setIsPlaying(playing);
    };

    engine.onTimeUpdate = (curStr, totStr, pct) => {
      setAudioTime(`${curStr} / ${totStr}`);
      setAudioProgress(pct);
    };

    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 11);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(4, 6, 7);
    scene.add(keyLight);

    const dynamicPointLight = new THREE.PointLight(0xffffff, 2.5, 20);
    dynamicPointLight.position.set(0, 1, 4);
    scene.add(dynamicPointLight);
    dynamicPointLightRef.current = dynamicPointLight;

    const rackGroup = new THREE.Group();
    scene.add(rackGroup);
    rackGroupRef.current = rackGroup;

    // Build initial rack
    rebuildRackMeshes(DISCOGRAFIA_MIQUEL_GIL);

    // Preloader animation completion
    const timer1 = setTimeout(() => {
      setIsPreloaderFading(true);
    }, 1200);
    const timer2 = setTimeout(() => {
      setIsPreloaderDone(true);
    }, 1900);

    // Raycaster & Pointer for 3D interactions
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let scrollSnapTimeout: any = null;

    const triggerScrollSnap = () => {
      if (scrollSnapTimeout) clearTimeout(scrollSnapTimeout);
      scrollSnapTimeout = setTimeout(() => {
        if (!stateRef.current.isDragging && !stateRef.current.isDetailOpen && !stateRef.current.isIndexOpen) {
          const nearest = Math.max(0, Math.min(stateRef.current.filteredItems.length - 1, Math.round(stateRef.current.targetIndex)));
          gsap.to(stateRef.current, {
            targetIndex: nearest,
            duration: 0.45,
            ease: 'power2.out'
          });
        }
      }, 150);
    };

    const handlePointerDown = (e: PointerEvent) => {
      stateRef.current.isDragging = true;
      stateRef.current.dragStartX = e.clientX;
      stateRef.current.dragStartY = e.clientY;
      stateRef.current.dragMoved = false;
    };

    const handlePointerMove = (e: PointerEvent) => {
      stateRef.current.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      stateRef.current.mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

      // Update custom cursor
      if (cursorRingRef.current) {
        cursorRingRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }

      if (stateRef.current.isDragging) {
        const deltaY = e.clientY - stateRef.current.dragStartY;
        if (Math.abs(deltaY) > 5) stateRef.current.dragMoved = true;
        stateRef.current.targetIndex += deltaY * 0.005;
        stateRef.current.dragStartY = e.clientY;
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!stateRef.current.isDragging) return;
      stateRef.current.isDragging = false;
      triggerScrollSnap();

      if (!stateRef.current.dragMoved && !stateRef.current.isIndexOpen && !stateRef.current.isDetailOpen) {
        pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);

        const intersects = raycaster.intersectObjects(rackGroup.children, true);
        if (intersects.length > 0) {
          let obj: THREE.Object3D | null = intersects[0].object;
          while (obj && obj.parent && obj.parent !== rackGroup) {
            obj = obj.parent;
          }
          if (obj && typeof (obj as any).userData?.index === 'number') {
            const clickedIdx = (obj as any).userData.index;
            if (clickedIdx === stateRef.current.activeDiscreteIndex) {
              openProductionPage(true);
            } else {
              goToDisc(clickedIdx);
            }
          }
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (stateRef.current.isDetailOpen || stateRef.current.isIndexOpen) return;
      stateRef.current.targetIndex += e.deltaY * 0.0018;
      triggerScrollSnap();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (stateRef.current.isDetailOpen) {
        if (e.key === 'Escape') openProductionPage(false);
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        if (!stateRef.current.isIndexOpen) goToDisc(stateRef.current.activeDiscreteIndex + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        if (!stateRef.current.isIndexOpen) goToDisc(stateRef.current.activeDiscreteIndex - 1);
      } else if (e.key === 'Enter') {
        if (!stateRef.current.isIndexOpen) openProductionPage(true);
      } else if (e.key === 'Escape') {
        if (stateRef.current.isIndexOpen) setIsIndexOpen(false);
      }
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    // Animation loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      const st = stateRef.current;
      st.smoothMouseX += (st.mouseX - st.smoothMouseX) * 0.08;
      st.smoothMouseY += (st.mouseY - st.smoothMouseY) * 0.08;
      st.currentIndex += (st.targetIndex - st.currentIndex) * 0.1;

      const nearestIdx = Math.round(st.currentIndex);
      if (nearestIdx !== st.activeDiscreteIndex && nearestIdx >= 0 && nearestIdx < st.discMeshes.length) {
        const diff = nearestIdx - st.activeDiscreteIndex;
        st.activeDiscreteIndex = nearestIdx;
        if (soundEngineRef.current) {
          soundEngineRef.current.playRackClick(diff);
          if (soundEngineRef.current.isPlayingMusic) {
            soundEngineRef.current.stopMusic();
          }
        }
        setActiveIndex(nearestIdx);

        // Animate HUD side panel change
        if (sideHudRef.current) {
          const hudBlocks = sideHudRef.current.querySelectorAll('.hud-block');
          gsap.fromTo(hudBlocks,
            { opacity: 0, y: 6 },
            { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: 'power2.out' }
          );
        }
      }

      const isMobile = window.innerWidth < 768;
      const xOffsetStep = isMobile ? 1.8 : 2.3;
      const xCenterShift = isMobile ? 0 : 0.8;
      const yOffsetStep = isMobile ? 1.1 : 1.35;

      st.discMeshes.forEach((mesh, i) => {
        const offset = i - st.currentIndex;
        const absOffset = Math.abs(offset);
        const isCurrent = i === st.activeDiscreteIndex;

        // Extended diagonal rack trajectory across the screen
        const targetX = -offset * xOffsetStep + xCenterShift;
        const targetY = offset * yOffsetStep;
        const targetZ = isCurrent ? 1.2 : -absOffset * 0.9 - 0.4;

        mesh.position.x += (targetX - mesh.position.x) * 0.14;
        mesh.position.y += (targetY - mesh.position.y) * 0.14;
        mesh.position.z += (targetZ - mesh.position.z) * 0.14;

        const targetRotX = isCurrent ? (-st.smoothMouseY * 0.28) : (-offset * 0.18);
        const targetRotY = isCurrent ? (st.smoothMouseX * 0.35) : (0.45 - offset * 0.08);

        mesh.rotation.x += (targetRotX - mesh.rotation.x) * 0.12;
        mesh.rotation.y += (targetRotY - mesh.rotation.y) * 0.12;

        if (isCurrent) {
          mesh.rotation.z -= engine.isPlayingMusic ? 0.016 : 0.0045;
        } else {
          mesh.rotation.z += (0 - mesh.rotation.z) * 0.08;
        }

        const targetScale = isCurrent ? (isMobile ? 1.0 : 1.12) : Math.max(0.68, 0.95 - absOffset * 0.06);
        mesh.scale.setScalar(mesh.scale.x + (targetScale - mesh.scale.x) * 0.14);
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      cancelAnimationFrame(animId);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);

      engine.destroy();
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [openProductionPage, goToDisc]);

  const nextDiscIndex = (activeIndex + 1) % filteredItems.length;
  const nextDiscItem = filteredItems[nextDiscIndex] || filteredItems[0];

  return (
    <div className={`disco-page-container ${isLightMode ? 'light' : 'dark-theme'}`}>
      {/* Film Grain Overlay */}
      <div className="film-grain" />

      {/* Custom Cursor Ring */}
      <div id="cursor-ring" ref={cursorRingRef}>
        <span id="cursor-label" className="font-mono text-[8px] tracking-widest uppercase opacity-0 transition-opacity duration-200 text-white">
          escoltar
        </span>
      </div>

      {/* Dynamic Ambient Backdrop Glow */}
      <div
        id="ambient-glow"
        ref={ambientGlowRef}
        className="fixed inset-0 pointer-events-none z-0 transition-all duration-1000 opacity-25"
        style={{
          background: 'radial-gradient(circle at 50% 52%, rgba(200, 90, 50, 0.20) 0%, rgba(242, 236, 225, 0) 68%)'
        }}
      />

      {/* Subtle Studio Grid Crosshairs */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
        <div className="w-full h-full grid grid-cols-4 md:grid-cols-12 border-b border-hairline">
          <div className="border-r border-hairline h-full" />
          <div className="border-r border-hairline h-full hidden md:block" />
          <div className="border-r border-hairline h-full hidden md:block" />
          <div className="border-r border-hairline h-full" />
          <div className="border-r border-hairline h-full hidden md:block" />
          <div className="border-r border-hairline h-full hidden md:block" />
          <div className="border-r border-hairline h-full" />
          <div className="border-r border-hairline h-full hidden md:block" />
          <div className="border-r border-hairline h-full hidden md:block" />
          <div className="border-r border-hairline h-full" />
          <div className="border-r border-hairline h-full hidden md:block" />
          <div className="h-full hidden md:block" />
        </div>
      </div>

      {/* PRELOADER OVERLAY */}
      {!isPreloaderDone && (
        <div
          id="preloader"
          className={`fixed inset-0 z-50 flex flex-col justify-between p-6 md:p-10 bg-[#090807] text-[#F4F0E6] transition-opacity duration-700 pointer-events-none ${
            isPreloaderFading ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="flex items-center justify-between border-b border-white/15 pb-4">
            <div className="flex items-center gap-3">
              <div className="px-2.5 py-1 border border-white/30 font-display font-extrabold text-sm tracking-tighter">
                MG // 24
              </div>
              <span className="font-mono text-[10px] tracking-[0.25em] uppercase opacity-60">
                Miquel Gil // Arxiu Discogràfic 1988–2024
              </span>
            </div>
            <div className="font-mono text-[11px] tracking-widest uppercase opacity-60 hidden sm:block">
              MASTERITZACIÓ ÒPTICA — CD 120MM POLICARBONAT
            </div>
          </div>

          <div className="my-auto flex flex-col items-center justify-center relative">
            <div className="relative w-52 h-52 md:w-64 md:h-64 flex items-center justify-center">
              <svg className="w-full h-full animate-spin" style={{ animationDuration: '7s' }} viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="95" fill="none" stroke="rgba(244,240,230,0.22)" strokeWidth="1" />
                <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(244,240,230,0.1)" strokeWidth="0.75" strokeDasharray="4 6" />
                <circle cx="100" cy="100" r="62" fill="none" stroke="rgba(244,240,230,0.08)" strokeWidth="0.75" />
                <circle cx="100" cy="100" r="34" fill="none" stroke="rgba(244,240,230,0.35)" strokeWidth="1.2" strokeDasharray="18 8" />
                <circle cx="100" cy="100" r="22" fill="none" stroke="rgba(244,240,230,0.2)" strokeWidth="1" />
                <circle cx="100" cy="100" r="14" fill="none" stroke="rgba(200,90,50,0.85)" strokeWidth="1.5" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span id="preloader-percent" className="font-mono text-2xl md:text-3xl font-light tracking-tighter">100%</span>
                <span className="font-mono text-[9px] tracking-[0.3em] uppercase opacity-50 mt-1">CARREGANT DISCOS</span>
              </div>
            </div>
            <div id="preloader-status" className="font-mono text-[10px] tracking-[0.25em] uppercase opacity-60 mt-6 text-center">
              INICIALITZANT LECTOR ÒPTIC // 10 OBRES DE MIQUEL GIL
            </div>
          </div>

          <div className="flex items-end justify-between border-t border-white/15 pt-4 font-mono text-[10px] tracking-widest uppercase opacity-60">
            <div>ARREL MEDITERRÀNIA · VALÈNCIA</div>
            <div>10 EDICIONS OFICIALS EN RACK 3D</div>
          </div>
        </div>
      )}

      {/* BACKGROUND EDITORIAL METADATA STRIP */}
      <div id="editorial-bg" className="fixed inset-x-0 top-24 pointer-events-none z-10 flex flex-col justify-center items-center px-4 md:px-14 overflow-hidden">
        <div className="mb-2 flex items-center gap-3 font-mono text-[11px] tracking-[0.28em] uppercase opacity-70">
          <span id="bg-cat-id" className="px-2.5 py-0.5 border border-hairline rounded-full">{activeItem.id}</span>
          <span>•</span>
          <span id="bg-year">{activeItem.year}</span>
          <span>•</span>
          <span id="bg-director">{activeItem.label.toUpperCase()}</span>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 md:gap-7 font-mono text-[10px] md:text-[11px] tracking-[0.22em] uppercase opacity-65">
          <span id="bg-single">TEMA DESTACAT: «{activeItem.single.toUpperCase()}»</span>
          <span>//</span>
          <span id="bg-runtime">DURADA: {activeItem.duration}</span>
          <span>//</span>
          <span id="bg-accolade" className="text-amber-700 font-bold dark:text-amber-300">{activeItem.accolade}</span>
        </div>
      </div>

      {/* THREE.JS WEBGL 3D CANVAS CONTAINER */}
      <div id="webgl-container" ref={containerRef} className="fixed inset-0 z-20 cursor-grab active:cursor-grabbing" />

      {/* SIDE VERTICAL RACK TELEMETRY */}
      <div
        id="side-hud-panel"
        ref={sideHudRef}
        className="fixed left-6 top-1/2 -translate-y-1/2 z-25 hidden xl:flex flex-col items-start gap-4 pointer-events-none font-mono text-[10px] tracking-[0.2em] uppercase opacity-100 max-w-[280px]"
        style={{ color: 'var(--text-primary)' }}
      >
        {/* BLOQUE 1: TÍTULO Y GÈNERE */}
        <div className="hud-block flex flex-col gap-1 w-full" style={{ color: 'var(--text-primary)' }}>
          <span className="font-bold text-[9px] tracking-[0.25em] opacity-80" style={{ color: 'var(--text-primary)' }}>DISC &amp; GÈNERE</span>
          <h2 id="hud-title" className="font-serif italic text-4xl sm:text-5xl tracking-tight leading-none font-black my-1" style={{ color: 'var(--text-primary)' }}>
            {activeItem.title}
          </h2>
          <span id="hud-genre" className="font-bold opacity-100" style={{ color: 'var(--text-primary)' }}>{activeItem.style}</span>
        </div>

        <div className="w-full h-[1px] opacity-30" style={{ backgroundColor: 'var(--text-primary)' }} />

        {/* BLOQUE 2: DISCOGRÀFICA & PRODUCCIÓ */}
        <div className="hud-block flex flex-col gap-1 w-full" style={{ color: 'var(--text-primary)' }}>
          <span className="font-bold text-[9px] tracking-[0.25em] opacity-80" style={{ color: 'var(--text-primary)' }}>DISCOGRÀFICA &amp; PRODUCCIÓ</span>
          <p id="hud-producer" className="normal-case font-sans text-[11px] leading-snug font-bold opacity-100" style={{ color: 'var(--text-primary)' }}>
            {activeItem.label} · {activeItem.producer}
          </p>
        </div>

        <div className="w-full h-[1px] opacity-30" style={{ backgroundColor: 'var(--text-primary)' }} />

        {/* BLOQUE 3: SINOPSI / ARXIU */}
        <div className="hud-block flex flex-col gap-1 w-full" style={{ color: 'var(--text-primary)' }}>
          <span className="font-bold text-[9px] tracking-[0.25em] opacity-80" style={{ color: 'var(--text-primary)' }}>SINOPSI / ARXIU</span>
          <p id="hud-synopsis" className="normal-case font-sans text-[11px] leading-relaxed font-semibold opacity-100 line-clamp-4" style={{ color: 'var(--text-primary)' }}>
            {activeItem.synopsis}
          </p>
        </div>
      </div>

      {/* TOP NAVIGATION HUD BAR */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-3 sm:px-8 py-3.5 md:py-4 border-b border-hairline glass-panel">
        <div className="flex items-center gap-3">
          <Link href="/" className="group flex items-center gap-3 text-left focus:outline-none" title="Tornar a l'inici del web">
            <div className="px-2.5 py-1 rounded border border-hairline bg-white/5 font-display font-extrabold text-xs sm:text-sm tracking-tight group-hover:bg-[#F4F0E6] group-hover:text-[#090807] transition-colors">
              MIQUEL GIL
            </div>
            <div className="hidden xl:flex flex-col border-l border-hairline pl-3">
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase leading-tight">DISCOGRAFIA OFICIAL</span>
              <span className="font-mono text-[9px] tracking-[0.18em] uppercase opacity-50">1988 — 2024 // 10 VOLUMS</span>
            </div>
          </Link>
        </div>

        <nav className="flex items-center p-1 rounded-full border border-hairline bg-black/20 dark:bg-white/5 backdrop-blur-md overflow-x-auto max-w-[58vw] sm:max-w-none">
          <button
            id="nav-all"
            onClick={() => handleFilterChange('all')}
            className={`nav-pill px-2.5 sm:px-3.5 py-1.5 rounded-full font-mono text-[10px] sm:text-[11px] tracking-[0.16em] uppercase transition-all whitespace-nowrap ${
              filter === 'all'
                ? 'bg-[#F4F0E6] text-[#090807] font-medium'
                : 'opacity-65 hover:opacity-100'
            }`}
          >
            TOTS <span className="opacity-60 text-[9px] ml-0.5">(10)</span>
          </button>
          <button
            id="nav-estudi"
            onClick={() => handleFilterChange('estudi')}
            className={`nav-pill px-2.5 sm:px-3.5 py-1.5 rounded-full font-mono text-[10px] sm:text-[11px] tracking-[0.16em] uppercase transition-all whitespace-nowrap ${
              filter === 'estudi'
                ? 'bg-[#F4F0E6] text-[#090807] font-medium'
                : 'opacity-65 hover:opacity-100'
            }`}
          >
            ESTUDI <span className="opacity-60 text-[9px] ml-0.5">(08)</span>
          </button>
          <button
            id="nav-directe"
            onClick={() => handleFilterChange('directe')}
            className={`nav-pill px-2.5 sm:px-3.5 py-1.5 rounded-full font-mono text-[10px] sm:text-[11px] tracking-[0.16em] uppercase transition-all whitespace-nowrap ${
              filter === 'directe'
                ? 'bg-[#F4F0E6] text-[#090807] font-medium'
                : 'opacity-65 hover:opacity-100'
            }`}
          >
            DIRECTE &amp; TRIO <span className="opacity-60 text-[9px] ml-0.5">(02)</span>
          </button>
          <div className="h-3.5 w-[1px] bg-current opacity-20 mx-1" />
          <button
            id="nav-index"
            onClick={() => setIsIndexOpen(!isIndexOpen)}
            className="nav-pill px-2.5 sm:px-3.5 py-1.5 rounded-full font-mono text-[10px] sm:text-[11px] tracking-[0.16em] uppercase transition-all opacity-65 hover:opacity-100 whitespace-nowrap"
          >
            ÍNDEX
          </button>
        </nav>

        <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.16em] uppercase">
          <button
            id="btn-antigravity"
            onClick={() => {
              setIsAntigravityOpen(true);
              if (soundEngineRef.current) soundEngineRef.current.playRackClick();
            }}
            className="px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-900 hover:bg-amber-400 hover:text-black transition-all flex items-center gap-1.5 font-medium"
            title="Exportar codi per a Antigravity / Next.js"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
            <span>ANTIGRAVITY</span>
          </button>

          <button
            id="btn-theme"
            onClick={toggleTheme}
            className="px-2.5 py-1.5 rounded-full border border-hairline hover:border-current transition-all hidden md:flex items-center gap-1.5"
            title="Canviar il·luminació Estudi / Nit"
          >
            <span id="theme-dot" className={`w-2 h-2 rounded-full ${isLightMode ? 'bg-stone-900' : 'bg-amber-400'}`} />
            <span id="theme-label">{isLightMode ? 'DIA' : 'NIT'}</span>
          </button>

          <button
            id="btn-audio-fx"
            onClick={toggleAudioFx}
            className="px-2.5 py-1.5 rounded-full border border-hairline hover:border-current transition-all hidden sm:flex items-center gap-1.5"
            title="Sons mecànics del prestatge"
          >
            <span>FX</span>
            <span id="audio-label">[{isFxEnabled ? 'ON' : 'OFF'}]</span>
          </button>
        </div>
      </header>

      {/* FLOATING AUDIO PLAYER */}
      <div
        id="floating-audio-player"
        className="fixed left-4 sm:left-8 bottom-6 z-30 glass-panel border border-hairline rounded-2xl p-3 sm:px-4 sm:py-3 flex items-center gap-3.5 shadow-2xl max-w-[92vw] sm:max-w-md transition-all duration-500"
      >
        <div className="relative w-11 h-11 rounded-full overflow-hidden border border-hairline shrink-0 bg-stone-900">
          <img
            id="player-cover"
            src={activeItem.coverUrl}
            alt="Portada"
            className="w-full h-full object-cover animate-spin"
            style={{
              animationDuration: '12s',
              animationPlayState: isPlaying ? 'running' : 'paused'
            }}
          />
          <div className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-[#090807] border border-white/30" />
        </div>

        <div className="flex-1 min-w-[140px] sm:min-w-[180px]">
          <div className="flex items-center justify-between gap-2">
            <span id="player-track-title" className="font-mono text-[11px] font-semibold tracking-wider uppercase truncate" style={{ color: 'var(--text-primary)' }}>
              {activeItem.single}
            </span>
            <span id="player-time" className="font-mono text-[10px] opacity-75 shrink-0" style={{ color: 'var(--text-primary)' }}>
              {audioTime}
            </span>
          </div>
          <div className="font-mono text-[9px] tracking-[0.18em] uppercase opacity-75 truncate" id="player-album-sub" style={{ color: 'var(--text-primary)' }}>
            {activeItem.title} ({activeItem.year}) · Miquel Gil
          </div>
          <div
            id="player-progress-bar"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickPct = (e.clientX - rect.left) / rect.width;
              if (soundEngineRef.current && soundEngineRef.current.audioEl && soundEngineRef.current.audioEl.duration) {
                soundEngineRef.current.audioEl.currentTime = clickPct * soundEngineRef.current.audioEl.duration;
              }
            }}
            className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mt-1.5 cursor-pointer"
          >
            <div
              id="player-progress-fill"
              style={{ width: `${audioProgress}%` }}
              className="h-full bg-amber-600 transition-all duration-150"
            />
          </div>
        </div>

        <button
          id="btn-play-track"
          onClick={handlePlayToggle}
          className="w-9 h-9 rounded-full bg-[#141210] text-[#F2ECE1] flex items-center justify-center hover:scale-105 transition-transform shrink-0"
          title="Reproduir / Pausar mostra sonora"
        >
          {isPlaying ? (
            <svg id="icon-pause" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg id="icon-play" className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <a
          id="player-spotify-link"
          href={activeItem.spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 py-1.5 rounded-full border border-hairline hover:bg-emerald-500/20 hover:border-emerald-600 font-mono text-[9px] tracking-widest uppercase transition-all hidden sm:flex items-center gap-1.5"
          style={{ color: 'var(--text-primary)' }}
          title="Escoltar a Spotify"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          SPOTIFY ↗
        </a>
      </div>

      {/* PRODUCTION DETAIL PAGE VIEW */}
      <div
        id="production-page"
        className={`fixed inset-0 z-40 bg-[#090807] text-[#F4F0E6] overflow-y-auto custom-scroll ${
          isDetailOpen ? 'flex opacity-100' : 'hidden opacity-0'
        } flex-col transition-opacity duration-500`}
      >
        <div className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/10 bg-[#090807]/90 backdrop-blur-md text-[#F4F0E6]">
          <div className="flex items-center gap-4">
            <button
              id="prod-back-btn"
              onClick={() => openProductionPage(false)}
              className="font-mono text-xs tracking-widest uppercase text-[#F4F0E6] opacity-75 hover:opacity-100 flex items-center gap-2"
            >
              ← TORNAR AL PRESTATGE
            </button>
            <span className="text-[#F4F0E6] opacity-30">/</span>
            <span id="prod-top-title" className="font-mono text-xs tracking-widest uppercase font-bold text-[#F4F0E6] truncate max-w-xs">
              {activeItem.title}
            </span>
          </div>
          <div className="flex items-center gap-6 font-mono text-xs tracking-widest uppercase text-[#F4F0E6]">
            <a
              id="prod-top-spotify"
              href={activeItem.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F4F0E6] hover:opacity-50 transition-opacity"
            >
              SPOTIFY ↗
            </a>
            <button
              id="prod-close-btn"
              onClick={() => openProductionPage(false)}
              className="text-[#F4F0E6] hover:opacity-50 transition-opacity"
            >
              TANCAR ✕
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full px-6 md:px-12 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-3 space-y-6 font-mono text-xs">
            <div>
              <div className="opacity-50 text-[10px] tracking-[0.2em] uppercase mb-1">DIRECCIÓ / PRODUCCIÓ</div>
              <div id="prod-producer" className="tracking-wider">{activeItem.producer}</div>
            </div>
            <div>
              <div className="opacity-50 text-[10px] tracking-[0.2em] uppercase mb-1">ANY DE LLANÇAMENT</div>
              <div id="prod-year" className="tracking-wider">{activeItem.year}</div>
            </div>
            <div>
              <div className="opacity-50 text-[10px] tracking-[0.2em] uppercase mb-1">GÈNERE / ESTIL</div>
              <div id="prod-genre" className="tracking-wider">{activeItem.style}</div>
            </div>
            <div>
              <div className="opacity-50 text-[10px] tracking-[0.2em] uppercase mb-1">LLENGÜES</div>
              <div id="prod-langs" className="tracking-wider">Català (Valencià)</div>
            </div>
            <div>
              <div className="opacity-50 text-[10px] tracking-[0.2em] uppercase mb-1">DURADA TOTAL</div>
              <div id="prod-runtime" className="tracking-wider">{activeItem.duration}</div>
            </div>
            <div className="pt-6 border-t border-hairline space-y-3">
              <button
                id="prod-play-btn"
                onClick={handlePlayToggle}
                className="w-full py-3 rounded-full bg-[#F4F0E6] text-[#090807] font-mono text-[10px] tracking-[0.2em] uppercase font-bold hover:scale-[1.02] transition-transform"
              >
                {isPlaying ? '⏸ PAUSAR MOSTRA SONORA' : '▶ ESCOLTAR TEMA PRINCIPAL'}
              </button>
              <a
                id="prod-buy-btn"
                href={activeItem.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center py-3 rounded-full border border-hairline font-mono text-[10px] tracking-[0.2em] uppercase hover:bg-white/10 transition-colors"
              >
                OBRIR ENLLAÇ OFICIAL ↗
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-8">
            <div>
              <span id="prod-cat-badge" className="font-mono text-xs tracking-widest uppercase opacity-60">
                {activeItem.id} // {activeItem.categoryLabel}
              </span>
              <h1 id="prod-main-title" className="font-serif italic text-6xl sm:text-7xl md:text-8xl tracking-tight leading-none mt-2 mb-6">
                {activeItem.title}
              </h1>
            </div>

            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-hairline bg-stone-900 group">
              <img
                id="prod-cover-img"
                src={activeItem.coverUrl}
                alt={activeItem.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-white/90">
                  ARXIU OFICIAL — FOTOGRAMA / PORTADA
                </span>
              </div>
            </div>

            <p id="prod-synopsis" className="text-base sm:text-lg leading-relaxed font-light opacity-90">
              {activeItem.synopsis}
            </p>

            <div className="pt-6 border-t border-hairline space-y-4">
              <h3 className="font-mono text-xs tracking-[0.25em] uppercase opacity-50">REPERTORI DE L'EDICIÓ</h3>
              <div id="prod-tracklist" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
                {activeItem.tracklist.map((tr, tIdx) => (
                  <div
                    key={tIdx}
                    className={`p-2.5 rounded-lg border border-hairline ${
                      tIdx === 0
                        ? 'bg-amber-400/15 border-amber-400/40 text-amber-300'
                        : 'bg-white/5 opacity-80'
                    } flex items-center justify-between`}
                  >
                    <span className="truncate">{tr}</span>
                    {tIdx === 0 && <span className="text-[9px] uppercase tracking-widest ml-2">★ TEMA</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <h3 className="font-mono text-xs tracking-[0.25em] uppercase opacity-50">CRÍTIQUES I PREMIS</h3>
            <div id="prod-reviews" className="space-y-6">
              {activeItem.reviews.map((rev, rIdx) => (
                <div key={rIdx} className="p-4 rounded-xl border border-hairline bg-black/15 space-y-2">
                  <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] uppercase">
                    <span className="font-semibold text-amber-400">{rev.pub}</span>
                    <span className="px-2 py-0.5 rounded bg-white/10">{rev.score}</span>
                  </div>
                  <p className="font-serif italic text-base leading-snug opacity-90">“{rev.quote}”</p>
                </div>
              ))}
            </div>

            <div className="pt-8 border-t border-hairline space-y-4">
              <span className="font-mono text-[10px] tracking-[0.25em] uppercase opacity-50">SEGÜENT EDICIÓ</span>
              <button
                id="prod-next-btn"
                onClick={() => {
                  goToDisc(nextDiscIndex);
                  openProductionPage(false);
                  setTimeout(() => openProductionPage(true), 300);
                }}
                className="w-full text-left p-4 rounded-xl border border-hairline bg-white/5 hover:bg-white/10 transition-all flex items-center justify-between group"
              >
                <div>
                  <div id="prod-next-title" className="font-serif italic text-xl">{nextDiscItem.title}</div>
                  <div className="font-mono text-[10px] tracking-wider uppercase opacity-50 mt-0.5">
                    {nextDiscItem.year} · {nextDiscItem.category.toUpperCase()}
                  </div>
                </div>
                <span className="font-mono text-xs group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FULL ARCHIVE INDEX GRID MODAL */}
      <div
        id="index-modal"
        className={`fixed inset-0 z-40 pt-[61px] glass-panel ${
          isIndexOpen ? 'flex' : 'hidden'
        } flex-col`}
      >
        <div className="px-6 sm:px-10 py-5 border-b border-hairline flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg sm:text-xl font-bold tracking-tight uppercase">
              ÍNDEX COMPLET DE LA DISCOGRAFIA (1988–2024)
            </h2>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-55">
              10 DISCOS OFICIALS DE MIQUEL GIL • CLICA QUALSEVOL EDICIÓ PER MUNTAR-LA AL RACK 3D
            </p>
          </div>
          <button
            id="index-close-btn"
            onClick={() => setIsIndexOpen(false)}
            className="px-4 py-1.5 rounded-full border border-hairline font-mono text-[10px] tracking-[0.2em] uppercase hover:bg-white/10"
          >
            TANCAR ÍNDEX [ESC]
          </button>
        </div>

        <div
          id="index-grid"
          className="flex-1 overflow-y-auto custom-scroll p-6 sm:p-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6"
        >
          {DISCOGRAFIA_MIQUEL_GIL.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                const targetIdx = filteredItems.findIndex(d => d.id === item.id);
                if (targetIdx !== -1) {
                  goToDisc(targetIdx);
                } else {
                  // Switch filter to include this item
                  handleFilterChange('all');
                  const allIdx = DISCOGRAFIA_MIQUEL_GIL.findIndex(d => d.id === item.id);
                  if (allIdx !== -1) goToDisc(allIdx);
                }
                setIsIndexOpen(false);
              }}
              className="p-4 rounded-2xl border border-hairline bg-white/5 hover:bg-white/10 cursor-pointer transition-all flex flex-col justify-between"
            >
              <img src={item.coverUrl} alt={item.title} className="w-full aspect-square object-cover rounded-xl mb-3" />
              <div>
                <div className="font-mono text-[9px] opacity-50 uppercase">{item.id} · {item.year}</div>
                <div className="font-serif italic text-lg leading-tight mt-0.5">{item.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ANTIGRAVITY / NEXT.JS INTEGRATION MODAL */}
      <div
        id="antigravity-modal"
        className={`fixed inset-0 z-50 glass-panel ${
          isAntigravityOpen ? 'flex' : 'hidden'
        } flex-col p-4 sm:p-8 md:p-12`}
      >
        <div className="max-w-5xl w-full mx-auto flex-1 flex flex-col border border-hairline rounded-2xl bg-[#0c0b09]/95 overflow-hidden shadow-2xl">
          <div className="px-6 py-4 border-b border-hairline flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded bg-amber-400 text-black font-mono text-[10px] font-bold tracking-widest uppercase">
                ANTIGRAVITY READY
              </span>
              <h3 className="font-display text-sm sm:text-base font-bold uppercase tracking-wide">
                Guia i Component React / Next.js per a <span className="text-amber-400">miquelgil.vercel.app/discografia</span>
              </h3>
            </div>
            <button
              id="antigravity-close-btn"
              onClick={() => setIsAntigravityOpen(false)}
              className="px-3 py-1 rounded-full border border-hairline font-mono text-xs hover:bg-white/10"
            >
              ✕ TANCAR
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scroll p-6 space-y-6 font-mono text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-hairline bg-white/5">
                <div className="text-amber-400 font-bold mb-1">PAS 1 · DEPENDÈNCIES</div>
                <p className="opacity-75 text-[11px] leading-relaxed">
                  Al terminal d'Antigravity executa:<br />
                  <code className="text-emerald-300 code-selectable">npm install three gsap @types/three</code>
                </p>
              </div>
              <div className="p-4 rounded-xl border border-hairline bg-white/5">
                <div className="text-amber-400 font-bold mb-1">PAS 2 · ASSETS EXISTENTS</div>
                <p className="opacity-75 text-[11px] leading-relaxed">
                  El component ja apunta a les teues rutes locals de Next.js:<br />
                  <code className="text-emerald-300 code-selectable">/images/disco_1.jpg ... /disco_8.webp</code>
                </p>
              </div>
              <div className="p-4 rounded-xl border border-hairline bg-white/5">
                <div className="text-amber-400 font-bold mb-1">PAS 3 · RUTA NEXT.JS</div>
                <p className="opacity-75 text-[11px] leading-relaxed">
                  Enganxa el component a <code className="text-emerald-300 code-selectable">app/discografia/DiscografiaClient.tsx</code>.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-widest opacity-60">
                  FITXER: app/discografia/DiscografiaClient.tsx
                </span>
                <button
                  id="btn-copy-nextjs"
                  onClick={() => {
                    navigator.clipboard.writeText(generateNextJsComponentCode());
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2200);
                  }}
                  className="px-4 py-1.5 rounded-full bg-amber-400 text-black font-mono text-[10px] font-bold tracking-widest uppercase hover:bg-amber-300 transition-all"
                >
                  {copiedCode ? '✓ CODI COPIAT!' : 'COPIAR COMPONENTE NEXT.JS'}
                </button>
              </div>
              <pre className="code-selectable p-4 rounded-xl border border-hairline bg-black/80 text-emerald-300/90 overflow-x-auto text-[11px] leading-relaxed max-h-[340px] custom-scroll">
                {generateNextJsComponentCode()}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
