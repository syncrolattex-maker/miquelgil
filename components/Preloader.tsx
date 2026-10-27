"use client";

import { useEffect, useState } from "react";

export default function Preloader() {
  const [hidden, setHidden] = useState(false);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    const hide = window.setTimeout(() => setHidden(true), 650);
    const remove = window.setTimeout(() => setMounted(false), 1400);
    return () => {
      window.clearTimeout(hide);
      window.clearTimeout(remove);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="preloader" data-hidden={hidden} aria-hidden="true">
      <img src="/images/logo-W.png" alt="" />
    </div>
  );
}
