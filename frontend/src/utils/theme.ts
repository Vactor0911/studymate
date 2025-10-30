import { createTheme, responsiveFontSizes } from "@mui/material";
import "@mui/material/styles";

// MUI Palette 확장
declare module "@mui/material/styles" {
  interface Palette {
    transparent: Palette["primary"];
  }
  interface PaletteOptions {
    transparent?: PaletteOptions["primary"];
  }
}

// Mui Button 확장
declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    transparent: true;
  }
}

// MUI 테마
export const theme = responsiveFontSizes(
  createTheme({
    palette: {
      primary: {
        main: "#3FD4C7",
      },
      secondary: {
        main: "#111111",
        dark: "#767676",
        light: "#cccccc",
        contrastText: "#FFFFFF",
      },
      transparent: {
        main: "rgba(0, 0, 0, 0)",
      },
      text: {
        primary: "#111111",
        secondary: "#767676",
      },
      background: {
        default: "#FFFFFF",
      },
    },
    typography: {
      fontFamily: ["Pretendard-Regular", "Noto Sans KR", "sans-serif"].join(
        ","
      ),
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 700,
      },
      h3: {
        fontWeight: 700,
      },
      h4: {
        fontWeight: 700,
      },
      h5: {
        fontWeight: 700,
      },
      h6: {
        fontWeight: 700,
      },
    },
    components: {
      MuiTypography: {
        styleOverrides: {
          root: {
            wordBreak: "keep-all",
            textWrap: "pretty",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "50px",
            padding: "12px 24px",
          },
          outlined: {
            borderWidth: "2px",
            color: "#111111",
          },
        },
        defaultProps: {
          disableElevation: true,
        },
      },
      MuiSkeleton: {
        defaultProps: {
          animation: "wave",
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: "#111111",
            borderWidth: "2px",
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          variant: "standard",
          color: "secondary",
        },
      },
      MuiInputLabel: {
        defaultProps: {
          variant: "standard",
          color: "secondary",
        },
      },
      MuiInput: {
        defaultProps: {
          color: "secondary",
        },
      },
    },
  })
);
