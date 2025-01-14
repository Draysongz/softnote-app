"use client";
import {
  Flex,
  Box,
  Text,
  HStack,
  Progress,
  Heading,
  Button,
  useToast,
} from "@chakra-ui/react";
import { ChevronRightIcon, Image } from "@chakra-ui/icons";
import NavigationBar from "@/components/NavigationBar";
import { useState, useEffect } from "react";
import { useUser } from "@/context/context";

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

type Props = Record<string, never>;
const cards = [
  { day: 1, reward: 100 },
  { day: 2, reward: 120 },
  { day: 3, reward: 150 },
  { day: 4, reward: 180 },
  { day: 5, reward: 200 },
  { day: 6, reward: 220 },
  { day: 7, reward: 250 },
  { day: 8, reward: 280 },
  { day: 9, reward: 300 },
  { day: 10, reward: 350 },
  { day: 11, reward: 380 },
  { day: 12, reward: 520 },
  { day: 13, reward: 550 },
  { day: 14, reward: 1000 },
  { day: 15, reward: 1100 },
  { day: 16, reward: 1500 },
  { day: 17, reward: 1800 },
  { day: 18, reward: 2500 },
  { day: 19, reward: 3000 },
  { day: 20, reward: 4000 },
];

function DailyReward({}: Props) {
    const {user, setUser} = useUser()
    const toast= useToast()

    const [levelIndex, setLevelIndex] = useState(0);
     const [points, setPoints] = useState(0);
     const [activeDay, setActiveDay] = useState(0)

     useEffect(()=>{
      if(user){
        setPoints(user.coins);
        setLevelIndex(user.level);
        setActiveDay(user.checkInStreak)
      }
     },[user])

      const calculateProgress = () => {
        if (levelIndex >= levelNames.length - 1) {
          return 100;
        }
        const currentLevelMin = levelMinPoints[levelIndex];
        const nextLevelMin = levelMinPoints[levelIndex + 1];
        const progress =
          ((points - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100;
        return Math.min(progress, 100);
      };

      useEffect(() => {
        const currentLevelMin = levelMinPoints[levelIndex];
        const nextLevelMin = levelMinPoints[levelIndex + 1];
        if (points >= nextLevelMin && levelIndex < levelNames.length - 1) {
          setLevelIndex(levelIndex + 1);
        } else if (points < currentLevelMin && levelIndex > 0) {
          setLevelIndex(levelIndex - 1);
        }
      }, [points, levelIndex, levelMinPoints, levelNames.length]);
  
      const claimBonus = async () => {
        if (!user) return;

        try {
          const response = await fetch("/api/checkIn", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user.telegramId }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.message);
            return;
          }

          const { user: updatedUser, reward } = await response.json();
          toast({
            title: "Check-in successful",
            description: `You received ${reward} coins!`,
            duration: 3000,
            status: "success",
            isClosable: true,
          });
          setUser(updatedUser); // Update user data in context
          setActiveDay(updatedUser.checkInStreak);
        } catch (error) {
          console.error("Error claiming bonus:", error);
           toast({
             title: "Check-in failed",
             description:"Please try again later.",
             status: "error",
             duration: 3000,
             isClosable: true,
           });
        }
      };

      console.log(activeDay)

  return (
    <Flex
      minH={"100vh"}
      bgColor={"#06070A"}
      minW={"100vw"}
      color={"white"}
      direction={"column"}
      gap={6}
    >
      <Flex direction={"column"} gap={2} p={5}>
        <Flex gap={1} justifyContent={"center"}>
          <Heading fontSize={"24px"} color={"#487BFF"}>
            Daily Reward
          </Heading>
        </Flex>

        {/* <Flex justifyContent={"space-between"} alignItems={"center"}>
          <Flex direction={"column"}>
            <HStack spacing={10}>
              <Text fontSize={"small"}>
                {levelNames[levelIndex]}
                <ChevronRightIcon />
              </Text>
              <Text fontSize={"small"}>
                {" "}
                {levelIndex + 1} / {levelNames.length}
              </Text>
            </HStack>

            <Flex alignItems={"center"} borderRadius={"20px"} mt={2}>
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
          </Flex>

          <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={"flex-end"} // Align to the end of the container
            justifyContent={"center"}
          >
            <Text
              fontWeight={500}
              fontSize={"12px"}
              color={"#f5f5f5"}
              textAlign={"right"} // Ensure the text is right-aligned
            >
              XP Reward
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
              <Image src="/Vector.svg" />
              <Text>
                {new Intl.NumberFormat().format(parseInt(points.toFixed(0)))}
              </Text>
            </Box>
          </Box>
        </Flex> */}
      </Flex>

      {/* Cards displayed in a grid layout */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(5, 1fr)" // Ensures 5 cards per row
        gap={0.5}
        p={5}
        alignSelf={"center"}
        justifyContent={"center"}
        w="90%"
      >
        {cards.map((card, index) => (
          <Box
            key={index}
            mt={1}
            p={2}
            borderRadius={"8px"}
            textAlign="center"
            // border={"0.5px solid #5C6987"}
            bg={activeDay === index ? "#487BFF" : "#12161F"}
          >
            {/* Green dot for active day */}
            {/* {activeDay === card.day && (
              <Box
                position="absolute"
                top="-5px"
                right="-5px"
                width="10px"
                height="10px"
                bg="#12161F"
                borderRadius="full"
                boxShadow="0 0 8px rgba(0, 255, 41, 0.8)"
              />
            )} */}

            <Text
              fontSize={"xs"}
              color={activeDay === index ? "white" : "#5C6987"}
            >
              Day {card.day}
            </Text>
            <Text
              fontWeight={"800"}
              fontSize={"18px"}
              color={activeDay === index ? "white" : "#487BFF"}
            >
              {card.reward}
            </Text>
          </Box>
        ))}
      </Box>

      <Button
        alignSelf={"center"}
        color={"#fff"}
        w={"55vw"}
        borderRadius={"10px"}
        fontWeight={"500"}
        fontSize={"20px"}
        onClick={claimBonus}
        sx={{
          background:
            "radial-gradient(145.42% 255.78% at 50.09% -35.73%, #487BFF 14.35%, rgba(42, 79, 173, 0.67) 52.92%, rgba(31, 65, 153, 0) 100%)",
          boxShadow:
            "0px 48px 130px 0px #090628D9, 0px 0px 100.36px 0px #416BFF3D inset",
          backdropFilter: "blur(91.9367px)",
        }}
      >
        Claim Bonus
      </Button>

      <NavigationBar />
    </Flex>
  );
}

export default DailyReward;
