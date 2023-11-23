import gql from 'graphql-tag'
import Fragment from './user.fragment'

export default gql`
	query queryUsers($company: ID!){
		User{
			users(filter: { company: $company }){
				results{
					...UserProperties
				}
				token
			}
		}
	}
	${Fragment}
`