import { ADDITION, SUBTRACTION } from '../types/math';

export const subtract = () => {
  return {
    type: SUBTRACTION,
  };
};

export const increment = () => {
  return {
    type: ADDITION,
  };
};
