import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Image,
  ImageBackground,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  SafeAreaView,
  ScrollView,
  AsyncStorage,
  Alert,
} from 'react-native';
import Colors from '../constants/Colors';
import common from '../../Utilites/Common';
import {getCost, getDividends} from '../../Utilites/Network';
import {useDispatch, useSelector} from 'react-redux';
import {getDollars, setData} from '../store/actions/postActions';

export const SplashScreen = ({navigation}) => {
  const [canCloseSpinner, setCanCloseSpinner] = useState(false);
  const {dollar} = useSelector(state => state.useReducer);
  const dispatch = useDispatch();

  const addNewTicket = (name, count, price) => {
    getCost(name).then(
      cost => {
        // выполнение
        // console.warn('cost',cost)
        getDividends(name).then(
          dividend => {
            // выполнение
            // console.warn('dividend',dividend)
            const newTicker = {
              name: name,
              position: count,
              averagePrice: price,
              Dividends:
                dividend[0] != 'null'
                  ? dividend[0] == 'yield'
                    ? cost * dividend[1]
                    : dividend[1]
                  : '-',
              currentPrice: cost,
              fullPrice: count * cost * dollar,
            };
            AsyncStorage.getItem('body').then(body => {
              if (body != null && body.length) {
                const parseBody = JSON.parse(body);
                const index = parseBody.findIndex(
                  item => item.name.toUpperCase() == name.toUpperCase(),
                );
                let newArr = [];
                if (index == -1) {
                  newArr = [...parseBody, newTicker];
                } else {
                  parseBody.length - 1 == index
                    ? setCanCloseSpinner(true)
                    : null;
                  parseBody[index].currentPrice > newTicker.currentPrice
                    ? newTicker.value_Status == 'decrease'
                    : parseBody[index].currentPrice == newTicker.currentPrice &&
                      parseBody[index].value_Status != undefined
                    ? (newTicker.value_Status = parseBody[index].value_Status)
                    : 'increase';
                  newArr = [
                    ...parseBody.slice(0, index),
                    newTicker,
                    ...parseBody.slice(index + 1),
                  ];
                }
                AsyncStorage.setItem('body', JSON.stringify(newArr));
                dispatch(setData(newArr));
              } else {
                AsyncStorage.setItem('body', JSON.stringify([newTicker]));
                dispatch(setData([newTicker]));
              }
            });
          },
          reason => {
            // отклонение
          },
        );
      },
      reason => {
        // отклонение
        console.warn('reason', reason);
      },
    );
  };

  useEffect(() => {
    if (canCloseSpinner) {
      setCanCloseSpinner(false);
      navigation.navigate('MainScreenStack');
    }
  }, [canCloseSpinner]);

  const onFetch = () => {
    try {
      dispatch(getDollars());
      AsyncStorage.getItem('body').then(
        body => {
          // выполнение
          if (body != null && body.length) {
            const parseBody = JSON.parse(body);
            for (let i = 0; i < parseBody.length; i++) {
              addNewTicket(
                parseBody[i].name,
                parseBody[i].position,
                parseBody[i].averagePrice,
              );
            }
          } else {
            navigation.navigate('MainScreenStack');
          }
        },
        reason => {
          // отклонение
        },
      );
    } catch (e) {
      Alert.alert('Error', e);
    }
  };

  useEffect(() => {
    onFetch();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
      }}>
      <Image
        style={{width: 226, height: 116.5}}
        source={require('../../assets/icons/logo.png')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontFamily: 'Gilroy',
    fontSize: common.getLengthByIPhone7(17),
    lineHeight: common.getLengthByIPhone7(22),
    fontWeight: '900',
    color: Colors.textColor,
    textAlign: 'center',
  },
  greenText: {
    fontFamily: 'Gilroy',
    fontSize: common.getLengthByIPhone7(9),
    lineHeight: common.getLengthByIPhone7(11),
    fontWeight: '500',
    color: Colors.greenColor,
  },
  tickerName: {
    fontFamily: 'Gilroy',
    fontSize: common.getLengthByIPhone7(15),
    lineHeight: common.getLengthByIPhone7(17),
    color: Colors.textColor,
  },
});
