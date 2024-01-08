import Script from "next/script"
import ARView from "./ARView"

export default function Home() {
  return (
    <main>
      <Script src="https://cesium.com/downloads/cesiumjs/releases/1.107.1/Build/Cesium/Cesium.js" />
      <ARView />
      <Script src="/ar.js" />
    </main>
  )
}
