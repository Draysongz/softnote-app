"use client";

import {
  Box,
  Flex,
  Text,
  Icon,
  Progress,
  Button,
  useToast,
} from "@chakra-ui/react";
import Data, { CardType } from "@/components/data";
import Card from "@/components/card";
import { useState, useEffect } from "react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import NavigationBar from "@/components/NavigationBar";
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
  lastTriviaAttempt?: Date;
  lastPuzzleAttempt?: Date;
  checkInStreak: number;
  createdAt: Date;
  updatedAt: Date;
};

type UpdateData = Partial<UserData>;

export default function Puzzle() {
  const [cardsArray, setCardsArray] = useState<CardType[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [matches, setMatches] = useState<number>(0);
  const [firstCard, setFirstCard] = useState<CardType | null>(null);
  const [secondCard, setSecondCard] = useState<CardType | null>(null);
  const [stopFlip, setStopFlip] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState("");
   const [showAll, setShowAll] = useState<boolean>(true);

  const { user , setUser} = useUser();
  console.log(user)
 const [levelIndex, setLevelIndex] = useState(0);
 const [points, setPoints] = useState(0);
  const toast = useToast();


    useEffect(() => {
      const revealTimeout = setTimeout(() => {
        setShowAll(false); // Hide cards after 5 seconds
      }, 5000);

      return () => clearTimeout(revealTimeout); // Cleanup the timeout if component unmounts
    }, []);


     const updateUserProfile = async (updatedFields: UpdateData) => {
       if (!user || !user.telegramId) {
         console.error("User data or telegramId is missing.");
         return;
       }

       try {
         const response = await fetch(
           `/api/updateprofile?userId=${user.telegramId}`,
           {
             method: "PATCH",
             headers: {
               "Content-Type": "application/json",
             },
             body: JSON.stringify(updatedFields),
           }
         );

         if (!response.ok) {
           const errorText = await response.text(); // Read raw text to handle empty responses
           console.error(
             "Failed to update profile:",
             errorText || "Unknown error"
           );
           return null;
         }

         const updatedUser = await response.json();
         console.log("Profile updated successfully:", updatedUser);
         return updatedUser; // Return the updated user if needed
       } catch (error) {
         console.error("Error updating profile:", error);
       }
     };
  // Start new game automatically on load/reload
  useEffect(() => {
    NewGame();
  }, []);


   useEffect(() => {
     if (user) {
       setPoints(user.coins);
       setLevelIndex(user.level);
     }
   }, [user]);

  // Handle game stop logic after win or loss
useEffect(() => {
  const handleMoves = async () => {
    if (!user) return;

    try {
      const now = new Date();

      // Handle game over condition
      if (moves >= 3 && matches < 2) {
        setGameOver(true);
        if (moves === 3) {
          const updatedUser = await updateUserProfile({
            lastPuzzleAttempt: now,
          });
          setUser(updatedUser);
        }
      }

      // Handle win condition
      if (matches >= 2) {
        setWon(true);
        const newCoin = user.coins + 100;
        const updatedUser = await updateUserProfile({
          lastPuzzleAttempt: now,
          coins: newCoin,
        });
        setUser(updatedUser);

        toast({
          title: "You won 100Xp",
          duration: 3000,
          isClosable: true,
          status: "success",
        });
      }
    } catch (error) {
      console.error("Error handling moves:", error);
    }
  };

  handleMoves();
}, [moves, matches]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!user || !user.lastPuzzleAttempt) return;
      const now = new Date();
      const nextReset = new Date(user.lastPuzzleAttempt); // This will only execute if lastTriviaAttempt exists
      nextReset.setDate(nextReset.getDate() + 1); // Next reset at 24 hours

      const timeDiff = nextReset.getTime() - now.getTime();

      if (timeDiff > 0) {
        const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
        const seconds = Math.floor((timeDiff / 1000) % 60);

        setTimeLeft(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      }
    };

    // Run the timer every second
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [user]);

  function NewGame(): void {
    const shuffledArray = Data.sort(() => 0.5 - Math.random()).map((card) => ({
      ...card,
      matched: false,
    }));
    setCardsArray(shuffledArray);
    setMoves(0);
    setMatches(0);
    setFirstCard(null);
    setSecondCard(null);
    setWon(false);
    setGameOver(false);
    setShowAll(true); 
    resetIndicate();
  }

  function handleSelectedCards(item: CardType): void {
    if (stopFlip || gameOver || won) return; // Prevent further actions if game is over or won

    if(firstCard){
      setSecondCard(item) 
    } else{
      setFirstCard(item);
    }
  }

  useEffect(() => {
    if (firstCard && secondCard) {
      setStopFlip(true);
      if (firstCard.name === secondCard.name) {
        handleMatchSuccess();
      } else {
        handleMatchFailure();
      }
    }
  }, [firstCard, secondCard]);

  function handleMatchSuccess() {
    setCardsArray((prevArray) =>
      prevArray.map((card) =>
        card.name === firstCard!.name ? { ...card, matched: true } : card
      )
    );
    setMatches((prevMatches) => prevMatches + 1);
    updateIndicate("green");

    resetSelection();
  }

  function handleMatchFailure() {
    updateIndicate("red");
    setTimeout(resetSelection, 1000);
  }

  function resetSelection(): void {
    setFirstCard(null);
    setSecondCard(null);
    setStopFlip(false);
    setMoves((prevMoves) => prevMoves + 1);
  }

  function updateIndicate(color: string) {
    const indicateBoxes = document.querySelectorAll(".indicate");
    indicateBoxes[moves]?.setAttribute("style", `background-color: ${color}`);
  }

  function resetIndicate() {
    const indicateBoxes = document.querySelectorAll(".indicate");
    indicateBoxes.forEach((box) =>
      box.setAttribute("style", "background-color: lightgray")
    );
  }

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

  return (
    <Box
      display="flex"
      flexDirection="column"
      bg={"#06070A"}
      width="100vw"
      height="100vh"
      alignItems="center"
      textColor="white"
      overflow="hidden"
    >
      <Flex
        width="100%"
        height="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        pt={12}
        gap={5}
        pb={32}
      >
        <Box width="100%" px="20px" pb={10}>
          <Text
            color="#93BAFF"
            fontWeight="700"
            fontSize="24px"
            textAlign="center"
          >
            Daily Puzzle
          </Text>

          {/* <Flex
            w="100%"
            alignItems="center"
            mt={4}
            justifyContent="space-between"
          >
            <Box width="40%" display="flex" flexDirection="column" gap={1}>
              <Flex justifyContent="space-between">
                <Text fontSize="12px" color="#F5F5F5">
                  {levelNames[levelIndex]}
                  <Icon as={ChevronRightIcon} />
                </Text>
                <Text fontSize="12px" color="#F5F5F5">
                  {levelIndex + 1} / {levelNames.length}
                </Text>
              </Flex>
              <Flex alignItems="center" bg="green">
                <Progress
                  value={calculateProgress()}
                  size="sm"
                  borderRadius="full"
                  bg="#1D222E"
                  border="1px solid #7585A7"
                  w="full"
                />
              </Flex>
            </Box>
          </Flex> */}
        </Box>

        <Flex width="" gap={5}>
          <Box className="indicate" w="36px" h="36px" borderRadius="50%"></Box>
          <Box className="indicate" w="36px" h="36px" borderRadius="50%"></Box>
          <Box className="indicate" w="36px" h="36px" borderRadius="50%"></Box>
        </Flex>

        <Box width="90%" p="4px 16px" display={timeLeft !== "" ? "none" : "block"} >
          <div className="board" >
            {cardsArray.map((item) => (
              <Card
                key={item.id}
                item={item}
                handleSelectedCards={handleSelectedCards}
                toggled={
                 showAll || item === firstCard || item === secondCard || item.matched
                }
                stopflip={stopFlip}
              />
            ))}
          </div>

          {gameOver ? (
            <div className="comments">😢 Game Over! 😢</div>
          ) : won ? (
            <div className="comments">🎉 You won! 🎉</div>
          ) : (
            <div className="comments">Moves: {moves} / 3</div>
          )}
        </Box>

      {timeLeft !== " " && <Button
          mt={10}
          w="342px"
          h="49px"
          bg="#4979d1"
          fontSize="24px"
          _hover={{bg: "#4979d1"}}
          isDisabled={timeLeft !== ""}
        >
          {timeLeft}
        </Button>}
      </Flex>
      <NavigationBar />
    </Box>
  );
}
