import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacte i Contractació Oficial",
  description:
    "Canals oficials de contacte i contractació de Miquel Gil. Management artístic, xarxes socials i comunicació directa.",
  alternates: {
    canonical: "https://miquelgil.com/contacte",
  },
};

export default function ContacteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
