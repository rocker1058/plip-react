import gql from 'graphql-tag'
import Fragment from './key.fragment'

export default gql`
	query queryKey($id: ID!){
		Key{
			key(id: $id){
				...KeyProperties
			}
		}
	}
	${Fragment}
`