import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DarkTheme, LightTheme } from "../themes";
import { Box, ThemeProvider } from '@mui/material';

interface IThemeContextData {
    themeName: 'light' | 'dark';
    toggleTheme: () => void;
    isMobile: boolean;
}

const ThemeContext = createContext({} as IThemeContextData);

export const useAppThemeContext = () => {
    return useContext(ThemeContext);
}

interface IAppThemeProviderProps {
    children: React.ReactNode
}
export const AppThemeProvider: React.FC<IAppThemeProviderProps> = ({ children }) => {
    const savedTheme = localStorage.getItem('themeName') as 'light' | 'dark' | null;
    const [themeName, setThemeName] = useState<'light' | 'dark'>(savedTheme || 'dark');
    const [isMobile, setIsMobile] = useState(true);

    useEffect(() => {
        // Salva a preferência de tema no localStorage sempre que o tema for alterado
        localStorage.setItem('themeName', themeName);
    }, [themeName]);

    // Detectar tamanho da tela e ajustar isMobile
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 600);

        handleResize(); // Configura o estado inicial
        window.addEventListener('resize', handleResize);

        // Cleanup para remover o event listener
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeName(oldThemeName => oldThemeName === 'light' ? 'dark' : 'light')
    }, []);

    const theme = useMemo(() => {
        if (themeName === 'light') return LightTheme;

        return DarkTheme;
    }, [themeName]);

    const contextValue = useMemo(() => ({
        themeName,
        toggleTheme,
        isMobile
    }), [themeName, toggleTheme, isMobile]);

    return (
        <ThemeContext.Provider value={contextValue}>
            <ThemeProvider theme={theme}>
                <Box width="100vw" height="100vh" bgcolor={theme.palette.background.default}>
                    {children}
                </Box>
            </ThemeProvider>
        </ThemeContext.Provider>
    )
}