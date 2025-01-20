import React, { useState } from "react";
import { Box, Flex, IconButton, Text, Link } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { RxHamburgerMenu } from "react-icons/rx";

const learnPageBox = [
  {
    title: "Solana",
    path: "/learn/solana",
  },
  {
    title: "Rust",
    path: "/learn/rust",
  },
  {
    title: "Anchor",
    path: "/learn/anchor",
  },
];

interface MenuPanelProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const MenuPanel: React.FC<MenuPanelProps> = ({ isCollapsed, onToggle }) => {
  return (
    <Flex
      direction="column"
      bg="white"
      color="gray.700"
      p={4}
      minW={isCollapsed ? "60px" : "250px"}
      transition="width 0.2s"
      boxShadow="md"
      borderRadius="md"
    >
      <IconButton
        aria-label="Toggle menu"
        icon={<RxHamburgerMenu />}
        onClick={onToggle}
        alignSelf={isCollapsed ? "center" : "flex-end"}
        mb={4}
      />
      {!isCollapsed &&
        learnPageBox.map((box) => (
          <Box key={box.title} mb={4} className="box">
            <Link href={box.path}>
              <Text fontSize="lg" fontWeight="bold">
                {box.title}
              </Text>
            </Link>
          </Box>
        ))}
    </Flex>
  );
};

export default MenuPanel;
