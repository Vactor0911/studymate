import {
  Box,
  ClickAwayListener,
  Stack,
  Typography,
  type BoxProps,
} from "@mui/material";
import { useAtom } from "jotai";
import { useCallback, useRef, useState } from "react";
import { selectedBarAtom } from "../../states";

interface BarButtonProps extends BoxProps {
  label: string;
  color: string;
  setAnchor: (anchor: HTMLDivElement | null) => void;
}

const BarButton = (props: BarButtonProps) => {
  const { label, color, setAnchor, ...others } = props;

  const [isFocus, setIsFocus] = useState(false);
  const topRef = useRef(null);
  const [selectedBar, setSelectedBar] = useAtom(selectedBarAtom);

  const handleClickAway = useCallback(() => {
    if (selectedBar === label) {
      setAnchor(null);
      setIsFocus(false);
      setSelectedBar("");
    }
  }, [label, selectedBar, setAnchor, setSelectedBar]);

  const handleClick = useCallback(() => {
    if (topRef.current) {
      setIsFocus(true);
      setAnchor(topRef.current);
      setSelectedBar(label);
    }
  }, [label, setAnchor, setSelectedBar]);

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box
        position="relative"
        onMouseEnter={() => setIsFocus(true)}
        onMouseLeave={() => setIsFocus(false)}
        onClick={handleClick}
        sx={{
          cursor: "pointer",
        }}
        {...others}
      >
        {/* 하단 테두리 */}
        <Stack
          width="128px"
          height="128px"
          border={`4px solid ${color}`}
          borderRadius={7}
          justifyContent="center"
          alignItems="center"
          position="relative"
          sx={{
            transform: "rotateX(55deg) rotateZ(45deg)",
            transition: "all 0.25s ease-in-out",
          }}
        >
          {/* 기둥 하단 */}
          <Box
            width="80px"
            height="80px"
            bgcolor={color}
            borderRadius={4}
            sx={{
              filter: "brightness(85%)",
              boxShadow: `24px 24px 16px 8px ${color}BB`,
              transition: "all 0.25s ease-in-out",
            }}
          />
        </Stack>

        {/* 기둥 중심 */}
        <Box
          width="100px"
          height={isFocus || selectedBar === label ? "175px" : "100px"}
          bgcolor={color}
          position="absolute"
          bottom={0}
          left="50%"
          sx={{
            transform: "translate(-50%, -65px)",
            filter: "brightness(85%)",
            transition: "all 0.25s ease-in-out",
          }}
        />

        {/* 기둥 상단 */}
        <Box
          ref={topRef}
          position="absolute"
          top={0}
          left="50%"
          sx={{
            transform: `translate(-50%, ${
              isFocus || selectedBar === label ? "-150px" : "-75px"
            })`,
            transition: "transform 0.25s ease-in-out",
          }}
        >
          <Stack
            width="80px"
            height="80px"
            bgcolor={color}
            borderRadius={4}
            justifyContent="center"
            alignItems="center"
            sx={{
              transform: "rotateX(-55deg) rotateZ(-45deg)",
              transition: "all 0.25s ease-in-out",
            }}
          >
            <Typography
              variant="h4"
              color="white"
              sx={{
                transform: "translateY(-4px)",
              }}
            >
              {label}
            </Typography>
          </Stack>
        </Box>
      </Box>
    </ClickAwayListener>
  );
};

export default BarButton;
