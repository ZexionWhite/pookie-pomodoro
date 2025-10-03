import { useEffect, useMemo, useRef, useState } from "react";

export default function usePomodoro({
  focusMin = 25,
  shortMin = 5,
  longMin = 30,
  notifyUrl = "/sounds/notify.mp3",
  volume = 0.7,
  muted = false,
}) {
  const [mode, setMode] = useState("focus");
  const [isRunning, setRunning] = useState(false);
  const [cyclesDone, setCyclesDone] = useState(0);
  const minutesFor = (m) => (m === "focus" ? focusMin : m === "short" ? shortMin : longMin);

  const totalSec = useMemo(
    () => Math.max(1, minutesFor(mode) * 60),
    [mode, focusMin, shortMin, longMin]
  );

  const [seconds, setSeconds] = useState(totalSec);
  const tickRef = useRef(null);

  const audio = useMemo(() => {
    const a = new Audio(notifyUrl);
    a.preload = "auto";
    a.crossOrigin = "anonymous";
    return a;
  }, [notifyUrl]);

  useEffect(() => {
    audio.volume = muted ? 0 : Math.max(0, Math.min(1, volume));
  }, [audio, volume, muted]);

  const ding = () => {
    if (muted) return;
    try { audio.currentTime = 0; audio.play().catch(() => {}); } catch {}
  };

  useEffect(() => { setSeconds(totalSec); }, [totalSec]);

  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (!isRunning) return;

    tickRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s > 0) return s - 1;

        let nextMode = mode;
        let nextCycles = cyclesDone;

        if (mode === "focus") {
          nextCycles = cyclesDone + 1;
          nextMode = nextCycles < 4 ? "short" : "long";
          if (nextMode === "long") nextCycles = 0;
        } else {
          nextMode = "focus";
        }

        ding();

        setMode(nextMode);
        setCyclesDone(nextCycles);

        return minutesFor(nextMode) * 60;
      });
    }, 1000);


    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [isRunning, mode, cyclesDone, focusMin, shortMin, longMin]);

  const label = mode === "focus" ? "Focus" : mode === "short" ? "Short break" : "Long break";
  const fmt = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = String(s % 60).padStart(2, "0");
    return `${m}:${ss}`;
  };

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
