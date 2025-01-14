"use client";

import {
  Box,
  Text,
  Flex,
  Image,
  Icon,
  Progress,
  useToast,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Button
} from "@chakra-ui/react";
import Link from "next/link";
import { ChevronRightIcon } from "@chakra-ui/icons";
import NavigationBar from "@/components/NavigationBar";
import { useState, useEffect } from "react";
import { useUser } from "@/context/context";



interface TaskResponse {
  id: string;
  title: string;
  imagePath?: string | null;
  rewards: number;
  taskUrl?: string | null;
  claimed: boolean;
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

const ytTask = [
  {
    image: "/Youtube.svg",
    name: "SoftNote YouTube Introduction",
    reward: 100000,
    path: "/",
  },
  {
    image: "/Youtube.svg",
    name: "SoftNote XP Rush",
    reward: 100000,
    path: "/",
  },
  {
    image: "/Youtube.svg",
    name: "Crypto Funds Work-Out",
    reward: 100000,
    path: "/",
  },
];

export default function DailyTask() {
  const { user, setUser } = useUser();
  const [tasks, setTasks] = useState<TaskResponse[]>([]);

  const [levelIndex, setLevelIndex] = useState(0);
  const [points, setPoints] = useState(0);
  const toast = useToast()
  const [selectedtask, setSelectedTask]= useState<TaskResponse>()
   const { isOpen, onOpen, onClose } = useDisclosure();
   const [profitPerHour, setProfitPerHour] = useState(0)
   const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setPoints(user.coins);
      setLevelIndex(user.level);
      setProfitPerHour(user.profitPerHour)
    }
  }, [user]);

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

  async function fetchTasks(userId: string): Promise<TaskResponse[]> {
    const response = await fetch(`/api/getTasks?userId=${userId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }

    return response.json();
  }

  useEffect(() => {
    
    // Fetch tasks and handle loading states
    const loadTasks = async () => {
      if(!user) return;
      try {
      
        const tasksData = await fetchTasks(user.id);
        console.log(tasksData)
        setTasks(tasksData);
      } catch (error) {
console.log(error)
    };
  }

    loadTasks();
  }, [user]);


const handleTaskCompletion = async (taskId: string) => {
  if (!user) return;
  setLoading(true)
  try {
    const response = await fetch("/api/completeTask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, taskId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to claim task reward");
    }

    // Get the updated task and user points from the response
    const { task: updatedTask, user: updatedUser } = await response.json();

    // Update tasks with the returned task data
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    // Update points with the returned user data
    setPoints(updatedUser.coins);

    setUser(updatedUser);

    toast({
      title: "Task reward claimed successfully!",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    setLoading(false);
    onClose();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toast({
      title: error.message || "Error claiming task reward",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    onClose();
    setLoading(false);
  }
};

  const formatProfitPerHour = (profit: number) => {
    if (profit >= 1000000000) return `+${(profit / 1000000000).toFixed(2)}B`;
    if (profit >= 1000000) return `+${(profit / 1000000).toFixed(2)}M`;
    if (profit >= 1000) return `+${(profit / 1000).toFixed(2)}K`;
    return `${profit}`;
  };


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
        gap={5}
      >
        <Box width={"100%"} p={"20px"} pt={"30px"}>
          <Text
            color={"#487BFF"}
            fontWeight={"700"}
            fontSize={"24px"}
            textAlign={"center"}
          >
            Daily Tasks
          </Text>
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
                {user && formatProfitPerHour(profitPerHour)} per hour
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
          gap={3}
          justifyContent={"space-between"}
        >
          <Text fontSize={"16px"} fontWeight={500} color={"#fff"}>
            SoftNote YouTube
          </Text>

          {ytTask.map((task, id) => {
            return (
              <Link href={""} key={id}>
                <Flex
                  h={"70px"}
                  bg={"#12161E"}
                  borderRadius={"16px"}
                  padding={"18px 16px"}
                  gap={4}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                >
                  <Flex alignItems={"center"} gap={4}>
                    <Image
                      src={task.image}
                      w={"48px"}
                      h={"48px"}
                      alt="task img"
                    />
                    <Flex direction={"column"}>
                      <Text
                        fontSize={"16px"}
                        fontWeight={500}
                        color={"#f5f5f5"}
                      >
                        {task.name}
                      </Text>
                      <Flex alignItems={"center"}>
                        {/* <Image src="/Coin.svg" w={"14px"} alt="big coin" /> */}
                        <Text
                          fontSize={"12px"}
                          fontWeight={500}
                          color={"#f5f5f5"}
                        >
                          + {new Intl.NumberFormat().format(task.reward)} XP
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                </Flex>
              </Link>
            );
          })}

          <Text fontSize={"16px"} fontWeight={500} color={"#fff"}>
            Task List
          </Text>
          {tasks &&
            tasks.length > 0 &&
            tasks.map((task, id) => {
              return (
                <Link href={task.taskUrl!} target="_blank" key={id}>
                  <Flex
                    h={"60px"}
                    padding={"18px 16px"}
                    gap={2}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                    onClick={() => {
                      setSelectedTask(task);
                      onOpen();
                    }}
                  >
                    <Flex alignItems={"center"} gap={4}>
                      <Image
                        src={task.imagePath!}
                        w={"28px"}
                        h={"28px"}
                        alt="task image"
                      />
                      <Flex direction={"column"}>
                        <Text
                          fontSize={"14px"}
                          fontWeight={300}
                          color={"#f5f5f5"}
                        >
                          {task.title}
                        </Text>
                        <Flex alignItems={"center"} gap={1}>
                          <Image src="/Vector.svg" w={"14px"} alt="big coin" />
                          <Text
                            fontSize={"12px"}
                            fontWeight={500}
                            color={"#f5f5f5"}
                          >
                            +{new Intl.NumberFormat().format(task.rewards)} XP
                          </Text>
                        </Flex>
                      </Flex>
                    </Flex>

                    <Image
                      src={task.claimed ? "/checkmart.svg" : "/arrow.svg"}
                    />
                  </Flex>
                </Link>
              );
            })}
        </Box>
      </Flex>
      <NavigationBar />

      <Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton color={"white"} />

          <DrawerBody
            bgGradient={"linear-gradient(360deg, #00283A 0%, #12161E 88.17%)"}
          >
            <Flex
              minH={"30vh"}
              p={5}
              alignItems={"center"}
              justifyContent={"center"}
              gap={5}
              direction={"column"}
            >
              <Flex
                h={"80px"}
                bg={"#1D222E"}
                borderRadius={"16px"}
                padding={"18px 16px"}
                borderBottom={"0.9px solid #4979D1"}
                gap={4}
                alignItems={"center"}
                justifyContent={"center"}
                w={"full"}
              >
                <Flex alignItems={"center"} gap={4}>
                  <Image
                    src={selectedtask && selectedtask.imagePath!}
                    w={"48px"}
                    h={"48px"}
                    alt="task image"
                  />
                  <Flex direction={"column"}>
                    <Text fontSize={"16px"} fontWeight={500} color={"#f5f5f5"}>
                      {selectedtask && selectedtask.title}
                    </Text>
                    <Flex alignItems={"center"}>
                      <Image
                        src="/icons/BigCoin.png"
                        w={"14px"}
                        alt="big coin"
                      />
                      <Text
                        fontSize={"12px"}
                        fontWeight={500}
                        color={"#f5f5f5"}
                      >
                        + {selectedtask && selectedtask.rewards} XP
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>

              <Button
                onClick={() =>
                  selectedtask && handleTaskCompletion(selectedtask.id)
                }
                isLoading={loading}
                loadingText={"verifying"}
              >
                Verify
              </Button>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
