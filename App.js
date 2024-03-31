/**
 * File     -   App.js 
 * Author   -   Raj Rai
 * Credit   -   Raj Rai, Stepehen Graham, rgbacolorpicker.com
 * Date     -   N/A
 **/

import { Platform, ScrollView, Pressable, StyleSheet, Text, Button, View, Image, Alert} from 'react-native';
import { useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import guide from './images/question.jpg';
import styles from './styles/page-styles';
import { StatusBar } from 'expo-status-bar';
import * as SQLite from 'expo-sqlite';

export default function App() {
    const [db, setDb] = useState();
    // dim to brighter
    const [dimColors, setDimColors] = useState(['rgba(255, 0, 0, 0.3)', 'rgba(10,255,0,0.3)', 'rgba(0,0,255,0.3)', 'rgba(0, 255, 242, 0.3)', 'rgba(255,255,0,0.3)'])
    const [fullColors, setFullColors] = useState(['rgba(255, 0, 0, 1)', 'rgba(0,255,0, 1)', 'rgba(0,0,255, 1)', 'rgba(0, 255, 242, 0.8)', 'rgba(255,255,0, 1)'])
    // for recording
    const [recording, setRecording] = useState(null);
    const [permissionsResponse, requestPermission] = Audio.usePermissions();

    // connect to the database
    useEffect(() => {
        let db = null;
        if (Platform.OS === 'web') {
            db = {
                transaction: () => {
                    return {
                        executeSql: () => {
                        }
                    }
                }
            }
        }
        else {
            db = SQLite.openDatabase('record03.db')
        }
        setDb(db);
        console.log(db);
        // create the table if it doesn't exist
        db.transaction((tx) => {
            tx.executeSql(
                "create table if not exists recordings (id integer primary key AUTOINCREMENT NOT NULL, uri text);"
            ),
                (_, error) => console.log(error),
                () => console.log("Table exists or was created")
        })
    }, [])

    // Sounds
    const theme = require('./assets/sfx/theme.mp3');
    const tabla = require('./assets/sfx/TablaBeat.mp3');
    const mambo = require('./assets/sfx/MamboTime.wav');
    const harmonium = require('./assets/sfx/Harmonium.wav');
    const flute = require('./assets/sfx/Flute.wav');
    
    // Sound List
    const [soundList, setSoundList] = useState([
        { music: null, id: null, name: '', play: false, bgColor: ''},
        { music: null, id: null, name: '', play: false, bgColor: ''},
        { music: null, id: null, name: '', play: false, bgColor: ''},
        { music: null, id: null, name: '', play: false, bgColor: ''},
        { music: null, id: null, name: '', play: false, bgColor: ''}
    ])

    const loadSoundList = () => {
        loadSound(theme, 0, 'Theme')
        loadSound(tabla, 1, 'Tabla')
        loadSound(mambo, 2, 'Mambo')
        loadSound(harmonium, 3, 'Harmonium')
        loadSound(flute, 4, 'Flute') 
    }

    const loadSound = async (ur, num, name_) => {
        const { sound } = await Audio.Sound.createAsync(ur);
        await sound.setIsLoopingAsync(true)
        await sound.setVolumeAsync(0.4, 0);
        let newA = { ...soundList }
        if (soundList[num].music == null && soundList[num].id == null) {
            newA[num].music = sound; newA[num].id = num; newA[num].name = name_;
            setSoundList(newA)
            console.log("loaded", soundList[num].name)
            chooseColor(num)
        }
    }

    const playSound = async (num) => {
        try {
            if (soundList[num].music != null) {
                console.log('Playing Sound', soundList[num].name);1
                await soundList[num].music.playAsync();
                let playA = { ...soundList }
                playA[num].play = true;
                setSoundList(playA)
            }
            if (soundList[num].music == null) {
                loadSoundList();
            }
        } catch (e) {
            console.log(e)
        };
     }

    const stopSound = async (num) => {
        if (soundList[num].music != null) {
            console.log('Stopped Sound', soundList[num].name)
            await soundList[num].music.stopAsync();
            let playA = { ...soundList }
            playA[num].play = false;
            setSoundList(playA)
        }
    }
    // unload a sound
    const unloadSound = async () => {
        let x = 0;
        while (x < soundList.length) {
            // stop and unload
            if (soundList[x].music != null) {
                await soundList[x].music.stopAsync();
                await soundList[x].music.unloadAsync();
                let playA = { ...soundList }
                playA[x].play = false;
                setSoundList(playA)
                console.log("unloaded", soundList[x].name)
            }
            // load after unload to be able to play sound
            if (soundList[x].music == null) {
                loadSoundList();
            }
            x++
        }
    }

    // Functions for changing color of pre-loaded box depending on its playing state
    function chooseColor(num) {
        if (soundList[num].music != null && soundList[num].bgColor == '') {
            let color = { ...soundList }
            color[num].bgColor = dimColors[num];
            setSoundList(color)
        }
    }

    function lightUp(num) {
        if (soundList[num].music != null && soundList[num].bgColor != '') {
            let color = { ...soundList }
            color[num].bgColor = fullColors[num];
            setSoundList(color)
        }
        if (soundList[num].play == true) {
            let color = { ...soundList }
            color[num].bgColor = dimColors[num];  
            setSoundList(color)
        }
    }

    // Info
    const showGuide = (num) => {
        if (num == 1) {
            Alert.alert("Info:",
                "Press a Box to play Sound - color brightens up. Press it Again To Stop Sound to Start from Beginning - Color becomes dimmer. Sounds are always Repeated.")
        }
        if (num == 2) {
            Alert.alert("Info:",
                "Colored Box means there is recorded sound for play and they are always repeated. Long Pressing the Box will delete the Box and its recording. You can only have 20 recorded boxes")
        }
    }

    useEffect(() => {
        loadSoundList()
        return soundList
            ? () => {
                unloadSound() // Prevent sound from continue playing if App restarts or crashes
            }
            : undefined;
    }, [soundList.music])

    // recordings
    const startRecording = async () => {
        try {
                // request permission to use the mic
                if (permissionsResponse.status !== 'granted') {
                    console.log('Requesting permissions.');
                    await requestPermission();
                }
                console.log('Permission is ', permissionsResponse.status);

                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                });

                console.log('Starting recording...');
                const { recording } = await Audio.Recording.createAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY
                );
                setRecording(recording);
                console.log('...recording');
        }
        catch (errorEvent) {
            console.error('Failed to startRecording(): ', errorEvent);
        }
    }

    const stopRecording = async () => {
        try {
            // stop the actual recording
            await recording.stopAndUnloadAsync();

            // save the recorded object location
            const uri = (recording.getURI());

            // save uri
            addRecording(uri)

            // forget the recording object
            setRecording(undefined);

            // log the result
            console.log('Recording stopped and stored at ', uri);

        }
        catch (errorEvent) {
            console.error('Failed to stopRecording(): ', errorEvent);
        }
    }

    useEffect(() => {
        return recording
            ? () => {
                recording.stopAndUnloadAsync()
            }
            : undefined;
    }, [])

    // database
    const [recordings, setRecordings] = useState([]);
    const [updateRecordings, forceUpdate] = useState(0);

    // database starts from id value of 1 -
    const [recordedList, setRecordedList] = useState([
        { id: 0, sound: null, play: false, bgColor: '' }, { id: 1, sound: null, play: false, bgColor: '' }, { id: 2, sound: null, play: false, bgColor: '' }, { id: 3, sound: null, play: false, bgColor: '' }, { id: 4, sound: null, play: false, bgColor: '' },
        { id: 5, sound: null, play: false, bgColor: '' }, { id: 6, sound: null, play: false, bgColor: '' }, { id: 7, sound: null, play: false, bgColor: '' }, { id: 8, sound: null, play: false, bgColor: '' }, { id: 9, sound: null, play: false, bgColor: '' },
        { id: 10, sound: null, play: false, bgColor: '' }, { id: 11, sound: null, play: false, bgColor: '' }, { id: 12, sound: null, play: false, bgColor: '' }, { id: 13, sound: null, play: false, bgColor: '' }, { id: 14, sound: null, play: false, bgColor: '' },
        { id: 15, sound: null, play: false, bgColor: '' }, { id: 16, sound: null, play: false, bgColor: '' }, { id: 17, sound: null, play: false, bgColor: '' }, { id: 18, sound: null, play: false, bgColor: '' }, { id: 19, sound: null, play: false, bgColor: '' },
        { id: 20, sound: null, play: false, bgColor: '' },
    ])

    //update when the database  changes [db, updateRecordings]
    useEffect(() => {
        if (db != null) {
            db.transaction(
                (tx) => {
                    tx.executeSql(
                        "select * from recordings limit 20",
                        [],
                        (_, { rows }) => setRecordings(rows._array),
                        (_, error) => console.log(error)
                    ),
                        (_, error) => console.log(error),
                        () => console.log("retrieving * from recordings")
                }
            )
        }
        chooseRecordColor()
    }, [db, updateRecordings])

    const addRecording = (uri) => {
            db.transaction(
                (tx) => {
                    tx.executeSql(
                        "insert into recordings (uri) values (?)",
                        [uri],
                        () => console.log("added", uri),
                        (_, error) => console.log(error)
                    )
                },
                (_, error) => console.log('addRecording() failed: ', error),
                forceUpdate(f => f + 1)
            )
    }

    const deleteRecord = (id) => {
        stopPlayingRecording(id);
        db.transaction(
            (tx) => {
                tx.executeSql(
                    "delete from recordings where id = ?",
                    [id],
                    () => console.log("deleted record ", id),
                    (_, error) => console.log(error)
                )
            },
            (_, error) => console.log('deleteRecord() failed: ', error),
            forceUpdate(f => f + 1)
        )
        let newR = { ...recordedList }
        newR[id].sound = null; newR[id].play = false; newR[id].bgColor = '';
        setRecordedList(newR);
    }

    const loadRecording = async (recordedS, id) => {
        chooseRecordColor(id);
        const { sound } = await Audio.Sound.createAsync({ uri: recordedS });
        await sound.setIsLoopingAsync(true)

        let newR = { ...recordedList }
        newR[id].sound = sound;
        setRecordedList[newR]
        console.log("loaded Recording ", id)
        playRecording(id)
    }

    const unloadRecorded = async () => {
        let x = 0;
        while (x < recordedList.length) {
            // stop and unload
            if (recordedList[x].sound != null) {
                await recordedList[x].sound.stopAsync();
                await recordedList[x].sound.unloadAsync();
                let playA = { ...recordedList }
                playA[x].play = false;
                recordedList(playA)
                console.log("unloaded recording", x)
            }
            x++
        }
    }

    // choose random color for recorded sound box
    function chooseRecordColor() {
        let i = 0;
        let newColor = { ...recordedList }
        while (i < recordedList.length) {
            if (recordedList[i].sound == null && recordedList[i].bgColor == '') {
                let r = Math.floor(Math.random() * 5);
                newColor[i].bgColor = fullColors[r];
                setRecordedList[newColor];
            }
            i++;
        }
    }

    const playRecording = async (id) => {
        let newRPlay = { ...recordedList }
        if (newRPlay[id].sound != null && newRPlay[id].play == false) {
            console.log("Playing Recording", id)
            await recordedList[id].sound.playAsync();
            newRPlay[id].play = true;
            setRecordedList[newRPlay]
        }
    }

    const stopPlayingRecording = async (id) => {
        let newRStop = { ...recordedList }
        if (newRStop[id].sound != null && newRStop[id].play == true) {
            console.log("Stopped Playing Recording", id)
            await recordedList[id].sound.stopAsync();
            newRStop[id].play = false;
            setRecordedList[newRStop]
        }
    }

    useEffect(() => {
        return recordedList
            ? () => {
                unloadRecorded()
            }
            : undefined;
    }, [recordedList.sound])

    return (
        <View style={styles.container}>
           
                <View style={styles.topView}>
                    <Text style={styles.title}> Audio Samples</Text>
                    <Pressable style={{ width: 20 }} onPress={() => showGuide(1)}><Image source={guide} style={styles.guide} /></Pressable>
                </View>
           
            <View style={styles.secondView}>
                <View style={styles.sampleView}>
                    <Pressable style={[styles.button, effect.glow, { backgroundColor: soundList[0].bgColor }]} onPress={() => { (soundList[0].play == false) ? playSound(0) : stopSound(0); lightUp(0) }} />
                    <Pressable style={[styles.button, effect.glow, { backgroundColor: soundList[1].bgColor }]} onPress={() => { (soundList[1].play == false) ? playSound(1) : stopSound(1); lightUp(1)}} />
                    <Pressable style={[styles.button, effect.glow, { backgroundColor: soundList[2].bgColor }]} onPress={() => { (soundList[2].play == false) ? playSound(2) : stopSound(2); lightUp(2) }} />
                    <Pressable style={[styles.button, effect.glow, { backgroundColor: soundList[3].bgColor }]} onPress={() => { (soundList[3].play == false) ? playSound(3) : stopSound(3); lightUp(3) }} />
                    <Pressable style={[styles.button, effect.glow, { backgroundColor: soundList[4].bgColor }]} onPress={() => { (soundList[4].play == false) ? playSound(4) : stopSound(4); lightUp(4) }} />
                </View>
            </View>

            <View>
                <Pressable
                    style={styles.recordPress}
                    onPress={recording ? stopRecording : startRecording}
                >
                    <Text style={[styles.recordText, {color: recording ? 'red': 'green'}]}>{recording ? 'Stop Recording' : 'Start Recording'}</Text>
                </Pressable>
            </View>


            <View style={styles.secondTopView}>
                <Text style={styles.titleTwo}> Recordings </Text>
                <Pressable style={{ width: 20 }} onPress={() => showGuide(2)}><Image source={guide} style={styles.guide} /></Pressable>
            </View>

            <View style={styles.thirdView}>
                <View style={styles.recordView}>
                        {recordings.map(
                            ({ id, uri}) => {
                                return (
                                    <Pressable key={id} style={[styles.button, effect.glowTwo, { backgroundColor: recordedList[id].bgColor }]} onPress={() => { (recordedList[id].play == false) ? loadRecording(uri, id) : stopPlayingRecording(id); }} onLongPress={() => deleteRecord(id)}></Pressable>
                                )
                            })
                        }
                   </View>
             </View>
            <StatusBar style="auto" />
        </View>
    );
}

const effect = StyleSheet.create({
    glow: {
        borderStyle: 'solid',
        opacity: 3,
        borderRadius: 10,
        borderBlockColor: 'gold',
    },
    glowTwo: {
        borderStyle: 'solid',
        opacity: 3,
        borderRadius: 5,
        borderBlockColor: 'blue',
    }
})

