import React, { Component } from 'react'
import {
  StyleSheet,
  Text
} from 'react-native'

import Bouncy from 'react-native-bouncy-touchable'

export default class Button extends Component {
  render () {
    const { onPress, children } = this.props

    return (
      <Bouncy delay={60} style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>
          {children}
        </Text>
      </Bouncy>
    )
  }
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4C4747',
    borderRadius: 3,
    paddingHorizontal: 30,
    paddingVertical: 15,
    marginHorizontal: 10
  },
  buttonText: {
    fontFamily: 'oxygen',
    fontWeight: '200',
    color: '#fff',
    fontSize: 25
  }
})
