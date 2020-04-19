import { MakeStore } from 'next-redux-wrapper';
import { combineReducers, createStore } from 'redux';
import reducers from './reducers';
import { MathState } from './reducers/math';

export interface State {
  math: MathState;
}

const combinedReducers = combineReducers(reducers);

/**
 * @param {object} initialState The store's initial state (on the client side, the state of the server-side store is passed here)
 */
const makeStore: MakeStore = (initialState: State) => {
  return createStore(combinedReducers, initialState);
};

export default makeStore;
