import {
  Box,
  Collapse,
  Popover,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import BarButton from "./BarButton";
import { useState } from "react";

const BarHistory = () => {
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  return (
    <Stack
      direction="row"
      width="100%"
      height="100%"
      alignItems="flex-end"
      gap="5vw"
    >
      <BarButton label="01" color="#A5E9E2" mb={10} setAnchor={setAnchorEl} />
      <BarButton label="02" color="#3FD4C7" setAnchor={setAnchorEl} />
      <BarButton label="03" color="#3FD4C7" mb={10} setAnchor={setAnchorEl} />
      <BarButton label="04" color="#3D8BEB" setAnchor={setAnchorEl} />
      <BarButton label="05" color="#6574FF" mb={10} setAnchor={setAnchorEl} />

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
    </Stack>
  );
};

export default BarHistory;
