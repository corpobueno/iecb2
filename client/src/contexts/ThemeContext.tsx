import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ThemeProvider } from '@mui/material';
import { Box } from '@mui/system';

import { DarkTheme, LightTheme } from './../themes';
import { useWindowSize } from '../hooks/useWindowSize';

interface IThemeContextData {
  themeName: 'light' | 'dark';
  toggleTheme: () => void;
  theme: typeof LightTheme;
}

const ThemeContext = createContext({} as IThemeContextData);

export const useAppThemeContext = () => {
  return useContext(ThemeContext);
};

interface IAppThemeProviderProps {
  children: React.ReactNode
}
export const AppThemeProvider: React.FC<IAppThemeProviderProps> = ({ children }) => {
  const [themeName, setThemeName] = useState<'light' | 'dark'>('light');

  const toggleTheme = useCallback(() => {
    setThemeName(oldThemeName => oldThemeName === 'light' ? 'dark' : 'light');
  }, []);

 const theme = useMemo(() => {
  
    if (themeName === 'light') return LightTheme;

    return DarkTheme;
  }, [themeName]);
  const { windowHeight } = useWindowSize()

  return (
    <ThemeContext.Provider value={{ theme, themeName, toggleTheme }}>
      <ThemeProvider theme={theme}>
        
        <Box overflow='hidden' height={ windowHeight } width="100vw" bgcolor={theme.palette.background.default}>
        {children}
        </Box>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};