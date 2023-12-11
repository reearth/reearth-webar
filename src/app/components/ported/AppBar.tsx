import {
  AppBar as MuiAppBar,
  type AppBarProps as MuiAppBarProps,
  Toolbar,
  toolbarClasses,
  iconButtonClasses,
  styled,
} from "@mui/material"
import { DarkThemeOverride } from "./DarkThemeOverride";
import { forwardRef } from "react";

const StyledAppBar = styled(MuiAppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  maxWidth: "100%",
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  [`&.${toolbarClasses.root}`]: {
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    minHeight: theme.spacing(6),
  },
  [`& .${iconButtonClasses.root}`]: {
    minHeight: theme.spacing(5),
    minWidth: theme.spacing(6),
  },
}));

export type AppBarProps = MuiAppBarProps;

export const AppBar = forwardRef<HTMLDivElement, AppBarProps>(({ children, ...props }, ref) => (
  <DarkThemeOverride>
    <StyledAppBar ref={ref} position="static" elevation={0} {...props}>
      <StyledToolbar>{children}</StyledToolbar>
    </StyledAppBar>
  </DarkThemeOverride>
));
