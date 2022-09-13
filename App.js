import React, {Component} from 'react';
import {Platform, StatusBar, AsyncStorage} from 'react-native';
import {createRootNavigator} from './src/navigation/AppNavigation';
import CommonActions from './Utilites/NavigationService';
import Colors from './src/constants/Colors';

// "react-native-firebase": "^5.6.0",

type Props = {};
export default class App extends Component<Props> {
  UNSAFE_componentWillMount() {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#FFF', true);
      StatusBar.setBarStyle('dark-content', true);
    } else {
      StatusBar.setBarStyle('dark-content', true);
    }
  }

  render() {
    const Layout = createRootNavigator();
    return (
      <Layout
        ref={navigatorRef => {
          CommonActions.setTopLevelNavigator(navigatorRef);
        }}
      />
    );
  }
}
