import gql from 'graphql-tag'
import Fragment from './key.fragment'

export default gql`
	mutation disableKeyMutation($id: ID!){
		Key{
			disableKey(id: $id){
				...KeyProperties
			}
		}
	}
	${Fragment}
`
