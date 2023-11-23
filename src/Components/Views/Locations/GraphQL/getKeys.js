import gql from 'graphql-tag'
import Fragment from './key.fragment'

export default gql`
	query queryKeys($location: ID!, $token: ID, $limit: Int, $sortBy: String, $order: Order){
		Key{
			keys(filter: { location: $location }, token: $token, limit: $limit, sortBy: $sortBy, order: $order){
				results{
					...KeyProperties
				}
				token
			}
		}
	}
	${Fragment}
`