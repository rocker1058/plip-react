import gql from 'graphql-tag'

export default gql`
	mutation deleteRol($id: ID!){
		Access{
    		deleteRole(id: $id)
  		}
	}
`