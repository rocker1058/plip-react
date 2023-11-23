import { useQuery } from 'react-apollo'
import gql from 'graphql-tag'

const GET_BUSINESSLINE = gql`
	query getBusinessLine($businessLine: ID!) {
		BusinessLine{
			businessLine(id: $businessLine){
				id
				locations(limit: 1000, sortBy: "name", order: Ascending) {
					results {
						id
						name
					}
				}
			}
		}
	}
`

function useLocations(businessLine){
	const { data } = useQuery(GET_BUSINESSLINE, {
		variables: { businessLine }, skip: !businessLine,
	})
	return data ? data.BusinessLine.businessLine.locations.results : []
}

export default useLocations