import gql from 'graphql-tag'

export default gql`
	fragment CompanyDetailProperties on Company {
		id
		legalName
		name
		document{
			type
			number
		}
		contact {
			name
			position
			email
			phone
			phoneDetail
		}
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
		addressDetail
		logo
		phone
		phoneDetail
		invoiceMeasurements {
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
		commercialData{
			year
			monthlyConsumption
			baseMeterPrice
			discounts
		}
	}
`
