import { useAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { pickUpFeature } from "./ar";
import { cesiumLoadedAtom } from "./components/prototypes/view/states/ar";

export default function AROverlayView({...props}) {
  const [cesiumLoaded] = useAtom(cesiumLoadedAtom);

  useEffect(() => {
    if (!cesiumLoaded) { return; }
    console.log('cesiumLoaded:', cesiumLoaded);
    // ar.jsからFeatureをクリックした際のpropertiesを取得
    const handlePickedFeature = (pickedFeature) => {
      console.log('pickedFeature updated:', pickedFeature);
      //setSelectedFeature(pickedFeature);
    };
    pickUpFeature(handlePickedFeature);
  }, [cesiumLoaded]);

  return <div>AROverlayView</div>;
}
