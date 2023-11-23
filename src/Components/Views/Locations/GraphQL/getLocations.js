import gql from 'graphql-tag'
import LocationFragment from './location.fragment'

export default gql`
	query queryLocations($businessLine: ID, $filter: LocationFilter, $token: ID, $limit: Int, $sortBy: String, $order: Order){
		Location{
			locations(businessLine: $businessLine, filter: $filter token: $token, limit: $limit, sortBy: $sortBy, order: $order){
				results{
					...LocationProperties
				}
				token
			}
		}
	}
	${LocationFragment}
`