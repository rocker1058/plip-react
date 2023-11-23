import gql from 'graphql-tag'
import Fragment from './access.fragment'

export default gql`
	mutation toggleAccess($id: ID!) {
		Access {
			toggleAccess(id: $id) {
				...AccessProperties
			}
		}
	}
	${Fragment}
`