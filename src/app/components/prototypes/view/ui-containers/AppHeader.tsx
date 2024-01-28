import { useAtomValue } from "jotai";
import { type FC } from "react";

import { AppBar, AppIconButton, LayerIcon, RotateAroundIcon, Space, VisibilityOnIcon } from "../../ui-components";
// import { hideAppOverlayAtom } from "../states/app";

import { MainMenuButton } from "./MainMenuButton";

export const AppHeader: FC = () => {
  // const hidden = useAtomValue(hideAppOverlayAtom);
  // if (hidden) {
  //   return null;
  // }
  return (
    <AppBar>
      <MainMenuButton />
      <Space flexible />
      <AppIconButton title="データセット">
        <LayerIcon />
      </AppIconButton>
      <AppIconButton title="方位調整">
        <RotateAroundIcon />
      </AppIconButton>
      <AppIconButton title="表示モード">
        <VisibilityOnIcon />
      </AppIconButton>
    </AppBar>
  );
};
