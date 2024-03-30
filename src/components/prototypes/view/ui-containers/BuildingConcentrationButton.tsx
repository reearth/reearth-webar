import { useEffect, type FC } from "react";
import { AppIconButton, BuildingIcon } from "../../ui-components";
import { buildingConcentratedAtom } from "../states/ar";
import { useAtom } from "jotai";
import { updateOcclusion } from "../../../../ar";

export const BuildingConcentrationButton: FC = () => {
  const [buildingConcentrated, setBuildingConcentrated] = useAtom(buildingConcentratedAtom);
  // TODO: onClickが選択時しか作動しない (選択解除時に作動しない)
  function toggleBuildingConcentration() {
    setBuildingConcentrated(!buildingConcentrated);
  }
  useEffect(() => {
    if (buildingConcentrated === undefined) { return; }
    console.log(buildingConcentrated);
    updateOcclusion(buildingConcentrated);
  }, [buildingConcentrated]);

  return (
    <>
      <AppIconButton
        title="選択中のビルのみ表示"
        selected={buildingConcentrated}
        disableTooltip={buildingConcentrated}
        onClick={toggleBuildingConcentration}
      >
        <BuildingIcon />
      </AppIconButton>
    </>
  );
};
