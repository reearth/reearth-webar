import { styled } from "@mui/material";
import { useEffect, type FC } from "react";

import {
  FloatingPanel,
  ParameterList,
  SliderParameterItem,
} from "../../ui-components";

import { arStartedAtom, compassBiasAtom } from "../states/ar";
import { useAtomValue } from "jotai";
import { updateCompassBias } from "../../../../ar";

const Root = styled(FloatingPanel)(({ theme }) => ({
  width: 360,
  padding: theme.spacing(1),
}));

const Title = styled("div")(({ theme }) => ({
  ...theme.typography.h5,
  margin: theme.spacing(1),
}));

export const CompassBiasPanel: FC = () => {
  const arStarted = useAtomValue(arStartedAtom);
  const compassBias = useAtomValue(compassBiasAtom);
  useEffect(() => {
    if (!arStarted) { return; }
    updateCompassBias(compassBias);
  }, [compassBias]);

  return (
    <Root>
      <Title>コンパス設定</Title>
      <ParameterList>
        <SliderParameterItem
          label="コンパスバイアス"
          description="方位を微調整します。注目オブジェクトを選択してから使用してください。"
          min={-60}
          max={60}
          step={1}
          atom={compassBiasAtom}
        />
      </ParameterList>
    </Root>
  );
};
