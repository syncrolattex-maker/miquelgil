import type { Metadata } from "next";
import PaperClient from "./PaperClient";

export const metadata: Metadata = {
  title: "Paper — Design & Creative Direction",
  description:
    "Crafting digital experiences, one fold at a time. Dark portfolio hero page for designer Paper with mirrored video reel and real-time hand-tracking gesture control.",
};

export default function PaperPage() {
  return <PaperClient />;
}
