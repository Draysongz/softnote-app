"use client";

import { Box, Text } from "@chakra-ui/react";
import React from "react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useUser } from "@/context/context";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  to: string;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  isActive = false,
  to,
}) => (
  <Link href={to}>
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      width="72px"
      height="72px"
      backgroundColor={isActive ? "#487BFF" : "#12161E"}
      borderRadius="10px"
      className={isActive ? "text-[#ffffff]" : "text-[#487BFF]"}
    >
      {icon}
      <Text fontSize="10px" fontWeight={500} mt="4px">
        {label}
      </Text>
    </Box>
  </Link>
);

const NavigationBar: React.FC = () => {
  const [pathname, setPathname] = useState("/");
  const { isLoading } = useUser();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname);
    }
  }, []);

  if (isLoading) return null;

  return (
    <nav className="fixed bottom-0 w-full z-40 py-2 pb-6 bg-[#06070A]">
      <div className="flex gap-3 justify-center items-center max-w-md mx-auto px-4">
        <NavItem
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 9L12 2L21 9V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V9Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          label="Home"
          isActive={pathname === "/"}
          to="/"
        />
        <NavItem
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13 11H7M13 16H7M9 6H15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          label="Daily Tasks"
          isActive={pathname === "/dailytask"}
          to="/dailytask"
        />
        <NavItem
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8.5 11C10.7091 11 12.5 9.20914 12.5 7C12.5 4.79086 10.7091 3 8.5 3C6.29086 3 4.5 4.79086 4.5 7C4.5 9.20914 6.29086 11 8.5 11Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 8V14M17 11H23"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          label="Friends"
          isActive={pathname === "/friends"}
          to="/friends"
        />
        <NavItem
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.73571 10.6667H5.62139C5.65523 10.6667 5.68494 10.6799 5.70469 10.6991C5.72396 10.7178 5.7321 10.7402 5.7321 10.7604V19.1666H0.625V10.7604C0.625 10.7402 0.633141 10.7178 0.652412 10.6991C0.672162 10.6799 0.701874 10.6667 0.73571 10.6667Z"
                stroke="currentColor"
              />
              <path
                d="M9.557 1.16672H14.4427C14.4765 1.16672 14.5062 1.17992 14.526 1.19912C14.5453 1.21785 14.5534 1.24022 14.5534 1.26046V19.1666H9.44629V1.26046C9.44629 1.24022 9.45443 1.21785 9.4737 1.19912C9.49345 1.17992 9.52316 1.16672 9.557 1.16672Z"
                stroke="currentColor"
              />
              <path
                d="M18.3785 5.91669H23.2642C23.2981 5.91669 23.3278 5.92989 23.3475 5.94909C23.3668 5.96782 23.3749 5.99019 23.3749 6.01043V19.1666H18.2678V6.01043C18.2678 5.99019 18.276 5.96782 18.2952 5.94909C18.315 5.92989 18.3447 5.91669 18.3785 5.91669Z"
                stroke="currentColor"
              />
            </svg>
          }
          label="Leaderboard"
          isActive={pathname === "/achievements"}
          to="/achievements"
        />
      </div>
    </nav>
  );
};

export default NavigationBar;
