import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Text } from 'react-native';
import { useOnboardingStore } from '../store/onboardingStore';
import { LanguageLocationScreen } from '../screens/LanguageLocationScreen';
import { FarmProfileScreen } from '../screens/FarmProfileScreen';
import { CredentialsScreen } from '../screens/CredentialsScreen';
import { EligibilityDashboard } from '../screens/EligibilityDashboard';
import { VoiceAgentScreen } from '../screens/VoiceAgentScreen';

export const OnboardingNavigator: React.FC = () => {
    const { currentStep, setCurrentStep } = useOnboardingStore();

    const goToStep = (step: number) => {
        setCurrentStep(step);
    };

    const renderScreen = () => {
        switch (currentStep) {
            case 1:
                return <LanguageLocationScreen onNext={() => goToStep(2)} />;
            case 2:
                return (
                    <FarmProfileScreen
                        onNext={() => goToStep(3)}
                        onBack={() => goToStep(1)}
                    />
                );
            case 3:
                return <CredentialsScreen onBack={() => goToStep(2)} onNext={() => goToStep(4)} />;
            case 4:
                return (
                    <View style={{ flex: 1 }}>
                        <EligibilityDashboard />
                        {/* Dev button to go to voice agent */}
                        <TouchableOpacity
                            onPress={() => goToStep(5)}
                            style={{ position: 'absolute', top: 60, right: 20, backgroundColor: '#2e7d32', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, zIndex: 100 }}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>Voice Demo</Text>
                        </TouchableOpacity>
                    </View>
                );
            case 5:
                return <VoiceAgentScreen navigation={{ goBack: () => goToStep(4) }} />;
            default:
                return <LanguageLocationScreen onNext={() => goToStep(2)} />;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F0E1" />
            <View style={styles.inner}>{renderScreen()}</View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F0E1',
    },
    inner: {
        flex: 1,
    },
});
