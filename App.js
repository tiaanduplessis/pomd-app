import React, { Component } from 'react'
import { Font, AppLoading } from 'expo'

import Main from './src/ main'

export default class App extends Component {
  state = {
    fontLoaded: false
  };

  async componentDidMount () {
    await Font.loadAsync({
      'oxygen': require('./assets/fonts/Oxygen-Regular.ttf')
    })

    this.setState({ fontLoaded: true })
  }

  render () {
    const { fontLoaded } = this.state

    if (!fontLoaded) {
      return <AppLoading />
    }

    return <Main />
  }
}
