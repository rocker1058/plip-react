import gql from 'graphql-tag'
import Fragment from './location.fragment'

export default gql`
	mutation updateLocation($id: ID!, $location: LocationUpdate!) {
		Location{
			updateLocation(id: $id, location: $location){
				...LocationProperties
			}
		}
	}
	${Fragment}
`