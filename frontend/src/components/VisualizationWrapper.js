import { useState, useRef } from "react";
import VisualizationPanel from "./VisualizationPanel";
import CircularGenomeView from "./CircularGenomeView";
import { Button } from "./ui/button";

export default function VisualizationWrapper({
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
  const [pinnedFeature, setPinnedFeature] = useState(null);
  const [viewStart, setViewStart] = useState(1);
  const [viewEnd, setViewEnd] = useState(Math.min(sequenceLength, 100000));
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const svgRef = useRef(null);

  const activeFeature = pinnedFeature || hoveredFeature;

  const handleFeatureClick = (feature) => {
    if (pinnedFeature?.id === feature.id) {
      setPinnedFeature(null);
    } else {
      setPinnedFeature(feature);
    }
  };

  const viewLength = viewEnd - viewStart;


  const handleMouseDown = (e) => {
    if (e.target.closest(".feature-element")) return;
    setIsDragging(true);
    setDragStart(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !dragStart) return;

    const deltaX = dragStart - e.clientX;
    const deltaPosition = (deltaX / 800) * viewLength;

    let newStart = viewStart + deltaPosition;
    let newEnd = viewEnd + deltaPosition;

    // Keep within bounds
    if (newStart < 1) {
      newStart = 1;
      newEnd = viewLength;
    }
    if (newEnd > sequenceLength) {
      newEnd = sequenceLength;
      newStart = sequenceLength - viewLength;
    }

    setViewStart(Math.max(1, newStart));
    setViewEnd(Math.min(sequenceLength, newEnd));
    setDragStart(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  // Zoom handlers
  const handleZoomIn = () => {
    const center = (viewStart + viewEnd) / 2;
    const newLength = viewLength / 2;
    setViewStart(Math.max(1, center - newLength / 2));
    setViewEnd(Math.min(sequenceLength, center + newLength / 2));
  };

  const handleZoomOut = () => {
    const center = (viewStart + viewEnd) / 2;
    const newLength = Math.min(viewLength * 2, sequenceLength);
    setViewStart(Math.max(1, center - newLength / 2));
    setViewEnd(Math.min(sequenceLength, center + newLength / 2));
  };

  const handleResetView = () => {
    setViewStart(1);
    setViewEnd(Math.min(sequenceLength, 100000));
  };

  const handleJumpToFeature = () => {
    if (activeFeature) {
      const featureCenter = (activeFeature.start + activeFeature.end) / 2;
      const windowSize = Math.min(
        viewLength,
        activeFeature.end - activeFeature.start + 20000
      );
      setViewStart(Math.max(1, featureCenter - windowSize / 2));
      setViewEnd(Math.min(sequenceLength, featureCenter + windowSize / 2));
    }
  };

  // Filter features in view
  const visibleFeatures = selectedFeatures.filter(
    (f) => f.end >= viewStart && f.start <= viewEnd
  );

  // Adjust pixel position for current view
  const getViewPixelPosition = (position) => {
    return ((position - viewStart) / viewLength) * 800;
  };
  return (
    <div className="bg-slate-800 rounded-lg p-8 border border-slate-700 mb-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">
            Interactive Genome Browser:{" "}
            <span className="text-blue-400">{selectedSequence}</span>
          </h2>

          {/* Browser Controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleZoomIn}
              className="cursor-pointer px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition"
              title="Zoom In"
            >
              🔍+
            </Button>
            <Button
              onClick={handleZoomOut}
              className="cursor-pointer px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold transition"
              title="Zoom Out"
            >
              🔍-
            </Button>
            <Button
              onClick={handleResetView}
              className="cursor-pointer px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white rounded text-sm font-semibold transition"
              title="Reset View"
            >
              ↺ Reset
            </Button>
            {activeFeature && (
              <Button
                onClick={handleJumpToFeature}
                className="cursor-pointer px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-semibold transition"
                title="Jump to Selected Feature"
              >
                → Jump
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm mb-4">
          <div className="text-gray-400">
            Viewing:{" "}
            <span className="text-green-400 font-semibold">
              {Math.round(viewStart).toLocaleString()} -{" "}
              {Math.round(viewEnd).toLocaleString()} bp
            </span>
          </div>
          <div className="text-gray-400">
            Window size:{" "}
            <span className="text-cyan-400 font-semibold">
              {Math.round(viewLength).toLocaleString()} bp
            </span>
          </div>
          <div className="text-gray-400">
            Visible features:{" "}
            <span className="text-blue-400 font-semibold">
              {visibleFeatures.length} / {selectedFeatures.length}
            </span>
          </div>
        </div>

        <div className="bg-slate-700 rounded p-3 text-xs text-gray-300">
          💡 <strong>Browser Controls:</strong> Click and drag to pan • Use zoom
          buttons to zoom in/out • Click features to pin • Drag works on empty
          areas
        </div>
      </div>

      {/* Side-by-side layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Linear Visualization Panel */}
        <div className="lg:col-span-1">
          <h3 className="text-xl font-semibold text-white mb-4">
            Linear View (Pannable)
          </h3>
          <div
            ref={svgRef}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <svg
              width="900"
              height="500"
              className="border border-slate-600 rounded bg-slate-900"
            >
              {/* Ruler */}
              <g>
                <line
                  x1="50"
                  y1="20"
                  x2="850"
                  y2="20"
                  stroke="#4b5563"
                  strokeWidth="2"
                />
                {(() => {
                  // Generate dynamic tick marks based on view window
                  const ticks = [];
                  let interval = viewLength / 10;

                  // Round interval to nice number
                  const magnitude = Math.pow(
                    10,
                    Math.floor(Math.log10(interval))
                  );
                  interval = Math.ceil(interval / magnitude) * magnitude;

                  for (
                    let i = Math.ceil(viewStart / interval) * interval;
                    i <= viewEnd;
                    i += interval
                  ) {
                    ticks.push(i);
                  }

                  return ticks.map((tick) => (
                    <g key={tick}>
                      <line
                        x1={50 + getViewPixelPosition(tick)}
                        y1="15"
                        x2={50 + getViewPixelPosition(tick)}
                        y2="25"
                        stroke="#9ca3af"
                        strokeWidth="1"
                      />
                      <text
                        x={50 + getViewPixelPosition(tick)}
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

              {/* Features */}
              {visibleFeatures.map((feature, idx) => {
                const start = getViewPixelPosition(feature.start);
                const end = getViewPixelPosition(feature.end);
                const width = Math.max(end - start, 4);
                const yPos = getYPosition(feature.strand, idx);
                const color = getFeatureColor(feature.type);
                const isActive = activeFeature?.id === feature.id;

                return (
                  <g
                    key={`${feature.id}-${idx}`}
                    className="feature-element"
                    onMouseEnter={() =>
                      !pinnedFeature && onHoverFeature(feature)
                    }
                    onMouseLeave={() => !pinnedFeature && onHoverFeature(null)}
                    onClick={() => handleFeatureClick(feature)}
                    style={{ cursor: "pointer" }}
                  >
                    <rect
                      x={50 + start}
                      y={yPos}
                      width={width}
                      height="20"
                      fill={color}
                      opacity={isActive ? "1" : "0.6"}
                      rx="4"
                      stroke={isActive ? "#fff" : "none"}
                      strokeWidth="2"
                    />

                    {/* Arrow for strand direction */}
                    {width > 8 && (
                      <polygon
                        points={
                          feature.strand === "+"
                            ? `${50 + start + width - 5},${yPos + 10} ${
                                50 + start + width - 10
                              },${yPos + 5} ${50 + start + width - 10},${
                                yPos + 15
                              }`
                            : `${50 + start + 5},${yPos + 10} ${
                                50 + start + 10
                              },${yPos + 5} ${50 + start + 10},${yPos + 15}`
                        }
                        fill={color}
                        opacity={isActive ? "1" : "0.6"}
                      />
                    )}

                    {/* Feature label when hovered */}
                    {isActive && width > 20 && (
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

              {/* Strand labels */}
              <text
                x="20"
                y="65"
                className="text-sm font-semibold fill-blue-400"
              >
                +
              </text>
              <text
                x="20"
                y="145"
                className="text-sm font-semibold fill-red-400"
              >
                -
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              {[
                "gene",
                "CDS",
                "ORF",
                "GC_rich_region",
                "CpG_island",
                "tandem_repeat",
              ].map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <div
                    className="w-4 h-3 rounded"
                    style={{ backgroundColor: getFeatureColor(type) }}
                  ></div>
                  <span className="text-gray-300 text-xs font-medium">
                    {type.replace(/_/g, " ")}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-gray-500 text-xs mt-2">
              💡 Hover over features to highlight them in both views.
            </p>
          </div>
        </div>

        {/* Circular View */}
        <div className="lg:col-span-1">
          <h3 className="text-xl font-semibold text-white mb-4">
            Circular View
          </h3>
          <div className="flex justify-center">
            <svg
              width="500"
              height="500"
              className="border border-slate-600 rounded bg-slate-900"
              viewBox="0 0 600 600"
            >
              {(() => {
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
                const createArcPath = (
                  startAngle,
                  endAngle,
                  innerRad,
                  outerRad
                ) => {
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

                return (
                  <>
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
                      const angleWidth = Math.max(
                        endAngle - startAngle,
                        minAngleWidth
                      );

                      const isPositive = feature.strand === "+";
                      const featureRadius = isPositive
                        ? {
                            inner: innerRadius + 5,
                            outer: innerRadius + 35,
                          }
                        : {
                            inner: innerRadius - 35,
                            outer: innerRadius - 5,
                          };

                      const color = getFeatureColor(feature.type);
                      const isActive = activeFeature?.id === feature.id;

                      return (
                        <g
                          key={`${feature.id}-${idx}`}
                          onMouseEnter={() =>
                            !pinnedFeature && onHoverFeature(feature)
                          }
                          onMouseLeave={() =>
                            !pinnedFeature && onHoverFeature(null)
                          }
                          onClick={() => handleFeatureClick(feature)}
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
                            opacity={isActive ? "1" : "0.6"}
                            stroke={isActive ? "#fff" : "none"}
                            strokeWidth="2"
                          />

                          {/* Feature label on active */}
                          {isActive && (
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
                  </>
                );
              })()}
            </svg>
          </div>
        </div>
      </div>

      {/* Shared tooltip info */}
      {activeFeature && (
        <div className="mt-6 p-4 bg-slate-700 rounded border border-slate-600">
          <div className="flex justify-between items-start mb-3">
            <h4 className="text-white font-semibold">
              {pinnedFeature ? "📌 Pinned Feature" : "Hovered Feature"}
            </h4>
            {pinnedFeature && (
              <button
                onClick={() => setPinnedFeature(null)}
                className="text-xs text-gray-400 hover:text-gray-200"
              >
                Click to unpin
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
            {/* Display all non-null feature properties */}
            {Object.entries(activeFeature).map(([key, value]) => {
              // Skip internal/display keys
              if (key === "id" || key === "seq_id") return null;

              let displayValue = value;
              let displayKey = key;

              // Format display key
              displayKey = displayKey
                .replace(/_/g, " ")
                .replace(/([A-Z])/g, " $1")
                .trim()
                .split(" ")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");

              // Format display value
              if (typeof value === "number") {
                if (key.includes("content") || key.includes("ratio")) {
                  displayValue = (value * 100).toFixed(2) + "%";
                } else if (key === "repeat_count") {
                  displayValue = value;
                } else if (
                  key !== "frame" &&
                  key !== "unit_length" &&
                  key !== "repeat_count"
                ) {
                  displayValue = value.toLocaleString();
                }
              } else if (value === "+") {
                displayValue = "Forward";
              } else if (value === "-") {
                displayValue = "Reverse";
              }

              return (
                <div key={key}>
                  <span className="text-gray-400">{displayKey}:</span>
                  <span className="text-white font-semibold ml-1 block truncate">
                    {typeof value === "string" && value.length > 30
                      ? value.substring(0, 27) + "..."
                      : displayValue}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
