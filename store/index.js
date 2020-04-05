import { createStore, compose } from 'redux'
import reducers from './reducers';

const store = createStore(
  reducers
);

const composeEnhancers = (typeof window !== 'undefined' && window.__REDUX_DEVTOOLS_EXTENSION__) || compose;

store.subscribe(() => console.log(store.getState()))

export default store;
