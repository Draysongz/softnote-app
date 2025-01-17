"use client";

// import { ChevronRightIcon } from "@chakra-ui/icons";
import { Box, Flex, Text, Image, Avatar } from "@chakra-ui/react";
// import { Progress } from "@chakra-ui/react"
// import Link from "next/link";
import NavigationBar from "@/components/NavigationBar";
import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "@/context/context";
import debounce from "lodash/debounce";

// const SmallCardArray = [
//   {
//     image: "/game-chat.svg",
//     text: "Play Mini Games",
//     timer: "00:00",
//     path: "/dailychallenge",
//   },
// ];

type UserData = {
  id: string;
  telegramId: string;
  username: string;
  photoUrl?: string; // Optional field
  level: number;
  coins: number;
  taps: number;
  maxTaps: number;
  refillRate: number;
  lastRefillTime: Date;
  slots: number;
  referralCount: number;
  referredBy?: string; // Optional field
  freeSpins: number;
  multitap: number;
  tapLimitBoost: number;
  tappingGuruUses: number;
  profitPerHour: number;
  lastEarningsUpdate: Date;
  lastCheckIn?: Date; // Optional field
  checkInStreak: number;
  createdAt: Date;
  updatedAt: Date;
};

const levelNames = [
  "Bronze", // From 0 to 4999 coins
  "Silver", // From 5000 coins to 24,999 coins
  "Gold", // From 25,000 coins to 99,999 coins
  "Platinum", // From 100,000 coins to 999,999 coins
  "Diamond", // From 1,000,000 coins to 2,000,000 coins
  "Epic", // From 2,000,000 coins to 10,000,000 coins
  "Legendary", // From 10,000,000 coins to 50,000,000 coins
  "Master", // From 50,000,000 coins to 100,000,000 coins
  "GrandMaster", // From 100,000,000 coins to 1,000,000,000 coins
  "Lord", // From 1,000,000,000 coins to ∞
];

const levelMinPoints = [
  0, // Bronze
  5000, // Silver
  25000, // Gold
  100000, // Platinum
  1000000, // Diamond
  2000000, // Epic
  10000000, // Legendary
  50000000, // Master
  100000000, // GrandMaster
  1000000000, // Lord
];



