import React, { Fragment } from 'react';
import { Box, Image, Flex } from '@chakra-ui/core';
import { node } from 'prop-types';

const VideoCards = ({ cards }) => (
  <div className="progress-scroll">
    {cards &&
      cards.map((index) => <VideoCard key={index} />)
    }
  </div>
);

const VideoCard = () => {
  const kittenPlaceholder = 'https://via.placeholder.com/1024x576.png';

  return (

      <div style={{ backgroundImage: `url(${kittenPlaceholder})` }} className="progress-item">
        <div className="progress-item-inside">
          <button className="play-btn">
            <a href="./player/index.html">
              <i className="material-icons">play_arrow</i>
            </a>
          < /button>
        </div>      
      </div>

  )
};

VideoCards.propTypes = {
  cards: node,
}

export default VideoCards;