import React, { createContext, Component } from 'react';
import { saveToken, isLogged, getToken } from '../lib/auth'
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
    console.log('montatoProvider')
    if(isLogged()){
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