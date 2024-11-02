import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material";
import { AppFrame, darkTheme } from "./components/prototypes/ui-components";
import { AppHeader } from "./components/prototypes/view/ui-containers/AppHeader";
import ARView from "./ARView";
import AROverlayView from "./AROverlayView";
import { Provider } from "jotai";
import { ApolloProvider } from "@apollo/client";
import { createCatalogClient, createGeoClient } from "./components/shared/graphql/clients";
import DatasetSyncer from "./DatasetSyncer";
import { SelectionCoordinator } from "./components/prototypes/view/containers/SelectionCoordinator";

function App() {
  const catalogUrl = 'https://api.plateau.reearth.io/datacatalog/graphql';
  const catalogClient = createCatalogClient(catalogUrl);

  const url = new URL(decodeURIComponent(document.location.href));
  const auth = url.searchParams.get("auth");
  const catalogAdminUrl = 'https://api.plateau.reearth.io/datacatalog/admin/graphql';
  const catalogAdminClient = auth ? createCatalogClient(catalogAdminUrl, auth) : null;

  const geoUrl = 'https://geo.plateau.reearth.io/';
  const geoClient = createGeoClient(geoUrl);

  return (
    <BrowserRouter>
      <ApolloProvider client={catalogAdminClient ?? catalogClient}>
        <ApolloProvider client={geoClient}>
          <ThemeProvider theme={darkTheme}>
            <main className="flex flex-col">
              <Provider>
                <AppFrame header={<AppHeader />}>
                  <DatasetSyncer className="hidden" />
                  <ARView className="relative w-full h-full" />
                  <AROverlayView />
                  <SelectionCoordinator />
                </AppFrame>
              </Provider>
            </main>
          </ThemeProvider>
        </ApolloProvider>
      </ApolloProvider>
    </BrowserRouter>
  )
}

export default App
