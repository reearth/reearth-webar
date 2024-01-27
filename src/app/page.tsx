import Script from "next/script"
import ARView from "./ARView"
import { ThemeProvider } from "@mui/material"
import { AppBar, darkTheme } from "./components/prototypes/ui-components"

export default function Home() {
  return (
    <ThemeProvider theme={darkTheme}>
      <main>
        <Script src="https://cesium.com/downloads/cesiumjs/releases/1.107.1/Build/Cesium/Cesium.js" />
        <AppBar></AppBar>
        <ARView />
        <Script src="/ar.js" />
      </main>
    </ThemeProvider>
  )
}
