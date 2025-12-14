export default function VisualizationPanel({
  selectedSequence,
  selectedFeatures,
  sequenceLength,
  zoomLevel,
  hoveredFeature,
  onHoverFeature,
  getPixelPosition,
  getFeatureColor,
  getYPosition,
}) {
  return (
    <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 overflow-x-auto mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Genomic Region:{" "}
          <span className="text-blue-400">{selectedSequence}</span>
          <span className="text-sm text-gray-400 ml-3">
            (Zoom: {(zoomLevel * 100).toFixed(0)}%)
          </span>
        </h2>
        <div className="flex items-center gap-6 text-sm">
          <div className="text-gray-400">
            Sequence length:{" "}
            <span className="text-green-400 font-semibold">
              {sequenceLength} bp
            </span>
          </div>
          <div className="text-gray-400">
            Total features:{" "}
            <span className="text-blue-400 font-semibold">
              {selectedFeatures.length}
            </span>
          </div>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <svg
          width={Math.max(900, 900 * zoomLevel)}
          height="300"
          className="border border-slate-600 rounded bg-slate-900"
        >
          {/* Ruler */}
          <g>
            <line
              x1="50"
              y1="20"
              x2={850 * zoomLevel + 50}
              y2="20"
              stroke="#4b5563"
              strokeWidth="2"
            />
            {(() => {
              // Generate dynamic tick marks based on sequence length
              const ticks = [];
              let interval = 500000; // Start with 500k

              // Adjust interval based on sequence length
              if (sequenceLength < 10000) interval = 1000;
              else if (sequenceLength < 50000) interval = 5000;
              else if (sequenceLength < 100000) interval = 10000;
              else if (sequenceLength < 500000) interval = 50000;
              else if (sequenceLength < 1000000) interval = 100000;
              else interval = 500000;

              for (let i = 0; i <= sequenceLength; i += interval) {
                ticks.push(i);
              }

              return ticks.map((tick) => (
                <g key={tick}>
                  <line
                    x1={50 + getPixelPosition(tick) * zoomLevel}
                    y1="15"
                    x2={50 + getPixelPosition(tick) * zoomLevel}
                    y2="25"
                    stroke="#9ca3af"
                    strokeWidth="1"
                  />
                  <text
                    x={50 + getPixelPosition(tick) * zoomLevel}
                    y="35"
                    textAnchor="middle"
                    className="text-xs fill-gray-400"
                  >
                    {tick > 1000000
                      ? (tick / 1000000).toFixed(1) + "M"
                      : tick > 1000
                      ? (tick / 1000).toFixed(0) + "K"
                      : tick}
                  </text>
                </g>
              ));
            })()}
          </g>

          {/* Plus strand label */}
          <text x="10" y="85" className="text-sm font-semibold fill-blue-400">
            + Strand
          </text>

          {/* Minus strand label */}
          <text x="10" y="185" className="text-sm font-semibold fill-red-400">
            - Strand
          </text>

          {/* Features */}
          {selectedFeatures.map((feature, idx) => {
            const start = getPixelPosition(feature.start) * zoomLevel;
            const end = getPixelPosition(feature.end) * zoomLevel;
            const width = Math.max(end - start, 4);
            const yPos = getYPosition(feature.strand, idx);
            const color = getFeatureColor(feature.type);
            const isHovered = hoveredFeature === feature.id;

            return (
              <g
                key={feature.id}
                onMouseEnter={() => onHoverFeature(feature.id)}
                onMouseLeave={() => onHoverFeature(null)}
              >
                {/* Feature shadow when hovered */}
                {isHovered && (
                  <rect
                    x={50 + start - 2}
                    y={yPos - 2}
                    width={width + 4}
                    height="24"
                    fill={color}
                    opacity="0.3"
                    rx="3"
                  />
                )}

                {/* Main feature rectangle */}
                <rect
                  x={50 + start}
                  y={yPos}
                  width={width}
                  height="20"
                  fill={color}
                  opacity={isHovered ? "1" : "0.8"}
                  rx="2"
                  className="cursor-pointer transition-opacity"
                >
                  <title>{feature.id}</title>
                </rect>

                {/* Arrow for strand direction */}
                {width > 8 && (
                  <polygon
                    points={
                      feature.strand === "+"
                        ? `${50 + start + width - 5},${yPos + 10} ${
                            50 + start + width - 10
                          },${yPos + 5} ${50 + start + width - 10},${yPos + 15}`
                        : `${50 + start + 5},${yPos + 10} ${50 + start + 10},${
                            yPos + 5
                          } ${50 + start + 10},${yPos + 15}`
                    }
                    fill={color}
                    opacity={isHovered ? "1" : "0.6"}
                  />
                )}

                {/* Feature label when hovered */}
                {isHovered && width > 20 && (
                  <text
                    x={50 + start + width / 2}
                    y={yPos + 13}
                    textAnchor="middle"
                    className="text-xs font-bold fill-white pointer-events-none"
                  >
                    {feature.id.slice(0, 8)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Enhanced Legend */}
      <div className="mt-8 space-y-4">
        <h3 className="text-white font-semibold">Legend:</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {["gene", "CDS", "ORF", "GC_rich_region", "CpG_island"].map(
            (type) => (
              <div key={type} className="flex items-center gap-2">
                <div
                  className="w-6 h-4 rounded"
                  style={{ backgroundColor: getFeatureColor(type) }}
                ></div>
                <span className="text-gray-300 text-xs font-medium">
                  {type.replace(/_/g, " ")}
                </span>
              </div>
            )
          )}
        </div>
        <p className="text-gray-500 text-xs mt-4">
          💡 Tip: Hover over features to see details. Use zoom slider to adjust
          visualization scale.
        </p>
      </div>
    </div>
  );
}
