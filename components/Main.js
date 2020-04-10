import React from 'react';
import { Flex } from "@chakra-ui/core";

const Main = ({children}) => (
  <Flex
    className="main-container"
    align="center"
    justify="space-between"
    wrap="wrap"
  >
    {children}
  </Flex>
);

export default Main;
