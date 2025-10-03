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

  const [theme, setTheme] = useState("pink");
  const [durations, setDurations] = useState({ focus: 25, short: 5, long: 30 });

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
          volume={volume}
          setVolume={setVolume}
          muted={muted}
          setMuted={setMuted}
        />
      ) : (
        <ConfigPanel
          onBack={() => setPanel("main")}
          onMinimizeRequested={minimizeWindow}
          theme={theme}
          setTheme={setTheme}
          durations={durations}
          setDurations={setDurations}
          volume={volume}
          setVolume={setVolume}
          muted={muted}
          setMuted={setMuted}
        />
      )}
    </div>
  );
}
