import { Stack, Typography, useTheme } from "@mui/material";
import { useCallback } from "react";

interface AnswerSelectProps {
  index: number;
  content: string;
  isUserSelect: boolean;
  isAnswer: boolean;
}

const AnswerSelect = (props: AnswerSelectProps) => {
  const { index, content, isUserSelect, isAnswer } = props;

  const theme = useTheme();

  const getColor = useCallback(() => {
    if (isUserSelect !== isAnswer && isUserSelect) {
      return theme.palette.secondary.main;
    } else if (isAnswer) {
      return theme.palette.primary.main;
    } else {
      return theme.palette.secondary.light;
    }
  }, [
    isAnswer,
    isUserSelect,
    theme.palette.primary.main,
    theme.palette.secondary.light,
    theme.palette.secondary.main,
  ]);

  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <Stack
        className="number"
        width={26}
        height={26}
        p={0}
        justifyContent="center"
        alignItems="center"
        borderRadius="50%"
        border={`1px solid ${getColor()}`}
        color={getColor()}
      >
        <Typography
          variant="body1"
          fontWeight={isUserSelect !== isAnswer && isAnswer ? "bold" : "inherit"}
        >
          {index}
        </Typography>
      </Stack>

      <Typography
        variant="body1"
        fontWeight={isUserSelect !== isAnswer && isAnswer ? "bold" : "inherit"}
        sx={{
          color: getColor(),
        }}
      >
        {content}
      </Typography>
    </Stack>
  );
};

export default AnswerSelect;
