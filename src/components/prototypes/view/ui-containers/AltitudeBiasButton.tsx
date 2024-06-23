import { bindPopover, bindTrigger, usePopupState } from "material-ui-popup-state/hooks";
import { useId, type FC } from "react";

import { AppIconButton, OverlayPopper, SettingsIcon } from "../../ui-components";

import { AltitudeBiasPanel } from "./AltitudeBiasPanel";

export const AltitudeBiasButton: FC = () => {
  const id = useId();
  const popupState = usePopupState({
    variant: "popover",
    popupId: id,
  });
  const popoverProps = bindPopover(popupState);

  return (
    <>
      <AppIconButton
        title="高度調整"
        selected={popoverProps.open}
        disableTooltip={popoverProps.open}
        {...bindTrigger(popupState)}>
        <SettingsIcon />
      </AppIconButton>
      <OverlayPopper {...popoverProps} inset={1.5}>
        <AltitudeBiasPanel />
      </OverlayPopper>
    </>
  );
};
