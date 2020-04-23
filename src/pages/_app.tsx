import { ColorModeProvider, CSSReset, ThemeProvider } from '@chakra-ui/core';
import withRedux from 'next-redux-wrapper';
import NextApp, { AppContext } from 'next/app';
import React from 'react';
import { Provider } from 'react-redux';
import makeStore from '../store';
import '../styles/index.css';
import theme from '../theme';

interface AppProps {
  Component: any;
  store: any;
}

class App extends NextApp<AppProps> {
  static async getInitialProps({ Component, ctx }: AppContext) {
    const pageProps = Component.getInitialProps
      ? await Component.getInitialProps(ctx)
      : {};

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
}

const config = {
  storeKey: 'redux',
  debug: true,
};

export default withRedux(makeStore, config)(App);
