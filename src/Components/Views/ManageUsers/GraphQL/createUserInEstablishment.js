import gql from 'graphql-tag'
import Fragment from './user.fragment'

export default gql`
	mutation createUserInEstablishment($email: Email!, $access: AccessInput!) {
		User {
			registerEstablishmentUser(email: $email, access: $access) {
				...UserProperties
			}
		}
	}
	${Fragment}
`