import gql from 'graphql-tag'

export default gql`
	mutation deleteCompany($id: ID!){
		Company{
			deleteCompany(id: $id)
		}
	}`