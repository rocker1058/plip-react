import gql from 'graphql-tag'
import Fragment from './user.fragment'

export default gql`
	mutation createUserInEstablishment($email: Email!) {
		User {
			createUser(email: $email) {
				...UserProperties
			}
		}
	}
	${Fragment}
`