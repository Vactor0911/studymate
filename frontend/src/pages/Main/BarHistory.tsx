import { Stack, useTheme } from "@mui/material";
import BarButton from "./BarButton";
import { useCallback, useState } from "react";
import InfoPopover from "./InfoPopover";
import { useAtomValue } from "jotai";
import { selectedBarAtom } from "../../states";

const BarHistory = () => {
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const selectedBar = useAtomValue(selectedBarAtom);

  const processColor = useCallback(
    (origin: string, index: string) => {
      const selectedBarNum = Number(selectedBar);
      const indexNum = Number(index);

      if (indexNum < selectedBarNum) {
        return theme.palette.secondary.light;
      }
      return origin;
    },
    [selectedBar, theme.palette.secondary.light]
  );

  return (
    <Stack
      direction="row"
      width="100%"
      height="100%"
      alignItems="flex-end"
      gap="5vw"
    >
      <BarButton
        label="01"
        color={processColor("#A5E9E2", "01")}
        mb={15}
        setAnchor={setAnchorEl}
      />
      <BarButton
        label="02"
        color={processColor("#3FD4C7", "02")}
        setAnchor={setAnchorEl}
      />
      <BarButton
        label="03"
        color={processColor("#3FD4C7", "03")}
        mb={15}
        setAnchor={setAnchorEl}
      />
      <BarButton
        label="04"
        color={processColor("#3D8BEB", "04")}
        setAnchor={setAnchorEl}
      />
      <BarButton
        label="05"
        color={processColor("#6574FF", "05")}
        mb={15}
        setAnchor={setAnchorEl}
      />

      <InfoPopover anchorEl={anchorEl} setAnchorEl={setAnchorEl} />
    </Stack>
  );
};

export default BarHistory;
