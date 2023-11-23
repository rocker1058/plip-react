import gql from 'graphql-tag'
import Fragment from './role.fragment'

export default gql`
	query queryRoles($filter: RoleFilter, $token: ID, $limit: Int, $sortBy: String, $order: Order){
		Access{
			roles(filter: $filter, token: $token, limit: $limit, sortBy: $sortBy, order: $order) {
				results {
					...RoleProperties
       			}
      			token
      		}
    	}
	}
	${Fragment}
`
