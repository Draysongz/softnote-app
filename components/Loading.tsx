"use client";

import { Box, Flex, Heading, Image, Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";

export default function Loading() {
 

  return (
    <Flex
      minH={"100vh"}
      bgImage={"/bgframe.png"}
      minW={"100vw"}
      bgSize={"cover"}
      bgRepeat={"no-repeat"}
      justifyContent={"space-around"}
      alignItems={"center"}
      color={"white"}
      direction={"column"}
      bgColor={"#06070A"}
      gap={10}
      p={5}
    >
        <Box>
          <Image src="/softlogo.svg" />
        </Box>

        <Box>
          <Image src="teclogo.svg" />
        </Box>
    </Flex>
  );
}
