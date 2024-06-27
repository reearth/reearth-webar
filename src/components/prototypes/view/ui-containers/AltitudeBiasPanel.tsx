import { styled } from "@mui/material";
import { useEffect, type FC } from "react";

import {
  FloatingPanel,
  ParameterList,
  SliderParameterItem,
} from "../../ui-components";

import { arStartedAtom, altitudeBiasAtom } from "../states/ar";
import { useAtomValue } from "jotai";
import { updateAltitudeBias } from "../../../../ar";

const Root = styled(FloatingPanel)(({ theme }) => ({
  width: 360,
  padding: theme.spacing(1),
}));

const Title = styled("div")(({ theme }) => ({
  ...theme.typography.h5,
  margin: theme.spacing(1),
}));

export const AltitudeBiasPanel: FC = () => {
  const arStarted = useAtomValue(arStartedAtom);
  const altitudeBias = useAtomValue(altitudeBiasAtom);
  useEffect(() => {
    if (!arStarted) { return; }
    updateAltitudeBias(altitudeBias);
  }, [altitudeBias]);

  return (
    <Root>
      <Title>高度設定</Title>
      <ParameterList>
        <SliderParameterItem
          label="高度バイアス"
          description="高度を微調整します (単位: m)"
          min={-100}
          max={100}
          step={1}
          atom={altitudeBiasAtom}
        />
      </ParameterList>
    </Root>
  );
};
