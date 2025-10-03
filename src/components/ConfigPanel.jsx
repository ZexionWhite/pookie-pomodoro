import { useEffect, useMemo, useState } from "react";
import { FiMinus, FiArrowLeft, FiRotateCcw, FiVolume2, FiVolumeX } from "react-icons/fi";
import { getCurrentWindow } from "@tauri-apps/api/window";

const LS_KEY = "pookie.settings";
const DEFAULTS = {
  durations: { focus: 25, short: 5, long: 30 },
  theme: "pink",
  autoStartNext: true,
  loopMusic: false,
  tickSound: true,
  notifications: true,
  alwaysOnTop: true,
};

export default function ConfigPanel({
  onBack,
  onMinimizeRequested,
  theme,
  setTheme,
  durations,
  setDurations,
  volume,
  setVolume,
  muted,
  setMuted,
}) {
  const [opts, setOpts] = useState({
    autoStartNext: DEFAULTS.autoStartNext,
    loopMusic: DEFAULTS.loopMusic,
    tickSound: DEFAULTS.tickSound,
    notifications: DEFAULTS.notifications,
    alwaysOnTop: DEFAULTS.alwaysOnTop,
  });


  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.theme) setTheme(saved.theme);
        if (saved.durations) setDurations(saved.durations);
        if (saved.opts) setOpts((o) => ({ ...o, ...saved.opts }));
      }
    } catch {}

  }, []);


  const snap = useMemo(() => ({ theme, durations, opts }), [theme, durations, opts]);
  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem(LS_KEY, JSON.stringify(snap)), 120);
    return () => clearTimeout(t);
  }, [snap]);


  const setOpt = (k, v) => setOpts((o) => ({ ...o, [k]: v }));
  const updDur = (k, v) =>
    setDurations((d) => ({ ...d, [k]: Math.max(1, Math.min(180, Number(v || 0))) }));
  const step = (k, dir) => updDur(k, (durations[k] ?? 0) + (dir === "inc" ? 1 : -1));

  const resetAll = () => {
    setDurations(DEFAULTS.durations);
    setTheme(DEFAULTS.theme);
    setOpts({
      autoStartNext: DEFAULTS.autoStartNext,
      loopMusic: DEFAULTS.loopMusic,
      tickSound: DEFAULTS.tickSound,
      notifications: DEFAULTS.notifications,
      alwaysOnTop: DEFAULTS.alwaysOnTop,
    });

  };


  useEffect(() => {
    (async () => {
      try {
        const win = getCurrentWindow();
        await win.setAlwaysOnTop(!!opts.alwaysOnTop);
      } catch {}
    })();
  }, [opts.alwaysOnTop]);


  const beep = () => {
    if (!opts.tickSound) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 880;
    g.gain.value = (muted ? 0 : volume) * 0.2; 
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(() => {
      o.stop();
      ctx.close();
    }, 120);
  };

  return (
    <div className="h-full w-full flex flex-col clip-edge overflow-hidden select-none">
      {/* Topbar fijo */}
      <div data-tauri-drag-region className="shrink-0 w-full flex items-center justify-between px-3 py-2">
        <button
          data-tauri-drag-region={false}
          onClick={onBack}
          className="text-xl grid place-items-center h-9 w-9 rounded-xl hover:bg-[var(--surface)]"
          title="Back"
        >
          <FiArrowLeft />
        </button>

        <div className="font-display font-bold text-lg tracking-wide">Settings</div>

        <button
          data-tauri-drag-region={false}
          onClick={onMinimizeRequested}
          className="text-xl grid place-items-center h-9 w-9 rounded-xl hover:bg-[var(--surface)]"
          title="Minimize"
        >
          <FiMinus />
        </button>
      </div>

      <div className="grow overflow-auto no-scrollbars px-3 pb-3 space-y-3">
        {/* Durations (vertical) */}
        <Card title="Pomodoro lengths">
          <Field
            label="Focus (min)"
            control={
              <Stepper
                value={durations.focus}
                onDec={() => step("focus", "dec")}
                onInc={() => step("focus", "inc")}
                onInput={(v) => updDur("focus", v)}
              />
            }
          />
          <Divider />
          <Field
            label="Short break (min)"
            control={
              <Stepper
                value={durations.short}
                onDec={() => step("short", "dec")}
                onInc={() => step("short", "inc")}
                onInput={(v) => updDur("short", v)}
              />
            }
          />
          <Divider />
          <Field
            label="Long break (min)"
            control={
              <Stepper
                value={durations.long}
                onDec={() => step("long", "dec")}
                onInc={() => step("long", "inc")}
                onInput={(v) => updDur("long", v)}
              />
            }
          />
        </Card>

        <Card title="Theme">
          <Segmented
            value={theme}
            options={[
              { label: "Light", value: "light" },
              { label: "Dark", value: "dark" },
              { label: "Pink", value: "pink" },
            ]}
            onChange={setTheme}
          />
        </Card>

        <Card title="Behaviour">
          <Toggle
            label="Auto-start next session"
            checked={opts.autoStartNext}
            onChange={(v) => setOpt("autoStartNext", v)}
          />
          <Toggle
            label="Loop music"
            checked={opts.loopMusic}
            onChange={(v) => setOpt("loopMusic", v)}
          />
          <Toggle
            label="Tick sound"
            checked={opts.tickSound}
            onChange={(v) => setOpt("tickSound", v)}
          />
          <Toggle
            label="Desktop notification"
            checked={opts.notifications}
            onChange={(v) => setOpt("notifications", v)}
          />
          <Toggle
            label="Always on top"
            checked={opts.alwaysOnTop}
            onChange={(v) => setOpt("alwaysOnTop", v)}
          />

          <Divider />

          <div className="flex items-center justify-between text-xs font-medium text-[var(--text)]/75 mb-1">
            <span className="inline-flex items-center gap-2">
              {muted ? <FiVolumeX /> : <FiVolume2 />} Volume
            </span>
            <span>{Math.round(volume * 100)}%</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMuted((m) => !m)}
              className="h-9 px-3 rounded-md border border-[var(--border-1)] bg-[var(--card)] hover:bg-[var(--surface)] text-sm"
              title={muted ? "Unmute" : "Mute"}
            >
              {muted ? "Unmute" : "Mute"}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="h-1.5 w-full rounded-full appearance-none bg-[var(--border-2)]
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)]
                [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:border-0
                [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--accent)]"
            />
            <button
              onClick={beep}
              className="h-9 px-3 rounded-md border border-[var(--border-1)] bg-[var(--card)] hover:bg-[var(--surface)] text-sm"
            >
              Preview
            </button>
          </div>
        </Card>

        {/* Footer */}
        <div className="w-full flex items-center justify-between pt-1">
          <button
            onClick={resetAll}
            className="inline-flex items-center gap-2 px-3 h-9 rounded-md border border-[var(--border-1)] bg-[var(--card)] hover:bg-[var(--surface)] text-sm"
            title="Reset to defaults"
          >
            <FiRotateCcw /> Reset
          </button>
          <button
            onClick={onBack}
            className="px-4 h-9 rounded-md bg-[var(--accent)] text-white text-sm font-semibold shadow-[var(--shadow-1)]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}


