import React from "react";
import { Heading, Flex, Text, Image } from "@chakra-ui/core";

import Logo from '../assets/images/logo.png';

const Header = () => (
  <Flex
    as="nav"
    align="center"
    justify="space-between"
    wrap="wrap"
    padding="0.6rem"
    bg="black"
    height="50px"
    color="white"
  >
    <Flex>
      <Heading as="h1" size="lg">
        <Image
          margin="2px"
          height="25px"
          src={Logo}
          alt="Veso"
        />
      </Heading>
    </Flex>
  </Flex>
);

export default Header;
