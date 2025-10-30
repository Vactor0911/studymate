import { Avatar, ButtonBase, useTheme, type AvatarProps } from "@mui/material";
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';

interface ProfileAvatarButtonProps extends AvatarProps {
  onClick?: () => void;
}

const ProfileAvatarButton = (props: ProfileAvatarButtonProps) => {
  const { onClick, sx, ...others } = props;

  const theme = useTheme();

  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        borderRadius: "50%",
      }}
    >
      <Avatar
        sx={{
          width: "100%",
          height: "100%",
          border: `2px solid ${theme.palette.primary.main}`,
          ...sx,
        }}
        {...others}
      >
        <PersonRoundedIcon fontSize="large" />
      </Avatar>
    </ButtonBase>
  );
};

export default ProfileAvatarButton;
