import React, {createContext, ReactNode, useContext, useState} from 'react';

type AuthContextType = {
  token: string | null;
  profile: Record<string, any> | null;
  login: (data: Record<string, any>) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const KEY = 'sjdkhfg';
  const storedToken = localStorage.getItem(KEY);
  const [token, setToken] = useState<string | null>(storedToken ? JSON.parse(storedToken).token : null);
  const [profile, setProfile] = useState<Record<string, any> | null>(storedToken ? JSON.parse(storedToken) : null);

  /*useEffect(() => {
    if (storedToken) {
        const checkin = async () => {
          let fetchWithAuth = configureFetch(storedToken);
          await fetchWithAuth(apiBaseUrl+'checkin').then((response) => {
            setToken(storedToken);
          }).catch(() => {
            logout()
          });
        };
        checkin()
    } else {
      logout()
    }
  }, []);*/

  const login = (data: Record<string, any>) => {
    setToken(data.token)
    setProfile(data)
    localStorage.setItem(KEY, JSON.stringify(data));
  };

  const logout = () => {
    localStorage.removeItem(KEY);
    setToken(''); // empty string is to distinguish initial state from checkin or logout
    setProfile(null)
  };

  const contextValue: AuthContextType = { token, profile, login, logout };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
