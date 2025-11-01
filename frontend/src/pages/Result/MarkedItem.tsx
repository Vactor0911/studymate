import { Stack, Typography, useTheme, type StackProps } from "@mui/material";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";

interface MarkedItemProps extends StackProps {
  index: number;
  question: string;
  isCorrect: boolean;
}

const MarkedItem = (props: MarkedItemProps) => {
  const { index, question, isCorrect, ...others } = props;

  const theme = useTheme();

  return (
    <Stack direction="row" alignItems="center" p={1} px={2} gap={2} {...others}>
      {/* 번호 */}
      <Stack
        bgcolor="white"
        height="75%"
        justifyContent="center"
        alignItems="center"
        borderRadius={1}
        sx={{
          aspectRatio: "1/1",
        }}
      >
        <Typography variant="h6">{index}</Typography>
      </Stack>

      {/* 문제 */}
      <Typography
        variant="body1"
        flex={1}
        fontWeight={500}
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
      >
        {question}
      </Typography>

      {/* 정답 여부 */}
      <Stack direction="row" borderRadius={1} overflow="hidden">
        {/* O */}
        <Stack
          bgcolor={isCorrect ? theme.palette.secondary.main : "white"}
          justifyContent="center"
          alignItems="center"
          p={1}
          px={2}
        >
          <RadioButtonUncheckedRoundedIcon
            sx={{
              color: isCorrect ? "white" : "inherit",
            }}
          />
        </Stack>

        {/* X */}
        <Stack
          bgcolor={!isCorrect ? theme.palette.secondary.main : "white"}
          justifyContent="center"
          alignItems="center"
          p={1}
          px={2}
        >
          <ClearRoundedIcon
            sx={{
              color: !isCorrect ? "white" : "inherit",
              transform: "scale(1.1)",
            }}
          />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default MarkedItem;
