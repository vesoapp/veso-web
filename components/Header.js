import React from "react";
import { Heading, Flex, Text, Image } from "@chakra-ui/core";
import Logo from '../assets/images/logo.png';
import Container from "./Container";

const Header = () => (
  <div className="main-nav">
    <Container>
      <Flex
        as="nav"
        align="center"
        justify="space-between"
        wrap="wrap"
        padding="0.6rem 0"
        >
          <Flex>
            <div className="site-logo">
              <a href="#"></a>
            </div>
          </Flex>
        </Flex> 
    </Container>
  </div>
);

export default Header;
