import {getDollar} from '../../../Utilites/Network';

export const SET_DATA = 'SET_DATA';
export const GET_DOLLAR = 'GET_DOLLAR';
export const getDollars = () => {
  try {
    return async dispatch => {
      const result = await getDollar();
      // const json=await result.json()
      if (result) {
        dispatch({
          type: GET_DOLLAR,
          payload: result,
        });
        // console.log(result)
      } else {
        console.log('Unable to fetch!');
      }
    };
  } catch (error) {
    console.log(error);
  }
};

export const setData = (newData = []) => {
  return async dispatch => {
    dispatch({
      type: SET_DATA,
      payload: newData,
    });
  };
};
