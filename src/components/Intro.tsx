import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./Intro.css";

/** The envelope: a "+" to open, which slides left as "Conexão" unfolds. Shown on every visit. */
export default function Intro({ onDone }: { onDone: () => void }) {
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (!opened) return;
    // Leave as soon as the word has finished unfolding (Intro.css: 0.45s delay + 0.9s).
    const t = window.setTimeout(onDone, 1400);
    return () => window.clearTimeout(t);
  }, [opened, onDone]);

  return (
    <motion.div
      className="intro"
      role="dialog"
      aria-modal="true"
      aria-label="Entrada"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <button
        type="button"
        className={`intro__mark${opened ? " is-open" : ""}`}
        onClick={() => setOpened(true)}
        aria-label={opened ? undefined : "Abrir ligação"}
        autoFocus
      >
        <span className="intro__plus" aria-hidden={!opened}>
          <i />
          <span className="sr-only">+</span>
        </span>
        <span className="intro__word">
          <span>Conexão</span>
        </span>
      </button>
    </motion.div>
  );
}
