import { BrowserRouter } from 'react-router-dom'
import './App.css'

import { AppThemeProvider, AuthProvider, DrawerProvider, AlertProvider } from './shared/contexts';
import { Login, MenuLateral } from './shared/components';
import { AppRoutes } from './routes'

function App() {
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
