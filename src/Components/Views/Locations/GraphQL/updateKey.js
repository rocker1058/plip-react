import gql from 'graphql-tag'
import Fragment from './key.fragment'

export default gql`
	mutation updateKey($id: ID!, $key: KeyUpdate!) {
		Key{
			updateKey(id: $id, key: $key){
				...KeyProperties
			}
		}
	}
	${Fragment}
`