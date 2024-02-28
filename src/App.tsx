import { ThemeProvider } from "@mui/material";
import { darkTheme } from "./components/prototypes/ui-components";
import { AppHeader } from "./components/prototypes/view/ui-containers/AppHeader";
import ARView from "./ARView";
import { Provider } from "jotai";
import { ApolloProvider } from "@apollo/client";
import { createCatalogClient } from "./components/shared/graphql/clients";

function App() {
  const url = 'https://api.plateau.reearth.io/datacatalog/graphql';

  return (
    <ApolloProvider client={createCatalogClient(url)}>
      <ThemeProvider theme={darkTheme}>
        <main className="flex flex-col">
          <Provider>
            <AppHeader />
            <ARView className="relative w-screen h-full" />
          </Provider>
        </main>
      </ThemeProvider>
    </ApolloProvider>
  )
}

export default App
