import React from 'react';
import { Flex, Box, AspectRatioBox } from "@chakra-ui/core";

const TrailerSlider = () => (
    <div className="video-slider-container">
        <AspectRatioBox ratio={16 / 9}>
        <Box
        as="iframe"
        title="slider-video"
        maxH="50vh"
        src="https://www.youtube.com/embed/U3Xy2x9NDrw"
        allowFullScreen
        />
        </AspectRatioBox>
    </div>
);

export default TrailerSlider;
