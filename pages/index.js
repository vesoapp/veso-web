import React, { Fragment, PureComponent } from 'react';
import { withTheme } from 'emotion-theming';
import { connect } from 'react-redux';
import { Button } from '@chakra-ui/core';

import Header from '../components/Header';
import Container from '../components/Container';
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
        <Container>
          <Header />
        </Container>
        <VideoCards cards={[1, 2, 3, 4]} />
        {number}
        <Button onClick={testDown}> Subtract </Button>
        <Button onClick={testUp}> Add </Button>
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
