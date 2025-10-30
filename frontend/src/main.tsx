import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { Provider as JotaiProvider } from "jotai";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { theme } from "./utils/theme.ts";
import { jotaiStore } from "./states/jotaiStore.ts";
import CustomSnackbarProvider from "./components/CustomSnackbarProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <JotaiProvider store={jotaiStore}>
      <ThemeProvider theme={theme}>
        <CustomSnackbarProvider>
          <CssBaseline />
          <App />
        </CustomSnackbarProvider>
      </ThemeProvider>
    </JotaiProvider>
  </StrictMode>
);
