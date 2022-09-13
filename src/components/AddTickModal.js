import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Image,
  TextInput,
  View,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import Colors from '../constants/Colors';
import common from '../../Utilites/Common';
import Config from '../constants/Config';
import Modal from 'react-native-modal';
import {Btn} from './Btn';

export const AddTickModal = ({
  modal,
  closeModal,
  onPress,
  addCash,
  addNewCash,
}) => {
  const [name, setname] = useState('');
  const [count, setcount] = useState('');
  const [price, setprice] = useState('');
  const [usd, setUsd] = useState('');
  const [rub, setRub] = useState('');

  return (
    <Modal
      animationIn="zoomIn"
      animationOut="zoomOut"
      transparent={true}
      isVisible={modal}
      onRequestClose={() => closeModal()}
      onBackdropPress={() => closeModal()}
      backdropOpacity={0.4}
      propagateSwipe={true}
      style={{margin: 0, justifyContent: 'center', alignItems: 'center'}}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          keyboardShouldPersistTaps={'handled'}
          contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}>
          <TouchableOpacity
            style={{position: 'absolute', width: '100%', height: '100%'}}
            onPress={() => closeModal()}
            activeOpacity={1}
          />
          <View
            style={{
              backgroundColor: '#FFF',
              borderRadius: common.getLengthByIPhone7(30),
              paddingTop: common.getLengthByIPhone7(30),
              paddingBottom: common.getLengthByIPhone7(20),
              paddingHorizontal: 20,
              width: common.getLengthByIPhone7(0) - 32,
            }}>
            <Text style={styles.title}>ДОБАВИТЬ</Text>
            {addCash ? (
              <>
                <TextInput
                  style={styles.input}
                  placeholder={'Рубли'}
                  placeholderTextColor={Colors.grayColor}
                  value={rub}
                  onChangeText={text => setRub(text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder={'USD'}
                  placeholderTextColor={Colors.grayColor}
                  value={usd}
                  onChangeText={text => setUsd(text)}
                />
              </>
            ) : (
              <>
                <TextInput
                  style={styles.input}
                  placeholder={'Тикер'}
                  placeholderTextColor={Colors.grayColor}
                  value={name}
                  onChangeText={text => setname(text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder={'Кол-во'}
                  keyboardType={'numeric'}
                  placeholderTextColor={Colors.grayColor}
                  value={count}
                  onChangeText={text => setcount(text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder={'Средняя цена'}
                  keyboardType={'numeric'}
                  placeholderTextColor={Colors.grayColor}
                  value={price}
                  onChangeText={text => setprice(text)}
                />
              </>
            )}
            <Btn
              green
              title={'Добавить'}
              customStyle={{marginTop: 28}}
              onPress={() => {
                if (addCash) {
                  if (rub.length || usd.length) {
                    addNewCash({
                      usd: usd.length
                        ? parseFloat(usd.split(',').join('.')).toString()
                        : null,
                      rub: rub.length
                        ? parseFloat(rub.split(',').join('.')).toString()
                        : null,
                    });
                    setTimeout(() => {
                      setUsd('');
                      setRub('');
                    }, 500);
                  } else {
                    Alert.alert(
                      Config.appName,
                      'Введите все необходимые данные',
                    );
                  }
                } else {
                  if (price.length && count.length && name.length) {
                    onPress({
                      name: name.toUpperCase(),
                      count: parseFloat(count.split(',').join('.')),
                      price: parseFloat(price.split(',').join('.')),
                    });
                    setTimeout(() => {
                      setname('');
                      setcount('');
                      setprice('');
                    }, 500);
                  } else {
                    Alert.alert(
                      Config.appName,
                      'Введите все необходимые данные',
                    );
                  }
                }
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  mainBlock: {
    minWidth: common.getLengthByIPhone7(200),
    paddingVertical: common.getLengthByIPhone7(24),
    paddingHorizontal: common.getLengthByIPhone7(16),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: common.getLengthByIPhone7(14),
  },
  title: {
    fontFamily: 'Gilroy',
    fontSize: common.getLengthByIPhone7(24),
    color: Colors.textColor,
    fontWeight: Platform.select({ios: '900', android: 'bold'}),
    textAlign: 'center',
    alignSelf: 'center',
    marginBottom: common.getLengthByIPhone7(26),
  },
  input: {
    fontFamily: 'Gilroy',
    fontSize: common.getLengthByIPhone7(18),
    lineHeight: common.getLengthByIPhone7(22),
    color: Colors.textColor,
    minWidth: '100%',
    paddingLeft: 25,
    height: common.getLengthByIPhone7(61),
    borderWidth: 1,
    borderColor: Colors.grayColor,
    borderRadius: common.getLengthByIPhone7(10),
    marginBottom: 8,
  },
});
