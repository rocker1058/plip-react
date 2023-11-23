import gql from 'graphql-tag'

export default gql`
	fragment LocationProperties on Location {
		id
		name
		phone
		phoneDetail
		locationDetail
		address{
			country
			region
			city
			address
			tags
			coordinates {
				latitude
				longitude
			}
		}
		tags
		contact{
			name
			position
			email
			phone
			notification
		}
		invoiceMeasurements{
			businessLineDependant
			measurements{
				year
				baseMeasurement
				lineMeasurement
				paperType
				invoicingCompany
				bigHeadMeasurement
				dataInvoiceMeasurement
				productMeasurement
				wayPayMeasurement
				additionalInformationMeasurement
				codeQrMeasurement
				codeBarsMeasurement
				footerMeasurement
			}
		}
		businessLine {
			id
			name
		}
	}
`