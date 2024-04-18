import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { pickUpFeature, updateCompassBias, updateFov } from "./ar";
import { compassBiasAtom, fovPiOverAtom, cesiumLoadedAtom, arStartedAtom } from "./components/prototypes/view/states/ar";
import { SelectionPanel } from "./components/prototypes/view/ui-containers/SelectionPanel";
import { AppOverlayLayout } from "./components/prototypes/ui-components";
import { replaceScreenSpaceSelectionObjectsAtom } from "./components/prototypes/screen-space-selection";

export default function AROverlayView({...props}) {
  const cesiumLoaded = useAtomValue(cesiumLoadedAtom);
  const replaceSelection = useSetAtom(replaceScreenSpaceSelectionObjectsAtom);
  // const [selectedFeature, setSelectedFeature] = useAtom(selectedFeatureAtom);

  useEffect(() => {
    if (!cesiumLoaded) { return; }
    // ar.jsからFeatureをクリックした際のpropertiesを取得
    const handlePickedFeature = (pickedFeature) => {
      replaceSelection([pickedFeature])
      //setSelectedFeature(pickedFeature);
    };
    pickUpFeature(handlePickedFeature);
  }, [cesiumLoaded, replaceSelection]);

  return <div {...props}>
    <AppOverlayLayout aside={<SelectionPanel />}/>
  </div>;
}
