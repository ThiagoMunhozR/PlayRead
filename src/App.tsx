import { BrowserRouter } from 'react-router-dom'
import './App.css'

import { AppThemeProvider, AuthProvider, DrawerProvider } from './shared/contexts';
import { Login, MenuLateral } from './shared/components';
import { AppRoutes } from './routes'
import { AlertProvider } from './shared/contexts';

function App() {
  return (
    <AuthProvider>
      <AppThemeProvider>

      <Login>

        <DrawerProvider>
          <AlertProvider>
            <BrowserRouter>

              <MenuLateral>
                <AppRoutes />
              </MenuLateral>

            </BrowserRouter>
          </AlertProvider>
        </DrawerProvider>
        
      </Login>

      </AppThemeProvider>
    </AuthProvider>
  );
};

export default App
