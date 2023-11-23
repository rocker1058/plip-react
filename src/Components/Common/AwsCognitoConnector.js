import Amplify from 'aws-amplify'


Amplify.configure({
	Auth: {
		region: 'us-east-1',
		userPoolId: process.env.REACT_APP_AWS_COGNITO_POOLID,
		userPoolWebClientId: process.env.REACT_APP_AWS_COGNITO_CLIENTID,
		oauth: {
			domain: process.env.REACT_APP_COGNITO_DOMAIN,
			scope: [ 'openid', 'email', 'profile', 'phone' ],
			redirectSignIn: process.env.REACT_APP_REDIRECT,
			redirectSignOut: process.env.REACT_APP_REDIRECT,
			responseType: 'code',
		},
	},
})

const signIn = (username, password) => {
	return Amplify.Auth.signIn(username, password)
		.then((user) => {
			if (user.challengeName === 'SMS_MFA' || user.challengeName === 'SOFTWARE_TOKEN_MFA') {
				return {
					type: 'MFA',
				}
			}
			else if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
				const { requiredAttributes } = user.challengeParam
				return {
					type: 'NewPasswordRequired',
					result: {
						required_attributes: requiredAttributes,
						user,
					},
				}
			}
			else if (user.challengeName === 'MFA_SETUP') {
				// This happens when the MFA method is TOTP
				// The user needs to setup the TOTP before using it
				// More info please check the Enabling MFA part
				return {
					type: 'TOTP',
				}
			}
			return { type: 'Success', user }
		})
		.catch((e) => {
			if (e.code === 'UserNotConfirmedException') {
				return { type: 'UserNotConfirmed' }
			}
			throw e
		})
}

const confirmInvite = (username, password, newPassword, attributes={}) => {
	return Amplify.Auth.signIn(username, password)
		.then((user) => {
			if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
				return Amplify.Auth.completeNewPassword(user, newPassword, attributes)
			}
			throw new Error('User is in wrong state')
		})
		.catch((e) => {
			if (e.code === 'UserNotConfirmedException') {
				return { type: 'UserNotConfirmed' }
			}
			throw e
		})
}

const signOut = () => {
	return Amplify.Auth.signOut()
}

const getLoggedUser = () => {
	return Amplify.Auth.currentAuthenticatedUser({ bypassCache: false })
		.then((user) => {
			return Amplify.Auth.currentSession()
				.then(async (data) => {
					const { accessToken } = data
					return {
						cognitoUser: user,
						token: accessToken,
					}
				})
		})
		.catch(() => null)
}

const updateAttributes = async (attributes) => {
	const user = await Amplify.Auth.currentAuthenticatedUser()
	return Amplify.Auth.updateUserAttributes(user, attributes)
		.then(() => Amplify.Auth.currentAuthenticatedUser({ bypassCache: true }))
}

const sendVerificationCode = (email) => Amplify.Auth.forgotPassword(email)

const forgotPasswordConfirmation = (username, code, newPassword) => Amplify.Auth.forgotPasswordSubmit(username, code, newPassword)

const resetPassword = async (oldPassword, newPassword) => {
	const user = await Amplify.Auth.currentAuthenticatedUser()
	return Amplify.Auth.changePassword(user, oldPassword, newPassword)
}

export { signIn, confirmInvite, signOut, getLoggedUser, updateAttributes, sendVerificationCode, forgotPasswordConfirmation, resetPassword }
