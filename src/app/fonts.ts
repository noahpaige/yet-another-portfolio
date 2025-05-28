import { Space_Mono, IBM_Plex_Mono, Lexend_Deca } from "next/font/google";

export const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});
export const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const lexendDeca = Lexend_Deca({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  style: "normal",
  display: "swap",
});
