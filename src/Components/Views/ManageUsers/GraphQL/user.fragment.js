import gql from 'graphql-tag'
import AccessFragment from './access.fragment'

export default gql`
	fragment UserProperties on User {
		id
		email
		name
		lastName
		phoneNumber
		enabled
		accesses {
			...AccessProperties
		}
	}
	${AccessFragment}
`