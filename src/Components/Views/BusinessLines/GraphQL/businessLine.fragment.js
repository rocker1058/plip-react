import gql from 'graphql-tag'

export default gql`
	fragment BusinessLineProperties on BusinessLine {
		id
		name
		logo
		contact {
			name
			position
			email
			phone
		}
		locationQuantity
		invoiceMeasurements {
			companyDependant
			measurements {
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
		createdAt
	}
`
