import React, { createContext, Component } from 'react';
import { saveToken, isLogged, getToken, removeUser } from '../lib/auth'
import { userProfile } from '../lib/api'
import { networkError, dangerNotification } from '../lib/notifications' 
import config from '../lib/config'
let ActionCable = require('actioncable')

export const UserContext = createContext();

export class UserProvider extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isLoggedIn: false,
      showNotificationCenter: false,
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
          this.liveSocket()
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
    this.liveSocket()
  }

  liveSocket = () => {
    console.log('live sockets', this.state.user.uuid)
    // Sockets
    var cable = ActionCable.createConsumer(config.apis.socket)

    cable.subscriptions.create(
      { channel: "UsersChannel", user_uuid: this.state.user.uuid},
      {
        received: data => {
          const { notification } = data
          const { balance } = data
          const { unreaded_count } = data

          this.setState({
            user: {
              ...this.state.user, 
              balance: balance, 
              notifications: { 
                ...this.state.user.notifications,
                unreadedCount: unreaded_count,
                content: [notification, ...this.state.user.notifications.content] }}
          });
        }
      }
    );
  }

  toggleShowNotificationCenter = () => {
    this.setState({ showNotificationCenter: !this.state.showNotificationCenter });
  }


  render() {
    return (
      <UserContext.Provider value={{ state: this.state, actions: { loginUser: this.loginUser, toggleShowNotificationCenter: this.toggleShowNotificationCenter }}}>
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