function Card({ title, children }) {
  return (
    <section className="rounded-2xl border border-[var(--border-1)] bg-[var(--surface)] p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-[var(--text)]/80 mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Divider() {
  return <div className="h-px w-full bg-[var(--border-1)] rounded" />;
}

function Field({ label, control }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-[var(--text)]">{label}</div>
      {control}
    </div>
  );
}

function Stepper({ value, onDec, onInc, onInput }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onDec}
        className="h-9 w-9 grid place-items-center rounded-md border border-[var(--border-1)] hover:bg-[var(--card)]"
        aria-label="Decrease"
      >
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onInput(e.target.value)}
        className="w-20 h-9 rounded-md px-3 bg-[var(--card)] border border-[var(--border-1)] text-[var(--text)] text-center"
      />
      <button
        onClick={onInc}
        className="h-9 w-9 grid place-items-center rounded-md border border-[var(--border-1)] hover:bg-[var(--card)]"
        aria-label="Increase"
      >
        +
      </button>
    </div>
  );
}

function Segmented({ value, options, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`h-10 rounded-xl border text-sm transition
              ${
                active
                  ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                  : "bg-[var(--card)] text-[var(--text)] border-[var(--border-1)] hover:bg-[var(--surface)]"
              }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-[var(--card)] border border-[var(--border-1)]">
      <span className="text-[var(--text)]">{label}</span>
      <span
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full cursor-pointer transition
          ${checked ? "bg-[var(--accent)]" : "bg-[var(--border-2)]"}`}
      >
        <span
          className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white transition
          ${checked ? "right-1" : "left-1"}`}
        />
      </span>
    </label>
  );
}
