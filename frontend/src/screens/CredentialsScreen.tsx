import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { BigToggle } from '../components/BigToggle';
import { useOnboardingStore, Category, Gender } from '../store/onboardingStore';

interface CredentialsScreenProps {
    onBack: () => void;
}

export const CredentialsScreen: React.FC<CredentialsScreenProps> = ({
    onBack,
}) => {
    const { t } = useTranslation();
    const store = useOnboardingStore();

    const categoryOptions: { key: Category; icon: string; labelKey: string }[] = [
        { key: 'general', icon: '🟢', labelKey: 'credentials_screen.general' },
        { key: 'obc', icon: '🟡', labelKey: 'credentials_screen.obc' },
        { key: 'sc', icon: '🔵', labelKey: 'credentials_screen.sc' },
        { key: 'st', icon: '🟤', labelKey: 'credentials_screen.st' },
    ];

    const genderOptions: { key: Gender; icon: string; labelKey: string }[] = [
        { key: 'male', icon: '👨‍🌾', labelKey: 'credentials_screen.male' },
        { key: 'female', icon: '👩‍🌾', labelKey: 'credentials_screen.female' },
        { key: 'other', icon: '🧑‍🌾', labelKey: 'credentials_screen.other_gender' },
    ];

    const documentOptions = [
        {
            key: 'aadhaar' as const,
            icon: '🪪',
            labelKey: 'credentials_screen.aadhaar',
            value: store.hasAadhaar,
            toggle: () => store.setCredentials({ hasAadhaar: !store.hasAadhaar }),
        },
        {
            key: 'bank' as const,
            icon: '🏦',
            labelKey: 'credentials_screen.bank_account',
            value: store.hasBankAccount,
            toggle: () => store.setCredentials({ hasBankAccount: !store.hasBankAccount }),
        },
        {
            key: 'ration' as const,
            icon: '📋',
            labelKey: 'credentials_screen.ration_card',
            value: store.hasRationCard,
            toggle: () => store.setCredentials({ hasRationCard: !store.hasRationCard }),
        },
    ];

    const isComplete = store.category && store.gender;

    const handleSubmit = () => {
        store.markComplete();
        // In production: queue for API submission
        Alert.alert(
            '✅ Profile Complete!',
            `Your profile has been saved locally and will be submitted when connected.\n\n` +
            `Location: ${store.taluka}, ${store.district}, ${store.state}\n` +
            `Land: ${store.landOwnership} / ${store.landSize}\n` +
            `Crop: ${store.primaryCrop}\n` +
            `Category: ${store.category}`,
            [{ text: 'OK' }]
        );
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Progress */}
            <Text style={styles.stepText}>
                {t('onboarding.step', { current: 3, total: 3 })}
            </Text>
            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '100%' }]} />
            </View>

            <Text style={styles.title}>{t('credentials_screen.title')}</Text>
            <Text style={styles.subtitle}>{t('credentials_screen.subtitle')}</Text>

            {/* Category */}
            <Text style={styles.sectionLabel}>{t('credentials_screen.category')}</Text>
            <View style={styles.toggleGroup}>
                {categoryOptions.map((opt) => (
                    <BigToggle
                        key={opt.key}
                        icon={opt.icon}
                        label={t(opt.labelKey)}
                        isSelected={store.category === opt.key}
                        onPress={() => store.setCredentials({ category: opt.key })}
                        variant="toggle"
                    />
                ))}
            </View>

            {/* Gender */}
            <Text style={styles.sectionLabel}>{t('credentials_screen.gender')}</Text>
            <View style={styles.toggleGroup}>
                {genderOptions.map((opt) => (
                    <BigToggle
                        key={opt.key}
                        icon={opt.icon}
                        label={t(opt.labelKey)}
                        isSelected={store.gender === opt.key}
                        onPress={() => store.setCredentials({ gender: opt.key })}
                        variant="toggle"
                    />
                ))}
            </View>

            {/* Documents */}
            <Text style={styles.sectionLabel}>{t('credentials_screen.documents')}</Text>
            <View style={styles.toggleGroup}>
                {documentOptions.map((doc) => (
                    <BigToggle
                        key={doc.key}
                        icon={doc.icon}
                        label={t(doc.labelKey)}
                        isSelected={doc.value}
                        onPress={doc.toggle}
                        variant="checkbox"
                    />
                ))}
            </View>

            {/* Navigation */}
            <View style={styles.navRow}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={onBack}
                    accessibilityLabel={t('onboarding.back')}
                >
                    <Text style={styles.backButtonText}>← {t('onboarding.back')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.submitButton, !isComplete && styles.submitButtonDisabled]}
                    onPress={isComplete ? handleSubmit : undefined}
                    disabled={!isComplete}
                    accessibilityLabel={t('onboarding.submit')}
                >
                    <Text style={styles.submitButtonText}>✓ {t('onboarding.submit')}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F0E1',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    stepText: {
        fontSize: 14,
        color: '#8B7355',
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: '600',
    },
    progressBar: {
        height: 6,
        backgroundColor: '#E0D6CC',
        borderRadius: 3,
        marginBottom: 24,
    },
    progressFill: {
        height: 6,
        backgroundColor: '#2E7D32',
        borderRadius: 3,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#5C4033',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 16,
        color: '#8B7355',
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#5C4033',
        marginBottom: 12,
        marginTop: 8,
    },
    toggleGroup: {
        marginBottom: 8,
    },
    navRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        gap: 12,
    },
    backButton: {
        flex: 1,
        backgroundColor: '#FAFAFA',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#8B7355',
        paddingVertical: 16,
        alignItems: 'center',
        minHeight: 56,
    },
    backButtonText: {
        color: '#5C4033',
        fontSize: 18,
        fontWeight: '600',
    },
    submitButton: {
        flex: 1,
        backgroundColor: '#FF8F00',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        minHeight: 56,
    },
    submitButtonDisabled: {
        backgroundColor: '#C4C4C4',
    },
    submitButtonText: {
        color: '#FAFAFA',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
