export default function Controls() {
  return (
    <div className="flex gap-6 text-3xl mt-6">
      <button>⏹️</button>
      <button>▶️</button>
      <button>🔁</button>
      <div className="relative group">
        <button>🔊</button>
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-700 p-2 rounded">
          <input type="range" min="0" max="100" className="w-24" />
        </div>
      </div>
    </div>
  );
}
