import gql from 'graphql-tag'

export default gql`
	mutation cancelInvoice($id: ID!) {
		Invoice{
			cancelInvoice(invoice: $id)
		}
	}
`