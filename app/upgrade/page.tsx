"use client"

import { Box, Text, Flex, Image, Icon, Progress, Spinner, useToast} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import NavigationBar from "@/components/NavigationBar";
import { useState, useEffect } from "react";
import { useUser } from "@/context/context";

const Upgrade = [
  {
    image: "/upgrade.png",
  },
  {
    image: "/upgrade.png",
  },
  {
    image: "/upgrade.png",
  },
];

interface Card {
  id: string;
  name: string;
  category: string;
  baseProfit: number;
  profitIncrease: number;
  baseCost: number;
  costIncrease: number;
  imagePath: string;
  coinIcon: string;
  level: number; // Level is included here
  userPurchased: boolean;
  nextCost: number;
  profitPerHour: number;
  nextProfitPerHour: number;
}

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


export default function Upgrades() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
      const { user, setUser } = useUser();
      const toast = useToast();

      const [levelIndex, setLevelIndex] = useState(0);
      const [points, setPoints] = useState(0);
      
const formatNumber = (num: number) => {
  if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

      useEffect(() => {
        if (user) {
          setPoints(user.coins);
          setLevelIndex(user.level);
        }
      }, [user]);

       useEffect(() => {
         const currentLevelMin = levelMinPoints[levelIndex];
         const nextLevelMin = levelMinPoints[levelIndex + 1];
         if (points >= nextLevelMin && levelIndex < levelNames.length - 1) {
           setLevelIndex(levelIndex + 1);
         } else if (points < currentLevelMin && levelIndex > 0) {
           setLevelIndex(levelIndex - 1);
         }
       }, [points, levelIndex, levelMinPoints, levelNames.length]);

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
  

  // Fetch cards from the backend API
  const fetchCards = async () => {
    try {
      const response = await fetch(`/api/getCards?userId=${user?.id}`, { method: "GET" });

      if (!response.ok) {
        throw new Error("Failed to fetch cards");
      }

      const data: Card[] = await response.json();
      console.log(data)
      setCards(data); // Set the fetched cards in state
    } catch (error) {
      console.error("Error fetching cards:", error);
    } finally {
      setLoading(false); // Stop loading after fetching
    }
  };

  // Use useEffect to fetch cards on component mount
  useEffect(() => {
    fetchCards();
  }, [user]);


  const handlePurchase = async (
    cardId: string,
    userId: string,
    cost: number
  ) => {
    if (!user) {
      console.error("User data not available.");
      return;
    }

    if (cost > user.coins) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough coins to buy this card.",
        duration: 3000,
        isClosable: true,
        status: "error",
      });
      return;
    }

    const toastId = toast({
      title: "Purchasing card...",
      status: "loading",
      duration: null,
      isClosable: true,
    });

    try {
      const response = await fetch("/api/purchaseCard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, cardId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to purchase card");
      }

      const result = await response.json();
      setCards((prevCards) =>
        prevCards?.map((card) => (card.id === cardId ? result.card : card))
      );

      toast.update(toastId, {
        title: "Card purchased successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setUser(result.updatedUser);
      console.log("Purchase Result:", result);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error:", err);
      toast.update(toastId, {
        title: "Failed to purchase the card. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };


  const handleUpgrade = async (
    cardId: string,
    userId: string,
    cost: number
  ) => {
       if (!user) {
         console.error("User data not available.");
         return;
       }

    if (cost > user.coins) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough coins to upgrade this card ",
        duration: 3000,
        isClosable: true,
        status: "error",
      });
      return;
    }

    const toastId = toast({
      title: "Upgrading card...",
      status: "loading",
      duration: null, // Keeps the toast open until manually closed or replaced
      isClosable: true,
    });
    try {
      const response = await fetch("/api/upgradeCard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, cardId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to purchase card");
      }

      const result = await response.json();
      setCards((prevCards) =>
        prevCards?.map((card) => (card.id === cardId ? result.card : card))
      );

      toast.update(toastId, {
        title: "Card Upgrade successful!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setUser(result.updatedUser);
      console.log("Purchase Result:", result);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error upgrading card:", err);
      toast.update(toastId, {
        title: "Failed to upgrade the card. Please try again.",
        description: err.response ? err.response.data : "Error purchasing card",
        status: "error",
        duration: 5000, // Automatically closes after 5 seconds
        isClosable: true,
      });
    }
  };



  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh" direction={'column'} w={"full"}>
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }
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
        minHeight={"100vh"}
        bg={"#12161F"}
        flexDirection={"column"}
        alignItems={"center"}
        pb={32}
        gap={5}
      >
        <Box width={"100%"} p={"20px"} pt={"30px"}>
          <Flex
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
                <Text fontSize={"12px"} color={"#F5F5F5"}>
                  {levelNames[levelIndex]}
                  <Icon as={ChevronRightIcon} />
                </Text>
                <Text fontSize={"12px"} color={"#F5F5F5"}>
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
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Text fontWeight={500} fontSize={"12px"} color={"#f5f5f5"}>
                XP Reward
              </Text>
              <Box
                width={"80px"}
                height={"21px"}
                padding={"2px 12px"}
                fontWeight={"600"}
                fontSize={"14px"}
                color={"#f5f5f5"}
                textAlign={"center"}
                alignItems={"center"}
                display={"flex"}
                justifyContent={"center"}
                gap={1}
              >
                <Image src="/Vector.svg" />
                <Text>
                  {new Intl.NumberFormat().format(parseInt(points.toFixed(0)))}
                </Text>
              </Box>
            </Box>
          </Flex>
        </Box>
        <Box
          width={"100%"}
          px={"16px"}
          display={"flex"}
          flexDirection={"column"}
          gap={3}
          justifyContent={"space-between"}
        >
          <Flex
            width={"100%"}
            height={"105px"}
            py={"8px"}
            gap={"19px"}
            alignContent={"center"}
            justifyContent={"center"}
          >
            {Upgrade.map((upgrade, id) => {
              return (
                <Box
                  key={id}
                  width={"94px"}
                  height={"89px"}
                  borderRadius={"16px"}
                  border={"1px solid #4979D133"}
                  // p={"20px 30px"}
                  alignItems={"center"}
                  justifyContent={"center"}
                  gap={"10px"}
                  display={"flex"}
                  flexDirection={"column"}
                >
                  <Image
                    src={upgrade.image}
                    w={"80%"}
                    // h={"59px"}
                    // mx={'auto'}
                    alt="upgrade img"
                  />
                </Box>
              );
            })}
          </Flex>
          <Box
            w={"100%"}
            display={"grid"}
            gridTemplateColumns={"repeat(2, 1fr)"}
            gap={"16px"}
            mt={5}
          >
            {cards &&
              cards.map((card, index) => {
                return (
                  <Box
                    key={index}
                    w={"100%"}
                    borderRadius={"16px"}
                    border={"0.67px solid #99999933"}
                    bg={"#12161E"}
                    p={"16px 6px"}
                    onClick={() => {
                      if (!user) return; // Ensure the user exists

                      if (card.level >= 1) {
                        handleUpgrade(card.id, user.id, card.nextCost); // Upgrade if level >= 1
                      } else {
                        handlePurchase(card.id, user.id, card.baseCost); // Purchase if level < 1
                      }
                    }}
                  >
                    <Flex alignItems={"center"} gap={"10px"}>
                      <Image
                        src={card.imagePath}
                        w={"60px"}
                        borderRadius={"10px"}
                        alt="detail img"
                      />
                      <Flex flexDirection={"column"} w={"99px"}>
                        <Text
                          fontSize={"14px"}
                          fontWeight={600}
                          lineHeight={"19.36px"}
                          color={"#487BFF"}
                        >
                          {card.name}
                        </Text>
                        <Text
                          fontSize={"11px"}
                          fontWeight={500}
                          lineHeight={"14.52px"}
                          color={"#7585A7"}
                        >
                          Profit per Hour
                        </Text>
                        <Flex alignItems={"center"} gap={1}>
                          <Image
                            src="/Vector.svg"
                            w={"16px"}
                            alt="coin img"
                          />
                          {""}
                          <Text fontSize={"14px"} fontWeight={500}>
                            {card.nextProfitPerHour
                              ? formatNumber(card.nextProfitPerHour)
                              : formatNumber(card.baseProfit)}
                          </Text>
                        </Flex>
                      </Flex>
                    </Flex>
                    <Flex
                      justifyContent={"space-between"}
                      w={"147px"}
                      mt={3}
                      lineHeight={"10px"}
                    >
                      <Text fontSize={"12px"} fontWeight={500}>
                        Level {card.level}
                      </Text>
                      <Flex alignItems={"center"}>
                        <Image
                          src="/Vector.svg"
                          w={"16px"}
                          alt="coin img"
                        />
                        <Text fontSize={"14px"} fontWeight={500}>
                          {card.nextCost ? formatNumber(card.nextCost) : formatNumber(card.baseCost)}
                        </Text>
                      </Flex>
                    </Flex>
                  </Box>
                );
              })}
          </Box>
        </Box>
      </Flex>
      <NavigationBar />
    </Box>
  );
}
