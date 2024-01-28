import Script from "next/script"
import ARView from "./ARView"
import { ThemeProvider } from "@mui/material"
import { darkTheme } from "./components/prototypes/ui-components"
import { AppHeader } from "./components/prototypes/view/ui-containers/AppHeader"

export default function Home() {
  return (
    <ThemeProvider theme={darkTheme}>
      <main className="flex flex-col">
        <Script src="https://cesium.com/downloads/cesiumjs/releases/1.107.1/Build/Cesium/Cesium.js" />
        <AppHeader />
        <ARView className="relative w-screen h-full" />
        <Script src="/ar.js" />
      </main>
    </ThemeProvider>
  )
}
