import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Image,
  ScrollView,
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
  AsyncStorage,
  RefreshControl,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Colors from '../constants/Colors';
import common from '../../Utilites/Common';
import {getCost, getDividends} from '../../Utilites/Network';
import {AddTickModal} from '../components/AddTickModal';
import {ChooseActionModal} from '../components/ChooseActionModal';
import {TouchableHighlight} from 'react-native-gesture-handler';
import {useSelector, useDispatch} from 'react-redux';
import Config from '../constants/Config';
import * as RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import {getDollars, setData} from '../store/actions/postActions';

export const MainScreen = ({navigation}) => {
  const {dollar, mainData} = useSelector(state => state.useReducer);
  const dispatch = useDispatch();
  var path =
    Platform.select({
      ios: RNFS.DocumentDirectoryPath,
      android: RNFS.DownloadDirectoryPath,
    }) + '/MyStocks.txt';
  const [addModal, setAddModal] = useState(false);
  const [dividends, setDividends] = useState(0);
  const [rubCash, setRubCash] = useState(0);
  const [usdCash, setUsdCash] = useState(0);
  const [content, setContent] = useState([]);
  const [refreshPage, setRefreshPage] = useState(false);
  const [sum, setSum] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [actionModal, setActionModal] = useState(false);
  const [currentTick, setCurrentTick] = useState({});
  const [addCash, setAddCash] = useState(false);
  const [canCloseSpinner, setCanCloseSpinner] = useState(false);

  const actionArr = [
    [
      {
        text: 'Удалить',
        color: Colors.redColor,
        action: 'delete',
      },
    ],
    [
      {
        text: 'Добавить наличные',
        color: Colors.textColor,
        action: 'addCash',
      },
      {
        text: 'Добавить тикер',
        color: Colors.textColor,
        action: 'addTick',
      },
      {
        text: 'Сохранить данные',
        color: Colors.greenColor,
        action: 'saveData',
      },
      {
        text: 'Загрузить данные',
        color: 'blue',
        action: 'pushData',
      },
      {
        text: 'Удалить данные',
        color: Colors.redColor,
        action: 'deleteData',
      },
    ],
  ];
  const [currentActArr, setCurrentActArr] = useState(actionArr[0]);

  const action = async what => {
    if (what == 'delete') {
      const index = mainData.findIndex(
        item => item.name.toUpperCase() == currentTick.name.toUpperCase(),
      );
      let newArr = [...mainData.slice(0, index), ...mainData.slice(index + 1)];
      AsyncStorage.setItem('body', JSON.stringify(newArr));
      dispatch(setData(newArr));
      setActionModal(false);
    } else if (what == 'addTick') {
      setActionModal(false);
      setAddCash(false);
      setTimeout(() => {
        setAddModal(true);
      }, 400);
    } else if (what == 'addCash') {
      setActionModal(false);
      setAddCash(true);
      setTimeout(() => {
        setAddModal(true);
      }, 400);
    } else if (what == 'saveData') {
      setActionModal(false);
      const granted =
        Platform.OS == 'ios'
          ? 'granted'
          : await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            );
      if (granted == 'granted') {
        RNFS.writeFile(path, JSON.stringify(mainData), 'utf8')
          .then(success => {
            setTimeout(() => {
              Alert.alert(
                Config.appName,
                Platform.select({
                  ios:
                    'Файл сохранен. Пожалуйста, не переименовывайте файл. Путь файла - iPhone/MyStocks/MyStocks.txt',
                  android:
                    'Файл сохранен. Пожалуйста, не переименовывайте файл. Файл сохранен в папке Download',
                }),
              );
            }, 500);
            console.log('FILE WRITTEN!', path);
          })
          .catch(err => {
            console.log(err.message);
          });
      }
    } else if (what == 'pushData') {
      setActionModal(false);
      setTimeout(async () => {
        try {
          const res = await DocumentPicker.pick({
            type: [DocumentPicker.types.plainText],
          });
          RNFS.readFile(res.uri, 'utf8').then(file => {
            if (res.name.indexOf('MyStocks.txt') != -1) {
              let newData = JSON.parse(file);
              dispatch(setData(newData));
              AsyncStorage.setItem('body', JSON.stringify(newData));
              setTimeout(() => {
                onRefresh();
              }, 300);
            } else {
              Alert.alert(Config.appName, 'Неверное имя файла');
            }
          });
        } catch (err) {
          if (DocumentPicker.isCancel(err)) {
          } else {
            console.log('errerr', err);
            Alert.alert(
              Config.appName,
              'Ошибка при взятии файла. Пожалуйста, проверьте целостность и доступ файла',
            );
          }
        }
      }, 500);
    } else if (what == 'deleteData') {
      setActionModal(false);
      setTimeout(() => {
        Alert.alert(
          Config.appName,
          'Вы действительно хотите очистить весь список?',
          [
            {
              text: 'Отмена',
            },
            {
              text: 'Очистить',
              style: 'destructive',
              onPress: () => {
                AsyncStorage.removeItem('body').then(() => {
                  dispatch(setData([]));
                });
              },
            },
          ],
        );
      }, 500);
    } else {
      console.log(what);
    }
  };

  const addNewTicket = async (name, count, price) => {
    setRefreshPage(true);
    getCost(name).then(
      cost => {
        // выполнение
        getDividends(name).then(
          dividend => {
            // выполнение
            // console.warn('dividend',dividend)
            let newTicker = {
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
              value_Status: 'equals',
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
                  // setCanCloseSpinner
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
            setAddModal(false);
          },
          reason => {
            // отклонение
            console.warn('REASON', reason);
            // Alert.alert(Config.appName,'Ошибка при получении данных')
          },
        );
      },
      reason => {
        // отклонение
        console.warn('REASONNN', reason);
        Alert.alert(Config.appName, 'Ошибка при получении данных.');
      },
    );
  };

  // useEffect(() => {
  //   dispatch(getDollars(dollar));
  // }, [dispatch]);

  useEffect(() => {
    const newContent = [];
    let newDividends = 0;
    let newSum = 0;
    if (mainData && mainData?.length) {
      for (let i = 0; i < mainData.length; i++) {
        newContent.push(
          <TouchableHighlight
            underlayColor={'#EAEAEA'}
            activeOpacity={1}
            onPress={() => {
              setCurrentActArr(actionArr[0]);
              setActionModal(true);
              setCurrentTick(mainData[i]);
            }}
            style={{
              paddingVertical: 10,
              paddingHorizontal: common.getLengthByIPhone7(16),
            }}>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text
                style={{
                  ...styles.tickerName,
                  width: common.getLengthByIPhone7(59),
                  fontWeight: 'bold',
                }}
                numberOfLines={1}>
                {mainData[i].name}
              </Text>
              <Text
                style={{
                  ...styles.grayText,
                  width: common.getLengthByIPhone7(33),
                  marginRight: common.getLengthByIPhone7(22),
                  textAlign: 'center',
                }}
                numberOfLines={1}>
                {mainData[i].position}
              </Text>
              <Text
                style={{
                  ...styles.grayText,
                  width: common.getLengthByIPhone7(62),
                  color:
                    mainData[i].value_Status == 'increase'
                      ? Colors.greenColor
                      : mainData[i].value_Status == 'decrease'
                      ? Colors.redColor
                      : Colors.textColor,
                }}
                numberOfLines={1}>
                {mainData[i].currentPrice}
              </Text>
              <Text
                style={{
                  ...styles.grayText,
                  width: common.getLengthByIPhone7(54),
                }}
                numberOfLines={1}>
                {mainData[i].averagePrice}
              </Text>
              <Text
                style={{
                  ...styles.grayText,
                  width: common.getLengthByIPhone7(54),
                }}
                numberOfLines={1}>
                {mainData[i].Dividends != '-' &&
                mainData[i].Dividends != undefined
                  ? mainData[i].Dividends.toFixed(2)
                  : mainData[i].Dividends}
              </Text>
              <Text
                style={{
                  ...styles.grayText,
                  minWidth: common.getLengthByIPhone7(63),
                  fontWeight: 'bold',
                  textAlign: 'right',
                }}>
                {mainData[i].fullPrice != undefined
                  ? mainData[i].fullPrice
                      .toFixed(0)
                      .toString()
                      .replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')
                  : mainData[i].fullPrice}
              </Text>
            </View>
          </TouchableHighlight>,
        );

        newDividends =
          mainData[i].Dividends != '-'
            ? newDividends + mainData[i].position * mainData[i].Dividends
            : newDividends;
        newSum = newSum + mainData[i].fullPrice;
      }
    }
    setSum(newSum);
    setDividends(newDividends);
    setContent(newContent);
  }, [mainData]);

  useEffect(() => {
    setInterval(() => {
      dispatch(getDollars());
      AsyncStorage.getItem('body').then(
        async body => {
          // выполнение
          if (body != null && body.length) {
            const parseBody = JSON.parse(body);
            for (let i = 0; i < parseBody.length; i++) {
              await addNewTicket(
                parseBody[i].name,
                parseBody[i].position,
                parseBody[i].averagePrice,
              );
            }
          } else {
            setRefreshing(false);
            dispatch(setData([]));
          }
        },
        reason => {
          // отклонение
          setRefreshing(false);
        },
      );
    }, 15000);
  }, []);

  // useEffect(() => {
  //   onRefresh()
  // }, [navigation])

  useEffect(() => {
    if (canCloseSpinner) {
      setRefreshing(false);
      setCanCloseSpinner(false);
      // console.warn('1232')
    }
  }, [canCloseSpinner]);

  const onRefresh = () => {
    setRefreshing(true);
    dispatch(getDollars());
    AsyncStorage.getItem('body').then(
      async body => {
        // выполнение
        if (body != null && body.length) {
          const parseBody = JSON.parse(body);
          for (let i = 0; i < parseBody.length; i++) {
            await addNewTicket(
              parseBody[i].name,
              parseBody[i].position,
              parseBody[i].averagePrice,
            );
          }
        } else {
          setRefreshing(false);
          dispatch(setData([]));
        }
      },
      reason => {
        // отклонение
        setRefreshing(false);
      },
    );
    AsyncStorage.getItem('usdCash').then(
      usdCash => {
        // выполнение
        if (usdCash != null && usdCash.length) {
          setUsdCash(parseFloat(JSON.parse(usdCash)));
        }
      },
      reason => {
        // отклонение
        setRefreshPage(true);
        setTimeout(() => {
          setRefreshPage(false);
        }, 50);
      },
    );
    AsyncStorage.getItem('rubCash').then(
      rubCash => {
        // выполнение
        if (rubCash != null && rubCash.length) {
          setRubCash(parseFloat(JSON.parse(rubCash)));
        }
      },
      reason => {
        // отклонение
        setRefreshPage(true);
        setTimeout(() => {
          setRefreshPage(false);
        }, 50);
      },
    );
  };

  const addNewCash = (usd, rub) => {
    setAddModal(false);
    if (usd != null && usd != NaN && usd.length) {
      AsyncStorage.setItem('usdCash', usd);
      setUsdCash(parseFloat(usd));
    }
    if (rub != null && rub != NaN && rub.length) {
      AsyncStorage.setItem('rubCash', rub);
      setRubCash(parseFloat(rub));
    }
  };

  return (
    <>
      <View style={{backgroundColor: '#FFF'}}>
        <SafeAreaView />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            height: 44,
          }}>
          <Text style={styles.title}>ПОРТФЕЛЬ</Text>
          <TouchableOpacity
            style={{position: 'absolute', right: 16}}
            onPress={() => {
              setCurrentActArr(actionArr[1]);
              dispatch(getDollars());
              setActionModal(true);
              // setAddModal(true)
            }}>
            <Image
              source={require('../../assets/icons/plus.png')}
              style={{width: 30, height: 30, tintColor: Colors.greenColor}}
            />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => onRefresh()}
          />
        }
        style={{flex: 1, backgroundColor: '#FFF'}}
        contentContainerStyle={{flexGrow: 1, paddingBottom: 50}}>
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: common.getLengthByIPhone7(16),
            marginVertical: 20,
          }}>
          <View style={styles.headerBlock}>
            <Text style={styles.headerBlockTitle}>Дивиденды</Text>
            <Text style={{...styles.headerBlockText, marginBottom: 5}}>
              {dividends
                .toFixed(0)
                .replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')}{' '}
              USD
            </Text>
            <Text style={styles.headerBlockText}>
              {(dividends * dollar)
                .toFixed(0)
                .replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')}{' '}
              ₽
            </Text>
          </View>
          <View style={styles.headerBlock}>
            <Text style={styles.headerBlockTitle}>Наличность</Text>
            <Text style={{...styles.headerBlockText, marginBottom: 5}}>
              {usdCash
                .toFixed(0)
                .toString()
                .replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')}{' '}
              USD
            </Text>
            <Text style={styles.headerBlockText}>
              {rubCash
                .toFixed(0)
                .toString()
                .replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')}{' '}
              ₽
            </Text>
          </View>
          <View style={styles.headerBlock}>
            <Text style={styles.headerBlockTitle}>Сумма</Text>
            <Text style={{...styles.headerBlockText, marginBottom: 5}}>
              {(sum / dollar + usdCash + rubCash / dollar)
                .toFixed(0)
                .replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')}{' '}
              USD
            </Text>
            <Text style={styles.headerBlockText}>
              {(sum + rubCash + usdCash * dollar)
                .toFixed(0)
                .replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ')}{' '}
              ₽
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            marginVertical: 10,
            width: '100%',
            paddingHorizontal: common.getLengthByIPhone7(16),
          }}>
          <Text
            style={{...styles.greenText, width: common.getLengthByIPhone7(59)}}>
            Тикер
          </Text>
          <Text
            style={{...styles.greenText, width: common.getLengthByIPhone7(53)}}>
            Позиция
          </Text>
          <Text
            style={{...styles.greenText, width: common.getLengthByIPhone7(62)}}>
            Текущая
          </Text>
          <Text
            style={{...styles.greenText, width: common.getLengthByIPhone7(54)}}>
            Ср.Цена
          </Text>
          <Text
            style={{...styles.greenText, width: common.getLengthByIPhone7(54)}}>
            Див.
          </Text>
          <Text
            style={{
              ...styles.greenText,
              width: common.getLengthByIPhone7(63),
              textAlign: 'right',
            }}>
            Стоимость
          </Text>
        </View>
        {content}
        {/* <Btn onPress={() => {
        AsyncStorage.removeItem('body').then(() => {
          setData([])
          network.mainData = []
        })
        }} title={'Очистить'} customStyle={{marginTop:32,width:common.getLengthByIPhone7(0) - common.getLengthByIPhone7(16),alignSelf:'center'}}/> */}
      </ScrollView>
      <AddTickModal
        modal={addModal}
        closeModal={() => setAddModal(false)}
        onPress={({name, count, price}) => addNewTicket(name, count, price)}
        addNewCash={({usd, rub}) => addNewCash(usd, rub)}
        addCash={addCash}
      />
      <ChooseActionModal
        modal={actionModal}
        closeModal={() => setActionModal(false)}
        arr={currentActArr}
        action={what => action(what)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    fontFamily: 'Gilroy',
    fontSize: common.getLengthByIPhone7(24),
    // lineHeight:common.getLengthByIPhone7(22),
    fontWeight: Platform.select({ios: '900', android: 'bold'}),
    color: Colors.textColor,
    textAlign: 'center',
  },
  headerBlock: {
    backgroundColor: '#F2F2F2',
    width: common.getLengthByIPhone7(100),
    marginRight: common.getLengthByIPhone7(20),
    borderRadius: 10,
    padding: 7,
  },
  headerBlockTitle: {
    fontFamily: 'Gilroy',
    fontSize: common.getLengthByIPhone7(13),
    lineHeight: common.getLengthByIPhone7(15),
    color: Colors.grayColor,
    marginBottom: 8,
  },
  headerBlockText: {
    fontFamily: 'Gilroy',
    fontSize: common.getLengthByIPhone7(15),
    lineHeight: common.getLengthByIPhone7(17),
    fontWeight: 'bold',
    color: Colors.grayColor,
  },
  greenText: {
    fontFamily: 'Gilroy',
    fontSize: common.getLengthByIPhone7(9),
    lineHeight: common.getLengthByIPhone7(11),
    fontWeight: '500',
    color: Colors.grayColor,
  },
  tickerName: {
    fontFamily: 'Gilroy',
    fontSize: common.getLengthByIPhone7(15),
    lineHeight: common.getLengthByIPhone7(17),
    color: Colors.textColor,
  },
});
