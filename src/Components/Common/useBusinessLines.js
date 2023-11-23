import { useQuery } from 'react-apollo'
import gql from 'graphql-tag'

const GET_BUSINESS_LINES = gql`
	query getBusinessLines($company: ID!) {
		Company{
			company(id: $company){
				id
				businessLines(limit: 1000, sortBy: "name", order: Ascending) {
					results {
						id
						name
					}
				}
			}
		}
	}
`

function useBusinessLines(company){
	const { data } = useQuery(GET_BUSINESS_LINES, {
		variables: { company }, skip: !company,
	})
	return data ? data.Company.company.businessLines.results : []
}

export default useBusinessLines