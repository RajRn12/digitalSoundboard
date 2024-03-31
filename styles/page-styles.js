/**
 * File   -  page-styles.js
 * Author - Raj Rai
 **/
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'lightblue',
        alignItems: 'center',
        height: 1000,
    },

    topView: {
        flexDirection: 'row',
        marginBottom: 10,
        marginTop:35,
    },
    secondTopView: {
        flexDirection: 'row',
        marginBottom: 10,

    },
    title: {
        textShadowColor: 'rgba(255, 0, 0, 0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 10,
        fontWeight: 'bold',
        color:'blue',
        fontSize: 18,

    },
    titleTwo: {
        textShadowColor: 'rgba(255, 0, 0, 1)',
        textShadowOffset: { width:5, height: 1 },
        textShadowRadius: 10,
        fontWeight: 'bold',
        color: 'yellow',
        fontSize: 18,
    },

    guide: {
        width: 20,
        height: 20,
        marginLeft: 5,
        marginTop: 3 
    },

    secondView: {
        backgroundColor: 'lightyellow',
        borderWidth: 5,
        borderRadius: 10,
        borderStyle: 'dashed',
        borderBlockColor: 'black',
        marginBottom: 20,
    },
    sampleView: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: 350,
        justifyContent:'center',
        marginTop: 10,
        marginBottom: 10,
    },

    recordPress: {
        backgroundColor: 'yellow',
        borderBlockColor: 'black',
        borderStyle: 'solid',
        height: 30,
        width: 150,
        justifyContent: 'center',
        borderWidth: 2,
        borderRadius: 7,
        marginBottom: 10,
    },
    recordText: {
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 15,
    },
    thirdView: {
        backgroundColor: 'pink',
        borderWidth: 5,
        borderRadius: 10,
        borderStyle: 'dashed',
        borderBlockColor: 'black',
    },
    recordView: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: 350,
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 20,
    },

    button: {
        borderBlockColor: 'black',
        borderStyle: 'solid',
        width: '15%',
        height: 50,
        borderWidth: 2,
        borderRadius: 7,
        marginLeft: 5,
        marginRight: 5,
        marginTop: 7,
        marginBottom: 7,
        justifyContent: 'center'
    },

});
export default styles;