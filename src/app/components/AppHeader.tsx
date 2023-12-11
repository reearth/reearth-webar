import { type FC } from "react";
// import { useAtomValue } from "jotai";
// import { hideAppOverlayAtom } from "../states/app";

import { AppBar, Space } from "./ported";
import { MainMenuButton } from "./MainMenuButton";
// import { DateControlButton } from "./DateControlButton";

export const AppHeader: FC = () => {
  // const hidden = useAtomValue(hideAppOverlayAtom);
  // if (hidden) {
  //   return null;
  // }
  return (
    <AppBar>
      <MainMenuButton />
      <Space flexible />
      {/* <DateControlButton /> */}
    </AppBar>
  );
};
