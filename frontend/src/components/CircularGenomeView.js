export default function CircularGenomeView({
  selectedSequence,
  selectedFeatures,
  sequenceLength,
  hoveredFeature,
  onHoverFeature,
  getFeatureColor,
}) {
  const centerX = 250;
  const centerY = 250;
  const radius = 180;
  const innerRadius = 120;

  // Convert base pair position to angle (0 = top, clockwise)
  const getAngle = (position) => {
    return (position / sequenceLength) * 360;
  };

  // Convert angle to SVG coordinates
  const getCoordinates = (angle, rad) => {
    const radians = ((angle - 90) * Math.PI) / 180;
    return {
      x: centerX + rad * Math.cos(radians),
      y: centerY + rad * Math.sin(radians),
    };
  };

  // Create path for arc
  const createArcPath = (startAngle, endAngle, innerRad, outerRad) => {
    const startInner = getCoordinates(startAngle, innerRad);
    const startOuter = getCoordinates(startAngle, outerRad);
    const endInner = getCoordinates(endAngle, innerRad);
    const endOuter = getCoordinates(endAngle, outerRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `
      M ${startOuter.x} ${startOuter.y}
      A ${outerRad} ${outerRad} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}
      L ${endInner.x} ${endInner.y}
      A ${innerRad} ${innerRad} 0 ${largeArc} 0 ${startInner.x} ${startInner.y}
      Z
    `;
  };

  // Group features by type and color
  const groupedFeatures = selectedFeatures.reduce((acc, feature) => {
    const color = getFeatureColor(feature.type);
    if (!acc[color]) {
      acc[color] = [];
    }
    acc[color].push(feature);
    return acc;
  }, {});

  return (
    <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 mb-8">
      <h2 className="text-2xl font-bold text-white mb-6">
        Circular Genome View:{" "}
        <span className="text-blue-400">{selectedSequence}</span>
      </h2>

      <div className="flex justify-center">
        <svg
          width="600"
          height="600"
          className="border border-slate-600 rounded bg-slate-900"
          viewBox="0 0 600 600"
        >
          {/* Background circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="#4b5563"
            strokeWidth="1"
          />

          {/* Inner circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={innerRadius}
            fill="none"
            stroke="#4b5563"
            strokeWidth="1"
            strokeDasharray="5,5"
          />

          {/* Center circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r="20"
            fill="#1e293b"
            stroke="#64748b"
            strokeWidth="2"
          />

          {/* Sequence length label in center */}
          <text
            x={centerX}
            y={centerY + 25}
            textAnchor="middle"
            className="text-sm fill-gray-400"
          >
            {sequenceLength > 1000000
              ? (sequenceLength / 1000000).toFixed(1) + "M bp"
              : sequenceLength > 1000
              ? (sequenceLength / 1000).toFixed(0) + "K bp"
              : sequenceLength + " bp"}
          </text>

          {/* Ruler ticks and labels */}
          {(() => {
            const ticks = [];
            let interval = 500000;
            if (sequenceLength < 10000) interval = 1000;
            else if (sequenceLength < 50000) interval = 5000;
            else if (sequenceLength < 100000) interval = 10000;
            else if (sequenceLength < 500000) interval = 50000;
            else if (sequenceLength < 1000000) interval = 100000;
            else interval = 500000;

            for (let i = 0; i <= sequenceLength; i += interval) {
              ticks.push(i);
            }

            return ticks.map((tick) => {
              const angle = getAngle(tick);
              const outerPos = getCoordinates(angle, radius + 15);
              const tickPos = getCoordinates(angle, radius + 5);

              return (
                <g key={tick}>
                  <line
                    x1={getCoordinates(angle, radius).x}
                    y1={getCoordinates(angle, radius).y}
                    x2={tickPos.x}
                    y2={tickPos.y}
                    stroke="#9ca3af"
                    strokeWidth="1"
                  />
                  <text
                    x={outerPos.x}
                    y={outerPos.y}
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
              );
            });
          })()}

          {/* Strand separators */}
          {[0, 180].map((angle) => {
            const start = getCoordinates(angle, innerRadius);
            const end = getCoordinates(angle, radius);
            return (
              <line
                key={`strand-${angle}`}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke="#4b5563"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
            );
          })}

          {/* Features as arcs */}
          {selectedFeatures.map((feature, idx) => {
            const startAngle = getAngle(feature.start);
            const endAngle = getAngle(feature.end);
            const minAngleWidth = 0.5;
            const angleWidth = Math.max(endAngle - startAngle, minAngleWidth);

            const isPositive = feature.strand === "+";
            const featureRadius = isPositive
              ? { inner: innerRadius + 5, outer: innerRadius + 35 }
              : { inner: innerRadius - 35, outer: innerRadius - 5 };

            const color = getFeatureColor(feature.type);
            const isHovered = hoveredFeature?.id === feature.id;

            return (
              <g
                key={`${feature.id}-${idx}`}
                onMouseEnter={() => onHoverFeature(feature)}
                onMouseLeave={() => onHoverFeature(null)}
                style={{ cursor: "pointer" }}
              >
                <path
                  d={createArcPath(
                    startAngle,
                    startAngle + angleWidth,
                    featureRadius.inner,
                    featureRadius.outer
                  )}
                  fill={color}
                  opacity={isHovered ? "1" : "0.6"}
                  stroke={isHovered ? "#fff" : "none"}
                  strokeWidth="2"
                />

                {/* Feature label on hover */}
                {isHovered && (
                  <g>
                    <text
                      x={centerX}
                      y={centerY - 40}
                      textAnchor="middle"
                      className="text-sm font-bold fill-white"
                    >
                      {feature.id}
                    </text>
                    <text
                      x={centerX}
                      y={centerY - 20}
                      textAnchor="middle"
                      className="text-xs fill-gray-300"
                    >
                      {feature.start} - {feature.end} bp
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Plus/Minus strand labels */}
          <text
            x={centerX - 50}
            y={centerY - innerRadius - 50}
            className="text-sm font-semibold fill-blue-400"
          >
            (+) strand
          </text>
          <text
            x={centerX - 50}
            y={centerY + innerRadius + 65}
            className="text-sm font-semibold fill-red-400"
          >
            (-) strand
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-8 space-y-4">
        <h3 className="text-white font-semibold">Legend:</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
          💡 Circular view shows genome features arranged around the sequence.
          Outer ring shows (+) strand, inner ring shows (-) strand.
        </p>
      </div>
    </div>
  );
}
