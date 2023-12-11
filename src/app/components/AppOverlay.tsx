import { useAtomValue } from "jotai";
import { type FC } from "react";

import { Spacer } from "./Spacer";
import { AppOverlayLayout } from "./ported";
// import { hideAppOverlayAtom } from "../states/app";

// import { DeveloperPanels } from "../developer/DeveloperPanels";
import { MainPanel } from "./MainPanel";
import { SelectionPanel } from "./SelectionPanel";

type Props = {
  type: "main" | "aside" | "developer";
  width: number;
  height?: number;
};

export const AppOverlay: FC<Props> = ({ type, width, height }) => {
  // const hidden = useAtomValue(hideAppOverlayAtom);
  const hidden = false
  return (
    <>
      <AppOverlayLayout
        hidden={hidden}
        main={type === "main" ? <MainPanel /> : null}
        aside={type === "aside" ? <SelectionPanel /> : null}
        // developer={<DeveloperPanels />}
      />
      <Spacer width={width} height={height} hidden={hidden} />
    </>
  );
};
