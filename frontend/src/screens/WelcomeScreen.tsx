import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types/navigation';
import { useOnboardingStore, Language } from '../store/onboardingStore';
import i18n from '../i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const LANGUAGES: { key: Language; label: string; nativeLabel: string }[] = [
    { key: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
    { key: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
    { key: 'en', label: 'English', nativeLabel: 'English' },
];

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const store = useOnboardingStore();

    const handleLanguageChange = (lang: Language) => {
        store.setLanguage(lang);
        i18n.changeLanguage(lang);
    };

    const handleStart = () => {
        store.setHasSeenWelcome();
        navigation.navigate('OnboardingStep1');
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                {/* Hero section */}
                <View style={styles.hero}>
                    <View style={styles.emojiRow}>
                        <Text style={styles.heroEmoji}>🌾</Text>
                        <Text style={[styles.heroEmoji, styles.heroEmojiCenter]}>🚜</Text>
                        <Text style={styles.heroEmoji}>👨‍🌾</Text>
                    </View>
                    <Text style={styles.appName}>{t('welcome_screen.title')}</Text>
                    <Text style={styles.tagline}>{t('welcome_screen.tagline')}</Text>
                </View>

                {/* Body */}
                <View style={styles.body}>
                    {/* Language Picker */}
                    <Text style={styles.langHeading}>भाषा / Language / भाषा</Text>
                    <View style={styles.langRow}>
                        {LANGUAGES.map((lang) => (
                            <TouchableOpacity
                                key={lang.key}
                                style={[
                                    styles.langButton,
                                    store.language === lang.key && styles.langButtonSelected,
                                ]}
                                onPress={() => handleLanguageChange(lang.key)}
                                accessibilityLabel={`Select ${lang.label}`}
                                accessibilityState={{ selected: store.language === lang.key }}
                            >
                                <Text
                                    style={[
                                        styles.langNative,
                                        store.language === lang.key && styles.langNativeSelected,
                                    ]}
                                >
                                    {lang.nativeLabel}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Feature highlights */}
                    <View style={styles.features}>
                        {[
                            { icon: '✅', text: t('welcome_screen.feature_check') },
                            { icon: '📋', text: t('welcome_screen.feature_schemes') },
                            { icon: '📶', text: t('welcome_screen.feature_offline') },
                        ].map((f, i) => (
                            <View key={i} style={styles.featureRow}>
                                <Text style={styles.featureIcon}>{f.icon}</Text>
                                <Text style={styles.featureText}>{f.text}</Text>
                            </View>
                        ))}
                    </View>

                    {/* CTA */}
                    <TouchableOpacity
                        style={styles.ctaButton}
                        onPress={handleStart}
                        accessibilityRole="button"
                        accessibilityLabel={t('welcome_screen.cta')}
                    >
                        <Text style={styles.ctaText}>{t('welcome_screen.cta')} →</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F0E1',
    },
    hero: {
        backgroundColor: '#2E7D32',
        paddingVertical: 48,
        paddingHorizontal: 24,
        alignItems: 'center',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    emojiRow: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    heroEmoji: {
        fontSize: 52,
    },
    heroEmojiCenter: {
        marginHorizontal: 16,
    },
    appName: {
        fontSize: 36,
        fontWeight: '900',
        color: '#FAFAFA',
        letterSpacing: 1,
        marginBottom: 8,
    },
    tagline: {
        fontSize: 16,
        color: '#C8E6C9',
        textAlign: 'center',
        lineHeight: 24,
    },
    body: {
        padding: 24,
    },
    langHeading: {
        fontSize: 15,
        color: '#8B7355',
        textAlign: 'center',
        marginBottom: 12,
        fontWeight: '600',
    },
    langRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 28,
        gap: 8,
    },
    langButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#E0D6CC',
        backgroundColor: '#FAFAFA',
        alignItems: 'center',
        minHeight: 52,
        justifyContent: 'center',
    },
    langButtonSelected: {
        borderColor: '#2E7D32',
        borderWidth: 3,
        backgroundColor: '#EAF5EA',
    },
    langNative: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1B1B1B',
    },
    langNativeSelected: {
        color: '#2E7D32',
        fontWeight: '700',
    },
    features: {
        backgroundColor: '#FAFAFA',
        borderRadius: 16,
        padding: 16,
        marginBottom: 28,
        borderWidth: 1,
        borderColor: '#E0D6CC',
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    featureIcon: {
        fontSize: 22,
        marginRight: 12,
        width: 30,
    },
    featureText: {
        fontSize: 16,
        color: '#5C4033',
        flex: 1,
        lineHeight: 22,
    },
    ctaButton: {
        backgroundColor: '#2E7D32',
        borderRadius: 18,
        paddingVertical: 20,
        alignItems: 'center',
        minHeight: 64,
        justifyContent: 'center',
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 6,
    },
    ctaText: {
        color: '#FAFAFA',
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});
