import React from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useOnboardingStore } from '../store/onboardingStore';
import { LanguageLocationScreen } from '../screens/LanguageLocationScreen';
import { FarmProfileScreen } from '../screens/FarmProfileScreen';
import { CredentialsScreen } from '../screens/CredentialsScreen';

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
                return <CredentialsScreen onBack={() => goToStep(2)} />;
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
