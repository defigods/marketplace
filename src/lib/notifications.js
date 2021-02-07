import { store } from 'react-notifications-component'

export function networkError() {
  store.addNotification({
    title: 'Connection error',
    message: 'Check your internet connection or try again later',
    type: 'danger',
    insert: 'top',
    container: 'top-right',
    animationIn: ['animated', 'fadeIn'],
    animationOut: ['animated', 'fadeOut'],
    showIcon: true,
    dismiss: {
      duration: 5000,
    },
  })
}

export function warningNotification(title, message, duration = 5000) {
  store.addNotification({
    title: title,
    message: message,
    type: 'warning',
    insert: 'top',
    container: 'top-right',
    animationIn: ['animated', 'fadeIn'],
    animationOut: ['animated', 'fadeOut'],
    showIcon: true,
    dismiss: {
      duration: duration,
    },
  })
}

export function dangerNotification(title, message) {
  store.addNotification({
    title: title,
    message: message,
    type: 'danger',
    insert: 'top',
    container: 'top-right',
    animationIn: ['animated', 'fadeIn'],
    animationOut: ['animated', 'fadeOut'],
    showIcon: true,
    dismiss: {
      duration: 5000,
    },
  })
}

export function successNotification(title, message) {
  store.addNotification({
    title: title,
    message: message,
    type: 'success',
    insert: 'top',
    container: 'top-right',
    animationIn: ['animated', 'fadeIn'],
    animationOut: ['animated', 'fadeOut'],
    showIcon: true,
    dismiss: {
      duration: 5000,
    },
  })
}
