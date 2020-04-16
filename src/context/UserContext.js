import React, { createContext, Component } from 'react';
import { saveToken, isLogged, getToken, removeUser } from '../lib/auth'
import { userProfile } from '../lib/api'
import { networkError, dangerNotification } from '../lib/notifications' 

export const UserContext = createContext();

export class UserProvider extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isLoggedIn: false,
      token: null,
      user: {
        uuid: null
      }
    }
  }

  componentDidMount(){
    if(isLogged()){
      userProfile()
      .then((response) => {
        if (response.data.result === true) {
          this.setState({ user: response.data.user })
        } else {
          dangerNotification('Session expired', 'Please login again')
          removeUser()
        }
      }).catch(() => {
        // Notify user if network error
        networkError()
      });

      this.loginUser(getToken('userToken'), getToken('userUuid'))      
    }
  }

  loginUser = (token, user) => {
    this.setState({ isLoggedIn: true, token: token, user: user })
    // Cookie management 
    saveToken('userToken', token)
    saveToken('userUuid', user)
  }

  render() {
    return (
      <UserContext.Provider value={{ state: this.state, actions: { loginUser: this.loginUser }}}>
        {this.props.children}
      </UserContext.Provider>
    )
  }
}

export function withUserContext(Component) {
  class ComponentWithContext extends React.Component {
    render() {
      return (
        <UserContext.Consumer>
          {(value) => <Component {...this.props} userProvider={{...value}} />}
        </UserContext.Consumer>
      )
    }
  }

  return ComponentWithContext
}