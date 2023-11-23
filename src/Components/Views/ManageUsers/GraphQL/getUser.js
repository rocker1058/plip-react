import gql from 'graphql-tag'
import Fragment from './user.fragment'

export default gql`
	query queryUser($id: ID!){
		User{
			user(id: $id){
				...UserProperties
			}
		}
	}
	${Fragment}
`