import { DECREMENT_VALUE, INCREMENT_VALUE } from '../types/numerical';

export const addNumber = () => ({
  type: INCREMENT_VALUE,
})

export const subtractNumber = () => ({
  type: DECREMENT_VALUE,
})