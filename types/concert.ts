export type ConcertStatus = "upcoming" | "postponed" | "past";

export interface Concert {
  id: string;
  title: string;
  format: string;
  dateStr: string;
  year: string;
  venue: string;
  city: string;
  status: ConcertStatus;
  statusText: string;
  description: string;
  ticketUrl?: string;
  infoUrl?: string;
  isFeatured?: boolean;
  bg: string;
  fg: string;
  badge: string;
  order?: number;
  rawDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FormatPreset {
  name: string;
  badge: string;
  bg: string;
  fg: string;
}

export const FORMAT_PRESETS: FormatPreset[] = [
  {
    name: "Duo amb Eduard Navarro",
    badge: "Format Íntim",
    bg: "#E63946",
    fg: "#111211",
  },
  {
    name: "Miquel Gil Trio",
    badge: "Format Trio",
    bg: "#F4A261",
    fg: "#111211",
  },
  {
    name: "Estrena amb Convidats",
    badge: "Gran Estrena",
    bg: "#E9C46A",
    fg: "#111211",
  },
  {
    name: "Banda Completa (6 músics)",
    badge: "Banda Completa",
    bg: "#2A9D8F",
    fg: "#111211",
  },
  {
    name: "Banda i Convidats Especials",
    badge: "Concert Històric",
    bg: "#83A95C",
    fg: "#111211",
  },
  {
    name: "Duo amb Pep Gimeno «Botifarra»",
    badge: "Gira Històrica",
    bg: "#8ECAE6",
    fg: "#111211",
  },
  {
    name: "Recital Acústic / Sol",
    badge: "Acústic Sol",
    bg: "#D4A373",
    fg: "#111211",
  },
];

export const PALETTE_SWATCHES = [
  { label: "Vermell Terracota", bg: "#E63946", fg: "#111211" },
  { label: "Ambre Mediterrani", bg: "#F4A261", fg: "#111211" },
  { label: "Arena Daurada", bg: "#E9C46A", fg: "#111211" },
  { label: "Verd Jade Marí", bg: "#2A9D8F", fg: "#111211" },
  { label: "Verd Oliva de Camp", bg: "#83A95C", fg: "#111211" },
  { label: "Blau Cel de Costa", bg: "#8ECAE6", fg: "#111211" },
  { label: "Ocre Terres", bg: "#D4A373", fg: "#111211" },
  { label: "Bordeus Fosc", bg: "#9D0208", fg: "#FFFFFF" },
  { label: "Cendra Carbó", bg: "#2B2D42", fg: "#FFFFFF" },
];

export const DEFAULT_CONCERTS: Concert[] = [
  {
    id: "mataro-2026",
    title: "Festival 2 Terços — Can Soler",
    format: "Duo amb Eduard Navarro",
    dateStr: "Pendent de nova data (2026)",
    year: "2026",
    venue: "Can Soler (Espai Agrari i Natural)",
    city: "Mataró (Maresme)",
    status: "postponed",
    statusText: "Ajornat per pluja · Nova data properament",
    description:
      "Concert íntim d'arrel mediterrània en format duo amb Eduard Navarro (vents tradicionals i corda polsada). Actuació emmarcada en el festival de cultura i paisatge 2 Terços.",
    infoUrl: "https://www.mataro.cat/ca/actualitat/agenda/2026-miquel-gil-i-eduard-navarro",
    isFeatured: true,
    bg: "#E63946",
    fg: "#111211",
    badge: "Format Íntim",
    order: 1,
  },
  {
    id: "kursaal-2024",
    title: "Miquel Gil Trio al Kursaal",
    format: "Miquel Gil Trio",
    dateStr: "13 d'abril de 2024 · 20:00 h",
    year: "2024",
    venue: "Teatre Kursaal (Sala Petita)",
    city: "Manresa (Bages)",
    status: "past",
    statusText: "Completat amb èxit",
    description:
      "Presentació del repertori contemporani i peces clau de la trajectòria de Miquel Gil acompanyat per Nelo Alfonso als teclats i Gusmà Gil al baix elèctric.",
    infoUrl: "https://surtdecasa.cat/centre/agenda/2024/concert-de-miquel-gil-trio/224743",
    bg: "#F4A261",
    fg: "#111211",
    badge: "Format Trio",
    order: 2,
  },
  {
    id: "principal-2024",
    title: "Estrena Oficial de «Viatger»",
    format: "Estrena amb Convidats",
    dateStr: "9 de març de 2024 · 20:30 h",
    year: "2024",
    venue: "Teatre Principal de València",
    city: "València",
    status: "past",
    statusText: "Entrades Esgotades",
    description:
      "Gran concert de presentació de l'àlbum «Viatger», dedicat a la memòria de Manolo Miralles. Una producció especial d'alta volada artística amb col·laboracions especials.",
    isFeatured: true,
    bg: "#E9C46A",
    fg: "#111211",
    badge: "Gran Estrena",
    order: 3,
  },
  {
    id: "etno-2023",
    title: "Inauguració l'ETNO — 20 anys d'Orgànic",
    format: "Banda Completa (6 músics)",
    dateStr: "27 d'abril de 2023 · 21:00 h",
    year: "2023",
    venue: "L'ETNO (La Beneficència)",
    city: "València",
    status: "past",
    statusText: "Concert Inaugural",
    description:
      "Concert de celebració de les dues dècades del disc fundacional «Orgànic», amb la formació de gala: Eduard Navarro, Toni Porcar, Nelo Alfonso, Gusmà Gil i José María Reillo.",
    infoUrl: "https://letno.dival.es/en/actividad/concert-or-spectacle/miquel-gil",
    bg: "#2A9D8F",
    fg: "#111211",
    badge: "Banda Completa",
    order: 4,
  },
  {
    id: "palau-2019",
    title: "Presentació «Geometries» al Palau",
    format: "Banda i Convidats Especials",
    dateStr: "15 de novembre de 2019 · 21:00 h",
    year: "2019",
    venue: "Palau de la Música de València",
    city: "València",
    status: "past",
    statusText: "Entrades Esgotades",
    description:
      "Estrena solemnement aclamada de l'àlbum «Geometries» amb la participació de Pep Gimeno «Botifarra», Borja Penalba, Mireia Vives i Marta Margaix.",
    infoUrl: "https://www.vilaweb.cat/noticies/pep-gimeno-botifarra-borja-penalba-mireia-vives-i-marta-margaix-convidats-de-miquel-gil-al-palau/",
    bg: "#83A95C",
    fg: "#111211",
    badge: "Concert Històric",
    order: 5,
  },
  {
    id: "nus-tour",
    title: "Gira «Nus» amb Botifarra",
    format: "Duo amb Pep Gimeno «Botifarra»",
    dateStr: "2015 — 2018 (Més de 50 concerts)",
    year: "2015",
    venue: "Auditoris i teatres arreu del país",
    city: "País Valencià i Catalunya",
    status: "past",
    statusText: "Gira Històrica",
    description:
      "Trobada íntima i despullada entre dos cims del cant popular valencià. Només veus, guitarra acústica i xicotetes percussions tradicionals compartint escenari arreu del territori.",
    bg: "#8ECAE6",
    fg: "#111211",
    badge: "Gira Històrica",
    order: 6,
  },
];
