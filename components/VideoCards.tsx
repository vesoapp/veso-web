import { Box, Image } from '@chakra-ui/core';
import React from 'react';
import johnWick from '../assets/images/johnWick.jpg';

const VideoCards: React.FunctionComponent<{ cards: number[] }> = ({
  cards,
}) => <>{cards && cards.map((index) => <VideoCard key={index} />)}</>;

const VideoCard: React.FunctionComponent = () => (
  <Box maxW="sm" overflow="hidden" width="290px">
    <Image src={johnWick} alt="" />
  </Box>
);

export default VideoCards;
