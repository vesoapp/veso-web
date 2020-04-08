import React from 'react';
import { Flex } from "@chakra-ui/core";

const Container = ({children}) => (
  <Flex
    as="nav"
    align="center"
    justify="space-between"
    wrap="wrap"
    pl="6rem"
    bg="black"
    color="white"
  >
    {children}
  </Flex>
);

export default Container;
