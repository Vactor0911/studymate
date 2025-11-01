import { Box, keyframes } from "@mui/material";
import AnalyzeIcon1 from "../../assets/AnalyzeIcon1.png";
import AnalyzeIcon2 from "../../assets/AnalyzeIcon2.png";
import AnalyzeIcon3 from "../../assets/AnalyzeIcon3.png";
import AnalyzeIcon4 from "../../assets/AnalyzeIcon4.png";
import AnalyzeIcon5 from "../../assets/AnalyzeIcon5.png";

const Animation1 = keyframes`
    from {
        top: 50%;
        left: 50%;
        opacity: 0;
        transform: scale(0.5) rotate(${Math.random() * 180}deg);
    }
    to {
        top: 30%;
        left: 0;
        opacity: 1;
        transform: scale(1) rotate(0deg);
    }
`;

const Animation2 = keyframes`
    from {
        top: 50%;
        left: 50%;
        opacity: 0;
        transform: scale(0.5) rotate(${Math.random() * 180}deg);
    }
    to {
        top: 70%;
        left: -10%;
        opacity: 1;
        transform: scale(1) rotate(0deg);
    }
`;

const Animation3 = keyframes`
    from {
        top: 50%;
        left: 50%;
        opacity: 0;
        transform: scale(0.5) rotate(${Math.random() * 180}deg);
    }
    to {
        top: 15%;
        left: 100%;
        opacity: 1;
        transform: scale(1) rotate(0deg);
    }
`;

const Animation4 = keyframes`
    from {
        top: 50%;
        left: 50%;
        opacity: 0;
        transform: scale(0.5) rotate(${Math.random() * 180}deg);
    }
    to {
        top: 50%;
        left: 90%;
        opacity: 1;
        transform: scale(1) rotate(0deg);
    }
`;

const Animation5 = keyframes`
    from {
        top: 50%;
        left: 50%;
        opacity: 0;
        transform: scale(0.5) rotate(${Math.random() * 180}deg);
    }
    to {
        top: 80%;
        left: 100%;
        opacity: 1;
        transform: scale(1) rotate(0deg);
    }
`;

const BackgroundEffect = () => {
  return (
    <>
      <Box
        component="img"
        src={AnalyzeIcon1}
        position="absolute"
        sx={{
          opacity: 0,
          animation: `1s ease-in-out forwards ${Animation1}`,
        }}
        zIndex={-1}
      />
      <Box
        component="img"
        src={AnalyzeIcon2}
        position="absolute"
        sx={{
          opacity: 0,
          animation: `1s ease-in-out 0.25s forwards ${Animation2}`,
        }}
        zIndex={-1}
      />
      <Box
        component="img"
        src={AnalyzeIcon3}
        position="absolute"
        sx={{
          opacity: 0,
          animation: `1s ease-in-out 0.1s forwards ${Animation3}`,
        }}
        zIndex={-1}
      />
      <Box
        component="img"
        src={AnalyzeIcon4}
        position="absolute"
        sx={{
          opacity: 0,
          animation: `1s ease-in-out forwards ${Animation4}`,
        }}
        zIndex={-1}
      />
      <Box
        component="img"
        src={AnalyzeIcon5}
        position="absolute"
        sx={{
          opacity: 0,
          animation: `1s ease-in-out 0.2s forwards ${Animation5}`,
        }}
        zIndex={-1}
      />
    </>
  );
};

export default BackgroundEffect;
