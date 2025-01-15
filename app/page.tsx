"use client";

import { Box } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import Homepage from "@/components/Homepage";
import Loading from "@/components/Loading";
import Welcome from "@/components/Welcome";

export const dynamic = "force-dynamic";

function HomeContent() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <Box width={"100vw"} overflowX={"hidden"} fontFamily={"sans-serif"}>
      <Welcome />
    </Box>
  );
}

export default function Home() {
  return (
    <HomeContent />
  );
}
