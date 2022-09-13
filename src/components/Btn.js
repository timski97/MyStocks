import React,{useState} from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native'
import Colors from '../constants/Colors'
import Common from '../../Utilites/Common'

export const Btn = ({customStyle={}, green=false, onPress= () => null, title,disabled = false,customTextStyle}) => {

  
  return (
    <TouchableOpacity style={{...styles.btnView,...customStyle,
      ...{backgroundColor: green ? Colors.greenColor : '#FFF',
          borderWidth: green ? 0 : 1,
          borderColor: Colors.greenColor,
          opacity:disabled ? 0.5 : 1,
      }}}
        onPress={() => onPress()} disabled={disabled}
        >
    <Text allowFontScaling={false} style={{...styles.title,...{color:!green ? Colors.textColor : '#FFF'},...customTextStyle}}>{title}</Text>
  </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  btnView:{
      height:Common.getLengthByIPhone7(60),
      width:'100%',
      justifyContent:'center',
      borderRadius:Common.getLengthByIPhone7(10),
      alignItems:'center',
  },
  title:{
    fontWeight:'bold',
    fontFamily:'Gilroy',fontSize:Common.getLengthByIPhone7(16),
    lineHeight:Common.getLengthByIPhone7(22)
  }
})