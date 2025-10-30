import { Avatar, ButtonBase, useTheme, type AvatarProps } from "@mui/material";

interface ProfileAvatarButtonProps extends AvatarProps {
  name: string;
  onClick?: () => void;
}

const ProfileAvatarButton = (props: ProfileAvatarButtonProps) => {
  const { name, onClick, sx, ...others } = props;

  const theme = useTheme();

  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        borderRadius: "50%",
        border: `2px solid ${theme.palette.primary.main}`,
      }}
    >
      <Avatar
        sx={{
          ...sx,
          fontSize: "2em",
        }}
        {...others}
      >
        {name.charAt(0).toUpperCase()}
      </Avatar>
    </ButtonBase>
  );
};

export default ProfileAvatarButton;
