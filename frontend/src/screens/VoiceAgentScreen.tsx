import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, SafeAreaView, Dimensions, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import OpenAI from 'openai';
import { useOnboardingStore, Language } from '../store/onboardingStore';
import { chatWithRegistrationAgent } from '../services/agentApi';
import { SCHEMES_CONTENT } from '../data/schemesData';

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

    const { activeSchemeContext, language, name, state, district, taluka, mobile, hasAadhaar, hasBankAccount, documents } = useOnboardingStore();
    const [conversationHistory, setConversationHistory] = useState<{ role: string, content: string }[]>([]);
    const [operationMode, setOperationMode] = useState<'general' | 'eligibility' | 'agentic' | 'scheme_search'>(activeSchemeContext === 'PMFBY' ? 'eligibility' : 'general');
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
        if (operationMode === 'eligibility' && conversationHistory.length === 0) {
            const initialGreeting = "Welcome to the eligibility check! Let's find out if you qualify. First, are you a cultivator or sharecropper on the land you wish to insure?";
            setAgentResponse(initialGreeting);
            setConversationHistory([
                { role: "system", content: "You are an eligibility checker assistant. Your job is to interactively determine if the farmer qualifies. Ask them questions one by one based on this criteria: 1) Are they a cultivator/sharecropper? 2) Do they have a valid land ownership certificate or tenancy agreement? 3) Which crop are they insuring? If they answer yes to 1 and 2, and provide a crop, tell them they are eligible. If they answer no to either 1 or 2, tell them they are not eligible yet. Always reply in exactly the same language the user speaks. DO NOT output markdown. Return a plain JSON object with a single key 'response'." },
                { role: "assistant", content: initialGreeting }
            ]);
            playTTSString(initialGreeting);
        } else if (operationMode === 'agentic' && conversationHistory.length === 0) {
            const initialGreeting = "I am ready to help you perform actions on the PMFBY portal. Please tell me what you need to do, like applying for insurance.";
            setAgentResponse(initialGreeting);
            setConversationHistory([
                { role: "system", content: "You are the agentic assistant relaying information between the user and the PMFBY backend automation. Help the user in the exact same language they used." },
                { role: "assistant", content: initialGreeting }
            ]);
            playTTSString(initialGreeting);
        } else if (operationMode === 'scheme_search' && conversationHistory.length === 0) {
            const initialGreeting = "I can help you find schemes that you are eligible for. Tell me a bit about your situation, or what you are looking for.";
            setAgentResponse(initialGreeting);
            setConversationHistory([
                { role: "system", content: `You are an expert scheme advisor. Answer the user's queries regarding government schemes in the language they used. You have access to the user's onboarded data: Name (${name}), State (${state}), District (${district}), Mobile (${mobile}). Also here are the available schemes:\n${SCHEMES_CONTENT}\nGive them a tailored response about what schemes might apply to them.` },
                { role: "assistant", content: initialGreeting }
            ]);
            playTTSString(initialGreeting);
        } else if (operationMode === 'general' && conversationHistory.length === 0) {
            const initialGreeting = "Hi, I am Sahayak! How can I help you today?";
            setAgentResponse(initialGreeting);
            setConversationHistory([
                {
                    role: "system",
                    content: `You are a helpful AI Assistant named Sahayak aimed at resolving doubts and issues for farmers and help them with schemes related queries. You have multiple modes of operations: 'general', 'eligibility', and 'agentic'.

Analyze the user's query:
- If they ask to check their eligibility for a scheme, output exactly and only: {"action": "SWITCH_ELIGIBILITY", "response": "Switching to Eligibility Check mode."}
- If they ask about what schemes they are eligible for, what types of schemes exist, or ask for a list of available schemes, output exactly: {"action": "SWITCH_SCHEMES", "response": "Switching to Scheme Search mode."}
- If they ask to apply for a scheme, register, or perform an action on a portal, FIRST evaluate if their request is specific. If they simply say "register", DO NOT switch yet. Output exactly: {"response": "Do you want to register for the crop insurance scheme, or register for a website account on pmfby.gov.in?"}. 
- DO NOT hallucinate or make up insurance premium calculations yourself. If the user asks "how much is my premium" or "calculate my premium", you MUST switch to agentic mode to let the backend browser handle it.
- If their intent is CLEAR (e.g. "register for the scheme", "register for account", "apply for insurance", "calculate premium", "how much is my premium"), output exactly: {"action": "SWITCH_AGENTIC", "intent": "<mapped_intent>", "response": "Switching to Agentic Mode. Now starting the process."}. The mapped_intent MUST be one of 'apply_insurance' or 'calculate_premium'.
- Otherwise, provide a helpful answer to their query in the exact same language they used, within ~200 words. Output a JSON object: {"response": "<your helpful answer>"}. Do not use markdown.`
                },
                { role: "assistant", content: initialGreeting }
            ]);
            playTTSString(initialGreeting);
        }
    }, [operationMode, conversationHistory.length, activeSchemeContext]);

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

            const newHistory = [...conversationHistory, { role: "user", content: transcribedText }];

            if (operationMode === 'agentic') {
                // We're essentially a messenger in this mode. Just relay the transcribedText directly.
                setAgentState('AGENT_WORKING');
                setAgentResponse(workingTranslations[language] || workingTranslations['en']);

                // Build robust profile document payload
                const documents_available = [];
                if (hasAadhaar || documents?.aadhaar) documents_available.push('Aadhaar');
                if (hasBankAccount || documents?.bank) documents_available.push('Bank Account');
                if (documents?.ration) documents_available.push('Ration Card');
                if (documents?.land712) documents_available.push('Land Record 7/12');

                const profileData = { full_name: name, state, district, taluka, mobile, documents_available };

                try {
                    const agentChatRes = await chatWithRegistrationAgent(backendSessionId, transcribedText, transcribedText, profileData);

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

            } else if (operationMode === 'eligibility') {
                setAgentState('REASONING');
                setAgentResponse('Thinking...');
                let llmResult = '';

                const completion = await openai.chat.completions.create({
                    model: "meta/llama-3.3-70b-instruct",
                    messages: newHistory as any,
                    temperature: 0.5,
                    max_tokens: 300,
                });

                const rawLlm = completion.choices[0]?.message?.content || '{}';
                console.log('\n[FRONTEND - ELIGIBILITY MODE] LLM Raw Response:\n', rawLlm, '\n');
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

            } else if (operationMode === 'scheme_search') {
                setAgentState('REASONING');
                setAgentResponse('Searching...');
                let llmResult = '';

                // Add an artificial 3 second delay to simulate searching
                await new Promise(resolve => setTimeout(resolve, 3000));

                const completion = await openai.chat.completions.create({
                    model: "meta/llama-3.3-70b-instruct",
                    messages: newHistory as any,
                    temperature: 0.5,
                    max_tokens: 350,
                });

                const rawLlm = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
                console.log('\n[FRONTEND - SCHEME SEARCH MODE] LLM Raw Response:\n', rawLlm, '\n');
                llmResult = rawLlm;

                setAgentResponse(llmResult);
                setConversationHistory([...newHistory, { role: "assistant", content: llmResult }]);
                await playTTSString(llmResult);

            } else if (operationMode === 'general') {
                setAgentState('REASONING');
                setAgentResponse('Thinking...');
                let llmResult = '';

                const completion = await openai.chat.completions.create({
                    model: "meta/llama-3.3-70b-instruct",
                    messages: newHistory as any,
                    temperature: 0.5,
                    max_tokens: 300,
                });

                const rawLlm = completion.choices[0]?.message?.content || '{}';
                console.log('\n[FRONTEND - GENERAL MODE] LLM Raw Response:\n', rawLlm, '\n');
                try {
                    const cleanedRaw = rawLlm.replace(/```json/g, '').replace(/```/g, '').trim();
                    const parsed = JSON.parse(cleanedRaw);

                    if (parsed.action === 'SWITCH_ELIGIBILITY') {
                        setOperationMode('eligibility');
                        setConversationHistory([]);
                        return;
                    } else if (parsed.action === 'SWITCH_SCHEMES') {
                        setOperationMode('scheme_search');
                        setConversationHistory([]);
                        return;
                    } else if (parsed.action === 'SWITCH_AGENTIC') {
                        setOperationMode('agentic');

                        if (parsed.intent) {
                            setAgentResponse(parsed.response);
                            playTTSString(parsed.response);

                            const newSessionId = "session_" + Date.now();
                            setBackendSessionId(newSessionId);
                            setAgentState('AGENT_WORKING');

                            setConversationHistory([
                                { role: "system", content: "You are the agentic assistant relaying information between the user and the PMFBY backend automation. Help the user in the exact same language they used." },
                                { role: "user", content: transcribedText || "Start" },
                                { role: "assistant", content: parsed.response }
                            ]);

                            const documents_available = [];
                            if (hasAadhaar || documents?.aadhaar) documents_available.push('Aadhaar');
                            if (hasBankAccount || documents?.bank) documents_available.push('Bank Account');
                            if (documents?.ration) documents_available.push('Ration Card');
                            if (documents?.land712) documents_available.push('Land Record 7/12');

                            const profileData = { full_name: name, state, district, taluka, mobile, documents_available };

                            try {
                                const response = await chatWithRegistrationAgent(
                                    newSessionId,
                                    null,
                                    transcribedText || "User requests to start",
                                    profileData,
                                    parsed.intent
                                );

                                if (response.status === 'success') {
                                    const reply = "Task completed successfully.";
                                    setAgentResponse(reply);
                                    playTTSString(reply);
                                    setConversationHistory(prev => [...prev, { role: "assistant", content: reply }]);
                                } else if (response.status === 'requires_input') {
                                    setAgentResponse(response.question || '');
                                    playTTSString(response.question || 'I need more information.');
                                    setConversationHistory(prev => [...prev, { role: "assistant", content: response.question || '' }]);
                                    setLastBackendRequest(response.question || '');
                                }
                                setAgentState('INITIAL');
                            } catch (error) {
                                console.error('Agent chat error:', error);
                                setAgentResponse('Failed to communicate with automation backend.');
                                setAgentState('INITIAL');
                            }
                        } else {
                            setConversationHistory([]);
                        }
                        return;
                    }

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
                <View style={{ alignItems: 'center' }}>
                    <Text style={styles.headerTitle}>Sahayak Voice</Text>
                    <Text style={styles.modeIndicator}>
                        {operationMode === 'general' ? 'General Mode' : operationMode === 'eligibility' ? 'Eligibility Check' : operationMode === 'scheme_search' ? 'Scheme Search' : 'Agentic Mode'}
                    </Text>
                </View>
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

                {/* Text Area (Always render to show status and responses) */}
                <View style={[styles.textContainer, { maxHeight: height * 0.35 }]}>
                    <ScrollView showsVerticalScrollIndicator={true} nestedScrollEnabled={true}>
                        <Text style={[
                            styles.instructionText,
                            agentResponse.length > 150 ? { fontSize: 13, lineHeight: 22 } : {}
                        ]}>
                            {agentResponse || "Hi, how can I help you today?"}
                        </Text>
                    </ScrollView>
                </View>

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
    modeIndicator: {
        fontSize: 12,
        color: '#2e7d32',
        marginTop: 2,
        fontWeight: '600',
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
