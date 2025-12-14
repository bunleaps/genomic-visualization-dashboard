export default function Controls({
  selectedSequence,
  onSequenceChange,
  zoomLevel,
  onZoomChange,
  uniqueSeqs,
}) {
  return (
    <div className="bg-slate-800 rounded-lg p-6 mb-8 border border-slate-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-white font-semibold mb-3">
            Select Sequence:
          </label>
          <select
            value={selectedSequence || ""}
            onChange={(e) => onSequenceChange(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
          >
            {uniqueSeqs.map((seq) => (
              <option key={seq} value={seq}>
                {seq}
              </option>
            ))}
          </select>
        </div>
        {/* <div>
          <label className="block text-white font-semibold mb-3">
            Zoom Level: {(zoomLevel * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={zoomLevel}
            onChange={(e) => onZoomChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
        </div> */}
      </div>
    </div>
  );
}
