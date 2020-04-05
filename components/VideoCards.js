import React, { Fragment } from 'react';
import { Box, Image, Flex } from '@chakra-ui/core';

import johnWick from '../assets/images/johnWick.jpg';

const VideoCards = ({ cards }) => (
  <div>
    {cards &&
      cards.map(() => <VideoCard />)
    }
  </div>
);

const VideoCard = () => (
  <Box
    maxW="sm"
    overflow="hidden"
    width="290px"
  >
    <Image src={johnWick} alt="" />
  </Box>
);

export default VideoCards;
