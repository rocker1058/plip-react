import gql from 'graphql-tag'
import Fragment from './user.fragment'

export default gql`
	mutation createPlipUser($email: Email!, $access: AccessInput!) {
		User {
			registerPlipUser(email: $email, access: $access) {
				...UserProperties
			}
		}
	}
	${Fragment}
`