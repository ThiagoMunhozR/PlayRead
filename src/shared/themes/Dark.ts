import { createTheme } from "@mui/material";
import { green, grey } from "@mui/material/colors";

export const DarkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary:{
            main: green[600],
            dark: green[800],
            light: green[300],
            contrastText: "white",
        },
        secondary:{
            main: grey[700],
            dark: grey[800],
            light: grey[500],
            contrastText: "white",
        },
        background: {
            paper: grey[800],
            default: grey[900]
        },
    },
    typography: {
      allVariants: {
        color: 'white',
      }
    }
});