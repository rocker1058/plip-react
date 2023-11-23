import gql from 'graphql-tag'

export default gql`
	mutation deleteAccess($id: ID!){
		Access{
    		deleteAccess(id: $id)
  		}
	}
`