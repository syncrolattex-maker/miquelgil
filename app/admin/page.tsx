import { Metadata } from "next";
import AdminClient from "./AdminClient";

export const metadata: Metadata = {
  title: "Intranet de Gestió — Miquel Gil",
  description: "Panell d'administració privat per a la gestió de concerts i entrades de Miquel Gil.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminClient />;
}
