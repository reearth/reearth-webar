import { type Getter } from "jotai";
import { type ComponentType, type HTMLAttributes } from "react";

import { ScreenSpaceSelectionEntry } from "../screen-space-selection";
import { LoadedTileset } from "../../shared/types";

export interface LayerModelOverrides {}

export type LayerType = keyof LayerModelOverrides;

export interface LayerModelHandle {
  bringToFront: () => void;
}

export interface LayerModelHandleRef {
  current?: LayerModelHandle;
}

export interface LayerModelBase {
  id: string;
  type: LayerType;
  handleRef: LayerModelHandleRef;
}

export type LayerModel<T extends LayerType = LayerType> = LayerType extends never
  ? LayerModelBase
  : {
      [K in LayerType]: K extends T
        ? LayerModelOverrides[K] extends LayerModelBase
          ? LayerModelOverrides[K]
          : never
        : never;
    }[LayerType];

export type LayerPredicate<T extends LayerType = LayerType> = (
  layer: LayerModel<T>,
  get: Getter, // TODO: Eliminate getter from arguments
) => boolean;

export type LayerProps<T extends LayerType = LayerType> = LayerModel<T> & {
  index: number;
  selected?: boolean;
  itemProps?: HTMLAttributes<HTMLElement>;
  selections?: ScreenSpaceSelectionEntry[];
  tilesets?: LoadedTileset[];
};

export type LayerComponents = {
  [T in keyof LayerModelOverrides]: LayerProps<T> extends never
    ? undefined
    : ComponentType<LayerProps<T>>;
};
