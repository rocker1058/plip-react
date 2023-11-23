import gql from 'graphql-tag'

export default gql`
	mutation deleteBusinessLineMutation($id: ID!){
		BusinessLine{
			deleteBusinessLine(id: $id)
		}
	}`