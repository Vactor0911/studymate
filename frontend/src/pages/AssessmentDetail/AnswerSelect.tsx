import { Stack, Typography, useTheme, type StackProps } from "@mui/material";

interface AnswerSelectProps extends StackProps {
  index: number;
  content: string;
  isSelected: boolean;
}

const AnswerSelect = (props: AnswerSelectProps) => {
  const { index, content, isSelected, ...others } = props;

  const theme = useTheme();

  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={1}
      sx={{
        cursor: "pointer",
        "&:hover .number": {
          borderColor: theme.palette.primary.main,
        },
        "&:hover": {
          color: theme.palette.primary.main,
        },
        color: isSelected ? theme.palette.primary.main : "inherit",
      }}
      {...others}
    >
      <Stack
        className="number"
        width={26}
        height={26}
        p={0}
        justifyContent="center"
        alignItems="center"
        borderRadius="50%"
        border={`1px solid ${theme.palette.secondary.main}`}
        borderColor={isSelected ? theme.palette.primary.main : "inherit"}
        sx={{
          transition: "all 0.2s ease-out",
        }}
      >
        <Typography variant="body1" fontWeight={500}>
          {index}
        </Typography>
      </Stack>

      <Typography
        variant="body1"
        sx={{
          transition: "all 0.2s ease-out",
        }}
      >
        {content}
      </Typography>
    </Stack>
  );
};

export default AnswerSelect;
