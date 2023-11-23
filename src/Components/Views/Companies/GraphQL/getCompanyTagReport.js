import gql from 'graphql-tag'

export default gql`
	query queryInvoice($company: ID!, $from: DateTime, $to: DateTime){
		Invoice{
			companyReport(company: $company, from: $from, to: $to){
				data {
					id
					paperSaved
					totalInvoices
				}
				totals {
					totalInvoices
					paperSaved
				}
			}
		}
	}
`