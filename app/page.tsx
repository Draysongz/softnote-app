"use client";

import { Box } from "@chakra-ui/react";
import { useState, useEffect, Suspense } from "react";
import { useUser } from "@/context/context";
import { useSearchParams } from "next/navigation";
import Loading from "@/components/Loading";
import Welcome from "@/components/Welcome";

export const dynamic = "force-dynamic";

function HomeContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  console.log(error)
  const { setUser } = useUser();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("referralCode");

  const telegramInitData =
    "query_id=AAElBO5_AAAAACUE7n8MOa_y&user=%7B%22id%22%3A2146305061%2C%22first_name%22%3A%22Crypto%22%2C%22last_name%22%3A%22Dray%22%2C%22username%22%3A%22Habibilord%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%7D&auth_date=1729828440&hash=a21590e0fe10c68048781c3b3e22e8ecde0a8b8b163bf4c7a58e5c48855e584e";

  // Handle authentication
  useEffect(() => {
    if (telegramInitData) {
      fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          initData: telegramInitData,
          referralCode: referralCode,
        }),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch user data");
          }
          return res.json();
        })
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            console.log("User data:", data);
            setUser(data.user);
          }
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to fetch user data");
        });
    } else {
      setError("No user data available");
    }
  }, [referralCode, setUser]);

  // Handle loading state
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

export default function App() {
  return (
    <Suspense>
      <HomeContent />;
    </Suspense>
  );
}
