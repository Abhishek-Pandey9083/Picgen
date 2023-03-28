import { useReducer } from "react";

export default function useToggle(initialValue = true) {
  return useReducer((state) => !state, initialValue);
}
