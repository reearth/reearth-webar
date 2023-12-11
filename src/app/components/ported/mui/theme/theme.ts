import { alpha, createTheme, type ThemeOptions } from "@mui/material";
import { grey } from "@mui/material/colors";
import { type Shadows } from "@mui/material/styles/shadows";
import { type CSSProperties } from "react";
import { merge } from "lodash";

import { MuiIconButton } from "../components/MuiIconButton";

declare module "@mui/material/styles" {
  interface TypographyVariants {
    small: CSSProperties;
  }

  interface TypographyVariantsOptions {
    small?: CSSProperties;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    small: true;
  }
}

const theme = createTheme();

export const themeOptions: ThemeOptions = {
  shape: {
    borderRadius: 5,
  },
  palette: {
    primary: {
      main: "#00bebe",
    },
    secondary: grey,
    action: {
      selectedOpacity: 0.88,
    },
  },
  typography: {
    fontSize: 14,
    fontFamily: [
      "ui-sans-serif",
      "system-ui",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      '"Noto Sans"',
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
    h1: {
      fontSize: theme.typography.pxToRem(28.38),
      fontWeight: 600,
    },
    // Major second typographic scale of 14px base.
    // https://typescale.com
    h2: {
      fontSize: theme.typography.pxToRem(25.23),
      fontWeight: 600,
    },
    h3: {
      fontSize: theme.typography.pxToRem(22.43),
      fontWeight: 600,
    },
    h4: {
      fontSize: theme.typography.pxToRem(19.93),
      fontWeight: 600,
    },
    h5: {
      fontSize: theme.typography.pxToRem(17.72),
      fontWeight: 600,
    },
    h6: {
      fontSize: theme.typography.pxToRem(15.75),
      fontWeight: 600,
    },
    body1: {
      fontSize: theme.typography.pxToRem(14),
    },
    body2: {
      fontSize: theme.typography.pxToRem(12.44),
    },
    subtitle1: {
      fontSize: theme.typography.pxToRem(14),
      fontWeight: 600,
    },
    subtitle2: {
      fontSize: theme.typography.pxToRem(12.44),
      fontWeight: 600,
    },
    caption: {
      fontSize: theme.typography.pxToRem(11.06),
    },
    small: {
      fontSize: theme.typography.pxToRem(9.83),
      lineHeight: 1.2,
    },
  },
  components: {
    MuiIconButton,
  },
};

export const lightThemeOptions = merge<unknown, unknown, ThemeOptions>({}, themeOptions, {
  palette: {
    mode: "light",
    background: {
      default: "#ffffff",
    },
    text: {
      secondary: alpha(theme.palette.common.black, 0.45),
    },
  },
  shadows: [
    "none",
    "0 0 0 1px rgba(0, 0, 0, 0.05), 0 1px 12px 0 rgba(0, 0, 0, 0.05)",
    ...Array<string>(23).fill("0 0 2px 0 rgba(0, 0, 0, 0.15), 0 4px 32px rgba(0, 0, 0, 0.2)"),
  ] as Shadows,
});

export const darkThemeOptions = merge<unknown, unknown, ThemeOptions>({}, themeOptions, {
  palette: {
    mode: "dark",
    background: {
      default: "#222222",
      paper: "#333333",
    },
    text: {
      secondary: alpha(theme.palette.common.white, 0.45),
    },
  },
  shadows: [
    "none",
    "0 1px 12px 0 rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.05)",
    ...Array<string>(23).fill("0 4px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.05)"),
  ] as Shadows,
});

export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);
