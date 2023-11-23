import gql from 'graphql-tag'
import Fragment from './user.fragment'

export default gql`
	mutation updateUserAccess($user: ID!, $type: AccessTypeEnum!, $access: AccessInput!){
		Access {
			assignAccessToUser(user: $user, type: $type, access: $access){
				...UserProperties
			}
		}
	}
	${Fragment}
`