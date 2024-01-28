import { ThemeProvider } from "@mui/material"
import { darkTheme } from "./components/prototypes/ui-components"
import { AppHeader } from "./components/prototypes/view/ui-containers/AppHeader"
import ARView from "./ARView"

export default function Home() {
  return (
    <ThemeProvider theme={darkTheme}>
      <main className="flex flex-col">
        <AppHeader />
        <ARView className="relative w-screen h-full" />
      </main>
    </ThemeProvider>
  )
}
