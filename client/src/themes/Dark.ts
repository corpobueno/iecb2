import { createTheme } from '@mui/material';
import { purple, blue } from '@mui/material/colors';

export const DarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#a41e5d',
      dark: '#a41e5d',
      light: '#a41e5d',
      contrastText: '#ffffff',
    },
    secondary: {
      main: purple[500],
      dark: purple[700],
      light: purple[400],
      contrastText: '#ffffff',
    },
    info: {
      main: blue[500],
      dark: blue[700],
      light: blue[400],
      contrastText: '#ffffff',
    },
    background: {
      paper: '#0f1214',
      default: '#1e1e1e',
    }
  },
  typography: {
    allVariants: {
      color: 'white',
    }
  }
});
