'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import Link from 'next/link';
import './discografia.css';

// Tipat de dades de l'arxiu discogràfic
export interface Album {
  id: string;
  slug: string;
  title: string;
  year: string;
  label: string;
  single: string;
  duration: string;
  accolade: string;
  coverUrl: string;
  audioUrl?: string;
  isStudy?: boolean;
  description: string;
  tracks: string[];
}

export const DISCOGRAFIA_DATA: Album[] = [
  {
    id: 'MG—001',
    slug: 'viatger',
    title: 'Viatger',
    year: '2024',
    label: 'Temps Record',
    single: 'Nineta',
    duration: '4:07',
    accolade: '25 ANYS DE TRAJECTÒRIA · ARREL VIVA',
    coverUrl: '/images/disco_8.webp',
    audioUrl: '/audio/full/viatger_nineta.mp3',
    isStudy: true,
    description:
      'Dedicat a la memòria de Manolo Miralles i finançat mitjançant micromecenatge a Verkami. Un disc fet a mà amb producció digital que reflexiona sobre fer-se major sense rendir-se. Combina lletres pròpies, un romanç tradicional, un poema de Teresa Pasqual i un homenatge a Joan Baptista Humet.',
    tracks: [
      'Nineta',
      'La resposta',
      'Ai Ramon!!',
      'Sa Serena',
      'La Veritat',
      'Racons',
      'Rusaffi',
      'Cecilia',
      'Viatger',
      'Otoño en Navarrés',
    ],
  },
  {
    id: 'MG—002',
    slug: 'geometries',
    title: 'Geometries',
    year: '2019',
    label: 'Temps Record',
    single: 'Geometries',
    duration: '2:50',
    accolade: 'PREMI OVIDI MONTLLOR · ARQUITECTURA VOCAL',
    coverUrl: '/images/disco_7.jpg',
    audioUrl: '/audio/full/geometries_geometries.mp3',
    isStudy: true,
    description:
      "Deu cançons amb producció musical de Borja Penalba i finançament col·laboratiu. Una celebració poètica que posa música als versos d'Enric Casasses, Imma Màñez, Joanjo Garcia, Anna Montero i Vicent Andrés Estellés, presentada solemnement al Palau de la Música de València.",
    tracks: [
      'Llei Horària',
      'Hotel París',
      'Canvi De Clima',
      '#Copla 42',
      'Copeo',
      'Mort Petita',
      'Terra',
      'Tempesta',
      'La Que Diu',
      'Geometries',
    ],
  },
  {
    id: 'MG—003',
    slug: 'marcianes',
    title: 'Per marcianes',
    year: '2011',
    label: 'Galileo MC',
    single: 'La Cileta',
    duration: '4:00',
    accolade: 'TRADICIÓ MUTANT I EXPERIMENTACIÓ',
    coverUrl: '/images/disco_6.png',
    audioUrl: '/audio/full/marcianes_la_cileta.mp3',
    isStudy: true,
    description:
      'Darrer treball en solitari abans d’un parèntesi reflexiu de set anys. Cançó d’autor i maduresa compositiva amb una marcada personalitat mediterrània, arranjaments acústics refinats i col·laboracions líriques de gran volada.',
    tracks: [
      'De la Mar',
      'Rosa de Paper',
      'X Marcianes',
      'En Acabant',
      'La Cileta',
      'Vesprades',
      'Com Més',
      'Les Xiquetes',
      'Somriures',
      'Mirant la Llum',
      'Ferida',
    ],
  },
  {
    id: 'MG—004',
    slug: 'jazz-manel-camp',
    title: 'Miquel Gil & Manel Camp',
    year: '2009',
    label: "Edició d'autor",
    single: 'Cançó de Bressol',
    duration: '5:58',
    accolade: 'JAZZ I ARREL · IL·LUSTRACIONS JORDI ALBINYANA',
    coverUrl: '/images/disco_4.png',
    audioUrl: '/audio/full/jazz_manel_camp.mp3',
    isStudy: true,
    description:
      'Fusió de jazz i arrel mediterrània al costat del mestre pianista Manel Camp i el trompetista David Pastor. Edició limitada de col·leccionista il·lustrada per l’artista valencià Jordi Albinyana.',
    tracks: [
      'Intro Jazz',
      'Cançó de Bressol',
      'Fandango Improv',
      'Estellés en Blau',
      'Nocturn',
      'Arrel i Swing',
    ],
  },
  {
    id: 'MG—005',
    slug: 'eixos',
    title: 'Eixos',
    year: '2006',
    label: 'Temps Record',
    single: 'Dels Meus Ulls',
    duration: '3:33',
    accolade: 'PREMIS OVIDI MONTLLOR · PRODUCCIÓ BORJA PENALBA',
    coverUrl: '/images/disco_5.png',
    audioUrl: '/audio/full/eixos_dels_meus_ulls.mp3',
    isStudy: true,
    description:
      'Producció musical de Borja Penalba que va consagrar Miquel Gil com el gran guanyador en la primera edició dels Premis Ovidi Montllor. Una obra madura que entrellaça les formes d’arrel amb la força del cant contemporani.',
    tracks: [
      'Tinc Una Pena',
      'Fil De Vint',
      'De La China',
      'Dels Meus Ulls',
      'Gola Ampla',
      'Pensant Maneres',
      'Pepe Tono',
      'Tic Tac',
      'Parea',
      'Eix Tort',
      'Homenatge Per Marcianes',
    ],
  },
  {
    id: 'MG—006',
    slug: 'en-concert',
    title: 'En Concert',
    year: '2006',
    label: 'Galileo Music',
    single: 'Cançó Dels Traginers',
    duration: '5:34',
    accolade: 'DIRECTE HISTÒRIC · FORÇA ESCÈNICA',
    coverUrl: '/images/Captura-de-pantalla-2018-09-05-a-las-14.37.22.png',
    audioUrl: '/audio/full/en_concert_traginers.mp3',
    isStudy: false,
    description:
      'Selecció de les seues cançons més emblemàtiques interpretades en directe amb tota la banda. Una experiència immersiva que transporta directament al cor de la seua potència vocal i escènica.',
    tracks: [
      'Bandereta',
      'Tornada',
      'Tic-Tac',
      "Amaga L'Arbre",
      'Van Tres',
      'Katà',
      "L'Amor És Déu En Barca",
      'Memòria',
      'Adieu Paure Carnavas / Wa Habibi',
      'Cançó Dels Traginers',
      "Ballo Sardo / Cavall D'Arabia",
    ],
  },
  {
    id: 'MG—007',
    slug: 'kata',
    title: 'Katà',
    year: '2004',
    label: 'Temps Record',
    single: 'Katà',
    duration: '3:10',
    accolade: 'WORLD MUSIC CHARTS EUROPE · TOP 5 CONTINENTAL',
    coverUrl: '/images/disco_3.png',
    audioUrl: '/audio/full/kata_kata.mp3',
    isStudy: true,
    description:
      'Obra captivadora que fusiona les melodies tradicionals mediterrànies amb una moderna exploració sonora: granaïnes, fandangos i rembetika amb la participació de Raül Rodríguez.',
    tracks: [
      'Bandereta',
      'Tornada',
      'Katà',
      'Memòria',
      'Fandango',
      'I Giren',
      'Fènix',
      'Saturnàlia',
      'Un Bolero (A L’Alcudia)',
      "Cavall D'Arabia",
      "S'amaga",
    ],
  },
  {
    id: 'MG—008',
    slug: 'organic',
    title: 'Orgànic',
    year: '2001',
    label: 'Sonifolk',
    single: "L'amor és Déu en barca",
    duration: '4:18',
    accolade: 'OBRA MESTRA CANÒNICA · REVOLUCIÓ MEDITERRÀNIA',
    coverUrl: '/images/disco_2.png',
    audioUrl: '/audio/full/organic_amor_es_deu.mp3',
    isStudy: true,
    description:
      'Pedra angular de la música d’arrel mediterrània contemporània. Una trobada sense precedents entre cant d’estil, cants de batre, guitarres flamencs i vents tradicionals que va projectar Miquel Gil a escala internacional.',
    tracks: [
      "Amaga L'arbre",
      "L'amor És Déu En Barca",
      'Línia De Flotació',
      'Primavera',
      "Com Si L'aigua",
      'I Dotze',
      'Van Tres',
      'Un Silenci',
      'Mire La Mar',
      'Cançó Dels Traginers',
      'Bec De Gavina',
    ],
  },
  {
    id: 'MG—009',
    slug: 'buscando-tu-olor',
    title: 'Buscando tu olor',
    year: '1997',
    label: 'Seminola',
    single: 'Buscando tu olor',
    duration: '3:52',
    accolade: 'PRIMER TREBALL EN SOLITARI · TRANSICIÓ CREATIVA',
    coverUrl: '/images/disco_1.jpg',
    audioUrl: '/audio/full/buscando_tu_olor.mp3',
    isStudy: true,
    description:
      'Primer treball publicat en solitari amb el seu propi nom. Pas decisiu que va establir els fonaments creatius que desembocarien posteriorment en l’explosió sonora d’Orgànic.',
    tracks: [
      'Buscando tu olor',
      'Calle de la Mar',
      'Nana del marinero',
      'Viento del Sur',
      'Por la orilla',
    ],
  },
  {
    id: 'MG—010',
    slug: 'terminal-sur',
    title: 'Viajero (Terminal Sur)',
    year: '1988',
    label: 'Plataforma Discos',
    single: 'Sant Joan',
    duration: '4:30',
    accolade: 'ENCUENTROS CANCIÓN DE AUTOR · WORLD MUSIC PIONER',
    coverUrl: '/images/TerminalSur.jpg',
    audioUrl: '/audio/full/terminal_sur_sant_joan.mp3',
    isStudy: true,
    description:
      'Etapa d’obertura estètica i transició entre Al Tall i la carrera en solitari. Fruit de guanyar el 1986 els Encuentros de canción de autor para jóvenes intérpretes, fusiona ritmes mediterranis, seqüenciadors i instruments orgànics avançant-se a la world music.',
    tracks: [
      'Viajero',
      'Dinero Negro',
      'Sahariana',
      'Sant Joan',
      'Bon Matí',
      'Vampiro',
      'Esa Oscura Voz En Off',
      'Blau',
    ],
  },
];

