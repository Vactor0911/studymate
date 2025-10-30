import { Box, Popover, Stack, Typography, useTheme } from "@mui/material";

const InfoPopover = () => {
  const theme = useTheme();

  return (
    <Popover
      open={!!anchorEl}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        transform: "translateX(50px)",
      }}
      slotProps={{
        paper: {
          variant: "outlined",
          sx: {
            borderRadius: 3,
          },
        },
      }}
      onClose={() => setAnchorEl(null)}
    >
      <Stack p={3} borderRadius={3} position="relative">
        {/* 헤더 */}
        <Stack
          direction="row"
          alignItems="center"
          gap={1.5}
          position="relative"
          zIndex={2}
        >
          <Typography variant="h6">고등학교 3학년</Typography>

          <Box
            width="6px"
            height="6px"
            borderRadius="50%"
            bgcolor={theme.palette.secondary.dark}
          />

          <Typography variant="h6" color="text.secondary" fontWeight={500}>
            수학
          </Typography>
        </Stack>
      </Stack>
    </Popover>
  );
};
