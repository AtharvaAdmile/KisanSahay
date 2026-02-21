import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, SafeAreaView, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export const VoiceAgentScreen = ({ navigation }: any) => {
    const rippleAnim = useRef(new Animated.Value(0)).current;
    const breatheAnim = useRef(new Animated.Value(1)).current;

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
    }, [rippleAnim, breatheAnim]);

    const rippleScale1 = rippleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.5],
    });

    const rippleOpacity1 = rippleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.4, 0],
    });

    // Delay the second ripple slightly in output
    const rippleScale2 = rippleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 1.4],
    });

    const rippleOpacity2 = rippleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0],
    });

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

                    <Animated.View style={[styles.centerOrb, { transform: [{ scale: breatheAnim }] }]}>
                        <MaterialIcons name="graphic-eq" size={48} color="#fff" />
                    </Animated.View>
                </View>

                {/* Text Area */}
                <View style={styles.textContainer}>
                    <Text style={styles.instructionText}>
                        To apply for KCC, you need your Aadhar card, land records, and a bank passbook.
                    </Text>
                </View>

                <View style={styles.spacer} />

                {/* Bottom Mic Section */}
                <View style={styles.bottomSection}>
                    <Text style={styles.spokenText}>"KCC loan ke liye kya documents chahiye?"</Text>
                    <TouchableOpacity style={styles.micButton}>
                        <MaterialIcons name="mic" size={36} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.listeningText}>LISTENING</Text>
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
