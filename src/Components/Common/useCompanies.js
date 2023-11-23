import { useQuery } from 'react-apollo'
import gql from 'graphql-tag'

const GET_COMPANIES = gql`
	query getCompanies {
		Company{
			companies(limit: 1000, sortBy: "name", order: Ascending){
				results{
					id
					name
				}
			}
		}
	}
`

function useCompanies(){
	const { data } = useQuery(GET_COMPANIES)
	return data ? data.Company.companies.results : []
}

export default useCompanies