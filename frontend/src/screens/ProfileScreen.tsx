import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types/navigation';
import { useOnboardingStore } from '../store/onboardingStore';
import { AppHeader } from '../components/AppHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const LANG_LABELS: Record<string, string> = { hi: 'हिंदी', mr: 'मराठी', en: 'English' };
const LANG_FLAGS: Record<string, string> = { hi: '🇮🇳', mr: '🏛️', en: '🌐' };
const CROP_EMOJIS: Record<string, string> = {
    cotton: '☁️', sugarcane: '🎋', wheat: '🌾',
    rice: '🍚', soybean: '🫘', other: '🌻',
};

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const store = useOnboardingStore();

    const handleReset = () => {
        Alert.alert(
            t('profile_screen.reset'),
            t('profile_screen.reset_confirm'),
            [
                { text: t('onboarding.back'), style: 'cancel' },
                {
                    text: t('profile_screen.reset'),
                    style: 'destructive',
                    onPress: () => {
                        store.resetOnboarding();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'OnboardingStep1' }],
                        });
                    },
                },
            ],
        );
    };

    const ns = (val: string | null | undefined) =>
        val ? val : t('profile_screen.not_set');

    return (
        <View style={styles.container}>
            <AppHeader
                title={t('profile_screen.title')}
                showBack
                onBack={() => navigation.goBack()}
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
            >
                {/* Language & Location Card */}
                <InfoCard
                    icon="🌍"
                    title={t('profile_screen.language_location')}
                    onEdit={() => navigation.navigate('OnboardingStep1')}
                    editLabel={t('profile_screen.edit')}
                >
                    <InfoRow
                        label={LANG_FLAGS[store.language]}
                        value={LANG_LABELS[store.language] ?? store.language}
                    />
                    {store.state ? (
                        <InfoRow label="📍" value={[store.taluka, store.district, store.state].filter(Boolean).join(', ')} />
                    ) : (
                        <InfoRow label="📍" value={t('profile_screen.not_set')} muted />
                    )}
                </InfoCard>

                {/* Farm Details Card */}
                <InfoCard
                    icon={store.primaryCrop ? CROP_EMOJIS[store.primaryCrop] ?? '🌱' : '🌾'}
                    title={t('profile_screen.farm_details')}
                    onEdit={() => navigation.navigate('OnboardingStep2')}
                    editLabel={t('profile_screen.edit')}
                >
                    <InfoRow
                        label={t('farm_screen.ownership')}
                        value={store.landOwnership ? t(`farm_screen.${store.landOwnership}`) : ns(null)}
                        muted={!store.landOwnership}
                    />
                    <InfoRow
                        label={t('farm_screen.land_size')}
                        value={store.landSize ? t(`farm_screen.${store.landSize}`) : ns(null)}
                        muted={!store.landSize}
                    />
                    <InfoRow
                        label={t('farm_screen.crop')}
                        value={store.primaryCrop ? t(`farm_screen.${store.primaryCrop}`) : ns(null)}
                        muted={!store.primaryCrop}
                    />
                    <InfoRow
                        label={t('farm_screen.irrigation')}
                        value={store.irrigationMethod ? t(`farm_screen.${store.irrigationMethod}`) : ns(null)}
                        muted={!store.irrigationMethod}
                    />
                </InfoCard>

                {/* Credentials Card */}
                <InfoCard
                    icon="📋"
                    title={t('profile_screen.credentials')}
                    onEdit={() => navigation.navigate('OnboardingStep3')}
                    editLabel={t('profile_screen.edit')}
                >
                    <InfoRow
                        label={t('credentials_screen.category')}
                        value={store.category ? t(`credentials_screen.${store.category}`) : ns(null)}
                        muted={!store.category}
                    />
                    <InfoRow
                        label={t('credentials_screen.gender')}
                        value={
                            store.gender === 'other'
                                ? t('credentials_screen.other_gender')
                                : store.gender
                                ? t(`credentials_screen.${store.gender}`)
                                : ns(null)
                        }
                        muted={!store.gender}
                    />
                    <DocRow label={t('credentials_screen.aadhaar')} has={store.hasAadhaar} />
                    <DocRow label={t('credentials_screen.bank_account')} has={store.hasBankAccount} />
                    <DocRow label={t('credentials_screen.ration_card')} has={store.hasRationCard} />
                </InfoCard>

                {/* Check Eligibility Again */}
                <TouchableOpacity
                    style={styles.checkButton}
                    onPress={() => navigation.navigate('Home')}
                    accessibilityRole="button"
                    accessibilityLabel={t('profile_screen.check_again')}
                >
                    <Text style={styles.checkButtonText}>🎯 {t('profile_screen.check_again')}</Text>
                </TouchableOpacity>

                {/* Reset */}
                <TouchableOpacity
                    style={styles.resetButton}
                    onPress={handleReset}
                    accessibilityRole="button"
                    accessibilityLabel={t('profile_screen.reset')}
                >
                    <Text style={styles.resetButtonText}>⚠️ {t('profile_screen.reset')}</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

// --- Sub-components ---

interface InfoCardProps {
    icon: string;
    title: string;
    onEdit: () => void;
    editLabel: string;
    children: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, title, onEdit, editLabel, children }) => (
    <View style={cardStyles.card}>
        <View style={cardStyles.header}>
            <Text style={cardStyles.icon}>{icon}</Text>
            <Text style={cardStyles.title}>{title}</Text>
            <TouchableOpacity onPress={onEdit} accessibilityRole="button" accessibilityLabel={editLabel}>
                <Text style={cardStyles.editLink}>✏️ {editLabel}</Text>
            </TouchableOpacity>
        </View>
        <View style={cardStyles.body}>{children}</View>
    </View>
);

