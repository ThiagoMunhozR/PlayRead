import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthService } from '../services/api/auth/AuthService';
import { Environment } from '../environment';

// Define a interface para o contexto de autenticação
interface IAuthContextData {
  logout: () => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<string | void>;
  user: IUsuario | null;
  setUser?: (user: IUsuario | null) => void;
}

// Definindo a interface do usuário, com base nos dados retornados pelo Supabase
interface IUsuario {
  CodigoUsuario: number;
  Gamertag: string;
  FotoURL: string;
  Nome: string;
  Email: string;
}

const AuthContext = createContext({} as IAuthContextData);

const LOCAL_STORAGE_KEY__ACCESS_TOKEN = 'APP_ACCESS_TOKEN';
const LOCAL_STORAGE_KEY__USER = Environment.LOCAL_STORAGE_KEY__USER;

interface IAuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<IAuthProviderProps> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | undefined>();
  const [user, setUser] = useState<IUsuario | null>(null);

  useEffect(() => {
    // Carrega o token e as informações do usuário do localStorage, se existirem
    const storedAccessToken = localStorage.getItem(LOCAL_STORAGE_KEY__ACCESS_TOKEN);
    const storedUser = localStorage.getItem(LOCAL_STORAGE_KEY__USER);

    if (storedAccessToken) {
      setAccessToken(JSON.parse(storedAccessToken));
    }
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = useCallback(async (email: string, password: string) => {
    const result = await AuthService.auth(email, password);

    if (result instanceof Error) {
      throw result;
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEY__ACCESS_TOKEN, JSON.stringify(result.accessToken));
      localStorage.setItem(LOCAL_STORAGE_KEY__USER, JSON.stringify(result.user));

      setAccessToken(result.accessToken);
      setUser(result.user);
    }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY__ACCESS_TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEY__USER);

    setAccessToken(undefined);
    setUser(null);
  }, []);

  const isAuthenticated = useMemo(() => !!accessToken, [accessToken]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login: handleLogin, logout: handleLogout, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);