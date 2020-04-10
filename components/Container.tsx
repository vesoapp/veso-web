import { Flex } from '@chakra-ui/core';
import React from 'react';

const Container: React.FunctionComponent = ({ children }) => (
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
