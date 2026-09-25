import { createContext } from 'react';

export const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  login: async () => {},
  logout: async () => {}
});