const cardStyles = StyleSheet.create({
    card: {
        backgroundColor: '#FAFAFA',
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: '#E0D6CC',
        marginBottom: 14,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0EBE0',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    icon: {
        fontSize: 22,
        marginRight: 10,
    },
    title: {
        flex: 1,
        fontSize: 17,
        fontWeight: '700',
        color: '#5C4033',
    },
    editLink: {
        fontSize: 14,
        color: '#2E7D32',
        fontWeight: '600',
    },
    body: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
});

interface InfoRowProps {
    label: string;
    value: string;
    muted?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, muted }) => (
    <View style={rowStyles.row}>
        <Text style={rowStyles.label}>{label}</Text>
        <Text style={[rowStyles.value, muted && rowStyles.valueMuted]}>{value}</Text>
    </View>
);

interface DocRowProps {
    label: string;
    has: boolean;
}

const DocRow: React.FC<DocRowProps> = ({ label, has }) => (
    <View style={rowStyles.row}>
        <Text style={rowStyles.label}>{label}</Text>
        <View style={[rowStyles.docChip, has ? rowStyles.docChipYes : rowStyles.docChipNo]}>
            <Text style={[rowStyles.docChipText, has ? rowStyles.docChipTextYes : rowStyles.docChipTextNo]}>
                {has ? '✓' : '✗'}
            </Text>
        </View>
    </View>
);

const rowStyles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#F0EBE0',
    },
    label: {
        fontSize: 15,
        color: '#8B7355',
        flex: 1,
    },
    value: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1B1B1B',
        textAlign: 'right',
        flex: 1,
    },
    valueMuted: {
        color: '#C4C4C4',
        fontStyle: 'italic',
    },
    docChip: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    docChipYes: {
        backgroundColor: '#2E7D32',
    },
    docChipNo: {
        backgroundColor: '#E0D6CC',
    },
    docChipText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    docChipTextYes: {
        color: '#FAFAFA',
    },
    docChipTextNo: {
        color: '#8B7355',
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F0E1',
    },
    content: {
        padding: 20,
    },
    checkButton: {
        backgroundColor: '#2E7D32',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 12,
        minHeight: 56,
    },
    checkButtonText: {
        color: '#FAFAFA',
        fontSize: 18,
        fontWeight: '700',
    },
    resetButton: {
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#C62828',
        paddingVertical: 16,
        alignItems: 'center',
        minHeight: 56,
        backgroundColor: 'transparent',
    },
    resetButtonText: {
        color: '#C62828',
        fontSize: 16,
        fontWeight: '600',
    },
});
