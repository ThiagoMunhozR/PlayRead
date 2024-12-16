import { BrowserRouter } from 'react-router-dom'
import './App.css'

import { AppThemeProvider, DrawerProvider } from './shared/contexts'
import { AppRoutes } from './routes'
import { MenuLateral } from './shared/components';
import { AlertProvider } from './shared/contexts';

function App() {
  return (
    <AppThemeProvider>
      <DrawerProvider>
        <AlertProvider>
          <BrowserRouter>

            <MenuLateral>
              <AppRoutes />
            </MenuLateral>

          </BrowserRouter>
        </AlertProvider>
      </DrawerProvider>
    </AppThemeProvider>
  );
};

export default App
