import {GET_DOLLAR, SET_DATA} from '../actions/postActions';

const initialState = {
  mainData: [],
  dollar: 0,
};

export const useReducer = (state = initialState, action) => {
  // console.log('action',action)
  switch (action.type) {
    case SET_DATA:
      return {...state, mainData: action.payload};
    case GET_DOLLAR:
      return {...state, dollar: action.payload};
    default:
      return state;
  }
};
