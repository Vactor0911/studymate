import { Box, Popover, Stack, Typography, useTheme } from "@mui/material";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

interface InfoPopoverProps {
  anchorEl: HTMLDivElement | null;
  setAnchorEl: (value: React.SetStateAction<HTMLDivElement | null>) => void;
  grade: string;
  subject: string;
  focusContent: string;
  targetContent: string;
  isTransformOriginOnTop: boolean;
  darker?: boolean;
}

const InfoPopover = (props: InfoPopoverProps) => {
  const {
    anchorEl,
    setAnchorEl,
    grade,
    subject,
    focusContent,
    targetContent,
    isTransformOriginOnTop,
    darker,
  } = props;

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
        vertical: isTransformOriginOnTop ? "top" : "bottom",
        horizontal: "left",
      }}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        transform: "translate(25px, 20px)",
      }}
      slotProps={{
        paper: {
          variant: "outlined",
          sx: {
            borderRadius: 3,
            border: `1px solid ${theme.palette.secondary.main}`,
            bgcolor: "#00000000",
            overflow: "hidden",
          },
        },
      }}
      onClose={() => setAnchorEl(null)}
    >
      <Box
        position="relative"
        sx={{
          "&:before": {
            content: '""',
            position: "absolute",
            width: "100%",
            height: "100%",
            top: 0,
            left: 0,
            bgcolor: "#F3F3F333",
            backdropFilter: "blur(6px)",
            borderRadius: 3,
          },
        }}
      >
        <Stack
          gap={2}
          p={3}
          borderRadius={3}
          width="500px"
          position="relative"
          zIndex={2}
        >
          {/* 헤더 */}
          <Stack
            direction="row"
            alignItems="center"
            gap={1.5}
            position="relative"
            zIndex={2}
          >
            <Typography variant="h6">{grade}</Typography>

            <Box
              width="6px"
              height="6px"
              borderRadius="50%"
              bgcolor={
                darker
                  ? theme.palette.secondary.main
                  : theme.palette.secondary.dark
              }
            />

            <Typography
              variant="h6"
              color={darker ? theme.palette.secondary.main : "text.secondary"}
              fontWeight={500}
            >
              {subject}
            </Typography>
          </Stack>

          {/* 오늘의 Focus */}
          <Stack>
            <Stack direction="row" alignItems="center" gap={0.5}>
              <Typography variant="subtitle1" fontWeight={500}>
                오늘의 Focus
              </Typography>
              <AutoAwesomeRoundedIcon color="primary" />
            </Stack>
            <Typography variant="body1" color="text.secondary">
              {focusContent}
            </Typography>
          </Stack>

          {/* 오늘의 목표 */}
          <Stack>
            <Typography variant="subtitle1" fontWeight={500}>
              오늘의 목표
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {targetContent}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Popover>
  );
};

export default InfoPopover;
