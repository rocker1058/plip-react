import gql from 'graphql-tag'
import Fragment from './location.fragment'

export default gql`
	query locationQuery($id: ID!) {
		Location {
			location(id: $id){
				...LocationProperties
			}
		}
	}
	${Fragment}
`