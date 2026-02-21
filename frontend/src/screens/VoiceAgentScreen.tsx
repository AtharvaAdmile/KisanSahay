import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, SafeAreaView, Dimensions, ActivityIndicator, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import OpenAI from 'openai';
import { useOnboardingStore, Language } from '../store/onboardingStore';
import { chatWithRegistrationAgent } from '../services/agentApi';

const { width, height } = Dimensions.get('window');

// Localized translations for "Agent is working..."
const workingTranslations: Record<Language, string> = {
    'en': 'Sahayak is accessing PMFBY systems on your behalf...',
    'hi': 'सहायक आपकी ओर से PMFBY सिस्टम एक्सेस कर रहा है...',
    'mr': 'सहायक आपल्या वतीने PMFBY प्रणाली ऍक्सेस करत आहे...'
};

type AgentState = 'INITIAL' | 'LISTENING' | 'REASONING' | 'AGENT_WORKING' | 'SPEAKING';

const openai = new OpenAI({
    apiKey: process.env.EXPO_PUBLIC_NVIDIA_API_KEY || '',
    baseURL: 'https://integrate.api.nvidia.com/v1',
    dangerouslyAllowBrowser: true
});

const SARVAM_API_KEY = process.env.EXPO_PUBLIC_SARVAM_API_KEY || '';

