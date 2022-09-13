import React,{useState,useRef,useEffect} from 'react'
import { View, Text, StyleSheet, Image, TouchableHighlight, Dimensions, Platform,Animated,SafeAreaView} from 'react-native'
import Colors from '../constants/Colors'
import common from '../../Utilites/Common'
import FlashMessage,{ showMessage, hideMessage } from "react-native-flash-message"
import { BlurView, VibrancyView } from '@react-native-community/blur'
import Modal from 'react-native-modal'
// import { TouchableHighlight } from 'react-native-gesture-handler'
import Config from '../constants/Config'
import { getBottomSpace } from 'react-native-iphone-x-helper'
 

export const ChooseActionModal = ({modal, closeModal,action,arr=[]}) => {

    const content = [
            <View style={styles.header}>
                <Text style={styles.headerText}>Выберите нужное действие </Text>
            </View>
    ]

    for (let i = 0; i < arr.length; i++) {
        content.push(
            <TouchableHighlight activeOpacity={1} underlayColor={'#EAEAEA'} onPress={() => action(arr[i].action)}>
                <View style={styles.blockView}>
                    <Text style={{...styles.blockText,color:arr[i].color}}>
                        {arr[i].text}
                    </Text>
                </View>
            </TouchableHighlight>
        )
    }

  return (
    <Modal
        // {Config.newSlideInUp}
        animationIn='slideInUp'
        animationOut='slideOutDown'
        transparent={true}
        isVisible={modal}
        onRequestClose={() => closeModal()}
        onBackdropPress={() => closeModal()}
        backdropOpacity={0.4}
        propagateSwipe={true}
        style={{margin:0,justifyContent:'flex-end',paddingHorizontal:8}}
        >
            {Platform.OS == 'ios' ?
            <>
            <BlurView style={{...styles.mainBlock}} blurType='thinMaterial' blurAmount={27}>
                    {content}
            </BlurView>
            <BlurView blurType='thinMaterial' blurAmount={27} style={styles.cancelBtn}>
            <TouchableHighlight activeOpacity={1} 
                style={{width:'100%',height:'100%',justifyContent:'center',alignItems:'center'}} 
                underlayColor={'#EAEAEA'} onPress={() => closeModal()} >
                <Text style={styles.cancelText}>Отмена</Text>
            </TouchableHighlight>
            </BlurView>
            </>
            : 
            <>
            <View style={{...styles.mainBlock,overflow:'hidden'}}>
                {/* <BlurView> */}
                <BlurView
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0
                  }}
                blurType="light"
                blurRadius={25}
                />
                    {content}
                {/* </BlurView> */}
            </View>
            <View style={{...styles.cancelBtn,overflow:'hidden'}}>
                <BlurView
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        // borderRadius:14,
                    }}
                    blurType="light"
                    blurRadius={25}
                />
                <TouchableHighlight activeOpacity={1} 
                    style={{width:'100%',height:'100%',justifyContent:'center',alignItems:'center',borderRadius:14,}} 
                    underlayColor={'#EAEAEA'} onPress={() => closeModal()} >
                    <Text style={styles.cancelText}>Отмена</Text>
                </TouchableHighlight>
            </View>
            </>
            }
            {/* <SafeAreaView /> */}
    </Modal>
  )
}

const styles = StyleSheet.create({
    mainBlock:{
        width:'100%',
        borderRadius:common.getLengthByIPhone7(14),
        backgroundColor:Platform.OS == 'ios' ? null :'#FFF'
    },
    header:{
        height:common.getLengthByIPhone7(45),
        // borderTopLeftRadius:common.getLengthByIPhone7(14),
        // borderTopRightRadius:common.getLengthByIPhone7(14),
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
    },
    headerText:{
        fontFamily:'Gilroy',fontSize:common.getLengthByIPhone7(13),
        lineHeight:common.getLengthByIPhone7(18),
        color:Colors.textColor,
    },
    blockView:{
        height:common.getLengthByIPhone7(56),
        borderTopWidth:1,
        borderColor:'#B4B4B4',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
    },
    blockText:{
        fontFamily:'Gilroy',fontSize:common.getLengthByIPhone7(17),
        lineHeight:common.getLengthByIPhone7(22),
    },
    cancelBtn:{
        height:common.getLengthByIPhone7(56),
        // backgroundColor:'#FFF',
        marginTop:8,
        marginBottom:common.getLengthByIPhone7(8) + getBottomSpace(),
        borderRadius:common.getLengthByIPhone7(14),
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
    },
    cancelText:{
        fontFamily:'Gilroy',fontSize:common.getLengthByIPhone7(17),
        lineHeight:common.getLengthByIPhone7(22),
        color:Colors.textColor,
        fontWeight:'600',
    }
})