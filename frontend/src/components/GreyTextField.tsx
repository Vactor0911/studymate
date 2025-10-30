import {
  FormControl,
  Input,
  InputLabel,
  Typography,
  type InputProps,
} from "@mui/material";

interface GreyTextFieldProps extends InputProps {
  label: string;
  helperText?: string;
}

const GreyTextField = (props: GreyTextFieldProps) => {
  const { label, id, required, helperText, sx, ...others } = props;

  return (
    <FormControl
      variant="standard"
      required={required}
      sx={{
        "& .MuiFormLabel-root": {
          color: "secondary.dark",
        },
      }}
    >
      <InputLabel htmlFor={id}>{label}</InputLabel>
      <Input
        id={id}
        sx={{
          ...sx,
          "&::before": { borderBottomColor: "#E6E6E6" },
          "& .MuiSvgIcon-root": { color: "secondary.dark" },
        }}
        {...others}
      />
      {helperText && (
        <Typography variant="caption" color="error">
          {helperText}
        </Typography>
      )}
    </FormControl>
  );
};

export default GreyTextField;
