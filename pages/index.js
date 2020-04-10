import React, { Fragment, PureComponent } from 'react';
import { withTheme } from 'emotion-theming';
import { connect } from 'react-redux';
import { Button } from '@chakra-ui/core';

import Header from '../components/Header';
import Main from '../components/Main';
import Container from '../components/Container';
import TrailerSlider from '../components/TrailerSlider';
import VideoCards from '../components/VideoCards';

import { subtract, increment } from '../store/actions/math';

export class Index extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const { number, testDown, testUp } = this.props;

    return (
      <Fragment>
        <Header></Header>
        <Main>
          <TrailerSlider></TrailerSlider>
          <VideoCards cards={[1, 2, 3, 4, 5, 6]}></VideoCards>
          <VideoCards cards={[1, 2, 3, 4, 5, 6]}></VideoCards>
          <VideoCards cards={[1, 2, 3, 4, 5, 6]}></VideoCards>
          <VideoCards cards={[1, 2, 3, 4, 5, 6]}></VideoCards>
        </Main>
      </Fragment>
    )
  }
};

const mapStateToProps = state => state.math

const mapDispatchToProps = {
  testDown: subtract,
  testUp: increment
};

export default withTheme(connect(mapStateToProps, mapDispatchToProps)(Index)) ;
