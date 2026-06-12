import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '../types/navigation';
import { useOnboardingStore } from '../store/onboardingStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export const SplashScreen: React.FC<Props> = ({ navigation }) => {
    const { t } = useTranslation();
    const { isComplete, hasSeenWelcome, currentStep } = useOnboardingStore();
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.85)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 700,
                useNativeDriver: true,
            }),
            Animated.spring(scale, {
                toValue: 1,
                friction: 6,
                tension: 60,
                useNativeDriver: true,
            }),
        ]).start();

        const timer = setTimeout(() => {
            if (isComplete) {
                navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
            } else if (!hasSeenWelcome) {
                navigation.replace('Welcome');
            } else if (currentStep === 3) {
                navigation.replace('OnboardingStep3');
            } else if (currentStep === 2) {
                navigation.replace('OnboardingStep2');
            } else {
                navigation.replace('OnboardingStep1');
            }
        }, 1600);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
                <Text style={styles.emoji}>🌾</Text>
                <Text style={styles.appName}>KisanSahay</Text>
                <Text style={styles.tagline}>{t('welcome_screen.tagline')}</Text>
            </Animated.View>
            <Text style={styles.footer}>किसान सहाय · Kisan Sahay</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F0E1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
    },
    emoji: {
        fontSize: 80,
        marginBottom: 16,
    },
    appName: {
        fontSize: 36,
        fontWeight: '900',
        color: '#5C4033',
        letterSpacing: 1,
        marginBottom: 10,
    },
    tagline: {
        fontSize: 16,
        color: '#8B7355',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    footer: {
        position: 'absolute',
        bottom: 36,
        fontSize: 13,
        color: '#C4C4C4',
        letterSpacing: 0.5,
    },
});
