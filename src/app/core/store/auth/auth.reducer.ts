import { createReducer, on } from '@ngrx/store';
import { AuthState } from './auth.types';
import * as AuthActions from './auth.actions';

export const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.loginSuccess, (state, { token, user }) => ({
    ...state,
    token,
    user,
    isAuthenticated: true
  })),
  on(AuthActions.loginFailure, () => initialState),
  on(AuthActions.logout, () => initialState)
);

export default authReducer; 