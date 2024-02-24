import { ThemeProvider } from "@mui/material"
import { darkTheme } from "./components/prototypes/ui-components"
import { AppHeader } from "./components/prototypes/view/ui-containers/AppHeader"
import ARView from "./ARView"
import { Provider } from "jotai"
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: 'https://api.plateau.reearth.io/datacatalog/graphql',
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <main className="flex flex-col">
        <Provider>
          <ApolloProvider client={client}>
            <AppHeader />
            <ARView className="relative w-screen h-full" />
          </ApolloProvider>
        </Provider>
      </main>
    </ThemeProvider>
  )
}

export default App
