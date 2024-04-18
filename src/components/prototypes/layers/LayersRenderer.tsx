import { useAtomValue, type PrimitiveAtom } from "jotai";
import { Suspense, type ComponentType, type FC, type ReactNode, useMemo } from "react";

import { rootLayersLayerAtomsAtom } from "../../shared/states/rootLayer";
import { ScreenSpaceSelectionEntry, screenSpaceSelectionAtom } from "../screen-space-selection";

import { layerIdsAtom, layerSelectionAtom } from "./states";
import { type LayerComponents, type LayerModel, type LayerProps } from "./types";
import { LoadedTileset } from "../../shared/types";

interface LayerRendererProps {
  components: LayerComponents;
  index: number;
  layerAtom: PrimitiveAtom<LayerModel>;
  selections: ScreenSpaceSelectionEntry[] | undefined;
  tilesets: LoadedTileset[];
}

const LayerRenderer: FC<LayerRendererProps> = ({ components, index, layerAtom, selections, tilesets }) => {
  const layer = useAtomValue(layerAtom);
  const layerId = useAtomValue(layer.layerIdAtom);
  const layerSelection = useAtomValue(layerSelectionAtom);
  const filteredSelections = useMemo(
    () => selections?.filter(v => layerId === v.value.layerId),
    [layerId, selections],
  );

  const Component = components[layer.type] as ComponentType<LayerProps>;
  if (Component == null) {
    return null;
  }
  return (
    <Suspense>
      <Component
        {...layer}
        index={index}
        selected={layerSelection.some(s => s.id === layer.id)}
        selections={filteredSelections}
        tilesets={tilesets}
      />
    </Suspense>
  );
};

export interface LayersRendererProps<T extends LayerComponents> {
  components: T;
  tilesets: LoadedTileset[];
  children?: ReactNode;
}

export function LayersRenderer<T extends LayerComponents>({
  components,
  tilesets,
}: LayersRendererProps<T>): JSX.Element {
  const layerAtoms = useAtomValue(rootLayersLayerAtomsAtom);
  const layerIds = useAtomValue(layerIdsAtom);
  const selection = useAtomValue(screenSpaceSelectionAtom);
  return (
    <>
      {layerAtoms.map((layerAtom, index) => (
        <LayerRenderer
          key={layerIds[index]}
          components={components}
          index={index}
          layerAtom={layerAtom}
          tilesets={tilesets}
          selections={selection}
        />
      ))}
    </>
  );
}
