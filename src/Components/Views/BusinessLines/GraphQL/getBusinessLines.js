import gql from 'graphql-tag'
import BusinessLineFragment from './businessLine.fragment'

export default gql`
	query queryBusinessLines($company: ID!, $filter: BusinessLineFilter, $token: ID, $limit: Int, $sortBy: String, $order: Order){
		BusinessLine{
			businessLines(company: $company, filter: $filter, token: $token, limit: $limit, sortBy: $sortBy, order: $order){
				results{
					...BusinessLineProperties
				}
				token
			}
		}
	}
	${BusinessLineFragment}
`