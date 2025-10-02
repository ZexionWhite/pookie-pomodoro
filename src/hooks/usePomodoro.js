import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Hook Pomodoro con sonido al finalizar cada intervalo.
 * - notifyUrl: ruta del mp3/wav (ej: /sounds/notify.mp3 en /public)
 * - volume: 0..1 (se ajusta en caliente)
 * - muted: silencia la notificación
 */
export default function usePomodoro({
  focusMin = 25,
  shortMin = 5,
  longMin = 30,
  notifyUrl = "/sounds/notify.mp3",
  volume = 0.7,
  muted = false,
}) {
  // ---- estado base (orden fijo de hooks) ----
  const [mode, setMode] = useState("focus");           // "focus" | "short" | "long"
  const [isRunning, setRunning] = useState(false);
  const [cyclesDone, setCyclesDone] = useState(0);     // 0..3 focos completados
  const minutesFor = (m) => (m === "focus" ? focusMin : m === "short" ? shortMin : longMin);

  const totalSec = useMemo(
    () => Math.max(1, minutesFor(mode) * 60),          // >= 1 siempre
    [mode, focusMin, shortMin, longMin]
  );

  const [seconds, setSeconds] = useState(totalSec);
  const tickRef = useRef(null);

  // ---- audio estable (sin cambiar orden de hooks) ----
  const audio = useMemo(() => {
    const a = new Audio(notifyUrl);
    a.preload = "auto";
    a.crossOrigin = "anonymous";
    return a;
  }, [notifyUrl]);

  // aplicar volumen/mute en caliente
  useEffect(() => {
    audio.volume = muted ? 0 : Math.max(0, Math.min(1, volume));
  }, [audio, volume, muted]);

  const ding = () => {
    if (muted) return;
    try { audio.currentTime = 0; audio.play().catch(() => {}); } catch {}
  };

  // reset seconds cuando cambia totalSec (modo o duraciones)
  useEffect(() => { setSeconds(totalSec); }, [totalSec]);

  // ticker 1s (orden fijo)
  useEffect(() => {
    // limpia cualquier intervalo previo ANTES de crear uno nuevo
    if (tickRef.current) clearInterval(tickRef.current);
    if (!isRunning) return;

    tickRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s > 0) return s - 1;

        // terminó el intervalo actual -> decide siguiente
        let nextMode = mode;
        let nextCycles = cyclesDone;

        if (mode === "focus") {
          nextCycles = cyclesDone + 1;
          nextMode = nextCycles < 4 ? "short" : "long";
          if (nextMode === "long") nextCycles = 0;
        } else {
          nextMode = "focus";
        }

        // notificación
        ding();

        // aplica cambios
        setMode(nextMode);
        setCyclesDone(nextCycles);

        // continúa automáticamente
        return minutesFor(nextMode) * 60;
      });
    }, 1000);

    // cleanup
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [isRunning, mode, cyclesDone, focusMin, shortMin, longMin]); // deps correctas

  // label y helpers
  const label = mode === "focus" ? "Focus" : mode === "short" ? "Short break" : "Long break";
  const fmt = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${m}:${ss}`;
  };

  // progreso (0..1) robusto para evitar "undefined" en el SVG
  const progress = (totalSec > 0) ? 1 - seconds / totalSec : 0;

  return {
    mode, setMode,
    isRunning, setRunning,
    seconds, setSeconds,
    totalSec, fmt, progress,
    cyclesDone, setCyclesDone,
    label,
  };
}
