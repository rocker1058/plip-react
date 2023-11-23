import gql from 'graphql-tag'
import InvoiceFragment from './invoice.fragment'

export default gql`
	query queryCompanies($token: ID, $filter: InvoiceFilter, $limit: Int){
		Invoice{
			getInvoices(token: $token, filter: $filter, limit: $limit){
				results{
					...InvoiceProperties
				}
				token
				total
			}
		}
	}
	${InvoiceFragment}
`