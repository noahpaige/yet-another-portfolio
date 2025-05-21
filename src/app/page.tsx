import HomePage from "@/components/pages/home-page/home-page";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <HomePage />
    </Suspense>
  );
}
