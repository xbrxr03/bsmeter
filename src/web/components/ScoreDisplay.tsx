"use client";
import type { BSResult } from "../../core/types";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

function verdictColor(verdict: string): string {
  if (verdict === "clean") return "text-green-400";
  if (verdict === "suspect") return "text-yellow-400";
  return "text-red-400";
}

function verdictBg(verdict: string): string {
  if (verdict === "clean") return "bg-green-900/30 border-green-700";
  if (verdict === "suspect") return "bg-yellow-900/30 border-yellow-700";
  return "bg-red-900/30 border-red-700";
}

function ScoreGauge({ score }: { score: number }) {
  const radius = 60;
  const stroke = 10;
  const cx = 80;
  const cy = 80;
  const startAngle = Math.PI;
  const endAngle = 0;
  const range = startAngle - endAngle;
  const fillAngle = startAngle - (score / 100) * range;
  const x1 = cx + radius * Math.cos(startAngle);
  const y1 = cy + radius * Math.sin(startAngle);
  const x2 = cx + radius * Math.cos(fillAngle);
  const y2 = cy + radius * Math.sin(fillAngle);
  const large = (score / 100) * range > Math.PI ? 1 : 0;

  const trackColor = score > 60 ? "#ef4444" : score > 30 ? "#eab308" : "#22c55e";

  return (
    <svg width={160} height={100} viewBox="0 0 160 100">
      {/* Track */}
      <path
        d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
        fill="none"
        stroke="#374151"
        strokeWidth={stroke}
        strokeLinecap="round"
      />
      {/* Fill */}
      {score > 0 && (
        <path
          d={`M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
          strokeLinecap="round"
        />
      )}
      <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize="22" fontWeight="bold">
        {score}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#9ca3af" fontSize="10">
        / 100
      </text>
    </svg>
  );
}

export function ScoreDisplay({ result }: { result: BSResult }) {
  const { score, verdict, dimensions, domainSpecific } = result;

  const radarData = [
    { axis: "Utility", value: dimensions.utility.score },
    { axis: "Quality", value: dimensions.quality.score },
    { axis: "Style", value: dimensions.style.score },
    { axis: "Domain", value: domainSpecific.score },
  ];

  return (
    <div className={`rounded-xl border p-6 ${verdictBg(verdict)}`}>
      <div className="flex flex-col md:flex-row gap-8 items-center">
        {/* Gauge + verdict */}
        <div className="flex flex-col items-center gap-2 min-w-[160px]">
          <ScoreGauge score={score} />
          <span className={`text-2xl font-bold uppercase tracking-wider ${verdictColor(verdict)}`}>
            {verdict}
          </span>
        </div>

        {/* Radar chart */}
        <div className="flex-1 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="axis" tick={{ fill: "#9ca3af", fontSize: 12 }} />
              <Radar
                dataKey="value"
                stroke={score > 60 ? "#ef4444" : score > 30 ? "#eab308" : "#22c55e"}
                fill={score > 60 ? "#ef4444" : score > 30 ? "#eab308" : "#22c55e"}
                fillOpacity={0.2}
              />
              <Tooltip
                contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: 8 }}
                itemStyle={{ color: "#e5e7eb" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Dimension breakdown */}
        <div className="space-y-3 min-w-[200px]">
          {[
            { label: "Utility", dim: dimensions.utility },
            { label: "Quality", dim: dimensions.quality },
            { label: "Style", dim: dimensions.style },
            { label: "Domain", dim: domainSpecific },
          ].map(({ label, dim }) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">{label}</span>
                <span className="text-gray-300 font-mono">{dim.score}</span>
              </div>
              <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    dim.score > 60 ? "bg-red-500" : dim.score > 30 ? "bg-yellow-500" : "bg-green-500"
                  }`}
                  style={{ width: `${dim.score}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{dim.explanation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
