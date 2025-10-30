import { Box, Stack, Typography, useTheme } from "@mui/material";
import { useCallback } from "react";

interface ProgressBarProps {
  total: number;
  current: number;
}

const ProgressBar = (props: ProgressBarProps) => {
  const { total, current } = props;

  const theme = useTheme();

  const getPercentage = useCallback(() => {
    return (current / total) * 100;
  }, [current, total]);

  return (
    <Stack gap={1}>
      {/* 문제 수 */}
      <Stack direction="row" justifyContent="space-between" px={1}>
        <Typography variant="body1">1</Typography>
        <Typography variant="body1">{total}</Typography>
      </Stack>

      {/* 진행도 바 */}
      <Box width="100%" height="16px" borderRadius="50px" bgcolor="#F2F2F2">
        <Box
          width={`calc(${getPercentage()}%)`}
          height="100%"
          borderRadius="50px"
          bgcolor={theme.palette.primary.main}
          sx={{
            transition: "width 0.5s ease-in-out"
          }}
        />
      </Box>
    </Stack>
  );
};

export default ProgressBar;
