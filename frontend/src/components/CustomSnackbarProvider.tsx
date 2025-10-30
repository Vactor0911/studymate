import { IconButton } from "@mui/material";
import { closeSnackbar, SnackbarProvider } from "notistack";
import type { JSX, ReactNode } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const CustomSnackbarProvider = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  return (
    <SnackbarProvider
      maxSnack={3}
      action={(snackbarId) => (
        <IconButton
          color="inherit"
          sx={{ p: 0.5 }}
          onClick={() => closeSnackbar(snackbarId)}
        >
          <CloseRoundedIcon />
        </IconButton>
      )}
    >
      {children}
    </SnackbarProvider>
  );
};

export default CustomSnackbarProvider;
