import gql from 'graphql-tag'

export default gql`
	query getCompany($id: ID!) {
		Company{
			company(id: $id){
				id
				name
				logo
			}
		}
	}
`
