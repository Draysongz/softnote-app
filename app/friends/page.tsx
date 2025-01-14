"use client"

import {
  Box,
  Text,
  Flex,
  Image,
  Icon,
  useClipboard,
  Input,
  Button,
  HStack,
} from "@chakra-ui/react";
// import { Progress } from "@chakra-ui/react";
// import { ChevronRightIcon } from "@chakra-ui/icons";
import { CheckIcon } from "@chakra-ui/icons";
import { FaShareAlt } from "react-icons/fa";
import { MdContentCopy } from "react-icons/md";
import NavigationBar from "@/components/NavigationBar";
import { initUtils } from "@telegram-apps/sdk";
import { useUser } from "@/context/context";
import { useEffect, useState } from "react";

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

export default function Friends() {
  const { user } = useUser();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [referredUsers, setReferredUsers] = useState<any[]>([]);
  const { onCopy, value, hasCopied } = useClipboard(
    `https://t.me/softnote_bot?start=${user?.telegramId}`
  );
  const handleInviteFriend = () => {
    const utils = initUtils();
    const inviteLink = `https://t.me/softnote_bot?start=${user?.telegramId}`;
    const shareText = `Join me on this awesome Telegram mini app!`;
    const fullUrl = `https://t.me/share/url?url=${encodeURIComponent(
      inviteLink
    )}&text=${encodeURIComponent(shareText)}`;
    utils.openTelegramLink(fullUrl);
  };

  const fetchReferredUsers = async (userId: string) => {
    try {
      const response = await fetch(`/api/getReferredUsers?userId=${userId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch referred users");
      }

      const data = await response.json();
      setReferredUsers(data.referredUsers);
      console.log(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReferredUsers(user.telegramId);
    }
  }, [user]);
  console.log(referredUsers);

  const [levelIndex, setLevelIndex] = useState(0);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    if (user) {
      setPoints(user.coins);
      setLevelIndex(user.level);
    }
  }, [user]);

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

  //  const formatProfitPerHour = (profit: number) => {
  //    if (profit >= 1000000000) return `+${(profit / 1000000000).toFixed(2)}B`;
  //    if (profit >= 1000000) return `+${(profit / 1000000).toFixed(2)}M`;
  //    if (profit >= 1000) return `+${(profit / 1000).toFixed(2)}K`;
  //    return `${profit}`;
  //  };

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
        flexDirection={"column"}
        alignItems={"center"}
        pb={32}
        gap={1}
      >
        <Box width={"100%"} p={"20px"} >
          <Text
            color={"#487BFF"}
            fontWeight={"700"}
            fontSize={"24px"}
            textAlign={"center"}
          >
            Invite & Earn
          </Text>
          {/* <Flex
            w={"100%"}
            alignItems={"center"}
            mt={1}
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
              alignItems={"flex-end"} // Align to the end of the container
              justifyContent={"center"}
            >
              <Text
                fontWeight={500}
                fontSize={"12px"}
                color={"rgba(117, 133, 167, 1)"}
                textAlign={"right"} // Ensure the text is right-aligned
              >
                {user && formatProfitPerHour(user.profitPerHour)} per hour
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

        <Box
          width={"100%"}
          px={"16px"}
          display={"flex"}
          flexDirection={"column"}
          gap={5}
        >
          <Image
            src="/refXP.svg"
            mx={"auto"}
            alt="yellow dude"
          />
          <Text
            fontSize={"25px"}
            w={"251px"}
            fontWeight={600}
            color={"#fff"}
            textAlign={"center"}
            mx={"auto"}
          >
            Invite <span className="text-[#93BAFF]"> your friends</span> & Earn{" "}
            <span className="text-[#93BAFF]">1000 XP Points</span>
          </Text>

          <Flex
            w={"90%"}
            borderRadius={"10px"}
            mx={"auto"}
            p={"2px"}
            alignItems={"center"}
          >
            <Box
              display={"flex"}
              w={"100%"}
              h={"100%"}
              bg={"#12161E"}
              borderRadius={"10px"}
              alignItems={"center"}
            >
              <Input
                value={value}
                mr={2}
                alignSelf={"center"}
                height={"41px"}
                outline="none"
                boxShadow="none"
                _focus={{ boxShadow: "none" }}
                border="none"
                color="white"
                fontSize="10px"
                _placeholder={{ color: "white", fontSize: "10px" }}
                alignItems={"center"}
                isDisabled={true}
              />
              <Button
                w={"41px"}
                height={"41px"}
                onClick={onCopy}
                bg={"#487BFF"}
                borderRadius={"0px"}
                mr={"0.5"}
                _hover={{ bg: "#4979d1", border: "none", outline: "none" }}
              >
                {hasCopied ? (
                  <CheckIcon boxSize={5} color={"white"} />
                ) : (
                  <Icon as={MdContentCopy} boxSize={5} color={"white"} />
                )}{" "}
                {/* Switches between icons */}
              </Button>
              <Button
                w={"41px"}
                height={"41px"}
                onClick={handleInviteFriend}
                bg={"#487BFF"}
                borderRadius={"0px 10px 10px 0px"}
                _hover={{ bg: "#4979d1", border: "none", outline: "none" }}
              >
                <Icon as={FaShareAlt} boxSize={5} color={"white"} />
                {/* Switches between icons */}
              </Button>
            </Box>
          </Flex>

          <Flex flexDirection={"column"} gap={4} w={"90%"} mx={"auto"}>
            <Text fontSize={"12px"} fontWeight={500}>
              Friend List
            </Text>
            <Box
              borderRadius={"10px"}
              h={"67px"}
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
              p={"2px"}
            >
              {referredUsers &&
                referredUsers.length > 0 &&
                referredUsers.map((user, index) => {
                  return (
                    <Box
                      key={index}
                      width={"100%"}
                      h={"100%"}
                      bg={"#1d222e"}
                      borderRadius={"10px"}
                      fontSize={"14px"}
                      fontWeight={500}
                      display={"flex"}
                      mx={"auto"}
                      justifyContent={"space-between"}
                      p={4}
                      alignItems={"center"}
                      color={"#f2f2f2"}
                    >
                      <Text>{user.username}</Text>
                      <HStack>
                        <Image alt="coin img" src="/Vector.svg" />
                        <Text>{user.coins}</Text>
                      </HStack>
                    </Box>
                  );
                })}
              {referredUsers && referredUsers.length <= 0 && (
                <Box
                  width={"100%"}
                  h={"100%"}
                  bg={"#12161E"}
                  borderRadius={"10px"}
                  fontSize={"14px"}
                  fontWeight={500}
                  display={"flex"}
                  mx={"auto"}
                  justifyContent={"center"}
                  alignItems={"center"}
                  color={"#f2f2f2"}
                >
                  You haven’t invited anyone yet
                </Box>
              )}
            </Box>
          </Flex>
        </Box>
      </Flex>
      <NavigationBar />
    </Box>
  );
}
