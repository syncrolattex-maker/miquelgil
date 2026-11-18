import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mainframe® — Creative Agency",
  description: "Full-screen hero landing page for creative agency Mainframe.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Prova01Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://db.onlinewebfonts.com/c/5ac3fe7c6abd2f62067f266d89671492?family=HelveticaNowDisplay-Medium"
      />
      <link
        rel="stylesheet"
        href="https://db.onlinewebfonts.com/c/1aa3377e489837a26d019bba501e779d?family=HelveticaNowDisplayW01-Rg"
      />
      {children}
    </>
  );
}
