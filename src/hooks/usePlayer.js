import { useEffect, useMemo, useRef, useState } from "react";

export default function usePlayer({
  playlist,            // ["url.mp3"] o [{src, title}]
  volume = 0.7,
  muted = false,
  shuffle = true,
  loop = false,
}) {
  // Normalizar playlist → [{src,title}]
  const meta = useMemo(() => {
    const arr = Array.isArray(playlist) ? playlist : [];
    return arr
      .map(it =>
        typeof it === "string" ? { src: it, title: fileTitle(it) } : it
      )
      .filter(m => typeof m?.src === "string" && m.src.length > 0);
  }, [playlist]);

  const audioRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Crear <audio> una sola vez
  if (!audioRef.current) {
    const a = new Audio();
    a.preload = "metadata";
    a.crossOrigin = "anonymous";
    audioRef.current = a;
  }
  const a = audioRef.current;

  // Track actual seguro
  const track = meta.length ? meta[(index + meta.length) % meta.length] : null;

  // Listeners + cargar fuente
  useEffect(() => {
    if (!a) return;

    const onLoaded = () => {
      setDuration(Number.isFinite(a.duration) ? a.duration : 0);
      // aplicar vol/mute por si el load resetea algo
      a.muted = !!muted;
      a.volume = clamp01(volume);
    };
    const onTime = () =>
      setCurrent(Number.isFinite(a.currentTime) ? a.currentTime : 0);

    const onEnded = () => {
      if (loop) {
        a.currentTime = 0;
        a.play().catch(() => {});
        return;
      }
      // pasar al siguiente y mantener play
      next(true);
    };

    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("durationchange", onLoaded);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnded);

    return () => {
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("durationchange", onLoaded);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnded);
    };
  }, [a, loop, muted, volume]);

  // Aplicar vol/mute en caliente
  useEffect(() => {
    if (!a) return;
    a.muted = !!muted;
    a.volume = clamp01(volume);
  }, [a, volume, muted]);

  // Cuando cambia playlist, corregir índice si hace falta y cargar tema
  useEffect(() => {
    if (!a || !meta.length) {
      setDuration(0);
      setCurrent(0);
      return;
    }
    const nextIndex = Math.min(index, meta.length - 1);
    if (nextIndex !== index) setIndex(nextIndex);
    // Cargar el tema actual y reproducir si ya veníamos en play
    a.src = meta[nextIndex].src;
    a.currentTime = 0;
    if (isPlaying) a.play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta]);

  // Cuando cambia el índice, cargar ese tema y seguir reproduciendo si corresponde
  useEffect(() => {
    if (!a || !track?.src) return;
    a.src = track.src;
    a.currentTime = 0;
    if (isPlaying) a.play().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, track?.src]);

  /* ---- Controles ---- */
  async function play() {
    if (!a || !track?.src) return;
    try {
      a.muted = !!muted;
      a.volume = clamp01(volume);
      await a.play();
      setIsPlaying(true);
    } catch {}
  }

  function pause() {
    if (!a) return;
    a.pause();
    setIsPlaying(false);
  }

  function toggle() {
    isPlaying ? pause() : play();
  }

  function seekRatio(p) {
    if (!a || !duration) return;
    const t = clamp01(p) * duration;
    a.currentTime = t;
    setCurrent(t);
  }

  function next(fromAuto = false) {
    if (!meta.length) return;
    setIndex(i => {
      if (shuffle && meta.length > 1) {
        let n = i;
        while (n === i) n = Math.floor(Math.random() * meta.length);
        return n;
      }
      return (i + 1) % meta.length;
    });
    // si venimos del 'ended' o ya estaba tocando, mantener reproducción
    if (fromAuto || isPlaying) setIsPlaying(true);
  }

  function prev() {
    if (!meta.length) return;
    setIndex(i => (i - 1 + meta.length) % meta.length);
    if (isPlaying) setIsPlaying(true);
  }

  const pos = useMemo(() => (duration ? current / duration : 0), [current, duration]);

  return {
    // Estado expuesto
    isPlaying,
    duration,
    current,
    pos,
    index,
    src: track?.src || "",
    title: track?.title || (track?.src ? fileTitle(track.src) : "—"),
    list: meta,

    // Controles
    play,
    pause,
    toggle,
    seekRatio,
    next,
    prev,
    setIndex,
    audio: a,
  };
}

/* utils */
function fileTitle(url) {
  try {
    const name = decodeURIComponent(url.split("/").pop() || "");
    return name.replace(/\.(mp3|wav|ogg)$/i, "");
  } catch {
    return "—";
  }
}

function clamp01(x) {
  return Math.max(0, Math.min(1, Number.isFinite(x) ? x : 0));
}
