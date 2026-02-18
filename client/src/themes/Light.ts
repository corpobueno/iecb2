import { createTheme } from '@mui/material';
import { blueGrey, purple } from '@mui/material/colors';

export const LightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0247a2',
      dark: '#021959',
      light: '#02499b',
      contrastText: '#ffffff',
    },
    secondary: {
      main: purple[800],
      dark: purple[900],
      light: purple[400],
      contrastText: '#ffffff',
    },
    info: {
      main: blueGrey[600],
      dark: blueGrey[800],
      light: blueGrey[500],
      contrastText: '#ffffff',
    },
    background: {
      paper: '#ffffff',
      default: '#f7f6f3',
    },
  },
  typography: {
    fontSize: 16,
    fontFamily: [
      '"Assistant"',
      '"Arial"',
      'sans-serif'
    ].join(','),
  }
});
