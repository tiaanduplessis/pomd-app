import React, { Component } from 'react'
import { Animated, View, Text, StyleSheet, SafeAreaView } from 'react-native'
import { Notifications } from 'expo'

import padNum from '../utils/pad-num'
import { ONE_SECOND, COUNTDOWN_STATES } from '../utils/constants'
import Button from '../components/Button'

export default class Counter extends Component {
    state = {
      backgroundColor: new Animated.Value(0),
      countdownState: COUNTDOWN_STATES.idle,
      lastTick: null,
      endTime: null
    };

    render () {
      let backgroundColor = this.state.backgroundColor.interpolate({
        inputRange: [0, 1, 2],
        outputRange: ['#A03538', '#CA4343', '#20A64C']
      })

      return (
        <SafeAreaView style={[styles.container, { backgroundColor: '#A03538' }]}>
          <Animated.View style={[styles.container, { backgroundColor }]}>
            <View style={styles.contentContainer}>
              {this._renderTimeRemaining()}
            </View>
            {this._renderButtons()}
          </Animated.View>
        </SafeAreaView>
      )
    }

    _renderTimeRemaining () {
      let { endTime, lastTick } = this.state
      let minutesRemaining
      let secondsRemaining

      if (endTime && lastTick) {
        minutesRemaining = Math.floor((endTime - lastTick) / 1000 / 60)
        secondsRemaining = Math.round(
          (endTime - lastTick) / 1000 - minutesRemaining * 60
        )
      } else if (this.state.countdownState === 'idle' && !endTime && !lastTick) {
        minutesRemaining = Math.floor(this.props.workDuration)
        secondsRemaining = Math.round(
          (this.props.workDuration - minutesRemaining) * 60
        )
      } else {
        console.log({ error: true, endTime, lastTick })
      }

      return (
        <Text style={styles.countdown}>
          {`${padNum(minutesRemaining, 2)}:${padNum(secondsRemaining, 2)}`}
        </Text>
      )
    }

    _renderButtons () {
      let { countdownState } = this.state

      if (countdownState === COUNTDOWN_STATES.idle) {
        return (
          <View style={styles.buttonContainer}>
            <Button
              onPress={() => {
                this._startTimer()
              }}>
              Let's Go
            </Button>
          </View>
        )
      } else if (countdownState === COUNTDOWN_STATES.active) {
        return (
          <View style={styles.buttonContainer}>
            <Button
              onPress={() => {
                this._pauseTimer()
              }}>
              Pause
            </Button>
            <Button
              onPress={() => {
                this._stopTimer(true)
              }}>
              Stop
            </Button>
          </View>
        )
      } else if (countdownState === COUNTDOWN_STATES.paused) {
        return (
          <View style={styles.buttonContainer}>
            <Button
              onPress={() => {
                this._startTimer()
              }}>
              Let's Go
            </Button>
            <Button
              onPress={() => {
                this._stopTimer(true)
              }}>
              Stop
            </Button>
          </View>
        )
      } else if (countdownState === COUNTDOWN_STATES.break) {
        return (
          <View style={styles.buttonContainer}>
            <Button
              onPress={() => {
                this._startTimer()
              }}>
              Skip break
            </Button>
          </View>
        )
      }
    }

    _pauseTimer () {
      this.setState({ countdownState: 'paused' }, () => {
        Animated.spring(this.state.backgroundColor, { toValue: 0.5 }).start()

        clearInterval(this._timer)
        this._timer = null

        if (this._notificationId) {
          Notifications.cancelScheduledNotificationAsync(this._notificationId)
        }
      })
    }

    _stopTimer (cancelNotification = false) {
      this.setState(
        { countdownState: 'idle', lastTick: null, endTime: null },
        () => {
          Animated.spring(this.state.backgroundColor, { toValue: 0 }).start()
          clearInterval(this._timer)
          this._timer = null

          if (cancelNotification && this._notificationId) {
            Notifications.cancelScheduledNotificationAsync(this._notificationId)
            this._notificationId = null
          }
        }
      )
    }

    _startTimer () {
      let { workDuration } = this.props
      clearInterval(this._timer)

      let currentTime = new Date().getTime()
      let endTime

      if (
        this.state.countdownState === 'paused' &&
        this.state.lastTick &&
        this.state.endTime
      ) {
        let timeIdle = currentTime - this.state.lastTick
        endTime = this.state.endTime + timeIdle
      } else {
        endTime = currentTime + workDuration * 60 * 1000
      }

      this.setState(
        { countdownState: 'active', endTime, lastTick: currentTime },
        async () => {
          Animated.spring(this.state.backgroundColor, { toValue: 1 }).start()

          // Schedule notification
          this._notificationId = await Notifications.scheduleLocalNotificationAsync(
            {
              title: 'Pomdoro completed!',
              body: 'Time to take a break...',
              ios: {
                sound: true
              },
              android: {
                vibrate: true
              }
            },
            {
              time: endTime
            }
          )

          this._timer = setInterval(
            () => {
              let lastTick = new Date().getTime()
              if (lastTick > endTime) {
                this._startBreak()
              } else {
                this.setState({ lastTick })
              }
            },
            ONE_SECOND
          )
        }
      )
    }

    _startBreak () {
      let { breakDuration } = this.props
      clearInterval(this._timer)

      let currentTime = new Date().getTime()
      let endTime = currentTime + breakDuration * 60 * 1000

      this.setState(
        { countdownState: 'break', endTime, lastTick: currentTime },
        async () => {
          Animated.spring(this.state.backgroundColor, { toValue: 2 }).start()

          // Schedule notification
          this._notificationId = await Notifications.scheduleLocalNotificationAsync(
            {
              title: 'Break is over!',
              body: 'Ready to start another Pomodoro?',
              ios: {
                sound: true
              },
              android: {
                vibrate: true
              }
            },
            {
              time: endTime
            }
          )

          // Start ticker
          this._timer = setInterval(
            () => {
              let lastTick = new Date().getTime()
              if (lastTick > endTime) {
                this._startTimer()
              } else {
                this.setState({ lastTick })
              }
            },
            ONE_SECOND
          )
        }
      )
    }
}

const styles = StyleSheet.create({
  buttonContainer: {
    paddingTop: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexDirection: 'row',
    flex: 0.5
  },
  container: {
    flex: 1
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  countdown: {
    color: '#fff',
    fontFamily: 'oxygen',
    fontWeight: '500',
    fontSize: 80
  }
})
