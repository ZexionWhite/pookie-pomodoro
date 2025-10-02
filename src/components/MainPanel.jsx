import { useEffect, useState } from "react";
import { FiMenu, FiStopCircle, FiPlay, FiPause, FiRefreshCw, FiMinus } from "react-icons/fi";
import usePomodoro from "../hooks/usePomodoro";
import usePlayer from "../hooks/usePlayer";
import Snorlax from "./Snorlax";
import PlayerBar from "./PlayerBar";
import VolumePopover from "./VolumePopover";
import IconButton from "./IconButton";

export default function MainPanel({
  onConfig,
  onMinimizeRequested,
  theme,          // reservado
  setTheme,       // reservado
  durations,
  volume,         // viene de App (persistente)
  setVolume,
  muted,          // viene de App (persistente)
  setMuted,
}) {
  const { focus, short, long } = durations;

  // --- cargar playlist desde /public/songs/playlist.json
  const [playlist, setPlaylist] = useState([]);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/songs/playlist.json", { cache: "no-cache" });
        const json = await res.json();
        if (!alive) return;
        // Permitimos strings o {src,title}
        const norm = Array.isArray(json) ? json : [];
        setPlaylist(norm);
      } catch {
        setPlaylist([]); // tolerante
      }
    })();
    return () => { alive = false; };
  }, []);

  // Pomodoro (ding usa volumen/mute global)
  const P = usePomodoro({
    focusMin: focus,
    shortMin: short,
    longMin: long,
    notifyUrl: "/sounds/notify.mp3",
    volume,
    muted,
  });

  // Música con la misma config + shuffle
  const music = usePlayer({ playlist, volume, muted, shuffle: true });

  const onPlayClick = () => {
    P.enableSound?.();   // desbloquea audio para notis
    P.setRunning(true);
    music.play?.();      // opcional: acompaña al pomodoro
  };

  const onPauseClick = () => {
    P.setRunning(false);
    music.pause?.();
  };

  const onStopClick = () => {
    P.setRunning(false);
    P.setSeconds(P.totalSec);
    // si querés también: music.pause?.(); music.seekRatio?.(0);
  };

  return (
    <div className="h-full w-full flex flex-col items-center gap-3 p-3 select-none">
      {/* Top titlebar */}
      <div data-tauri-drag-region className="w-full flex items-center justify-between text-[var(--text)]">
        <IconButton title="Settings" onClick={onConfig}><FiMenu /></IconButton>
        <div className="font-display text-base font-bold tracking-wide">{P.label}</div>
        <IconButton title="Minimize" onClick={onMinimizeRequested}><FiMinus /></IconButton>
      </div>

      {/* Snorlax + timer */}
      <Snorlax
        timeText={P.fmt(P.seconds)}
        cycles={P.cyclesDone}
        mode={P.mode}
        progress={P.progress}
      />

      {/* Player bar */}
      <div className="w-full px-1">
        <PlayerBar music={music} />
      </div>

      {/* Controls dock */}
      <div className="w-full mt-1 rounded-2xl border border-[var(--border-1)] bg-[var(--surface)] shadow-[var(--shadow-1)] px-3 py-2">
        <div className="grid grid-cols-5 items-center">
          <div className="flex justify-start">
            <IconButton title="Settings" onClick={onConfig}><FiMenu /></IconButton>
          </div>

          <div className="flex justify-center">
            <IconButton title="Stop" onClick={onStopClick}>
              <FiStopCircle />
            </IconButton>
          </div>

          <div className="flex justify-center">
            {P.isRunning ? (
              <IconButton title="Pause" onClick={onPauseClick} variant="filled" size="lg">
                <FiPause />
              </IconButton>
            ) : (
              <IconButton title="Play" onClick={onPlayClick} variant="filled" size="lg">
                <FiPlay />
              </IconButton>
            )}
          </div>

          <div className="flex justify-center">
            <IconButton title="Auto-advance" className="opacity-80">
              <FiRefreshCw />
            </IconButton>
          </div>

          <div className="flex justify-end">
            <VolumePopover
              muted={muted}
              setMuted={setMuted}
              volume={volume}
              setVolume={setVolume}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
