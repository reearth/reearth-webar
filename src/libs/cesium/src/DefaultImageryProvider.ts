import { ImageryProviderBase } from '../../cesium-helpers/src'

export class DefaultImageryProvider extends ImageryProviderBase {
  readonly ready = false
  readonly readyPromise = Promise.resolve(false)
  readonly tileWidth = 0
  readonly tileHeight = 0
}