export default function Homepage() {
  const { user, setUser } = useUser();
  const [userData, setUserData] = useState<UserData | null>();
  const [levelIndex, setLevelIndex] = useState(0);
  const [coins, setCoins] = useState(0);
  console.log(coins)
  const [clicks, setClicks] = useState<{ id: number; x: number; y: number }[]>(
    []
  );
  const [isFirstImage, setIsFirstImage] = useState(true);

  const [points, setPoints] = useState(0);
  const [pointsToAdd, setPointsToAdd] = useState(0);
  const [profitPerHour, setProfitPerHour] = useState(0);
  const [floatingEnergy, setFloatingEnergy] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const updateQueueRef = useRef<{ coins: number; taps: number } | null>(null);

  // Keep a ref for the latest points to use in debounced function
  const pointsRef = useRef(points);
  useEffect(() => {
    pointsRef.current = points;
  }, [points]);

  // Initialize from user data
  useEffect(() => {
    if (user) {
      setUserData(user);
      setFloatingEnergy(user.taps);
      setPoints(user.coins);
      setProfitPerHour(user.profitPerHour || 0);
    }
  }, [user]);

  // Debounced update function
  const debouncedUpdate = useCallback(
    debounce(async (updates: { coins: number; taps: number }) => {
      if (!user?.telegramId || !updates) return;

      setIsUpdating(true);
      try {
        const response = await fetch(
          `/api/updateprofile?userId=${user.telegramId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updates),
          }
        );

        if (!response.ok) throw new Error("Update failed");

        const updatedUser = await response.json();
        setUser(updatedUser);
        setUserData(updatedUser);

        // Process next update in queue if exists
        if (
          updateQueueRef.current &&
          (updateQueueRef.current.coins !== updates.coins ||
            updateQueueRef.current.taps !== updates.taps)
        ) {
          debouncedUpdate(updateQueueRef.current);
          updateQueueRef.current = null;
        }
      } catch (error) {
        console.error("Error updating profile:", error);
      } finally {
        setIsUpdating(false);
      }
    }, 200), // 200ms debounce
    [user?.telegramId, setUser]
  );

  const queueUpdate = useCallback(
    (newPoints: number, newEnergy: number) => {
      const updates = { coins: newPoints, taps: newEnergy };

      if (isUpdating) {
        // Queue the update if one is in progress
        updateQueueRef.current = updates;
      } else {
        // Otherwise, trigger the update
        debouncedUpdate(updates);
      }
    },
    [isUpdating, debouncedUpdate]
  );

  const handleCardClick = async (e: React.TouchEvent<HTMLDivElement>) => {
    if (floatingEnergy <= 0) return;
    setIsFirstImage(false);

    const touches = Array.from(e.changedTouches);
    let newPoints = points;
    let newFloatingEnergy = floatingEnergy;

    touches.forEach(() => {
      newPoints += pointsToAdd;
      newFloatingEnergy -= 1;
    });

    // Optimistic update
    setPoints(newPoints);
    setFloatingEnergy(newFloatingEnergy);

    // Queue the update
    queueUpdate(newPoints, newFloatingEnergy);

    // Handle animations
    setClicks((prev) => [
      ...prev,
      ...touches.map((touch) => ({
        id: Date.now(),
        x: touch.pageX,
        y: touch.pageY,
      })),
    ]);
  };

  // Background sync
  useEffect(() => {
    if (!user?.telegramId) return;

    const syncInterval = setInterval(async () => {
      if (isUpdating) return; // Skip sync if update is in progress

      try {
        const response = await fetch(`/api/getuser?userId=${user.telegramId}`);
        if (!response.ok) throw new Error("Failed to fetch user data");

        const { user: latestUser } = await response.json();

        // Only update if values are different and no update is queued
        if (
          !updateQueueRef.current &&
          (latestUser.coins !== points || latestUser.taps !== floatingEnergy)
        ) {
          setUser(latestUser);
          setUserData(latestUser);
          setFloatingEnergy(latestUser.taps);
          setPoints(latestUser.coins);
        }
      } catch (error) {
        console.error("Error syncing data:", error);
      }
    }, 5000); // Sync every 5 seconds

    return () => clearInterval(syncInterval);
  }, [user?.telegramId, setUser, points, floatingEnergy, isUpdating]);

  useEffect(() => {
    const flickerTimer = setTimeout(() => {
      setIsFirstImage(true);
    }, 200);

    return () => clearTimeout(flickerTimer);
  }, [isFirstImage]);

  const handleAnimationEnd = (id: number) => {
    setClicks((prevClicks) => prevClicks.filter((click) => click.id !== id));
  };

  // const calculateProgress = () => {
  //   if (levelIndex >= levelNames.length - 1) {
  //     return 100;
  //   }
  //   const currentLevelMin = levelMinPoints[levelIndex];
  //   const nextLevelMin = levelMinPoints[levelIndex + 1];
  //   const progress =
  //     ((points - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100;
  //   return Math.min(progress, 100);
  // };

  useEffect(() => {
    const currentLevelMin = levelMinPoints[levelIndex];
    const nextLevelMin = levelMinPoints[levelIndex + 1];
    if (points >= nextLevelMin && levelIndex < levelNames.length - 1) {
      setLevelIndex(levelIndex + 1);
    } else if (points < currentLevelMin && levelIndex > 0) {
      setLevelIndex(levelIndex - 1);
    }
  }, [points, levelIndex, levelMinPoints, levelNames.length]);

  // const formatProfitPerHour = (profit: number) => {
  //   if (profit >= 1000000000) return `+${(profit / 1000000000).toFixed(2)}B`;
  //   if (profit >= 1000000) return `+${(profit / 1000000).toFixed(2)}M`;
  //   if (profit >= 1000) return `+${(profit / 1000).toFixed(2)}K`;
  //   return `${profit}`;
  // };

  useEffect(() => {
    if (userData) {
      setCoins(userData.coins);
      setPoints(userData.coins);
      setPointsToAdd(userData.multitap);
      setProfitPerHour(userData.profitPerHour);
      setLevelIndex(userData.level);
      setFloatingEnergy(userData.taps);
    }
  }, [userData]);

  // useEffect(() => {
  //   const handlePPh = async () => {
  //     if (user) {
  //       const now = new Date();
  //       const lastUpdate = user.lastEarningsUpdate
  //         ? new Date(user.lastEarningsUpdate)
  //         : now; // If null, set to now
  //       const elapsedSeconds = Math.floor(
  //         (now.getTime() - lastUpdate.getTime()) / 1000
  //       );

  //       // Calculate the earned coins since the last update
  //       const earnedCoins = (user.profitPerHour / 3600) * elapsedSeconds;

  //       // Update the points and sync with backend
  //       const newPoints = user.coins + earnedCoins;

  //       // Update the backend with new coins and the latest earnings update time
  //       await updateUserProfile({ coins: newPoints, lastEarningsUpdate: now });

  //       setPoints(newPoints);
  //     }
  //   };

  //   if (user) {
  //     handlePPh();
  //   }
  // }, [user]);

  useEffect(() => {
    if (profitPerHour > 0) {
      const interval = setInterval(() => {
        const pointsToAdd = profitPerHour / 3600; // Fractional points per second

        setPoints((prevPoints) => prevPoints + pointsToAdd); // Add fractional points
      }, 1000); // Every second

      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [profitPerHour]);

  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      bgColor={"#06070A"}
      width={"100vw"}
      minHeight={"100vh"}
      alignItems={"center"}
      textColor={"white"}
      overflow={"hidden"}
    >
      <Flex
        width={"100%"}
        height={"100%"}
        flexDirection={"column"}
        alignItems={"center"}
        justifyContent={"center"}
        pt={1}
        gap={1}
      >
        <Box w={"90%"}>
          <Flex alignItems={"center"} gap={2}>
            {userData && (
              <Avatar
                size={"sm"}
                name={userData.username}
                src={userData.photoUrl}
              />
            )}

            <Text fontWeight={"700"} fontSize={"20px"} color={"#F5F5F5"}>
              {userData && userData.username}
            </Text>
          </Flex>
          {/* <Flex
            w={"100%"}
            alignItems={"center"}
            mt={4}
            justifyContent={"space-between"}
          >
            <Box
              width={"40%"}
              display={"flex"}
              flexDirection={"column"}
              gap={1}
            >
              <Flex justifyContent={"space-between"}>
                <Text fontSize={"small"}>
                  {levelNames[levelIndex]}
                  <ChevronRightIcon />
                </Text>
                <Text fontSize={"small"}>
                  {" "}
                  {levelIndex + 1} / {levelNames.length}
                </Text>
              </Flex>
              <Flex alignItems={"center"} bg={"green"}>
                <Progress
                  value={calculateProgress()}
                  size="sm"
                  borderRadius={"full"}
                  bg={"#1D222E"}
                  border={"1px solid #7585A7"}
                  w={"full"}
                  sx={{
                    "& > div": {
                      background:
                        "linear-gradient(90deg, #4979D1 0%, #4979D1 48.17%, #B5CFFE 100%)",
                    },
                  }}
                />
              </Flex>
            </Box>
            <Box
              display={"flex"}
              flexDirection={"column"}
              alignItems={"flex-end"} // Align to the end of the container
              justifyContent={"center"}
            >
              <Text
                fontWeight={500}
                fontSize={"12px"}
                color={"rgba(117, 133, 167, 1)"}
                textAlign={"right"} // Ensure the text is right-aligned
              >
                {userData && formatProfitPerHour(profitPerHour)} per hour
              </Text>
              <Box
                width={"100%"}
                height={"21px"}
                fontWeight={"600"}
                fontSize={"14px"}
                color={"#f5f5f5"}
                textAlign={"right"} // Align text to the right
                alignItems={"center"}
                display={"flex"}
                justifyContent={"flex-end"} // Align the content inside to the end
                gap={1}
              >
                <Image src="/xp.svg" />
                <Text>
                  {new Intl.NumberFormat().format(parseInt(points.toFixed(0)))}
                </Text>
              </Box>
            </Box>
          </Flex> */}
        </Box>

        <Flex
          width={"100%"}
          flexDirection={"column"}
          pt={1}
          borderTopRadius={"10px"}
          justifyContent={"center"}
          alignItems={"center"}
          // bgGradient={
          //   "conic-gradient(from 180deg at 50% 50%, #19388A 0deg, #1A59FF 25.2deg, #D9D9D9 117deg, #1948C1 212.4deg, #F5F5F5 284.4deg, #19388A 360deg)"
          // }
        >
          <Flex
            flexDirection={"column"}
            bgColor={"#06070A"}
            w={"100%"}
            borderTopRadius={"15px"}
            h={"70vh"}
            // bg={'yellow'}
            className="gap-0 pt-2 sm:pt-2 xl:pt-3"
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            {/* <Flex w={"90%"} pt={"3px"}>
              {SmallCardArray.map((card, id) => {
                return (
                  <Link href={card.path} className="w-[100%]" key={id}>
                    <Flex
                      width={"100%"}
                      alignItems={"center"}
                      justifyContent={"center"}
                      bgColor={"#12161E"}
                      h={"45px"}
                      border={"1px solid #343C4D"}
                      borderRadius={"15px"}
                      px={3}
                    >
                      <Flex alignItems={"center"} gap={2}>
                        <Image alt="card img" src={card.image} w={"20px"} />
                        <Text
                          w={""}
                          textAlign={"center"}
                          fontSize={"12px"}
                          fontWeight={500}
                          color={"white"}
                        >
                          {card.text}
                        </Text>
                      </Flex>
                    </Flex>
                  </Link>
                );
              })}
            </Flex> */}

            <Box
              display={"flex"}
              flexDirection={"column"}
              width={"266px"}
              h={"100px"}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Flex h={"36px"} gap={2} alignItems={"center"}>
                <Image alt="coin img" src="/xpmid.svg" />
                <Text fontSize={"29.33px"} fontWeight={600} color={"#DDE2E7"}>
                  {new Intl.NumberFormat().format(parseInt(points.toFixed(0)))}
                </Text>
              </Flex>
            </Box>

            <Box
              w={"100%"}
              display={"flex"}
              flexDirection={"column"}
              justifyContent={"center"}
              alignItems={"center"}
              className="circle-outer h-[30vh] sm:h-[35vh]"
              onTouchStart={handleCardClick}
            >
              <Box
                width={"100%"}
                h={"100%"}
                display={"flex"}
                flexDirection={"column"}
                justifyContent={"center"}
                alignItems={"center"}
                // overflow={'hidden'}
                // mt={2}
                // className="circle-inner"
              >
                {/* <Image
                  alt="floating coin img"
                  src="/FloatingCoins.png"
                  position={"relative"}
                  zIndex={1}
                  className="w-[70%] sm:w-[100%]"
                /> */}
                <Box
                  // className="spin w-[200px] h-[200px] sm:w-[300px] sm:h-[300px]"
                  // bgGradient={
                  //   "conic-gradient(from 180deg at 50% 50%, #19388A 0deg, #1A59FF 25.2deg, #D9D9D9 117deg, #1948C1 212.4deg, #F5F5F5 284.4deg, #19388A 360deg)"
                  // }
                  // // w={"200px"}
                  // // h={"200÷px"}
                  // borderRadius={"50%"}
                  // position={"absolute"}
                  p={"5px"}
                  display={"flex"}
                >
                  <Box
                    // bgGradient={
                    //   "linear-gradient(360deg, #00283A 0%, #12161E 88.17%)"
                    // }
                    borderRadius={"50%"}
                    overflow={"hidden"}
                  >
                    <Image
                      src={"/XPCoin.svg"}
                      // w={{ base: "80%", sm: "auto" }}
                      mx={"auto"}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box
              w={"100%"}
              h={"35.33px"}
              mt={2}
              px={"10.67px"}
              alignItems={"center"}
              justifyContent={"center"}
              display={"flex"}
            >
              <Flex
                width={"85%"}
                h={"100%"}
                alignItems={"center"}
                pb={2}
                justifyContent={"center"}
                gap={1}
              >
                <Image src="/bolt.svg" />
                <Text fontSize={"13px"} fontWeight={500} color={"#487BFF"}>
                  {`${floatingEnergy} / ${userData && userData.maxTaps}`}
                </Text>
              </Flex>
            </Box>
          </Flex>
        </Flex>
      </Flex>
      <NavigationBar />
      {clicks.map((click) => (
        <div
          key={click.id}
          className="absolute text-5xl font-bold opacity-0 text-white pointer-events-none"
          style={{
            top: `${click.y - 42}px`,
            left: `${click.x - 28}px`,
            animation: `float 1s ease-out`,
          }}
          onAnimationEnd={() => handleAnimationEnd(click.id)}
        >
          {pointsToAdd}
        </div>
      ))}
    </Box>
  );
}
