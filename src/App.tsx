import { ThemeProvider } from "@mui/material";
import { darkTheme } from "./components/prototypes/ui-components";
import { AppHeader } from "./components/prototypes/view/ui-containers/AppHeader";
import ARView from "./ARView";
import { Provider } from "jotai";
import { ApolloProvider } from "@apollo/client";
import { createCatalogClient } from "./components/shared/graphql/clients";

function App() {
  const catalogUrl = 'https://api.plateau.reearth.io/datacatalog/graphql';
  const geoUrl = 'https://api.plateau.reearth.io/geo/graphql';

  return (
    <ApolloProvider client={createCatalogClient(catalogUrl)}>
      <ApolloProvider client={createCatalogClient(geoUrl)}>
        <ThemeProvider theme={darkTheme}>
          <main className="flex flex-col">
            <Provider>
              <AppHeader />
              <ARView className="relative w-screen h-full" />
            </Provider>
          </main>
        </ThemeProvider>
      </ApolloProvider>
    </ApolloProvider>
  )
}

export default App
