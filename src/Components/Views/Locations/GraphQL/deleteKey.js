import gql from 'graphql-tag'

export default gql`
	mutation deleteKeyMutation($id: ID!){
		Key{
			deleteKey(id: $id)
		}
	}`