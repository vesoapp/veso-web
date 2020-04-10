import React, { Fragment } from 'react';
import { Box, Image, Flex, Icon, Heading } from '@chakra-ui/core';
import { node } from 'prop-types';
import Container from './Container';

const VideoCards = ({ cards }) => (
  <Container zIndex={2}>
    <h2 className="progress-heading">
      Heading
    </h2>
    <div className="progress-scroll">
      {cards &&
        cards.map((index) => <VideoCard key={index} />)
      }
    </div>
  </Container>
);

const VideoCard = () => {
  const kittenPlaceholder = 'https://via.placeholder.com/1024x576.png';

  return (

      <div style={{ backgroundImage: `url(${kittenPlaceholder})` }} className="progress-item">
        <div className="progress-item-inside">
          <button className="play-btn">
            <a href="./player/index.html">
              <Icon className="material-icons" name="phone" />
            </a>
          </button>
        </div>      
      </div>

  )
};

VideoCards.propTypes = {
  cards: node,
}

export default VideoCards;