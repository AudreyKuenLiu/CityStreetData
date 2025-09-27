import { useReducer, Dispatch } from "react";
import { ViewPortSegment } from "../api-models/segments-for-viewport";

//type State = Record<string, ViewPortSegment>;
type State = Record<string, Omit<ViewPortSegment, "cnn">>;
type Action = { type: "toggle"; payload: ViewPortSegment };

const initialState: State = {};
const reducer = (state: State, action: Action): State => {
  const cnn = action.payload.cnn;
  const { line, street } = action.payload;
  if (action.type === "toggle") {
    if (cnn in state) {
      delete state[cnn];
    } else {
      state[cnn] = {
        line,
        street,
      };
    }
  }
  return state;
};

export const useSelectedSegments = (): [State, Dispatch<Action>] => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return [state, dispatch];
};
