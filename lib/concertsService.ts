import { Concert, ConcertStatus, DEFAULT_CONCERTS } from "@/types/concert";
import { supabase, isSupabaseConfigured } from "./supabase";

const STORAGE_KEY = "miquel_gil_concerts_v1";
const SYNC_EVENT = "miquelgil:concerts_updated";

/**
 * Normalitza el concert per assegurar tots els camps obligatoris
 */
export function normalizeConcert(c: Partial<Concert>): Concert {
  return {
    id: c.id || `concert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: (c.title || "Nou Concert").trim(),
    format: (c.format || "Miquel Gil en Concert").trim(),
    dateStr: (c.dateStr || "Properament").trim(),
    year: (c.year || new Date().getFullYear().toString()).trim(),
    venue: (c.venue || "Per confirmar").trim(),
    city: (c.city || "").trim(),
    status: (c.status || "upcoming") as ConcertStatus,
    statusText: (c.statusText || "Entrades a la venda").trim(),
    description: (c.description || "").trim(),
    ticketUrl: c.ticketUrl ? c.ticketUrl.trim() : undefined,
    infoUrl: c.infoUrl ? c.infoUrl.trim() : undefined,
    isFeatured: c.isFeatured !== undefined ? Boolean(c.isFeatured) : true,
    bg: c.bg || "#F4A261",
    fg: c.fg || "#111211",
    badge: (c.badge || "Concert").trim(),
    order: typeof c.order === "number" ? c.order : 99,
    rawDate: c.rawDate || undefined,
    createdAt: c.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Obté la llista de concerts des de Supabase o LocalStorage (amb fallback a DEFAULT_CONCERTS)
 */
export async function getConcerts(): Promise<Concert[]> {
  // 1. Si Supabase està configurat, intentem des de la base de dades al núvol
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("concerts")
        .select("*")
        .order("order", { ascending: true, nullsFirst: false });

      if (!error && data && data.length > 0) {
        const mapped = data.map((row: any) =>
          normalizeConcert({
            id: row.id,
            title: row.title,
            format: row.format,
            dateStr: row.date_str || row.dateStr,
            year: row.year,
            venue: row.venue,
            city: row.city,
            status: row.status,
            statusText: row.status_text || row.statusText,
            description: row.description,
            ticketUrl: row.ticket_url || row.ticketUrl,
            infoUrl: row.info_url || row.infoUrl,
            isFeatured: row.is_featured ?? row.isFeatured,
            bg: row.bg,
            fg: row.fg,
            badge: row.badge,
            order: row.order_index ?? row.order,
            rawDate: row.raw_date || row.rawDate,
            createdAt: row.created_at || row.createdAt,
            updatedAt: row.updated_at || row.updatedAt,
          })
        );
        // Actualitzem la memòria cau local
        saveToLocalStorage(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn("Supabase fetch failed, falling back to local cache:", err);
    }
  }

  // 2. Fallback a LocalStorage al navegador
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeConcert);
        }
      }
    } catch (e) {
      console.warn("Could not read concerts from localStorage:", e);
    }

    // Inicialitzem amb les dades per defecte si està buit
    saveToLocalStorage(DEFAULT_CONCERTS);
  }

  return DEFAULT_CONCERTS;
}

/**
 * Guarda o actualitza un concert
 */
export async function saveConcert(concertData: Partial<Concert>): Promise<Concert> {
  const concert = normalizeConcert(concertData);

  // 1. Supabase si està actiu
  if (isSupabaseConfigured && supabase) {
    try {
      const dbRow = {
        id: concert.id,
        title: concert.title,
        format: concert.format,
        date_str: concert.dateStr,
        year: concert.year,
        venue: concert.venue,
        city: concert.city,
        status: concert.status,
        status_text: concert.statusText,
        description: concert.description,
        ticket_url: concert.ticketUrl || null,
        info_url: concert.infoUrl || null,
        is_featured: concert.isFeatured,
        bg: concert.bg,
        fg: concert.fg,
        badge: concert.badge,
        order_index: concert.order,
        raw_date: concert.rawDate || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("concerts").upsert(dbRow);
      if (error) {
        console.error("Error saving to Supabase:", error);
      }
    } catch (err) {
      console.warn("Supabase upsert failed:", err);
    }
  }

  // 2. Actualitzem LocalStorage
  if (typeof window !== "undefined") {
    const current = await getConcerts();
    const existingIndex = current.findIndex((c) => c.id === concert.id);
    let updated: Concert[];

    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = concert;
    } else {
      updated = [concert, ...current];
    }

    saveToLocalStorage(updated);
    dispatchSyncEvent(updated);
  }

  return concert;
}

/**
 * Elimina un concert per id
 */
export async function deleteConcert(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("concerts").delete().eq("id", id);
      if (error) console.error("Error deleting from Supabase:", error);
    } catch (err) {
      console.warn("Supabase delete failed:", err);
    }
  }

  if (typeof window !== "undefined") {
    const current = await getConcerts();
    const updated = current.filter((c) => c.id !== id);
    saveToLocalStorage(updated);
    dispatchSyncEvent(updated);
  }

  return true;
}

/**
 * Canvi ràpid d'estat (ex: passar a Exhaurides amb un sol clic)
 */
export async function quickUpdateStatus(
  id: string,
  status: ConcertStatus,
  statusText?: string
): Promise<Concert | null> {
  const current = await getConcerts();
  const found = current.find((c) => c.id === id);
  if (!found) return null;

  const defaultStatusTexts: Record<ConcertStatus, string> = {
    upcoming: "Entrades a la venda",
    postponed: "Ajornat · Nova data properament",
    past: "Entrades Esgotades",
  };

  const updated: Concert = {
    ...found,
    status,
    statusText: statusText || defaultStatusTexts[status],
    updatedAt: new Date().toISOString(),
  };

  return await saveConcert(updated);
}

/**
 * Restableix la llista als concerts originals
 */
export async function resetToDefaults(): Promise<Concert[]> {
  if (typeof window !== "undefined") {
    saveToLocalStorage(DEFAULT_CONCERTS);
    dispatchSyncEvent(DEFAULT_CONCERTS);
  }
  return DEFAULT_CONCERTS;
}

/**
 * Subscripció reactiva per als components del client
 */
export function subscribeToConcerts(callback: (concerts: Concert[]) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (event: any) => {
    if (event.detail && Array.isArray(event.detail)) {
      callback(event.detail);
    } else {
      getConcerts().then(callback);
    }
  };

  window.addEventListener(SYNC_EVENT, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(SYNC_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

function saveToLocalStorage(concerts: Concert[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(concerts));
  } catch (e) {
    console.warn("LocalStorage save error:", e);
  }
}

function dispatchSyncEvent(concerts: Concert[]) {
  try {
    window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: concerts }));
  } catch (e) {}
}
