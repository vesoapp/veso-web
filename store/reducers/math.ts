import { ADDITION, SUBTRACTION } from '../types/math';

export interface MathState {
  number: number;
}

const initialState: MathState = {
  number: 0,
};

const math = (state = initialState, action: { type: string }) => {
  const { number } = state;

  switch (action.type) {
    case ADDITION:
      return { ...state, number: number + 1 };
    case SUBTRACTION:
      return { ...state, number: number - 1 };
    default:
      return state;
  }
};

export default math;
