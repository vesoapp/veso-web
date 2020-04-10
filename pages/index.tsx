import { Button } from '@chakra-ui/core';
import { withTheme } from 'emotion-theming';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import Container from '../components/Container';
import Header from '../components/Header';
import VideoCards from '../components/VideoCards';
import { State } from '../store';
import { increment, subtract } from '../store/actions/math';

interface IndexProps {
  number: number;
  testDown: any;
  testUp: any;
}

export class Index extends PureComponent<IndexProps> {
  render() {
    const { number, testDown, testUp } = this.props;

    return (
      <>
        <Container>
          <Header />
        </Container>
        <VideoCards cards={[1, 2, 3, 4]} />
        {number}
        <Button onClick={testDown}> Subtract </Button>
        <Button onClick={testUp}> Add </Button>
      </>
    );
  }
}

const mapStateToProps = (state: State) => state.math;

const mapDispatchToProps = {
  testDown: subtract,
  testUp: increment,
};

export default withTheme(connect(mapStateToProps, mapDispatchToProps)(Index));
