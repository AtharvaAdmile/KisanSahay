import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types/navigation';
import { useOnboardingStore } from '../store/onboardingStore';
import { evaluateEligibility } from '../engine/eligibility';
import { AppHeader } from '../components/AppHeader';
import { SchemeCard } from '../components/SchemeCard';
import { FarmSummaryCard } from '../components/FarmSummaryCard';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const store = useOnboardingStore();
    const results = evaluateEligibility(store);
    const eligible = results.filter((r) => r.eligible);
    const ineligible = results.filter((r) => !r.eligible);

    return (
        <View style={styles.container}>
            <AppHeader title="KisanSahay" />
            <ScrollView
                contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Farm Summary */}
                <FarmSummaryCard store={store} />

                {/* Eligible Count Banner */}
                <View style={styles.banner}>
                    <Text style={styles.bannerEmoji}>🎯</Text>
                    <Text style={styles.bannerText}>
                        {t('home_screen.eligible_banner', {
                            count: eligible.length,
                            total: results.length,
                        })}
                    </Text>
                </View>

                {/* Eligible Schemes */}
                {eligible.length > 0 && (
                    <>
                        <Text style={styles.sectionHeading}>
                            {t('home_screen.matched_heading')}
                        </Text>
                        {eligible.map((result) => (
                            <SchemeCard
                                key={result.scheme.scheme_id}
                                scheme={result.scheme}
                                isEligible
                                failedConditionKeys={[]}
                                language={store.language}
                                onPress={() =>
                                    navigation.navigate('SchemeDetail', {
                                        schemeId: result.scheme.scheme_id,
                                    })
                                }
                            />
                        ))}
                    </>
                )}

                {/* Ineligible Schemes */}
                {ineligible.length > 0 && (
                    <>
                        <Text style={styles.sectionHeadingMuted}>
                            {t('home_screen.other_heading')}
                        </Text>
                        {ineligible.map((result) => (
                            <SchemeCard
                                key={result.scheme.scheme_id}
                                scheme={result.scheme}
                                isEligible={false}
                                failedConditionKeys={result.failedConditionKeys}
                                language={store.language}
                                onPress={() =>
                                    navigation.navigate('SchemeDetail', {
                                        schemeId: result.scheme.scheme_id,
                                    })
                                }
                            />
                        ))}
                    </>
                )}

                {/* Profile Button */}
                <TouchableOpacity
                    style={styles.profileButton}
                    onPress={() => navigation.navigate('Profile')}
                    accessibilityRole="button"
                    accessibilityLabel={t('home_screen.my_profile')}
                >
                    <Text style={styles.profileButtonText}>
                        👤 {t('home_screen.my_profile')}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F0E1',
    },
    content: {
        padding: 20,
    },
    banner: {
        backgroundColor: '#2E7D32',
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    bannerEmoji: {
        fontSize: 24,
        marginRight: 12,
    },
    bannerText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FAFAFA',
        flex: 1,
    },
    sectionHeading: {
        fontSize: 20,
        fontWeight: '800',
        color: '#2E7D32',
        marginBottom: 12,
    },
    sectionHeadingMuted: {
        fontSize: 18,
        fontWeight: '700',
        color: '#8B7355',
        marginTop: 8,
        marginBottom: 12,
    },
    profileButton: {
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#8B7355',
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 12,
        minHeight: 56,
        backgroundColor: '#FAFAFA',
    },
    profileButtonText: {
        color: '#5C4033',
        fontSize: 18,
        fontWeight: '700',
    },
});
