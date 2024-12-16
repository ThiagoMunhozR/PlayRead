import { createTheme } from "@mui/material";
import { green, grey } from "@mui/material/colors";

export const LightTheme = createTheme({
    palette: {
        primary:{
            main: green[600],
            dark: green[800],
            light: green[300],
            contrastText: 'white',
        },
        secondary:{
            main: grey[600],
            dark: grey[800],
            light: grey[600],
            contrastText: 'white',
        },
        background: {
            default: grey[300],
            paper: grey[200]
        }
    },
    typography: {
        allVariants: {
          color: 'black',
        }
      }
});