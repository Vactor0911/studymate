import { Stack } from "@mui/material";
import BarButton from "./BarButton";
import { useState } from "react";
import InfoPopover from "./InfoPopover";

const BarHistory = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  return (
    <Stack
      direction="row"
      width="100%"
      height="100%"
      alignItems="flex-end"
      gap="5vw"
    >
      <BarButton label="01" color="#A5E9E2" mb={15} setAnchor={setAnchorEl} />
      <BarButton label="02" color="#3FD4C7" setAnchor={setAnchorEl} />
      <BarButton label="03" color="#3FD4C7" mb={15} setAnchor={setAnchorEl} />
      <BarButton label="04" color="#3D8BEB" setAnchor={setAnchorEl} />
      <BarButton label="05" color="#6574FF" mb={15} setAnchor={setAnchorEl} />

      <InfoPopover anchorEl={anchorEl} setAnchorEl={setAnchorEl} />
    </Stack>
  );
};

export default BarHistory;
