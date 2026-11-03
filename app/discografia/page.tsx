import DiscografiaClient from "./DiscografiaClient";

export const metadata = {
  title: "Miquel Gil — Discografia Optical Archive",
  description:
    "Arxiu 3D interactiu de la discografia oficial de Miquel Gil: 12 edicions en format òptic CD amb serigrafia i tipografia cinètica estil A24.",
};

export default function Discografia() {
  return <DiscografiaClient />;
}
