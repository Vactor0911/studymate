import { PieChart, type PieChartProps } from "@mui/x-charts/PieChart";

interface ResultChartProps {
  size?: number;
}

const ResultChart = (props: ResultChartProps) => {
  const { size = 300 } = props;

  const data1 = [
    { label: "Group A", value: 400 },
    { label: "Group B", value: 300 },
  ];

  const settings = {
    series: [
      {
        innerRadius: size * 0.25,
        outerRadius: size * 0.5,
        data: data1,
        highlightScope: { fade: "global", highlight: "item" },
      },
    ],
    hideLegend: true,
  } satisfies PieChartProps;

  return <PieChart width={size} height={size} {...settings}></PieChart>;
};

export default ResultChart;
