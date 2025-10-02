export default function PlayerBar({ music }) {
  const pos = music?.pos ?? 0;
  const cur = music?.current ?? 0;
  const dur = music?.duration ?? 0;

  const fmt = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${ss}`;
  };

  return (
    <div className="w-full select-none">
      <div className="flex items-center justify-between text-[12px] font-semibold text-[var(--text)]/80 mb-1">
        <span className="truncate">{music?.title ?? "—"}</span>
        <span>{fmt(cur)} / {fmt(dur)}</span>
      </div>

      <div
        className="relative h-[6px] w-full rounded-full cursor-pointer bg-[var(--border-2)]"
        onClick={(e) => {
          if (!music?.seekRatio) return;
          const r = e.currentTarget.getBoundingClientRect();
          const p = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
          music.seekRatio(p);
        }}
      >
        <div className="absolute left-0 top-0 bottom-0 rounded-full bg-[var(--accent)]"
             style={{ width: `${(pos || 0) * 100}%`, transition: "width 160ms linear" }} />
        <div className="absolute -top-[5px] w-3.5 h-3.5 rounded-full bg-[var(--accent)] translate-x-[-50%]"
             style={{ left: `${(pos || 0) * 100}%` }} />
      </div>
    </div>
  );
}
