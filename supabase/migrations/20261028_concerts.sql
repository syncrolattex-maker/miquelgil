-- =========================================================================
-- MIQUEL GIL — GESTIÓ D'AGENDA I CONCERTS (SUPABASE SCHEMA)
-- =========================================================================

-- 1. Crear taula de concerts
CREATE TABLE IF NOT EXISTS public.concerts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  format TEXT NOT NULL,
  date_str TEXT NOT NULL,
  year TEXT NOT NULL,
  venue TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'postponed', 'past')),
  status_text TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  ticket_url TEXT,
  info_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT true,
  bg TEXT NOT NULL DEFAULT '#F4A261',
  fg TEXT NOT NULL DEFAULT '#111211',
  badge TEXT NOT NULL DEFAULT 'Concert',
  order_index INTEGER DEFAULT 99,
  raw_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE public.concerts ENABLE ROW LEVEL SECURITY;

-- 3. Política de lectura pública: tothom pot consultar els concerts de l'agenda
DROP POLICY IF EXISTS "Concerts són públics per a lectura" ON public.concerts;
CREATE POLICY "Concerts són públics per a lectura"
  ON public.concerts
  FOR SELECT
  USING (true);

-- 4. Política d'escriptura: usuaris autenticats o clau d'administració
DROP POLICY IF EXISTS "Usuaris autenticats poden gestionar concerts" ON public.concerts;
CREATE POLICY "Usuaris autenticats poden gestionar concerts"
  ON public.concerts
  FOR ALL
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- 5. Inserció de dades inicials
INSERT INTO public.concerts (
  id, title, format, date_str, year, venue, city, status, status_text,
  description, info_url, is_featured, bg, fg, badge, order_index
) VALUES
(
  'mataro-2026',
  'Festival 2 Terços — Can Soler',
  'Duo amb Eduard Navarro',
  'Pendent de nova data (2026)',
  '2026',
  'Can Soler (Espai Agrari i Natural)',
  'Mataró (Maresme)',
  'postponed',
  'Ajornat per pluja · Nova data properament',
  'Concert íntim d''arrel mediterrània en format duo amb Eduard Navarro (vents tradicionals i corda polsada). Actuació emmarcada en el festival de cultura i paisatge 2 Terços.',
  'https://www.mataro.cat/ca/actualitat/agenda/2026-miquel-gil-i-eduard-navarro',
  true,
  '#E63946',
  '#111211',
  'Format Íntim',
  1
),
(
  'kursaal-2024',
  'Miquel Gil Trio al Kursaal',
  'Miquel Gil Trio',
  '13 d''abril de 2024 · 20:00 h',
  '2024',
  'Teatre Kursaal (Sala Petita)',
  'Manresa (Bages)',
  'past',
  'Completat amb èxit',
  'Presentació del repertori contemporani i peces clau de la trajectòria de Miquel Gil acompanyat per Nelo Alfonso als teclats i Gusmà Gil al baix elèctric.',
  'https://surtdecasa.cat/centre/agenda/2024/concert-de-miquel-gil-trio/224743',
  false,
  '#F4A261',
  '#111211',
  'Format Trio',
  2
),
(
  'principal-2024',
  'Estrena Oficial de «Viatger»',
  'Estrena amb Convidats',
  '9 de març de 2024 · 20:30 h',
  '2024',
  'Teatre Principal de València',
  'València',
  'past',
  'Entrades Esgotades',
  'Gran concert de presentació de l''àlbum «Viatger», dedicat a la memòria de Manolo Miralles. Una producció especial d''alta volada artística amb col·laboracions especials.',
  NULL,
  true,
  '#E9C46A',
  '#111211',
  'Gran Estrena',
  3
),
(
  'etno-2023',
  'Inauguració l''ETNO — 20 anys d''Orgànic',
  'Banda Completa (6 músics)',
  '27 d''abril de 2023 · 21:00 h',
  '2023',
  'L''ETNO (La Beneficència)',
  'València',
  'past',
  'Concert Inaugural',
  'Concert de celebració de les dues dècades del disc fundacional «Orgànic», amb la formació de gala: Eduard Navarro, Toni Porcar, Nelo Alfonso, Gusmà Gil i José María Reillo.',
  'https://letno.dival.es/en/actividad/concert-or-spectacle/miquel-gil',
  false,
  '#2A9D8F',
  '#111211',
  'Banda Completa',
  4
),
(
  'palau-2019',
  'Presentació «Geometries» al Palau',
  'Banda i Convidats Especials',
  '15 de novembre de 2019 · 21:00 h',
  '2019',
  'Palau de la Música de València',
  'València',
  'past',
  'Entrades Esgotades',
  'Estrena solemnement aclamada de l''àlbum «Geometries» amb la participació de Pep Gimeno «Botifarra», Borja Penalba, Mireia Vives i Marta Margaix.',
  'https://www.vilaweb.cat/noticies/pep-gimeno-botifarra-borja-penalba-mireia-vives-i-marta-margaix-convidats-de-miquel-gil-al-palau/',
  false,
  '#83A95C',
  '#111211',
  'Concert Històric',
  5
),
(
  'nus-tour',
  'Gira «Nus» amb Botifarra',
  'Duo amb Pep Gimeno «Botifarra»',
  '2015 — 2018 (Més de 50 concerts)',
  '2015',
  'Auditoris i teatres arreu del país',
  'País Valencià i Catalunya',
  'past',
  'Gira Històrica',
  'Trobada íntima i despullada entre dos cims del cant popular valencià. Només veus, guitarra acústica i xicotetes percussions tradicionals compartint escenari arreu del territori.',
  NULL,
  false,
  '#8ECAE6',
  '#111211',
  'Gira Històrica',
  6
)
ON CONFLICT (id) DO NOTHING;
