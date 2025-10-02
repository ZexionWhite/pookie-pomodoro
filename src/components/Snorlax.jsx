import { motion } from "framer-motion";
import { useMemo, useState } from "react";

export default function Snorlax({ timeText, cycles, mode, progress = 0 }) {
  const sleeping = mode === "short" || mode === "long";
  const [hover, setHover] = useState(false);

  // colores del theme (pastel)
  const lineColor = "var(--text)";
  const progressColor = "var(--accent)";
  const trackColor = "color-mix(in oklab, var(--text) 16%, transparent)";

  // ring
  const size = 288, r = 120, stroke = 12;
  const circ = useMemo(() => 2 * Math.PI * r, [r]);
  const dashTarget = Math.max(0, Math.min(1, progress)) * circ;
  const dashOffsetTarget = circ - dashTarget;

  return (
    <motion.div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative w-72 h-72 select-none"
      initial={{ scale: 0.98, opacity: 1 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 110, damping: 20 }}
    >
      {/* ===== Ring de progreso (suave) ===== */}
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
        <circle cx="144" cy="144" r={r} stroke={trackColor} strokeWidth={stroke} fill="none" />
        <g transform="rotate(-90 144 144)">
          <motion.circle
            cx="144"
            cy="144"
            r={r}
            stroke={progressColor}
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circ}
            animate={{ strokeDashoffset: dashOffsetTarget }}
            transition={{ type: "spring", stiffness: 135, damping: 26 }}
            strokeLinecap="round"
          />
        </g>
      </svg>

      {/* ===== Carita minimal (ojos cerrados siempre) ===== */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: hover ? 0 : 1, filter: hover ? "blur(2px)" : "blur(0px)" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Ojos cerrados */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex gap-14 translate-y-[-4px]">
            <div className="w-14 h-[6px] rounded-full" style={{ background: lineColor }} />
            <div className="w-14 h-[6px] rounded-full" style={{ background: lineColor }} />
          </div>
        </div>

        {/* Zzz sólo en descanso, bien cerquita del ojo derecho */}
        {sleeping && (
          <div
            className="absolute left-1/2 top-1/2 pointer-events-none"
            style={{ transform: "translate(-82px, -98px)", color: "var(--accent)" }}
          >
            <motion.div
              style={{ fontWeight: 700, fontSize: 18 }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: [0, 1, 0], y: [-2, -16] }}
              transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 0.2, ease: "easeOut" }}
            >
              Z
            </motion.div>
            <motion.div
              style={{ fontWeight: 700, fontSize: 16, marginLeft: 6 }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: [0, 1, 0], y: [-1, -14] }}
              transition={{ duration: 1.7, repeat: Infinity, repeatDelay: 0.25, ease: "easeOut" }}
            >
              Z
            </motion.div>
          </div>
        )}

        {/* Boca recta + colmillos en los extremos */}
        <svg className="absolute inset-0" width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
          <line x1="112" y1="196" x2="176" y2="196" stroke={lineColor} strokeWidth="6" strokeLinecap="round" />
          <path d="M112 196 l10 -12 l10 12 z" fill="#fff" />
          <path d="M176 196 l-10 -12 l-10 12 z" fill="#fff" />
        </svg>
      </motion.div>

      {/* ===== Overlay (timer + ciclos) ===== */}
      {hover && (
        <motion.div
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
        >
          <span className="text-5xl font-bold font-display tracking-wide select-none" style={{ color: "var(--text)" }}>
            {timeText}
          </span>
          <div className="mt-3 flex gap-2 text-2xl" title="Completed focus cycles">
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className={i < cycles ? "opacity-100" : "opacity-30"}>
                🍅
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
