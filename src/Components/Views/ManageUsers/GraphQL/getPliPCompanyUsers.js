import gql from 'graphql-tag'
import Fragment from './user.fragment'

export default gql`
	query queryUsers($filter: UserFilter, $token: ID, $limit: Int, $sortBy: String, $order: Order){
		User{
			plipUsers(filter: $filter, token: $token, limit: $limit, sortBy: $sortBy, order: $order){
				results{
					...UserProperties
				}
				token
			}
		}
	}
	${Fragment}
`