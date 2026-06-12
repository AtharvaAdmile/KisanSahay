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
import { evaluateEligibility } from '../engine/eligibility';
import { SCHEMES } from '../data/schemes';
import { AppHeader } from '../components/AppHeader';

type Props = NativeStackScreenProps<RootStackParamList, 'SchemeDetail'>;

export const SchemeDetailScreen: React.FC<Props> = ({ route, navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const store = useOnboardingStore();
    const { schemeId } = route.params;

    const scheme = SCHEMES.find((s) => s.scheme_id === schemeId);
    if (!scheme) return null;

    const result = evaluateEligibility(store).find((r) => r.scheme.scheme_id === schemeId);
    const isEligible = result?.eligible ?? false;
    const conditionResults = result?.conditionResults ?? [];

    const schemeName =
        store.language === 'hi'
            ? scheme.name_hi
            : store.language === 'mr'
            ? scheme.name_mr
            : scheme.name;

    const handleApply = () => {
        Alert.alert(
            scheme.name,
            `${t('scheme_detail.how_to_apply')}:\n\n${scheme.howToApply
                .map((step, i) => `${i + 1}. ${step}`)
                .join('\n\n')}`,
            [{ text: 'OK' }],
        );
    };

    return (
        <View style={styles.container}>
            <AppHeader
                title={scheme.name}
                showBack
                onBack={() => navigation.goBack()}
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
            >
                {/* Colored Header Band */}
                <View style={[styles.headerBand, { backgroundColor: scheme.accentColor }]}>
                    <Text style={styles.headerIcon}>{scheme.icon}</Text>
                    <Text style={styles.headerName}>{schemeName}</Text>
                    <View style={[styles.eligibilityChip, isEligible ? styles.chipGreen : styles.chipGray]}>
                        <Text style={styles.chipText}>
                            {isEligible
                                ? t('scheme_detail.eligible_chip')
                                : t('scheme_detail.not_eligible_chip')}
                        </Text>
                    </View>
                    <Text style={styles.headerMinistry}>
                        {t('scheme_detail.ministry')}: {scheme.ministry}
                    </Text>
                </View>

                <View style={styles.body}>
                    {/* What You Get */}
                    <Section title={t('scheme_detail.what_you_get')}>
                        <Text style={styles.amountText}>{scheme.amount}</Text>
                        <Text style={styles.bodyText}>{scheme.benefits}</Text>
                    </Section>

                    {/* Eligibility Checklist */}
                    <Section title={t('scheme_detail.eligibility')}>
                        {conditionResults.map((cond) => (
                            <View key={cond.labelKey} style={styles.checkRow}>
                                <View
                                    style={[
                                        styles.checkBadge,
                                        cond.met ? styles.checkBadgeGreen : styles.checkBadgeRed,
                                    ]}
                                >
                                    <Text style={styles.checkBadgeIcon}>
                                        {cond.met ? '✓' : '✗'}
                                    </Text>
                                </View>
                                <Text
                                    style={[
                                        styles.checkLabel,
                                        !cond.met && styles.checkLabelUnmet,
                                    ]}
                                >
                                    {t(cond.labelKey)}
                                </Text>
                            </View>
                        ))}
                    </Section>

                    {/* How to Apply */}
                    <Section title={t('scheme_detail.how_to_apply')}>
                        {scheme.howToApply.map((step, index) => (
                            <View key={index} style={styles.stepRow}>
                                <View style={styles.stepNumber}>
                                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                                </View>
                                <Text style={styles.stepText}>{step}</Text>
                            </View>
                        ))}
                    </Section>

                    {/* Required Documents */}
                    <Section title={t('scheme_detail.documents_needed')}>
                        {scheme.requiredDocs.map((doc) => {
                            const hasDoc =
                                (doc.toLowerCase().includes('aadhaar') && store.hasAadhaar) ||
                                (doc.toLowerCase().includes('bank') && store.hasBankAccount) ||
                                (doc.toLowerCase().includes('ration') && store.hasRationCard);
                            return (
                                <View key={doc} style={styles.checkRow}>
                                    <View
                                        style={[
                                            styles.checkBadge,
                                            hasDoc ? styles.checkBadgeGreen : styles.checkBadgeGray,
                                        ]}
                                    >
                                        <Text style={styles.checkBadgeIcon}>
                                            {hasDoc ? '✓' : '○'}
                                        </Text>
                                    </View>
                                    <Text style={[styles.checkLabel, !hasDoc && styles.checkLabelMuted]}>
                                        {doc}
                                    </Text>
                                </View>
                            );
                        })}
                    </Section>

                    {/* Apply CTA */}
                    <TouchableOpacity
                        style={[styles.applyButton, { backgroundColor: isEligible ? '#FF8F00' : '#8B7355' }]}
                        onPress={handleApply}
                        accessibilityRole="button"
                        accessibilityLabel={t('scheme_detail.apply_now')}
                    >
                        <Text style={styles.applyButtonText}>
                            {t('scheme_detail.apply_now')} →
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <View style={sectionStyles.container}>
        <Text style={sectionStyles.title}>{title}</Text>
        {children}
    </View>
);

const sectionStyles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: '#5C4033',
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#FF8F00',
        paddingLeft: 10,
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F0E1',
    },
    headerBand: {
        padding: 24,
        alignItems: 'center',
        paddingBottom: 28,
    },
    headerIcon: {
        fontSize: 56,
        marginBottom: 8,
    },
    headerName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FAFAFA',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 30,
    },
    eligibilityChip: {
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 6,
        marginBottom: 10,
    },
    chipGreen: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.6)',
    },
    chipGray: {
        backgroundColor: 'rgba(0,0,0,0.15)',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    chipText: {
        color: '#FAFAFA',
        fontSize: 14,
        fontWeight: '700',
    },
    headerMinistry: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.75)',
        textAlign: 'center',
    },
    body: {
        padding: 20,
    },
    amountText: {
        fontSize: 28,
        fontWeight: '900',
        color: '#2E7D32',
        marginBottom: 8,
    },
    bodyText: {
        fontSize: 16,
        color: '#5C4033',
        lineHeight: 24,
    },
    checkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    checkBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    checkBadgeGreen: {
        backgroundColor: '#2E7D32',
    },
    checkBadgeRed: {
        backgroundColor: '#C62828',
    },
    checkBadgeGray: {
        backgroundColor: '#E0D6CC',
    },
    checkBadgeIcon: {
        color: '#FAFAFA',
        fontSize: 14,
        fontWeight: 'bold',
    },
    checkLabel: {
        fontSize: 16,
        color: '#1B1B1B',
        flex: 1,
    },
    checkLabelUnmet: {
        color: '#C62828',
    },
    checkLabelMuted: {
        color: '#8B7355',
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 14,
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#FF8F00',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        marginTop: 1,
        flexShrink: 0,
    },
    stepNumberText: {
        color: '#FAFAFA',
        fontSize: 14,
        fontWeight: '800',
    },
    stepText: {
        fontSize: 15,
        color: '#5C4033',
        flex: 1,
        lineHeight: 22,
    },
    applyButton: {
        borderRadius: 18,
        paddingVertical: 20,
        alignItems: 'center',
        marginTop: 8,
        minHeight: 64,
        justifyContent: 'center',
    },
    applyButtonText: {
        color: '#FAFAFA',
        fontSize: 20,
        fontWeight: '800',
    },
});
