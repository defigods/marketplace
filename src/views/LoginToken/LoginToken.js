import React, { useEffect, useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import Backdrop from '@material-ui/core/Backdrop'
import CircularProgress from '@material-ui/core/CircularProgress'
import Snackbar from '@material-ui/core/Snackbar'
import MuiAlert from '@material-ui/lab/Alert'
import { signInToken } from 'lib/api'
import { withUserContext } from 'context/UserContext'
import { withWeb3Context } from 'context/Web3Context'

function LoginToken (props) {
	const [loading, setLoading] = useState(true)
	const { token: loginToken } = useParams()
	const history = useHistory()

	useEffect(() => {
		signInToken(loginToken).then((response) => {
			if (response.data.result) {
				// Save data in store
        props.userProvider.actions.loginUser(response.data.token, response.data.user)
				props.web3Provider.actions.setGasLandCost(response.data.gas.landGasCost)
				history.push('/')
			} else {
				setLoading(false)
			}
		}).catch((err) => {
			setLoading(false)
		})
	}, [])

	return (
		<>
			<Backdrop style={{ zIndex: 2000 }} open={loading}>
				<CircularProgress color="inherit" />
			</Backdrop>
			<Snackbar open={!loading}>
				<MuiAlert severity="error" elevation={6} variant="filled">
					Token not valid. Retry.
				</MuiAlert>
			</Snackbar>
		</>
	)
}

export default withWeb3Context(withUserContext(LoginToken))