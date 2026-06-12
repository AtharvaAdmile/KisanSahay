import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { IconCard } from '../components/IconCard';
import {
    useOnboardingStore,
    LandOwnership,
    LandSize,
    CropType,
    IrrigationMethod,
} from '../store/onboardingStore';
import { RootStackParamList } from '../types/navigation';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'OnboardingStep2'>;

export const FarmProfileScreen: React.FC = () => {
    const { t } = useTranslation();
    const navigation = useNavigation<NavProp>();
    const store = useOnboardingStore();

    const ownershipOptions: { key: LandOwnership; icon: string; labelKey: string }[] = [
        { key: 'own', icon: '🏠', labelKey: 'farm_screen.own' },
        { key: 'leased', icon: '🤝', labelKey: 'farm_screen.leased' },
    ];

    const sizeOptions: { key: LandSize; icon: string; labelKey: string }[] = [
        { key: 'below_1_acre', icon: '🌱', labelKey: 'farm_screen.below_1_acre' },
        { key: '1_to_2_acres', icon: '🌿', labelKey: 'farm_screen.1_to_2_acres' },
        { key: '2_to_5_acres', icon: '🌳', labelKey: 'farm_screen.2_to_5_acres' },
        { key: 'above_5_acres', icon: '🏞️', labelKey: 'farm_screen.above_5_acres' },
    ];

    const cropOptions: { key: CropType; icon: string; labelKey: string }[] = [
        { key: 'cotton', icon: '☁️', labelKey: 'farm_screen.cotton' },
        { key: 'sugarcane', icon: '🎋', labelKey: 'farm_screen.sugarcane' },
        { key: 'wheat', icon: '🌾', labelKey: 'farm_screen.wheat' },
        { key: 'rice', icon: '🍚', labelKey: 'farm_screen.rice' },
        { key: 'soybean', icon: '🫘', labelKey: 'farm_screen.soybean' },
        { key: 'other', icon: '🌻', labelKey: 'farm_screen.other' },
    ];

    const irrigationOptions: { key: IrrigationMethod; icon: string; labelKey: string }[] = [
        { key: 'rainfed', icon: '🌧️', labelKey: 'farm_screen.rainfed' },
        { key: 'well', icon: '💧', labelKey: 'farm_screen.well' },
        { key: 'canal', icon: '🚿', labelKey: 'farm_screen.canal' },
    ];

    const isComplete = !!(
        store.landOwnership && store.landSize && store.primaryCrop && store.irrigationMethod
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Progress */}
            <Text style={styles.stepText}>
                {t('onboarding.step', { current: 2, total: 3 })}
            </Text>
            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '66%' }]} />
            </View>

            <Text style={styles.title}>{t('farm_screen.title')}</Text>
            <Text style={styles.subtitle}>{t('farm_screen.subtitle')}</Text>

            {/* Land Ownership */}
            <Text style={styles.sectionLabel}>{t('farm_screen.ownership')}</Text>
            <View style={styles.cardRow}>
                {ownershipOptions.map((opt) => (
                    <IconCard
                        key={opt.key}
                        icon={opt.icon}
                        label={t(opt.labelKey)}
                        isSelected={store.landOwnership === opt.key}
                        onPress={() => store.setFarmDetails({ landOwnership: opt.key })}
                        size="large"
                    />
                ))}
            </View>

            {/* Land Size */}
            <Text style={styles.sectionLabel}>{t('farm_screen.land_size')}</Text>
            <View style={styles.cardRow}>
                {sizeOptions.map((opt) => (
                    <IconCard
                        key={opt.key}
                        icon={opt.icon}
                        label={t(opt.labelKey)}
                        isSelected={store.landSize === opt.key}
                        onPress={() => store.setFarmDetails({ landSize: opt.key })}
                    />
                ))}
            </View>

            {/* Primary Crop */}
            <Text style={styles.sectionLabel}>{t('farm_screen.crop')}</Text>
            <View style={styles.cardRow}>
                {cropOptions.map((opt) => (
                    <IconCard
                        key={opt.key}
                        icon={opt.icon}
                        label={t(opt.labelKey)}
                        isSelected={store.primaryCrop === opt.key}
                        onPress={() => store.setFarmDetails({ primaryCrop: opt.key })}
                    />
                ))}
            </View>

            {/* Irrigation Method */}
            <Text style={styles.sectionLabel}>{t('farm_screen.irrigation')}</Text>
            <View style={styles.cardRow}>
                {irrigationOptions.map((opt) => (
                    <IconCard
                        key={opt.key}
                        icon={opt.icon}
                        label={t(opt.labelKey)}
                        isSelected={store.irrigationMethod === opt.key}
                        onPress={() => store.setFarmDetails({ irrigationMethod: opt.key })}
                    />
                ))}
            </View>

            {/* Navigation */}
            <View style={styles.navRow}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    accessibilityLabel={t('onboarding.back')}
                >
                    <Text style={styles.backButtonText}>← {t('onboarding.back')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.nextButton, !isComplete && styles.nextButtonDisabled]}
                    onPress={isComplete ? () => navigation.navigate('OnboardingStep3') : undefined}
                    disabled={!isComplete}
                    accessibilityLabel={t('onboarding.next')}
                >
                    <Text style={styles.nextButtonText}>{t('onboarding.next')} →</Text>
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
    cardRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
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
    nextButton: {
        flex: 1,
        backgroundColor: '#2E7D32',
        borderRadius: 16,
        paddingVertical: 16,
        alignItems: 'center',
        minHeight: 56,
    },
    nextButtonDisabled: {
        backgroundColor: '#C4C4C4',
    },
    nextButtonText: {
        color: '#FAFAFA',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
