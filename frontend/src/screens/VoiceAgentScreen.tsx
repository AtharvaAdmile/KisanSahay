import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, SafeAreaView, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import OpenAI from 'openai';

const { width, height } = Dimensions.get('window');

const openai = new OpenAI({
    apiKey: process.env.EXPO_PUBLIC_NVIDIA_API_KEY || '',
    baseURL: 'https://integrate.api.nvidia.com/v1',
    dangerouslyAllowBrowser: true // required for RN
});

const SARVAM_API_KEY = process.env.EXPO_PUBLIC_SARVAM_API_KEY || '';

export const VoiceAgentScreen = ({ navigation }: any) => {
    const rippleAnim = useRef(new Animated.Value(0)).current;
    const breatheAnim = useRef(new Animated.Value(1)).current;

    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [sound, setSound] = useState<Audio.Sound | null>(null);

    const [transcript, setTranscript] = useState('');
    const [agentResponse, setAgentResponse] = useState('');

    useEffect(() => {
        // Ripple Animation (Scaling and fading)
        Animated.loop(
            Animated.timing(rippleAnim, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
            })
        ).start();

        // Breathing Animation (Slight scaling up and down)
        Animated.loop(
            Animated.sequence([
                Animated.timing(breatheAnim, {
                    toValue: 1.1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(breatheAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Request audio permissions on mount
        (async () => {
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                console.warn('Audio permissions not granted');
            }
        })();

        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [rippleAnim, breatheAnim, sound]);

    const rippleScale1 = rippleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.5],
    });

    const rippleOpacity1 = rippleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.4, 0],
    });

    const rippleScale2 = rippleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 1.4],
    });

    const rippleOpacity2 = rippleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0],
    });

    const startRecording = async () => {
        try {
            if (sound) {
                await sound.unloadAsync();
                setSound(null);
                setIsPlaying(false);
            }
            setTranscript('');
            setAgentResponse('');

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            console.log('Starting recording...');
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
            setIsRecording(true);
            console.log('Recording started');
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = async () => {
        console.log('Stopping recording...');
        if (!recording) return;
        setIsRecording(false);
        setIsProcessing(true);

        try {
            await recording.stopAndUnloadAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
            });
            const uri = recording.getURI();
            console.log('Recording stopped and stored at', uri);
            setRecording(null);

            if (uri) {
                await processAudioFlow(uri);
            } else {
                setIsProcessing(false);
            }
        } catch (err) {
            console.error('Failed to stop recording', err);
            setIsProcessing(false);
        }
    };

    const processAudioFlow = async (uri: string) => {
        try {
            // 1. STT with Sarvam AI
            console.log('Starting STT...');
            setTranscript('Listening... transcribing...');

            // Prepare form data. On Web, `uri` is a blob URL, so we must convert to a real Blob/File.
            const formData = new FormData();
            if (Platform.OS === 'web') {
                const res = await fetch(uri);
                const blob = await res.blob();
                formData.append('file', blob, 'audio.webm'); // Web usually records webm
            } else {
                formData.append('file', {
                    uri,
                    name: 'audio.m4a',
                    type: 'audio/x-m4a' // FIXED: Sarvam strict MIME checking
                } as any);
            }
            formData.append('model', 'saaras:v3');

            const sttResponse = await fetch('https://api.sarvam.ai/speech-to-text-translate', {
                method: 'POST',
                headers: {
                    'api-subscription-key': SARVAM_API_KEY,
                },
                body: formData as any,
            });

            if (!sttResponse.ok) {
                const errText = await sttResponse.text();
                throw new Error(`STT HTTP error! status: ${sttResponse.status} - ${errText}`);
            }

            const sttData = await sttResponse.json();
            console.log('STT Response:', sttData);
            const transcribedText = sttData.transcript || "Hello, I need help."; // Fallback if format is different
            setTranscript(transcribedText);

            // 2. LLM with Nvidia
            console.log('Starting LLM query...');
            setAgentResponse('Thinking...');
            let llmResult = '';

            const completion = await openai.chat.completions.create({
                model: "sarvamai/sarvam-m",
                messages: [
                    { "role": "system", "content": "You are a helpful assistant. Keep your answer strictly under 450 characters." },
                    { "role": "user", "content": transcribedText }
                ],
                temperature: 0.5,
                top_p: 1,
                max_tokens: 150,
                stream: false
            });

            llmResult = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
            setAgentResponse(llmResult);

            // 3. TTS with Sarvam AI
            console.log('Starting TTS stream...');

            // Sarvam requires inputs <= 500 chars
            const safeLlmResult = llmResult.substring(0, 500);

            const ttsResponse = await fetch("https://api.sarvam.ai/text-to-speech", {
                method: "POST",
                headers: {
                    "api-subscription-key": SARVAM_API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    inputs: [safeLlmResult],
                    target_language_code: "hi-IN",
                    speaker: "shubh",
                    pace: 1.0,
                    speech_sample_rate: 8000,
                    enable_preprocessing: true,
                    model: "bulbul:v3"
                })
            });

            if (!ttsResponse.ok) {
                const errText = await ttsResponse.text();
                throw new Error(`TTS HTTP error! status: ${ttsResponse.status} - ${errText}`);
            }

            const ttsData = await ttsResponse.json();
            if (ttsData.audios && ttsData.audios.length > 0) {
                // The API returns base64 encoded audio
                const base64Audio = ttsData.audios[0];
                let fileUri = '';

                if (Platform.OS === 'web') {
                    // Play directly from base64 on Web browsers
                    fileUri = 'data:audio/wav;base64,' + base64Audio;
                } else {
                    // Write to local file on iOS/Android
                    fileUri = FileSystem.documentDirectory + 'response.wav';
                    await FileSystem.writeAsStringAsync(fileUri, base64Audio, { encoding: 'base64' as any });
                }

                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri: fileUri },
                    { shouldPlay: true }
                );

                setSound(newSound);
                setIsPlaying(true);

                newSound.setOnPlaybackStatusUpdate((status) => {
                    if (status.isLoaded && status.didJustFinish) {
                        setIsPlaying(false);
                    }
                });

            } else {
                throw new Error('No audio returned from TTS');
            }

        } catch (error) {
            console.error('Error in processing flow:', error);
            setAgentResponse('Sorry, an error occurred. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconButton} onPress={() => navigation?.goBack()}>
                    <MaterialIcons name="arrow-back" size={28} color="#0f390f" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Sahayak Voice</Text>
                <View style={styles.languageToggle}>
                    <Text style={styles.langTextActive}>EN</Text>
                    <Text style={styles.langSeparator}>/</Text>
                    <Text style={styles.langTextInactive}>HI</Text>
                </View>
            </View>

            {/* Main Content */}
            <View style={styles.main}>
                {/* Animated Orbs */}
                <View style={styles.orbContainer}>
                    {(isPlaying || isRecording || isProcessing) && (
                        <>
                            <Animated.View
                                style={[
                                    styles.ripple1,
                                    { transform: [{ scale: rippleScale1 }], opacity: rippleOpacity1 },
                                ]}
                            />
                            <Animated.View
                                style={[
                                    styles.ripple2,
                                    { transform: [{ scale: rippleScale2 }], opacity: rippleOpacity2 },
                                ]}
                            />
                            <View style={styles.ripple3} />
                        </>
                    )}

                    <Animated.View style={[styles.centerOrb, { transform: [{ scale: breatheAnim }] }, isRecording ? styles.centerOrbRecording : null]}>
                        <MaterialIcons name="graphic-eq" size={48} color="#fff" />
                    </Animated.View>
                </View>

                {/* Text Area */}
                <View style={[styles.textContainer, { maxHeight: height * 0.3 }]}>
                    <Text style={styles.instructionText}>
                        {agentResponse || "To apply for KCC, you need your Aadhar card, land records, and a bank passbook."}
                    </Text>
                </View>

                <View style={styles.spacer} />

                {/* Bottom Mic Section */}
                <View style={styles.bottomSection}>
                    <Text style={styles.spokenText}>
                        {transcript ? `"${transcript}"` : '"KCC loan ke liye kya documents chahiye?"'}
                    </Text>
                    <TouchableOpacity style={[styles.micButton, isRecording && styles.micButtonActive]} onPress={toggleRecording}>
                        {isProcessing ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <MaterialIcons name={isRecording ? "stop" : "mic"} size={36} color="#fff" />
                        )}
                    </TouchableOpacity>
                    <Text style={styles.listeningText}>
                        {isRecording ? "LISTENING" : isProcessing ? "THINKING" : isPlaying ? "SPEAKING" : "TAP TO SPEAK"}
                    </Text>
                </View>
            </View>

            {/* Background Decor */}
            <View style={styles.bgDecorPrimary} />
            <View style={styles.bgDecorForest} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f5ef',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 16,
        zIndex: 20,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 57, 15, 0.05)',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f390f',
    },
    languageToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(15, 57, 15, 0.1)',
    },
    langTextActive: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#0f390f',
    },
    langSeparator: {
        fontSize: 12,
        color: 'rgba(15, 57, 15, 0.4)',
        marginHorizontal: 4,
    },
    langTextInactive: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(15, 57, 15, 0.6)',
    },
    main: {
        flex: 1,
        alignItems: 'center',
    },
    orbContainer: {
        height: height * 0.35,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: height * 0.05,
    },
    ripple1: {
        position: 'absolute',
        width: 256,
        height: 256,
        borderRadius: 128,
        backgroundColor: 'rgba(6, 249, 6, 0.1)',
    },
    ripple2: {
        position: 'absolute',
        width: 208,
        height: 208,
        borderRadius: 104,
        backgroundColor: 'rgba(6, 249, 6, 0.2)',
    },
    ripple3: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(6, 249, 6, 0.3)',
    },
    centerOrb: {
        width: 128,
        height: 128,
        borderRadius: 64,
        backgroundColor: '#06f906',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#06f906',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 10,
    },
    centerOrbRecording: {
        backgroundColor: '#ff4444',
        shadowColor: '#ff4444',
    },
    textContainer: {
        paddingHorizontal: 32,
        marginTop: 20,
        alignItems: 'center',
        zIndex: 10,
    },
    instructionText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        lineHeight: 32,
    },
    spacer: {
        flex: 1,
    },
    bottomSection: {
        alignItems: 'center',
        paddingBottom: height * 0.1,
        paddingHorizontal: 24,
        width: '100%',
        zIndex: 10,
    },
    spokenText: {
        fontSize: 18,
        fontWeight: '500',
        color: 'rgba(0,0,0,0.6)',
        textAlign: 'center',
        marginBottom: 24,
    },
    micButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    micButtonActive: {
        backgroundColor: '#ff4444',
    },
    listeningText: {
        marginTop: 16,
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(15, 57, 15, 0.4)',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    bgDecorPrimary: {
        position: 'absolute',
        top: '-10%',
        left: '-10%',
        width: '50%',
        height: '50%',
        backgroundColor: 'rgba(6, 249, 6, 0.05)',
        borderRadius: 999,
        zIndex: -1,
    },
    bgDecorForest: {
        position: 'absolute',
        bottom: '-10%',
        right: '-10%',
        width: '50%',
        height: '50%',
        backgroundColor: 'rgba(15, 57, 15, 0.05)',
        borderRadius: 999,
        zIndex: -1,
    },
});
