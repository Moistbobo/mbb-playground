export type Rect = { x: number; y: number; width: number; height: number };

export function rectsOverlap(a: Rect, b: Rect): boolean {
  'worklet';
  if (a.width <= 0 || a.height <= 0 || b.width <= 0 || b.height <= 0) {
    return false;
  }
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
