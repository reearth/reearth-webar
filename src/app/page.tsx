"use client";

import Script from "next/script"
import { ThemeProvider } from "@mui/material"
import { darkTheme } from "./components/prototypes/ui-components"
import { AppHeader } from "./components/prototypes/view/ui-containers/AppHeader"
import ARView from "./ARView"
import { Provider } from "jotai"

export default function Home() {
  return (
    <ThemeProvider theme={darkTheme}>
      <main className="flex flex-col">
        <Provider>
          <Script src="https://cesium.com/downloads/cesiumjs/releases/1.114/Build/Cesium/Cesium.js" />
          <AppHeader />
          <ARView className="relative w-screen h-full" />
        </Provider>
      </main>
    </ThemeProvider>
  )
}
