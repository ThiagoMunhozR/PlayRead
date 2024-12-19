import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DarkTheme, LightTheme } from "../themes";
import { Box, ThemeProvider } from '@mui/material';

interface IThemeContextData{
    themeName: 'light' | 'dark';
    toggleTheme: () => void;
}

const ThemeContext = createContext({} as IThemeContextData);

export const useAppThemeContext = () => {
    return useContext(ThemeContext);
}

interface IAppThemeProviderProps{
    children: React.ReactNode
}
export const AppThemeProvider: React.FC<IAppThemeProviderProps> = ({children}) => {
    const savedTheme = localStorage.getItem('themeName') as 'light' | 'dark' | null;
    const [themeName, setThemeName] = useState<'light' | 'dark'>(savedTheme || 'light');
    
    useEffect(() => {
        // Salva a preferência de tema no localStorage sempre que o tema for alterado
        localStorage.setItem('themeName', themeName);
    }, [themeName]);
    
    const toggleTheme = useCallback(() => {
        setThemeName(oldThemeName => oldThemeName === 'light' ? 'dark' : 'light')
    }, []);
    
    const theme = useMemo(() => {
        if (themeName === 'light') return LightTheme;
        
        return DarkTheme;
    }, [themeName]);


    return (
        <ThemeContext.Provider value={{ themeName, toggleTheme }}>
            <ThemeProvider theme={theme}>
                <Box width="100vw" height="100vh" bgcolor={theme.palette.background.default}>
                    {children}
                </Box>
            </ThemeProvider>
        </ThemeContext.Provider>
    )
}