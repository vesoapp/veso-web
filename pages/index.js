import React from 'react';
import { withTheme } from 'emotion-theming';
import { Fragment } from 'react';

import Header from '../components/Header';
import Container from '../components/Container';
import VideoCards from '../components/VideoCards';

const Index = () => (
  <Fragment>
    <Container>
      <Header />
    </Container>
    <VideoCards cards={[1,2,3,4]} />
  </Fragment>
);

export default withTheme(Index);