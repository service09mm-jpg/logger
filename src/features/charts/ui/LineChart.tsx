import type { LineGeometry } from "../domain/lineGeometry";

const WIDTH = 300;
const HEIGHT = 120;

/**
 * Лінійний графік для метрик на кшталт ваги: важлива траєкторія, а не
 * окремі дні. Горизонтальна пунктирна лінія — ціль.
 *
 * Малюється вручну, без бібліотеки графіків: координати рахує
 * `buildLineGeometry`, а тут лишається звичайний SVG.
 */
export function LineChart({
  geometry,
  color,
  emptyLabel,
}: {
  geometry: LineGeometry;
  color: string;
  emptyLabel: string;
}): React.ReactElement {
  if (geometry.points.length === 0) {
    return <EmptyChart label={emptyLabel} />;
  }

  return (
    <div className="border-b border-line">
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-32 w-full"
      preserveAspectRatio="none"
      role="img"
    >
      {geometry.targetY === null ? null : (
        <line
          x1={0}
          y1={geometry.targetY}
          x2={WIDTH}
          y2={geometry.targetY}
          stroke="currentColor"
          strokeDasharray="4 4"
          strokeWidth={1}
          className="text-muted"
          vectorEffect="non-scaling-stroke"
        />
      )}

      <polyline
        points={geometry.polyline}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />

      {geometry.points.map((point) => (
        <circle key={point.iso} cx={point.x} cy={point.y} r={2.5} fill={color} />
      ))}
    </svg>
    </div>
  );
}

/** Порожній графік — щоб місце не виглядало зламаним, поки записів немає. */
export function EmptyChart({ label }: { label: string }): React.ReactElement {
  return (
    <div className="flex h-32 items-center justify-center border-b border-line text-sm text-muted">
      {label}
    </div>
  );
}
