import React, { Fragment } from 'react'
import {
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native'
import { Constants, Permissions } from 'expo'
import DrawerLayout from 'react-native-drawer-layout'

import Counter from './components/Counter'
import { DEFAULT_BREAK_DURATION, DEFAULT_WORK_DURATION } from './utils/constants'

const { width } = Dimensions.get('window')

export default class Main extends React.Component {
  state = {
    workDuration: DEFAULT_WORK_DURATION,
    breakDuration: DEFAULT_BREAK_DURATION
  };

  async componentDidMount () {
    const result = await Permissions.askAsync(Permissions.NOTIFICATIONS)

    if (Constants.isDevice && result.status !== 'granted') {
      alert(
        'We need to send you a notification when the timer has expired!'
      )
    }
  }

  handleDrawerRef = view => {
    this._drawerLayout = view
  }

  render () {
    return (
      <Fragment>
        <StatusBar barStyle='light-content' />
        <DrawerLayout
          ref={this.handleDrawerRef}
          drawerWidth={width - 30}
          renderNavigationView={this._renderMenu}>
          <Counter {...this.state} />
          {this._renderMenuButton()}
        </DrawerLayout>

      </Fragment>

    )
  }

  _renderMenuButton () {
    return (
      <TouchableOpacity
        hitSlop={{ top: 15, left: 15, right: 15, bottom: 15 }}
        onPress={() => {
          this._drawerLayout.openDrawer()
        }}
        style={styles.menuButtonContainer}>
        <Image
          style={styles.menuButton}
          source={{
            uri: 'https://s3.amazonaws.com/pomodoro-exp/menu-button.png'
          }}
        />
      </TouchableOpacity>
    )
  }

  _renderMenu = () => {
    return (
      <View style={{ backgroundColor: '#F9F9F9', flex: 1, paddingTop: 60 }}>
        <View style={styles.menuOptions}>
          {this._renderOptions({
            title: 'Work',
            options: [10, 15, 20, 25],
            stateKey: 'workDuration'
          })}

          {this._renderOptions({
            title: 'Break',
            options: [3, 5, 10, 15],
            stateKey: 'breakDuration'
          })}
        </View>
      </View>
    )
  }

  _renderOptions ({ title, options, stateKey }) {
    let optionElements = options.map(option => {
      let isSelected = this.state[stateKey] === option

      return (
        <TouchableWithoutFeedback
          key={stateKey + option.toString()}
          onPress={() => this.setState(state => {
            state[stateKey] = option
            return state
          })}>
          <View
            style={[
              styles.optionButton,
              isSelected && styles.optionButtonSelected
            ]}>
            <Text
              style={[
                styles.optionText,
                isSelected && styles.optionTextSelected
              ]}>
              {option}min
            </Text>
          </View>
        </TouchableWithoutFeedback>
      )
    })

    return (
      <View style={styles.optionsContainer}>
        <View style={styles.optionsTitle}>
          <Text style={styles.optionsTitleText}>
            {title}
          </Text>
        </View>
        <View style={styles.optionContainer}>
          {optionElements}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  menuHeader: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#494745'
  },
  menuHeaderText: {
    fontSize: 23,
    fontWeight: '500',
    color: '#fff',
    backgroundColor: 'transparent'
  },
  menuOptions: {
    backgroundColor: '#fff',
    paddingBottom: 0
  },
  menuButtonContainer: {
    position: 'absolute',
    top: 55,
    left: 15
  },
  menuButton: {
    width: 25.5,
    height: 17.5
  },
  optionsContainer: {
    paddingTop: 12,
    paddingBottom: 5,
    borderBottomColor: '#eee',
    borderBottomWidth: 1
  },
  optionsTitle: {
    paddingLeft: 15,
    paddingBottom: 12,
    paddingTop: 0
  },
  optionsTitleText: {
    fontSize: 19,
    fontFamily: 'oxygen',
    fontWeight: '300'
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    paddingTop: 0
  },
  optionButton: {
    padding: 10,
    borderRadius: 3,
    backgroundColor: '#eee'
  },
  optionButtonSelected: {
    backgroundColor: '#D03838'
  },
  optionText: {
    color: '#888',
    fontFamily: 'oxygen',
    fontSize: width > 320 ? 14 : 12
  },
  optionTextSelected: {
    color: '#fff',
    fontFamily: 'oxygen',
    fontWeight: '500'
  }
})
