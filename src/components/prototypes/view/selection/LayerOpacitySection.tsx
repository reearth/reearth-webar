import { atom } from "jotai";
import { useMemo, type FC } from "react";

import { LayerModel } from "../../layers";
import { formatPercent, ParameterList, SliderParameterItem } from "../../ui-components";

export interface LayerOpacityFieldProps {
  layers: readonly LayerModel[];
}

export const LayerOpacitySection: FC<LayerOpacityFieldProps> = ({ layers }) => {
  const wrappedAtoms = useMemo(
    () =>
      layers.map(l =>
        atom(
          get => "opacityAtom" in l && get(l.opacityAtom),
          (get, set, update: number) => {
            if("opacityAtom" in l) {
              set(l.opacityAtom, update);
            }
          },
        ),
      ),
    [layers],
  );

  if (layers.length === 0) {
    return null;
  }

  return (
    <ParameterList>
      <SliderParameterItem
        label="不透明度"
        atom={wrappedAtoms}
        min={0}
        max={1}
        format={formatPercent}
      />
    </ParameterList>
  );
};