export default function DiscographyArchive() {
  const mountRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isBSide, setIsBSide] = useState(false);
  const [isStudyFilter, setIsStudyFilter] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeFormatted, setCurrentTimeFormatted] = useState('0:00');

  const targetIdxRef = useRef(0);
  const currentIdxRef = useRef(0);
  const activeIdxRef = useRef(0);
  const isBSideRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sincronitzar estat per al loop de Three.js
  useEffect(() => {
    isBSideRef.current = isBSide;
  }, [isBSide]);

  // Sincronització del reproductor d'àudio
  useEffect(() => {
    const activeItem = DISCOGRAFIA_DATA[activeIndex];
    if (audioRef.current && activeItem?.audioUrl) {
      if (isPlaying) {
        audioRef.current.pause();
        audioRef.current.src = activeItem.audioUrl;
        audioRef.current.load();
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.src = activeItem.audioUrl;
      }
    }
    setCurrentTimeFormatted('0:00');
  }, [activeIndex]);

  const toggleAudio = useCallback(() => {
    const activeItem = DISCOGRAFIA_DATA[activeIndex];
    if (!audioRef.current && typeof window !== 'undefined') {
      const audio = new Audio(activeItem.audioUrl || '/audio/full/viatger_nineta.mp3');
      audio.preload = 'metadata';
      audio.ontimeupdate = () => {
        const mins = Math.floor(audio.currentTime / 60);
        const secs = Math.floor(audio.currentTime % 60)
          .toString()
          .padStart(2, '0');
        setCurrentTimeFormatted(`${mins}:${secs}`);
      };
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTimeFormatted('0:00');
      };
      audioRef.current = audio;
    }

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [activeIndex, isPlaying]);

  // Efecte GSAP per a la Tipografia Cinètica
  useEffect(() => {
    if (!titleRef.current) return;
    const titleText = DISCOGRAFIA_DATA[activeIndex]?.title || '';

    // Netejar i crear spans per caràcter amb màscara d'overflow
    titleRef.current.innerHTML = '';
    const words = titleText.split(' ');

    words.forEach((word, wIdx) => {
      const wordSpan = document.createElement('span');
      wordSpan.style.display = 'inline-block';
      wordSpan.style.whiteSpace = 'nowrap';

      for (let c = 0; c < word.length; c++) {
        const mask = document.createElement('span');
        mask.style.display = 'inline-block';
        mask.style.overflow = 'hidden';
        mask.style.verticalAlign = 'bottom';

        const inner = document.createElement('span');
        inner.style.display = 'inline-block';
        inner.style.willChange = 'transform, opacity';
        inner.className = 'char-inner';
        inner.textContent = word[c];

        mask.appendChild(inner);
        wordSpan.appendChild(mask);
      }

      titleRef.current!.appendChild(wordSpan);
      if (wIdx < words.length - 1) {
        const space = document.createElement('span');
        space.innerHTML = '&nbsp;';
        titleRef.current!.appendChild(space);
      }
    });

    // Animació d'entrada estil A24
    gsap.fromTo(
      titleRef.current.querySelectorAll('.char-inner'),
      { yPercent: 105, opacity: 0, rotateZ: 4 },
      {
        yPercent: 0,
        opacity: 1,
        rotateZ: 0,
        duration: 0.65,
        stagger: 0.016,
        ease: 'expo.out',
        overwrite: true,
      }
    );
  }, [activeIndex]);

  // Inicialització de Three.js (S'executa un sol cop amb refs dinàmiques)
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    const isMobile = width < 768;
    camera.position.set(0, isMobile ? -1.0 : 0, isMobile ? 22 : 14);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // Il·luminació d'estudi
    scene.add(new THREE.AmbientLight(0xffffff, 0.82));
    const keyLight = new THREE.DirectionalLight(0xfff8ed, 2.0);
    keyLight.position.set(5, 7, 8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x90b0e0, 0.85);
    rimLight.position.set(-6, -4, 4);
    scene.add(rimLight);

    const rackGroup = new THREE.Group();
    scene.add(rackGroup);

    // Geometria del CD
    const outerR = 1.45;
    const holeR = 0.21;
    const faceGeo = new THREE.RingGeometry(holeR, outerR, 64, 2);
    const pos = faceGeo.attributes.position;
    const uvs = faceGeo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      uvs.setXY(i, pos.getX(i) / (outerR * 2) + 0.5, pos.getY(i) / (outerR * 2) + 0.5);
    }

    // Anell central transparent
    const hubGeo = new THREE.RingGeometry(0.08, holeR, 48, 1);
    const hubMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.1,
      transmission: 0.92,
      thickness: 0.05,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
    });

    const loader = new THREE.TextureLoader();
    const meshes: THREE.Group[] = [];

    DISCOGRAFIA_DATA.forEach((album) => {
      const group = new THREE.Group();

      // Cara A (Serigrafia oficial)
      const tex = loader.load(album.coverUrl);
      tex.colorSpace = THREE.SRGBColorSpace;
      const topMat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.24,
        metalness: 0.32,
        side: THREE.FrontSide,
      });
      const topMesh = new THREE.Mesh(faceGeo, topMat);
      topMesh.position.z = 0.018;
      group.add(topMesh);

      // Cara B (Acabat làser d'alumini)
      const backMat = new THREE.MeshStandardMaterial({
        color: 0xdcdfe3,
        roughness: 0.12,
        metalness: 0.84,
        side: THREE.BackSide,
      });
      const backMesh = new THREE.Mesh(faceGeo, backMat);
      backMesh.position.z = -0.018;
      group.add(backMesh);

      // Centre transparent
      const hubMesh = new THREE.Mesh(hubGeo, hubMat);
      group.add(hubMesh);

      rackGroup.add(group);
      meshes.push(group);
    });

    // Control de Scroll per roda de ratolí
    const onWheel = (e: WheelEvent) => {
      const maxIdx = DISCOGRAFIA_DATA.length - 1;
      targetIdxRef.current = Math.max(0, Math.min(maxIdx, targetIdxRef.current + e.deltaY * 0.0025));
    };
    window.addEventListener('wheel', onWheel, { passive: true });

    // Control tàctil / arrossegament de punter
    let isPointerDown = false;
    let startX = 0;
    let startTarget = 0;

    const onPointerDown = (e: PointerEvent) => {
      isPointerDown = true;
      startX = e.clientX;
      startTarget = targetIdxRef.current;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isPointerDown) return;
      const deltaX = e.clientX - startX;
      const maxIdx = DISCOGRAFIA_DATA.length - 1;
      targetIdxRef.current = Math.max(0, Math.min(maxIdx, startTarget - deltaX * 0.0035));
    };

    const onPointerUp = () => {
      isPointerDown = false;
    };

    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // Control per teclat (←, →, Espai, Enter, ESC)
    const onKeyDown = (e: KeyboardEvent) => {
      const maxIdx = DISCOGRAFIA_DATA.length - 1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        targetIdxRef.current = Math.min(maxIdx, Math.round(targetIdxRef.current) + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        targetIdxRef.current = Math.max(0, Math.round(targetIdxRef.current) - 1);
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsBSide((prev) => !prev);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        setIsDetailOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsDetailOpen(false);
        setIsIndexOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);

    // Redimensionament de la finestra
    const onResize = () => {
      if (!container || !renderer || !camera) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isMob = w < 768;
      camera.aspect = w / h;
      camera.position.set(0, isMob ? -1.0 : 0, isMob ? 22 : 14);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', onResize);

    // Loop de Renderitzat Físic
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);

      currentIdxRef.current += (targetIdxRef.current - currentIdxRef.current) * 0.1;
      const nearest = Math.round(currentIdxRef.current);
      if (nearest !== activeIdxRef.current && nearest >= 0 && nearest < DISCOGRAFIA_DATA.length) {
        activeIdxRef.current = nearest;
        setActiveIndex(nearest);
      }

      meshes.forEach((mesh, i) => {
        const offset = i - currentIdxRef.current;
        const absOffset = Math.abs(offset);
        const isCurrent = i === nearest;

        mesh.position.x += (offset * 0.68 - mesh.position.x) * 0.14;
        mesh.position.y += (-offset * 0.43 - mesh.position.y) * 0.14;
        mesh.position.z += ((isCurrent ? 1.1 : -absOffset * 0.75 - 0.48) - mesh.position.z) * 0.14;

        const flipAngleY = isCurrent && isBSideRef.current ? Math.PI : 0;
        const targetRotY = isCurrent ? flipAngleY : -0.52 + offset * 0.08;

        mesh.rotation.y += (targetRotY - mesh.rotation.y) * 0.12;
        if (isCurrent) mesh.rotation.z -= 0.0045; // Rotació constant de disc físic
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('wheel', onWheel);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      faceGeo.dispose();
      hubGeo.dispose();
    };
  }, []);

  const activeItem = DISCOGRAFIA_DATA[activeIndex] || DISCOGRAFIA_DATA[0];

  const handleSelectAlbum = (index: number) => {
    targetIdxRef.current = index;
    setActiveIndex(index);
    activeIdxRef.current = index;
  };

  return (
    <div className="disco-3d-root">
      {/* CUADRÍCULA DE FONDO (Studio Grid) */}
      <div className="disco-3d-grid">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`disco-3d-grid-col ${i % 3 !== 0 && i !== 11 ? 'disco-3d-grid-col-desktop' : ''}`}
          />
        ))}
      </div>

      {/* TIPOGRAFÍA CINÉTICA CENTRAL */}
      <div className="disco-3d-center-hero">
        <div className="disco-3d-hero-meta-top">
          <span className="disco-3d-badge">{activeItem.id}</span>
          <span>•</span>
          <span>{activeItem.year}</span>
          <span>•</span>
          <span>{activeItem.label}</span>
        </div>

        {/* H1 Animado con GSAP */}
        <h1 ref={titleRef} className="disco-3d-h1">
          {/* El contingut s'injecta via GSAP */}
        </h1>

        <div className="disco-3d-hero-meta-bottom">
          <span>TEMA DESTACAT: «{activeItem.single}»</span>
          <span>//</span>
          <span>DURADA: {activeItem.duration}</span>
          <span>//</span>
          <span className="disco-3d-accolade">{activeItem.accolade}</span>
        </div>
      </div>

      {/* CONTENEDOR THREE.JS */}
      <div ref={mountRef} className="disco-3d-canvas-container" />

      {/* HUD: CABECERA SUPERIOR */}
      <header className="disco-3d-header">
        <div className="disco-3d-brand">
          <Link href="/start" className="disco-3d-logo-btn">
            MIQUEL GIL
          </Link>
          <div className="disco-3d-brand-text">
            <span className="disco-3d-brand-title">DISCOGRAFIA OFICIAL</span>
            <span className="disco-3d-brand-sub">1988 — 2024 // 10 VOLUMS</span>
          </div>
        </div>

        <nav className="disco-3d-nav">
          <button
            onClick={() => {
              setIsStudyFilter(false);
              handleSelectAlbum(0);
            }}
            className={`disco-3d-nav-btn ${!isStudyFilter ? 'disco-3d-nav-btn-active' : ''}`}
          >
            TOTS (10)
          </button>
          <button
            onClick={() => {
              setIsStudyFilter(true);
              handleSelectAlbum(0);
            }}
            className={`disco-3d-nav-btn ${isStudyFilter ? 'disco-3d-nav-btn-active' : ''}`}
          >
            ESTUDI (08)
          </button>
          <button
            onClick={() => setIsIndexOpen((prev) => !prev)}
            className="disco-3d-nav-btn"
          >
            ÍNDEX {isIndexOpen ? '✕' : '∨'}
          </button>
        </nav>

        <div>
          <Link href="/start" className="disco-3d-antigravity-badge">
            • ANTIGRAVITY
          </Link>
        </div>
      </header>

      {/* HUD: BARRA LATERAL IZQUIERDA (Telemetría) */}
      <div className="disco-3d-telemetry">
        <div>
          <span className="disco-3d-telemetry-lbl">FORMAT D'ARXIU</span>
          <span>CD-DA 16-BIT / 44.1KHZ</span>
        </div>
        <div className="disco-3d-telemetry-divider" />
        <div>
          <span className="disco-3d-telemetry-lbl">CARA ACTIVA DEL DISC</span>
          <span>{isBSide ? 'CARA B // LÀSER' : 'CARA A // SERIGRAFIA OFICIAL'}</span>
        </div>
        <div className="disco-3d-telemetry-divider" />
        <div>
          <span className="disco-3d-telemetry-lbl">ORIGEN SONOR</span>
          <span>HORTA SUD · MEDITERRÀNIA</span>
        </div>
      </div>

      {/* HUD: FOOTER & CONTROLES */}
      <footer className="disco-3d-footer">
        {/* Reproductor Mini (Izquierda) */}
        <button
          onClick={toggleAudio}
          className="disco-3d-mini-player"
          title={isPlaying ? 'Pausar àudio' : 'Reproduir cançó destacada'}
        >
          <div className="disco-3d-mini-disc-wrap">
            <img
              src={activeItem.coverUrl}
              alt={activeItem.title}
              className={`disco-3d-mini-disc-img ${isPlaying ? 'disco-3d-spinning' : ''}`}
            />
            <div className="disco-3d-mini-play-overlay">
              <span>{isPlaying ? '❚❚' : '▶'}</span>
            </div>
          </div>
          <div className="disco-3d-mini-meta">
            <div className="disco-3d-mini-title-row">
              <span className="disco-3d-mini-single">{activeItem.single.toUpperCase()}</span>
              <span className="disco-3d-mini-duration">
                {currentTimeFormatted} / {activeItem.duration}
              </span>
            </div>
            <div className="disco-3d-mini-album-row">
              {activeItem.title} ({activeItem.year})
            </div>
          </div>
        </button>

        {/* Scrubber (Centro) */}
        <div className="disco-3d-scrubber">
          {DISCOGRAFIA_DATA.map((_, i) => (
            <button
              key={i}
              onClick={() => handleSelectAlbum(i)}
              aria-label={`Seleccionar àlbum ${i + 1}`}
              className={`disco-3d-scrub-bar ${i === activeIndex ? 'disco-3d-scrub-bar-active' : ''}`}
            />
          ))}
        </div>

        {/* Controles de Acción (Derecha) */}
        <div className="disco-3d-action-group">
          <button onClick={() => setIsBSide(!isBSide)} className="disco-3d-btn-ghost">
            ↻ GIRAR CARA {isBSide ? 'A' : 'B'}
          </button>
          <button onClick={() => setIsDetailOpen(true)} className="disco-3d-btn-primary">
            FITXA DEL DISC [ENTER]
          </button>
        </div>
      </footer>

      {/* DRAWER / MODAL: FITXA DEL DISC */}
      {isDetailOpen && (
        <div className="disco-3d-modal-backdrop" onClick={() => setIsDetailOpen(false)}>
          <div className="disco-3d-drawer" onClick={(e) => e.stopPropagation()}>
            <div>
              <div className="disco-3d-drawer-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="disco-3d-badge">{activeItem.id}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '12px', opacity: 0.5 }}>
                    {activeItem.year} · {activeItem.label}
                  </span>
                </div>
                <button onClick={() => setIsDetailOpen(false)} className="disco-3d-btn-ghost">
                  TANCAR [ESC]
                </button>
              </div>

              <div className="disco-3d-drawer-hero">
                <img
                  src={activeItem.coverUrl}
                  alt={activeItem.title}
                  className="disco-3d-drawer-cover"
                />
                <div>
                  <h2 className="disco-3d-drawer-title">{activeItem.title}</h2>
                  <p className="disco-3d-accolade" style={{ marginTop: '0.5rem', fontSize: '11px', letterSpacing: '0.14em' }}>
                    {activeItem.accolade}
                  </p>
                  <p style={{ marginTop: '0.5rem', fontFamily: 'monospace', fontSize: '11px', opacity: 0.6, letterSpacing: '0.1em' }}>
                    Cançó destacada: {activeItem.single} ({activeItem.duration})
                  </p>
                </div>
              </div>

              <div className="disco-3d-drawer-section">
                <h3 className="disco-3d-drawer-section-title">Ressenya Editorial</h3>
                <p className="disco-3d-drawer-body">{activeItem.description}</p>
              </div>

              <div className="disco-3d-drawer-section">
                <h3 className="disco-3d-drawer-section-title">Pistes del Disc</h3>
                <ol className="disco-3d-tracklist">
                  {activeItem.tracks.map((track, tIdx) => (
                    <li key={tIdx} className="disco-3d-track-row">
                      <span style={{ opacity: 0.35 }}>{(tIdx + 1).toString().padStart(2, '0')}.</span>
                      <span style={{ color: track === activeItem.single ? '#fde68a' : 'inherit', fontWeight: track === activeItem.single ? '700' : 'normal' }}>
                        {track}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="disco-3d-drawer-footer">
              <button onClick={toggleAudio} className="disco-3d-btn-primary">
                {isPlaying ? 'PAUSAR ÀUDIO' : 'REPRODUIR SINGLE'}
              </button>
              <Link
                href="/contractacio"
                style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#F4F0E6', opacity: 0.7 }}
              >
                Contractar espectacle →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ÍNDEX DEL CATÀLEG COMPLET */}
      {isIndexOpen && (
        <div className="disco-3d-index-backdrop" onClick={() => setIsIndexOpen(false)}>
          <div className="disco-3d-index-modal" onClick={(e) => e.stopPropagation()}>
            <div className="disco-3d-index-header">
              <span style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.2em', opacity: 0.7 }}>
                ÍNDEX GENERAL DE DISCOGRAFIA // 10 VOLUMS
              </span>
              <button onClick={() => setIsIndexOpen(false)} className="disco-3d-btn-ghost">
                TANCAR [ESC]
              </button>
            </div>

            <div className="disco-3d-index-list">
              {DISCOGRAFIA_DATA.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => {
                    handleSelectAlbum(idx);
                    setIsIndexOpen(false);
                  }}
                  className={`disco-3d-index-item ${idx === activeIndex ? 'disco-3d-index-item-active' : ''}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '11px', opacity: 0.4, flexShrink: 0 }}>{item.id}</span>
                    <span className="disco-3d-index-item-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.title}
                    </span>
                  </div>
                  <div className="disco-3d-index-meta">
                    <span>{item.year}</span>
                    <span className="disco-3d-index-label">{item.label}</span>
                    <span style={{ color: '#fbbf24' }}>«{item.single}»</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
