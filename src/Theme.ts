import { yellow, deepPurple, amber } from "@mui/material/colors";
import { createTheme} from "@mui/material/styles";

declare module '@mui/material/styles' {
    interface Palette {
        tertiary: Palette['primary'];
    }
    interface PaletteOptions {
        tertiary?: PaletteOptions['primary'];
    }
}

export const theme = createTheme({
    palette: {
        primary: {
            main: yellow[900],
            contrastText: '#000',
        },
        secondary: {
            main: deepPurple[500],
        },
        tertiary: {
            main: amber[100],
        },
    },
})

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: yellow[900],
        },
        secondary: {
            main: deepPurple[200],
        },
        tertiary: {
            main: amber[900],
        },
    },
})