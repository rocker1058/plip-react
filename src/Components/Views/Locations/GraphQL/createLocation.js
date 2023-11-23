import gql from 'graphql-tag'
import Fragment from './location.fragment'

export default gql`
	mutation createLocation($company: ID!, $location: LocationInput!) {
		Location{
			createLocation(
				company: $company,
				location: $location
			){
				...LocationProperties
			}
		}
	}
	${Fragment}
`