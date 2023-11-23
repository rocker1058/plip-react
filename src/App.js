import React from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { createStore } from 'redux'
import { Provider } from 'react-redux'

import { ApolloProvider } from 'react-apollo'
import { ApolloClient, InMemoryCache } from 'apollo-boost'
import { createUploadLink } from 'apollo-upload-client'
import { BatchHttpLink } from 'apollo-link-batch-http'
import { setContext } from 'apollo-link-context'
import 'moment/locale/es'
import 'notyf/notyf.min.css'

import Reducers from './Redux/Reducers'
import { getLoggedUser } from './Components/Common'
import Main from './Components/Main'

function App() {
	const batchLink = new BatchHttpLink({
		includeExtensions: true,
		uri: `${process.env.REACT_APP_GATEWAY}/graphql`,
		batchInterval: 100,
		batchMax: 10,
	})
	const uploadLink = createUploadLink({
		includeExtensions: true,
		uri: `${process.env.REACT_APP_GATEWAY}/graphql`,
	})
	const authLink = setContext((_, { headers }) => getLoggedUser()
		.then((user) => {
			if (user) {
				return {
					headers: {
						...headers,
						authorization: `Bearer ${user.token.jwtToken}`,
					},
				}
			}
			return {
				headers: {
					...headers,
				},
			}
		}))
	const client = new ApolloClient({
		link: authLink.split((operation) => operation.getContext().upload,
			uploadLink,
			batchLink,
		),
		cache: new InMemoryCache(),
		defaultOptions: {
			watchQuery: {
				fetchPolicy: 'cache-and-network',
			},
		},
	})
	const store = createStore(Reducers, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())
	
	return (
		<ApolloProvider client={client}>
			<Provider store={store}>
				<BrowserRouter>
					<Switch>
						<Route path='/' component={Main} />
					</Switch>
				</BrowserRouter>
			</Provider>
		</ApolloProvider>
	)
}

export default App
