import { isNumber } from "class-validator";
import { atomWithStorageValidation, type AtomValue } from "../../shared-states";

export const compassBiasAtom = atomWithStorageValidation({
  key: "compassBias",
  initialValue: 0,
  validate: isNumber,
});

export const fovPiOverAtom = atomWithStorageValidation({
  key: "fovPiOver",
  initialValue: 1,
  validate: isNumber,
});