import { useEffect, useState } from "react";
import MainPanel from "./components/MainPanel";
import ConfigPanel from "./components/ConfigPanel";
import usePersistentState from "./hooks/usePersistentState"; 

async function minimizeWindow() {
  try {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    const win = getCurrentWindow();
    await win.minimize();
  } catch (e) {
    console.error("minimize failed:", e);
  }
}

// Abrir devtools en dev (opcional)
(async () => {
  try {
    const { appWindow } = await import("@tauri-apps/api/window");
    await appWindow.openDevtools();
  } catch {
    window.__TAURI__?.window?.appWindow?.openDevtools?.();
  }
})();

export default function App() {
  const [panel, setPanel] = useState("main");

  // Theme y durations como los tenías
  const [theme, setTheme] = useState("pink");
  const [durations, setDurations] = useState({ focus: 25, short: 5, long: 30 });

  // ⬇️ NUEVO: una única fuente de verdad (y persistente) para audio
  const [volume, setVolume] = usePersistentState("pookie.volume", 0.7);
  const [muted, setMuted]   = usePersistentState("pookie.muted", false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="h-full w-full bg-[var(--bg)] text-[var(--text)]">
      {panel === "main" ? (
        <MainPanel
          onConfig={() => setPanel("config")}
          onMinimizeRequested={minimizeWindow}
          theme={theme}
          setTheme={setTheme}
          durations={durations}
          setDurations={setDurations}
          // ⬇️ Pasamos audio state compartido
          volume={volume}
          setVolume={setVolume}
          muted={muted}
          setMuted={setMuted}
        />
      ) : (
        <ConfigPanel
          onBack={() => setPanel("main")}
          onMinimizeRequested={minimizeWindow} // ⬅️ también aquí
          theme={theme}
          setTheme={setTheme}
          durations={durations}
          setDurations={setDurations}
          // ⬇️ los mismos valores (nada de duplicados)
          volume={volume}
          setVolume={setVolume}
          muted={muted}
          setMuted={setMuted}
        />
      )}
    </div>
  );
}
