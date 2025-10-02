import { useEffect, useMemo, useRef, useState } from "react";
import { FiVolume2, FiVolumeX } from "react-icons/fi";
import IconButton from "./IconButton";

export default function VolumePopover({ muted, setMuted, volume, setVolume }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // cerrar al click fuera
  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // porcentaje para “track lleno”
  const pct = useMemo(() => Math.max(0, Math.min(100, Math.round(volume * 100))), [volume]);

  // al mover el slider sincronizamos mute
  const onSlide = (v) => {
    const val = Math.max(0, Math.min(1, parseFloat(v)));
    setVolume(val);
    if (val === 0) setMuted(true);
    if (val > 0 && muted) setMuted(false);
  };

  return (
    <div className="relative" ref={ref}>
      <IconButton
        title={muted ? "Unmute" : "Volume"}
        onClick={() => setOpen((v) => !v)}
      >
        {muted ? <FiVolumeX /> : <FiVolume2 />}
      </IconButton>

      {open && (
        <div
          className="absolute right-0 -top-28 z-30 w-44 rounded-2xl border border-[var(--border-1)]
                     bg-[var(--card)] shadow-[var(--shadow-1)] p-3
                     transition duration-150 ease-out origin-bottom-right
                     data-[state=closed]:opacity-0 data-[state=closed]:scale-95"
          data-state={open ? "open" : "closed"}
        >
          {/* Slider progresivo minimal */}
          <div className="relative">
            <input
              aria-label="Volume"
              type="range"
              min="0" max="1" step="0.01"
              value={volume}
              onChange={(e) => onSlide(e.target.value)}
              className="h-2 w-full appearance-none rounded-full outline-none
                         bg-[var(--border-2)]
                         transition-[background-size] duration-150"
              // Técnica: capa superior coloreada con background-size dinámico
              style={{
                backgroundImage: "linear-gradient(var(--accent), var(--accent))",
                backgroundRepeat: "no-repeat",
                backgroundSize: `${pct}% 100%`,
                borderRadius: "9999px",
              }}
            />

            {/* Thumb estilizado */}
            <style>{`
              input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 16px; height: 16px; border-radius: 9999px;
                background: var(--accent);
                border: 2px solid color-mix(in oklab, var(--text) 12%, transparent);
                box-shadow: 0 2px 6px color-mix(in oklab, var(--text) 12%, transparent);
                transition: transform .12s ease;
              }
              input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.06); }
              input[type="range"]::-moz-range-thumb {
                width: 16px; height: 16px; border: 0; border-radius: 9999px;
                background: var(--accent);
                box-shadow: 0 2px 6px color-mix(in oklab, var(--text) 12%, transparent);
              }
              /* Firefox: track base y “relleno” */
              input[type="range"]::-moz-range-track {
                height: 8px; border-radius: 9999px; background: var(--border-2);
              }
              input[type="range"]::-moz-range-progress {
                height: 8px; border-radius: 9999px; background: var(--accent);
              }
            `}</style>
          </div>

          {/* caret */}
          <div
            className="absolute -bottom-1 right-3 w-3 h-3 rotate-45
                       bg-[var(--card)] border-r border-b border-[var(--border-1)]"
          />
        </div>
      )}
    </div>
  );
}
