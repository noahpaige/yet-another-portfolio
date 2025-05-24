export type BlobData = {
  path: Path2D;
  colors: { a: string; b: string }[];
  rotation: { angle: number; curSpeed: number; baseSpeed: number };
  scale: number;
};
