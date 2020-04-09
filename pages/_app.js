import React from 'react';
import NextApp from 'next/app';
import withRedux from 'next-redux-wrapper';
import makeStore from '../store';
import { elementType, object } from 'prop-types';
import '../assets/css/styles.css';

import { Provider } from 'react-redux';
import { ThemeProvider, CSSReset, ColorModeProvider } from '@chakra-ui/core';

import theme from '../theme';

class App extends NextApp {
  static async getInitialProps({ Component, ctx }) {
    const pageProps = Component.getInitialProps ? await Component.getInitialProps(ctx) : {};

    return { pageProps };
  }

  render() {
    const { Component, pageProps, store } = this.props;

    return (
      <ThemeProvider theme={theme}>
        <CSSReset />
        <ColorModeProvider>
          <Provider store={store}>
            <Component {...pageProps} />
          </Provider>
        </ColorModeProvider>
      </ThemeProvider>
    );
  }
};

App.propTypes = {
  Component: elementType,
  store: object,
}

export default withRedux(makeStore)(App);
