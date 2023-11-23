import gql from 'graphql-tag'
import CompanyFragment from './company.fragment'

export default gql`
	query queryCompanies($token: ID, $filter: CompanyFilter, $limit: Int, $sortBy: String, $order: Order){
		Company{
			companies(token: $token, filter: $filter, limit: $limit, sortBy: $sortBy, order: $order){
				results{
					...CompanyProperties
				}
				token
			}
		}
	}
	${CompanyFragment}
`