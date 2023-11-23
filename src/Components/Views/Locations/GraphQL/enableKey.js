import gql from 'graphql-tag'
import Fragment from './key.fragment'

export default gql`
	mutation enableKeyMutation($id: ID!){
		Key{
			enableKey(id: $id){
				...KeyProperties
			}
		}
	}
	${Fragment}
`