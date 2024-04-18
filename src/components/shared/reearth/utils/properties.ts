import { Cesium3DTileset } from "cesium";

export class Properties {
  private _layer: Cesium3DTileset;
  private _cachedProperties?: any;

  constructor(layer: Cesium3DTileset) {
    this._layer = layer;
  }

  get value() {
    if (this._cachedProperties) {
      return this._cachedProperties;
    }

    const properties = this._layer.properties;
    this._cachedProperties = properties;

    return this._cachedProperties;
  }
}
