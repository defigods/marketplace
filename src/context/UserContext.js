import React, { createContext, Component } from 'react';

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

  loginUser = (token, user) => {
    this.setState({ isLoggedIn: true, token: token, user: user })
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
          {(value) => <Component {...this.props} mapProvider={value} />}
        </UserContext.Consumer>
      )
    }
  }

  return ComponentWithContext
}