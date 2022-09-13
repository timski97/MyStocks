import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import store from '../../src/store/index';

import {MainScreen} from '../screens/MainScreen';
import {SplashScreen} from '../screens/SplashScreen';

const Stack = createStackNavigator();

const SplashStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SplashScreen"
        options={{gestureEnabled: false, header: () => null}}
        component={SplashScreen}
      />
    </Stack.Navigator>
  );
};

const MainScreenStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainScreen"
        options={{gestureEnabled: false, header: () => null}}
        component={MainScreen}
      />
    </Stack.Navigator>
  );
};

const MainStack = () => {
  return (
    <Stack.Navigator>
      {/* <Stack.Screen name="BottomNavigator" options={{gestureEnabled:false, header:() => null}} component={BottomNavigator} /> */}
      <Stack.Screen
        name="SplashStack"
        options={{gestureEnabled: false, header: () => null}}
        component={SplashStack}
      />
      <Stack.Screen
        name="MainScreenStack"
        options={{gestureEnabled: false, header: () => null}}
        component={MainScreenStack}
      />
    </Stack.Navigator>
  );
};

export const createRootNavigator = () => {
  const AllScreens = () => {
    return (
      <Provider store={store}>
        <NavigationContainer>
          <MainStack />
        </NavigationContainer>
      </Provider>
    );
  };

  return AllScreens;
};
