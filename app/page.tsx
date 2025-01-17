"use client";

import { Box } from "@chakra-ui/react";
import { useState, useEffect, Suspense } from "react";
import { useUser } from "@/context/context";
import { useSearchParams } from "next/navigation";
import Loading from "@/components/Loading";
import Welcome from "@/components/Welcome";
import Homepage from "@/components/Homepage";
import WebApp from "@twa-dev/sdk";

export const dynamic = "force-dynamic";

function HomeContent() {
  const [error, setError] = useState<string | null>(null);
  console.log(error)
  const [showWelcome, setShowWelcome] = useState(false);
  const {
    setUser,
    isLoading,
    setIsLoading,
    isInitialized,
    setIsInitialized,
  } = useUser();

  const searchParams = useSearchParams();
  const referralCode = searchParams.get("referralCode");

  // const telegramInitData =
  //   "query_id=AAElBO5_AAAAACUE7n8MOa_y&user=%7B%22id%22%3A2146305061%2C%22first_name%22%3A%22Crypto%22%2C%22last_name%22%3A%22Dray%22%2C%22username%22%3A%22Habibilord%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%7D&auth_date=1729828440&hash=a21590e0fe10c68048781c3b3e22e8ecde0a8b8b163bf4c7a58e5c48855e584e";

  useEffect(() => {
    if (isInitialized || !isLoading || !WebApp) return;
    WebApp.expand()
    const telegramInitData = WebApp.initData

    const initializeUser = async () => {

      if (!telegramInitData) {
        setError("No user data available");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            initData: telegramInitData,
            referralCode: referralCode,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();

        if (data.error) {
          setError(data.error);
        } else {
          setUser(data.user);

          const createdAt = new Date(data.user.createdAt).getTime();
          const now = new Date().getTime();
          const timeDiff = now - createdAt;

          if (timeDiff <= 15000) {
            setShowWelcome(true);
            setTimeout(() => setShowWelcome(false), 5000);
          }
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch user data");
      } finally {
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    initializeUser();
  }, [

    referralCode,
    setUser,
    isInitialized,
    isLoading,
    setIsInitialized,
    setIsLoading,
  ]);

  if (isLoading && !isInitialized) {
    return <Loading />;
  }

  return (
    <Box width={"100vw"} overflowX={"hidden"} fontFamily={"sans-serif"}>
      {showWelcome ? <Welcome /> : <Homepage />}
    </Box>
  );
}

export default function App() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
