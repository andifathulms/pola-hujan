"use client";

import { useEffect } from "react";

// Static host (GitHub Pages), no server: redirect client-side once JS
// runs, with a visible fallback link for anyone or anything that
// doesn't execute it.
export default function HomePage() {
  useEffect(() => {
    window.location.replace("./peta/");
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <p>
        Pola Hujan — <a href="./peta/">buka peta rezim curah hujan</a>.
      </p>
    </main>
  );
}
