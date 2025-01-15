import { Suspense } from "react";
import HomeContent from "./home-content";
import Loading from "@/components/Loading";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <Suspense fallback={<Loading />}>
      <HomeContent />
    </Suspense>
  );
}

