import numeral from 'numeral'

numeral.register('locale', 'es', {
	delimiters: {
		thousands: '.',
		decimal: ',',
	},
	abbreviations: {
		thousand: 'k',
		million: 'm',
		billion: 'b',
		trillion: 't',
	},
	currency: {
		symbol: '$',
	},
})

numeral.locale('es')

export default {
	formatLength: (valueInCm) => {
		if (valueInCm < 100) {
			return { number: numeral(valueInCm).format('0,0[.]00'), unit: 'cm' }
		}
		else if (valueInCm >= 100 && valueInCm < 100000) {
			return { number: numeral(valueInCm / 100).format('0,0[.]00'), unit: 'm' }
		}
		return { number: numeral(valueInCm / 100000).format('0,0[.]00'), unit: 'km' }
	},

	formatInvoiceArea: (lengthInCm) => {
		const area = lengthInCm * 8
		if (area < 10000) {
			return { number: numeral(area).format('0,0[.]00'), unit: 'cm' }
		}
		else if (area >= 10000 && area < 10000000000) {
			return { number: numeral(area / 10000).format('0,[.]00'), unit: 'm' }
		}
		return { number: numeral(area / 10000000000).format('0,0[.]00'), unit: 'km' }
	},
}