export const VoiceAgentScreen = ({ navigation }: any) => {
    const rippleAnim = useRef(new Animated.Value(0)).current;
    const breatheAnim = useRef(new Animated.Value(1)).current;

    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [agentState, setAgentState] = useState<AgentState>('INITIAL');
    const [sound, setSound] = useState<Audio.Sound | null>(null);

    const [transcript, setTranscript] = useState('');
    const [agentResponse, setAgentResponse] = useState('');

    // Multi-turn conversational state
    const { activeSchemeContext, language, name, state, district, taluka, mobile, hasAadhaar, hasBankAccount, documents } = useOnboardingStore();
    const [conversationHistory, setConversationHistory] = useState<{ role: string, content: string }[]>([]);
    const [backendSessionId, setBackendSessionId] = useState<string>(`session_${Date.now()}`);
    const [lastBackendRequest, setLastBackendRequest] = useState<string | null>(null);

    useEffect(() => {
        // Ripple Animation 
        Animated.loop(
            Animated.timing(rippleAnim, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
            })
        ).start();

        // Breathing Animation 
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

    useEffect(() => {
        // PMFBY Auto-Initialization
        if (activeSchemeContext === 'PMFBY' && conversationHistory.length === 0) {
            const initialGreeting = "Welcome to the PMFBY eligibility check! Let's find out if you qualify for crop insurance. First, are you a cultivator or sharecropper on the land you wish to insure?";
            setAgentResponse(initialGreeting);
            setConversationHistory([
                { role: "system", content: "You are the official PMFBY (Pradhan Mantri Fasal Bima Yojna) eligibility checker assistant. Your job is to interactively determine if the farmer qualifies for PMFBY. Ask them questions one by one based on this criteria: 1) Are they a cultivator/sharecropper? 2) Do they have a valid land ownership certificate or tenancy agreement? 3) Which crop are they insuring? If they answer yes to 1 and 2, and provide a crop, tell them they are eligible. If they answer no to either 1 or 2, tell them they are not eligible yet. Always reply in exactly the same language the user speaks. DO NOT output markdown. Return a plain JSON object with a single key 'response'." },
                { role: "assistant", content: initialGreeting }
            ]);

            // Play initial greeting
            playTTSString(initialGreeting);
        } else if (conversationHistory.length === 0) {
            // Generic Context
            setConversationHistory([
                { "role": "system", "content": "You are a helpful agricultural assistant. Directly answer the user's query in the exact same language they used. Do not include any internal monologues, thoughts, or markdown formatting. You MUST return strictly a JSON object with a single key 'response' containing your text." }
            ]);
        }
    }, [activeSchemeContext]);

    const playTTSString = async (text: string) => {
        try {
            console.log('Starting TTS stream...');
            const safeText = text.substring(0, 500);

            const ttsResponse = await fetch("https://api.sarvam.ai/text-to-speech", {
                method: "POST",
                headers: {
                    "api-subscription-key": SARVAM_API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    inputs: [safeText],
                    target_language_code: "hi-IN",
                    speaker: "ritu",
                    pace: 1.2,
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
                const base64Audio = ttsData.audios[0];
                let fileUri = '';

                if (Platform.OS === 'web') {
                    fileUri = 'data:audio/wav;base64,' + base64Audio;
                } else {
                    fileUri = FileSystem.documentDirectory + 'response.wav';
                    await FileSystem.writeAsStringAsync(fileUri, base64Audio, { encoding: 'base64' as any });
                }

                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri: fileUri },
                    { shouldPlay: true }
                );

                setSound(newSound);
                setAgentState('SPEAKING');

                newSound.setOnPlaybackStatusUpdate((status) => {
                    if (status.isLoaded && status.didJustFinish) {
                        setAgentState('INITIAL');
                    }
                });
            }
        } catch (error) {
            console.error('Error in TTS:', error);
        }
    };

    const stopPlayback = async () => {
        if (sound && agentState === 'SPEAKING') {
            await sound.stopAsync();
            setAgentState('INITIAL');
        }
    };

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
                if (agentState === 'SPEAKING') setAgentState('INITIAL');
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
            setAgentState('LISTENING');
            console.log('Recording started');
        } catch (err) {
            console.error('Failed to start recording', err);
            setAgentState('INITIAL');
        }
    };

    const stopRecording = async () => {
        console.log('Stopping recording...');
        if (!recording) return;

        setAgentState('REASONING');

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
                setAgentState('INITIAL');
            }
        } catch (err) {
            console.error('Failed to stop recording', err);
            setAgentState('INITIAL');
        }
    };

    const processAudioFlow = async (uri: string) => {
        try {
            // 1. STT with Sarvam AI
            console.log('Starting STT...');
            setTranscript('Listening... transcribing...');

            const formData = new FormData();
            if (Platform.OS === 'web') {
                const res = await fetch(uri);
                const blob = await res.blob();
                formData.append('file', blob, 'audio.webm');
            } else {
                formData.append('file', {
                    uri,
                    name: 'audio.m4a',
                    type: 'audio/x-m4a'
                } as any);
            }
            formData.append('model', 'saaras:v3');

            const sttResponse = await fetch('https://api.sarvam.ai/speech-to-text', {
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
            const transcribedText = sttData.transcript || "Hello, I need help.";
            setTranscript(transcribedText);

            // If activeSchemeContext is PMFBY, enter the Reasoning Loop
            if (activeSchemeContext === 'PMFBY') {
                setAgentState('REASONING');
                setAgentResponse('Evaluating internal logic...');

                const newHistory = [...conversationHistory, { role: "user", content: transcribedText }];

                // 1) Llama 3 Reasoning Step: Is the answer sufficient?
                const reasoningPrompt = `
You are the reasoning coordinator for the PMFBY eligibility checker.
Language to strictly reply in: ${language}
The backend's previous request to the user was: "${lastBackendRequest || 'Initial greeting requesting cultivator status.'}"
The user's response is: "${transcribedText}"

Task: Evaluate if the user's answer is providing the requested information sufficiently.
If NO (the user gave gibberish, asked a different question, or didn't answer properly): 
Reply directly to the user asking for clarification.
If YES (the user answered clearly): 
Output EXACTLY "BACKEND_READY". Do not output anything else.
`;
                const reasoningCompletion = await openai.chat.completions.create({
                    model: "meta/llama-3.3-70b-instruct",
                    messages: [
                        { role: "system", content: "Don't use markdown styling." },
                        ...newHistory,
                        { role: "assistant", content: reasoningPrompt }
                    ] as any,
                    temperature: 0.1,
                    max_tokens: 150,
                });

                const reasoningResult = reasoningCompletion.choices[0]?.message?.content?.trim() || '';

                if (reasoningResult !== "BACKEND_READY" && !reasoningResult.includes("BACKEND_READY")) {
                    // LLM decided to ask clarification. Don't ping backend.
                    setAgentResponse(reasoningResult);
                    setConversationHistory([...newHistory, { role: "assistant", content: reasoningResult }]);
                    await playTTSString(reasoningResult);
                    return;
                }

                // 2) Answer is sufficient -> Dispatch to Backend Agent
                setAgentState('AGENT_WORKING');
                setAgentResponse(workingTranslations[language] || workingTranslations['en']);

                // Build robust profile document payload
                const documents_available = [];
                if (hasAadhaar || documents?.aadhaar) documents_available.push('Aadhaar');
                if (hasBankAccount || documents?.bank) documents_available.push('Bank Account');
                if (documents?.ration) documents_available.push('Ration Card');
                if (documents?.land712) documents_available.push('Land Record 7/12');

                const profileData = { name, state, district, taluka, mobile, documents_available };

                try {
                    const agentChatRes = await chatWithRegistrationAgent(backendSessionId, transcribedText, profileData);

                    const backendStatus = agentChatRes.status;
                    const backendMsg = agentChatRes.message || "Working on it.";

                    if (backendStatus === 'requires_input') {
                        setLastBackendRequest(backendMsg);

                        let formattedSpeech = backendMsg;
                        if (agentChatRes.options && agentChatRes.options.length > 0) {
                            formattedSpeech += ` Options are: ${agentChatRes.options.join(', ')}`;
                        }

                        setAgentResponse(formattedSpeech);
                        setConversationHistory([...newHistory, { role: "assistant", content: formattedSpeech }]);
                        await playTTSString(formattedSpeech);

                    } else if (backendStatus === 'ready_to_submit') {
                        setLastBackendRequest(null);
                        const confirmMsg = "I have filled all the required forms. " + backendMsg + " Ensure your details are correct. Should I final submit?";

                        setAgentResponse(confirmMsg);
                        setConversationHistory([...newHistory, { role: "assistant", content: confirmMsg }]);
                        await playTTSString(confirmMsg);
                    } else if (backendStatus === 'error') {
                        setAgentResponse(`Backend error: ${backendMsg}`);
                        await playTTSString(`There was an error: ${backendMsg}`);
                    }

                } catch (backendError) {
                    console.error("Backend Chat Error:", backendError);
                    setAgentResponse('The backend agent is currently unavailable. Please check server connection.');
                    await playTTSString('Sorry, the automation agent is not responding.');
                }

            } else {
                // Generic RAG LLM fallback
                setAgentState('REASONING');
                console.log('Starting LLM query...');
                setAgentResponse('Thinking...');
                let llmResult = '';

                const newHistory = [...conversationHistory, { role: "user", content: transcribedText }];

                const completion = await openai.chat.completions.create({
                    model: "meta/llama-3.3-70b-instruct",
                    messages: newHistory as any,
                    temperature: 0.5,
                    max_tokens: 150,
                });

                const rawLlm = completion.choices[0]?.message?.content || '{}';
                try {
                    const cleanedRaw = rawLlm.replace(/```json/g, '').replace(/```/g, '').trim();
                    const parsed = JSON.parse(cleanedRaw);
                    llmResult = parsed.response || 'Sorry, I could not generate a response.';
                } catch (e) {
                    llmResult = rawLlm;
                }

                setAgentResponse(llmResult);
                setConversationHistory([...newHistory, { role: "assistant", content: llmResult }]);
                await playTTSString(llmResult);
            }

        } catch (error) {
            console.error('Error in processing flow:', error);
            setAgentResponse('Sorry, an error occurred. Please try again.');
        } finally {
            if (agentState !== 'SPEAKING') setAgentState('INITIAL');
        }
    };

    const toggleRecording = () => {
        if (agentState === 'LISTENING') {
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
                    {(agentState === 'SPEAKING' || agentState === 'LISTENING' || agentState === 'REASONING' || agentState === 'AGENT_WORKING') && (
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

                    <TouchableOpacity activeOpacity={0.8} onPress={stopPlayback} style={styles.centerOrbWrapper}>
                        <Animated.View style={[styles.centerOrb, { transform: [{ scale: breatheAnim }] }, agentState === 'LISTENING' ? styles.centerOrbRecording : null]}>
                            {agentState === 'AGENT_WORKING' ? (
                                <ActivityIndicator size="large" color="#fff" />
                            ) : (
                                <MaterialIcons name="graphic-eq" size={48} color="#fff" />
                            )}
                        </Animated.View>
                    </TouchableOpacity>
                </View>

                {/* Text Area (Hide if activeSchemeContext is active to avoid clutter, or maybe just render it anyway) */}
                {!activeSchemeContext && (
                    <View style={[styles.textContainer, { maxHeight: height * 0.3 }]}>
                        <Text style={styles.instructionText}>
                            {agentResponse || "To apply for KCC, you need your Aadhar card, land records, and a bank passbook."}
                        </Text>
                    </View>
                )}

                <View style={styles.spacer} />

                {/* Bottom Mic Section */}
                <View style={styles.bottomSection}>
                    <Text style={styles.spokenText}>
                        {transcript ? `"${transcript}"` : '"KCC loan ke liye kya documents chahiye?"'}
                    </Text>
                    <TouchableOpacity style={[styles.micButton, agentState === 'LISTENING' && styles.micButtonActive]} onPress={toggleRecording} disabled={agentState === 'AGENT_WORKING'}>
                        {agentState === 'REASONING' || agentState === 'AGENT_WORKING' ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <MaterialIcons name={agentState === 'LISTENING' ? "stop" : "mic"} size={36} color="#fff" />
                        )}
                    </TouchableOpacity>
                    <Text style={styles.listeningText}>
                        {agentState === 'LISTENING' ? "LISTENING" : agentState === 'AGENT_WORKING' ? "BACKEND WORKING" : agentState === 'REASONING' ? "REASONING" : agentState === 'SPEAKING' ? "SPEAKING" : "TAP TO SPEAK"}
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    langTextActive: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2e7d32',
    },
    langSeparator: {
        fontSize: 12,
        color: '#ccc',
        marginHorizontal: 4,
    },
    langTextInactive: {
        fontSize: 12,
        fontWeight: '500',
        color: '#888',
    },
    main: {
        flex: 1,
        zIndex: 10,
        paddingHorizontal: 24,
    },
    orbContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 250,
        marginVertical: 40,
        position: 'relative',
        zIndex: 2,
    },
    centerOrbWrapper: {
        position: 'absolute',
        zIndex: 5,
    },
    centerOrb: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#ee8c2b',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#ee8c2b',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.8)',
    },
    centerOrbRecording: {
        backgroundColor: '#ef4444',
        shadowColor: '#ef4444',
    },
    ripple1: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: '#ee8c2b',
        opacity: 0.3,
    },
    ripple2: {
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: '#ee8c2b',
        opacity: 0.15,
    },
    ripple3: {
        position: 'absolute',
        width: 280,
        height: 280,
        borderRadius: 140,
        borderWidth: 1,
        borderColor: 'rgba(238, 140, 43, 0.2)',
    },
    textContainer: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 4,
    },
    instructionText: {
        fontSize: 20,
        lineHeight: 32,
        color: '#0f390f',
        textAlign: 'center',
        fontWeight: '600',
    },
    spacer: {
        flex: 1,
    },
    bottomSection: {
        alignItems: 'center',
        paddingBottom: 40,
    },
    spokenText: {
        fontSize: 16,
        color: '#666',
        fontStyle: 'italic',
        marginBottom: 24,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    micButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#2e7d32',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#2e7d32',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
        borderWidth: 4,
        borderColor: '#fff',
    },
    micButtonActive: {
        backgroundColor: '#ef4444',
        shadowColor: '#ef4444',
    },
    listeningText: {
        marginTop: 16,
        fontSize: 12,
        fontWeight: 'bold',
        color: '#888',
        letterSpacing: 2,
    },
    bgDecorPrimary: {
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: 'rgba(238, 140, 43, 0.05)',
        zIndex: 0,
    },
    bgDecorForest: {
        position: 'absolute',
        bottom: -150,
        left: -100,
        width: 350,
        height: 350,
        borderRadius: 175,
        backgroundColor: 'rgba(46, 125, 50, 0.03)',
        zIndex: 0,
    }
});
