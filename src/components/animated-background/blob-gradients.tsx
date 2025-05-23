import { BlobData } from "@/app/types";
import { motion } from "framer-motion";

interface BlobGradientsProps {
  blobs: BlobData[];
  colorIndex: number;
}

const BlobGradients: React.FC<BlobGradientsProps> = ({ blobs, colorIndex }) => (
  <defs>
    {blobs.map((blob, index) => (
      <linearGradient
        key={index}
        id={`gradient-${index}`}
        x1="0"
        x2="1"
        y1="1"
        y2="0"
      >
        <motion.stop offset="0%" stopColor={blob.colors[colorIndex].a} />
        <motion.stop offset="100%" stopColor={blob.colors[colorIndex].b} />
      </linearGradient>
    ))}
  </defs>
);

export default BlobGradients;
