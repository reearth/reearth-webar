import { useAtomValue, useSetAtom } from "jotai";
import { intersection, intersectionBy, uniqBy } from "lodash-es";
import { useMemo, type FC } from "react";

import { ancestorsKey, attributesKey, makePropertyForFeatureInspector } from "../../../shared/plateau/featureInspector";
import { TILESET_FEATURE } from "../../../shared/reearth/layers";
import { Feature } from "../../../shared/reearth/types/layer";
import { findRootLayerAtom, rootLayersLayersAtom } from "../../../shared/states/rootLayer";
import { BuildingLayerModel, RootLayer } from "../../../shared/view-layers";
import { LayerModel, useFindLayer } from "../../layers";
import { ParameterList, PropertyParameterItem } from "../../ui-components";
import { type SCREEN_SPACE_SELECTION, type SelectionGroup } from "../states/selection";
import { isNotNullish } from "../../type-helpers";
import { getGMLId } from "../../../shared/plateau/utils";
import { useOptionalAtomValue } from "../../../shared/hooks";

export interface TileFeaturePropertiesSectionProps {
  values: (SelectionGroup & {
    type: typeof SCREEN_SPACE_SELECTION;
    subtype: typeof TILESET_FEATURE;
  })["values"];
}

// Takramの方の実装に寄せるのがよい
// ただし日本語にする処理はこちらにしかないので組み合わせる必要がある
export const TileFeaturePropertiesSection: FC<TileFeaturePropertiesSectionProps> = ({ values }) => {
  const rootLayersLayers = useAtomValue(rootLayersLayersAtom);
  const findRootLayer = useSetAtom(findRootLayerAtom);
  const findLayer = useFindLayer();

  const features = useMemo(
    () =>
      values
        .map(value => value.featureIndex.find(value.key)?.[0])
        .filter(isNotNullish),
    [values]
  )

  const convertedFeatures = useMemo(
    () =>
        features.map(feature => ({ ...feature, id: getGMLId(feature), properties: Object.fromEntries(feature.getPropertyIds().map(id => [id, feature.getProperty(id)]))})),
    [features]
  )

  // Only support single selection
  const layers = useMemo(() => {
    // const layersMap = values.reduce((res, v) => {
    //   if (!res[v.datasetId]) {
    //     res[v.datasetId] = [];
    //   }
    //   res[v.datasetId].push(v.key);
    //   return res;
    // }, {} as { [datasetId: string]: string[] });
    const foundDatasetId = values[0]?.datasetId;
    const fs = convertedFeatures;

    const layer = findLayer(rootLayersLayers, l => l.id === foundDatasetId);
    const rootLayer = findRootLayer(foundDatasetId ?? "");
    return [{ features: fs ?? [], layer, rootLayer }];
  }, [values, convertedFeatures, findLayer, rootLayersLayers, findRootLayer]);

  const tilesetLayer = layers[0].layer as BuildingLayerModel | undefined;
  const tilesetProperties = useOptionalAtomValue(tilesetLayer?.propertiesAtom);

  const featureType = useMemo(() => convertedFeatures[0]?.properties["feature_type"], [convertedFeatures]);
  const ancestorsFeatureType = useMemo(
    () => convertedFeatures[0]?.properties[attributesKey]?.[ancestorsKey]?.[0]?.["feature_type"],
    [convertedFeatures],
  );

  const properties = useMemo(() => {
    // TODO: Replace properties by JSONPath
    const properties = layers.reduce((res, { features, layer, rootLayer }) => {
      const featureType = features[0]?.properties["feature_type"];
      return res.concat(
        ...makePropertyForFeatureInspector({
          features,
          layer,
          featureInspector: rootLayer?.featureInspector,
          builtin: true,
          sortRootPropertyNames: names => {
            const properties = tilesetProperties?.value;
            const propertyKeys = properties?.map(p => p.name) ?? [];
            const restNames = names.filter(n => !propertyKeys?.includes(n));
            const sortedNames = propertyKeys
              .map(p => names.find(n => n === p))
              .filter(isNotNullish);
            return [...sortedNames, ...restNames];
          },
          featureType,
        }),
      );
    }, [] as Feature["properties"][]);

    return intersectionBy(properties, "name");
  }, [layers, tilesetProperties]);

  return (
    <ParameterList>
      <PropertyParameterItem
        properties={properties}
        featureType={featureType}
        ancestorsFeatureType={ancestorsFeatureType}
      />
    </ParameterList>
  );
};
