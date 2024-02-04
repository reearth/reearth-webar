import { type FC } from "react";

import { AppBar, AppIconButton, BuildingIcon, LayerIcon, Space, VisibilityOnIcon } from "../../ui-components";
// import { hideAppOverlayAtom } from "../states/app";

import { MainMenuButton } from "./MainMenuButton";
import { CompassBiasButton } from "./CompassBiasButton";
import { FovButton } from "./FovButton";

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
      <CompassBiasButton />
      <AppIconButton title="表示モード">
        <BuildingIcon />
      </AppIconButton>
      <FovButton />
    </AppBar>
  );
};
