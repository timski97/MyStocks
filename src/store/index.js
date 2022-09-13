import {createStore, combineReducers, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import {useReducer} from './reducers/postReduser';

export const rootReducer = combineReducers({useReducer});
export const store = createStore(rootReducer);
export default createStore(rootReducer, applyMiddleware(thunk));
