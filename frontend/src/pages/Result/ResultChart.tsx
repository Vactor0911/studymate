import { Box, Typography, useTheme } from "@mui/material";
import { PieChart, type PieChartProps } from "@mui/x-charts/PieChart";

interface ResultChartProps {
  size?: number;
}

const getAnswerRatio = (total: number, answers: number) => {
  return Math.floor((answers / total) * 100);
};

const ResultChart = (props: ResultChartProps) => {
  const { size = 300 } = props;

  const theme = useTheme();

  const data1 = [
    { label: "정답 수", value: 10, color: theme.palette.primary.main },
    { label: "오답 수", value: 5, color: theme.palette.secondary.main },
  ];

  const settings = {
    series: [
      {
        innerRadius: size * 0.25,
        outerRadius: size * 0.5,
        data: data1,
        arcLabel: (params) =>
          params.label === "정답 수" ? `${getAnswerRatio(15, 10)}%` : "",
        highlightScope: { fade: "global", highlight: "item" },
      },
    ],
    hideLegend: true,
    sx: {
      position: "relative",
      "& .MuiPieChart-seriesLabels": { fontWeight: "bold" },
    },
  } satisfies PieChartProps;

  return (
    <Box display="flex" width={size} height={size} position="relative">
      <PieChart width={size} height={size} {...settings} />
      <Typography
        variant="subtitle2"
        position="absolute"
        top="50%"
        left="50%"
        fontWeight="bold"
        sx={{
          transform: "translate(-50%, -50%)",
        }}
      >
        <span
          css={{
            fontSize: "2em",
          }}
        >
          {15}
        </span>
        문제
      </Typography>
    </Box>
  );
};

export default ResultChart;
