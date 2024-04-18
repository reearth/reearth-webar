import { Cesium3DTileset } from "cesium";

export type LoadedTileset = {
    id: string;
    url: string;
    primitive: Cesium3DTileset;
}