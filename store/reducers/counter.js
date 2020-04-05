import { INCREMENT_VALUE, DECREMENT_VALUE } from '../types/numerical';

const initialState = {
  number: 0,
};

const counter = (state = initialState, action) => {
  const { number } = state;

  switch (action.type) {
    case INCREMENT_VALUE:
      return number + 1;
    case DECREMENT_VALUE:
      return number - 1;
    default:
      return number;
  }
};

export default counter;