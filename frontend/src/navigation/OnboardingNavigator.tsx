import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Text } from 'react-native';
import { useOnboardingStore } from '../store/onboardingStore';
import { LanguageLocationScreen } from '../screens/LanguageLocationScreen';
import { CredentialsScreen } from '../screens/CredentialsScreen';
import { EligibilityDashboard } from '../screens/EligibilityDashboard';
import { VoiceAgentScreen } from '../screens/VoiceAgentScreen';
import { PersonalDetailsScreen } from '../screens/PersonalDetailsScreen';
import { SchemePage } from '../screens/SchemePage';
import { UserProfileScreen } from '../screens/UserProfileScreen';

export const OnboardingNavigator: React.FC = () => {
    const { currentStep, setCurrentStep } = useOnboardingStore();

    // Removed forced bypass - Onboarding is re-enabled natively starting at Step 1

    const goToStep = (step: number) => {
        setCurrentStep(step);
    };

    const renderScreen = () => {
        switch (currentStep) {
            case 1:
                return <PersonalDetailsScreen onNext={() => goToStep(2)} />;
            case 2:
                // Now LanguageLocation goes directly to Credentials (step 3)
                return <LanguageLocationScreen onNext={() => goToStep(3)} />;
            case 3:
                return <CredentialsScreen onBack={() => goToStep(2)} onNext={() => goToStep(4)} />;
            case 4:
                return (
                    <EligibilityDashboard
                        onVoiceAgentPress={() => goToStep(5)}
                        onSchemePress={() => goToStep(6)}
                        onProfilePress={() => goToStep(7)}
                    />
                );
            case 5:
                return <VoiceAgentScreen navigation={{ goBack: () => goToStep(4) }} />;
            case 6:
                return (
                    <SchemePage
                        onBack={() => goToStep(4)}
                        onAskShayak={() => goToStep(5)}
                    />
                );
            case 7:
                return <UserProfileScreen onHome={() => goToStep(4)} />;
            default:
                return <PersonalDetailsScreen onNext={() => goToStep(2)} />;
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
