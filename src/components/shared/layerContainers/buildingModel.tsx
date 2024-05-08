import { useTheme } from "@mui/material";
import { PrimitiveAtom, WritableAtom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { FC, useCallback, useEffect, useMemo, useRef } from "react";

import { ColorMap } from "../../prototypes/color-maps";
import {
  ScreenSpaceSelectionEntry,
  useScreenSpaceSelectionResponder,
} from "../../prototypes/screen-space-selection";
import { ViewLayerModel } from "../../prototypes/view-layers";
import { string, variable } from "../helpers";
import { useOptionalAtomValue } from "../hooks";
import { PlateauTilesetProperties, TileFeatureIndex } from "../plateau";
import { TILESET_FEATURE, TilesetLayer, TilesetProps } from "../reearth/layers";
import { Cesium3DTilesAppearance, ConditionsExpression, LayerAppearance } from "../reearth/types";
import {
  TILESET_BUILDING_MODEL_COLOR,
  TILESET_BUILDING_MODEL_FILTER,
  TILESET_CLIPPING,
} from "../types/fieldComponents/3dtiles";
import { OPACITY_FIELD } from "../types/fieldComponents/general";
import { SearchedFeatures } from "../view-layers";
import { ComponentAtom } from "../view-layers/component";
import { useFindComponent } from "../view-layers/hooks";

import { useClippingBox } from "./hooks/useClippingBox";
import { useEvaluateFeatureColor } from "./hooks/useEvaluateFeatureColor";
import { useEvaluateFilter } from "./hooks/useEvaluateFilter";
import { LoadedTileset } from "../types";
import { Cesium3DTile, Cesium3DTileFeature, Cesium3DTileStyle, Color } from "cesium";
import { getGMLId } from "../plateau/utils";

type TilesetContainerProps = Omit<TilesetProps, "appearance" | "boxAppearance"> & {
  id: string;
  featureIndexAtom: PrimitiveAtom<TileFeatureIndex | null>;
  layerIdAtom: WritableAtom<string | null, [string | null], any>;
  propertiesAtom: WritableAtom<PlateauTilesetProperties | null, [PlateauTilesetProperties | null], any>;
  colorPropertyAtom: PrimitiveAtom<string | null>;
  colorMapAtom: PrimitiveAtom<ColorMap>;
  hiddenFeaturesAtom: PrimitiveAtom<readonly string[] | null>;
  searchedFeaturesAtom: PrimitiveAtom<SearchedFeatures | null>;
  colorRangeAtom: PrimitiveAtom<number[]>;
  colorSchemeAtom: ViewLayerModel["colorSchemeAtom"];
  opacityAtom: PrimitiveAtom<number>;
  selections?: ScreenSpaceSelectionEntry<typeof TILESET_FEATURE>[];
  hidden: boolean;
  textured?: boolean;
  componentAtoms: ComponentAtom[];
  renderedTileset?: LoadedTileset;
};

export const BuildingModelLayerContainer: FC<TilesetContainerProps> = ({
  id,
  // onLoad,
  layerIdAtom,
  featureIndexAtom,
  propertiesAtom,
  // colorPropertyAtom,
  // colorSchemeAtom,
  // componentAtoms,
  // selections,
  hidden,
  // hiddenFeaturesAtom,
  // searchedFeaturesAtom,
  // textured,
  opacityAtom,
  renderedTileset,
}) => {
  const featureIndex = useMemo(() => new TileFeatureIndex(), []);
  const setFeatureIndex = useSetAtom(featureIndexAtom);
  const [layerId, setLayerId] = useAtom(layerIdAtom);
  useScreenSpaceSelectionResponder({
    type: TILESET_FEATURE,
    convertToSelection: (object) => {
      const obj = object as Cesium3DTileFeature
      if (
        obj.tileset !== renderedTileset?.primitive
      ) {
        return
      }
      const gmlId = getGMLId(obj)
      return typeof gmlId === "string" &&
        featureIndex
        ? {
            type: TILESET_FEATURE,
            value: {
              key: gmlId,
              layerId,
              featureIndex,
              datasetId: id,
            },
          }
        : undefined;
    },
    shouldRespondToSelection: (
      value,
    ): value is ScreenSpaceSelectionEntry<typeof TILESET_FEATURE> => {
      return value.type === TILESET_FEATURE && featureIndex.has(value.value.key);
    },
    onSelect: value => {
      const features = featureIndex.find(value.value.key)
      if (features == null) {
        return
      }
      features.forEach(feature => {
        feature.setProperty('__selected', true)
      })
    },
    onDeselect: value => {
      const features = featureIndex.find(value.value.key)
      if (features == null) {
        return
      }
      features.forEach(feature => {
        feature.setProperty('__selected', false)
      })
    },
    // computeBoundingSphere: (value, result = new BoundingSphere()) => {
    //   computeCartographicToCartesian(scene, location, result.center);
    //   result.radius = 200; // Arbitrary size
    //   return result;
    // },
  });

  const setProperties = useSetAtom(propertiesAtom);
  useEffect(
    () => {
      if(!renderedTileset) return;
      setProperties(new PlateauTilesetProperties(renderedTileset.primitive));
      const removeTileLoad = renderedTileset.primitive.tileLoad.addEventListener((tile: Cesium3DTile) => {
        featureIndex.addTile(tile, getGMLId);
      })
      const removeTileUnload = renderedTileset.primitive.tileUnload.addEventListener((tile: Cesium3DTile) => {
        featureIndex.removeTile(tile, getGMLId);
      })
      return () => {
        removeTileLoad();
        removeTileUnload();
      }
    },
    [renderedTileset, featureIndex, setProperties],
  );

  useEffect(
    () => {
      // onLoad?.(layerId);
      // setLayerId(layerId);
      setFeatureIndex(featureIndex);
    },
    [setFeatureIndex, featureIndex],
  );

  // const colorProperty = useAtomValue(colorPropertyAtom);
  // const colorScheme = useAtomValue(colorSchemeAtom);

  // Field components
  // const opacityAtom = useFindComponent(componentAtoms, OPACITY_FIELD);
  // const buildingModelColorAtom = useFindComponent(componentAtoms, TILESET_BUILDING_MODEL_COLOR);
  // const [clippingBox, boxAppearance] = useClippingBox(
  //   useOptionalAtomValue(useFindComponent(componentAtoms, TILESET_CLIPPING)),
  // );

  // const filter = useEvaluateFilter(
  //   useOptionalAtomValue(useFindComponent(componentAtoms, TILESET_BUILDING_MODEL_FILTER)),
  // );

  // const hiddenFeatures = useAtomValue(hiddenFeaturesAtom);
  // const hiddenFeaturesConditions: ConditionsExpression = useMemo(
  //   () => ({
  //     conditions:
  //       hiddenFeatures?.map(f => [`${variable("gml_id")} ===  ${string(f)}`, "false"]) ?? [],
  //   }),
  //   [hiddenFeatures],
  // );

  // const searchedFeatures = useAtomValue(searchedFeaturesAtom);
  // const shownSearchedFeaturesConditions: ConditionsExpression | undefined = useMemo(
  //   () =>
  //     searchedFeatures?.onlyShow
  //       ? {
  //           conditions: [
  //             ...(searchedFeatures?.features?.map(
  //               f => [`${variable("gml_id")} ===  ${string(f)}`, "true"] as [string, string],
  //             ) ?? []),
  //             ...hiddenFeaturesConditions.conditions,
  //             ...(filter.conditions[0].every(c => c === "true") ? [] : filter.conditions),
  //             ["true", "false"],
  //           ],
  //         }
  //       : undefined,
  //   [searchedFeatures, hiddenFeaturesConditions, filter],
  // );

  const opacity = useOptionalAtomValue(opacityAtom);
  // const color = useEvaluateFeatureColor({
  //   colorProperty: buildingModelColorAtom ? colorProperty ?? undefined : undefined,
  //   colorScheme: buildingModelColorAtom ? colorScheme ?? undefined : undefined,
  //   opacity: opacity?.value,
  //   selections,
  // });

  // const theme = useTheme();

  // const enableShadow = !opacity || opacity.value === 1;

  // const appearance: LayerAppearance<Cesium3DTilesAppearance> = useMemo(
  //   () => ({
  //     pbr: textured,
  //     ...(color
  //       ? {
  //           color: {
  //             expression: color,
  //           },
  //         }
  //       : {}),
  //     show: {
  //       expression: {
  //         conditions: shownSearchedFeaturesConditions
  //           ? [...shownSearchedFeaturesConditions.conditions]
  //           : [...hiddenFeaturesConditions.conditions, ...filter.conditions],
  //       },
  //     },
  //     shadows: enableShadow ? "enabled" : "disabled",
  //     selectedFeatureColor: theme.palette.primary.main,
  //     experimental_clipping: clippingBox,
  //   }),
  //   [
  //     color,
  //     enableShadow,
  //     textured,
  //     theme.palette.primary.main,
  //     clippingBox,
  //     filter.conditions,
  //     hiddenFeaturesConditions.conditions,
  //     shownSearchedFeaturesConditions,
  //   ],
  // );

  const styles = useMemo(() => ({ opacity }), [opacity]);
  const stylesRef = useRef(styles);
  stylesRef.current = styles;

  useEffect(() => {
    if(!renderedTileset) return;
    renderedTileset.primitive.style = new Cesium3DTileStyle({
      color: {
        evaluateColor: (_feature: Cesium3DTileFeature, result: Color) => {
          return Color.clone(Color.WHITE.withAlpha(stylesRef.current.opacity), result);
        }
      }
    });
  }, [renderedTileset]);

  useEffect(() => {
    if(!renderedTileset) return;
    renderedTileset.primitive.makeStyleDirty();
  }, [renderedTileset, styles]);

  useEffect(() => {
    if(!renderedTileset) return;
    renderedTileset.primitive.show = !hidden;
  }, [renderedTileset, hidden]);

  return null;
};
