import { BrowserRouter } from 'react-router-dom'
import './App.css'
import { useEffect } from 'react';

import { AppThemeProvider, AuthProvider, DrawerProvider, AlertProvider, useAuthContext } from './shared/contexts';
import { Login, MenuLateral } from './shared/components';
import { AppRoutes } from './routes'
import { supabase } from './shared/services/api/axios-config';
import { AuthService } from './shared/services/api/auth/AuthService';

function App() {
  const { setUser } = useAuthContext();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && setUser) {
        const usuario = await AuthService.loginWithSupabaseUser(session.user);
        if (!(usuario instanceof Error)) {
          setUser(usuario);
        } else {
          setUser(null);
        }
      }
    };
    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user && setUser) {
        const usuario = await AuthService.loginWithSupabaseUser(session.user);
        if (!(usuario instanceof Error)) {
          setUser(usuario);
        } else {
          setUser(null);
        }
      } else if (setUser) {
        setUser(null);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [setUser]);

  return (
    <AuthProvider>
      <AppThemeProvider>

        <DrawerProvider>
          <AlertProvider>
            <BrowserRouter>
              <Login>
                <MenuLateral>
                  <AppRoutes />
                </MenuLateral>
              </Login>
            </BrowserRouter>
          </AlertProvider>
        </DrawerProvider>

      </AppThemeProvider>
    </AuthProvider>
  );
};

export default App
