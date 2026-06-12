import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { OnboardingState } from '../store/onboardingStore';

interface FarmSummaryCardProps {
    store: OnboardingState;
}

const CROP_EMOJIS: Record<string, string> = {
    cotton: '☁️',
    sugarcane: '🎋',
    wheat: '🌾',
    rice: '🍚',
    soybean: '🫘',
    other: '🌻',
};

const LANG_FLAGS: Record<string, string> = {
    hi: '🇮🇳',
    mr: '🏛️',
    en: '🌐',
};

export const FarmSummaryCard: React.FC<FarmSummaryCardProps> = ({ store }) => {
    const { t } = useTranslation();

    const cropEmoji = store.primaryCrop ? CROP_EMOJIS[store.primaryCrop] ?? '🌱' : '🌱';
    const langFlag = LANG_FLAGS[store.language] ?? '🌐';

    const locationLine = [store.taluka, store.district, store.state]
        .filter(Boolean)
        .join(', ');

    const landLine = [
        store.landSize ? t(`farm_screen.${store.landSize}`) : null,
        store.landOwnership ? t(`farm_screen.${store.landOwnership}`) : null,
    ]
        .filter(Boolean)
        .join(' · ');

    const cropLine = store.primaryCrop ? t(`farm_screen.${store.primaryCrop}`) : null;

    return (
        <View style={styles.card}>
            <View style={styles.topRow}>
                <Text style={styles.avatar}>{cropEmoji}</Text>
                <View style={styles.info}>
                    <Text style={styles.greeting}>{t('home_screen.greeting')}</Text>
                    {locationLine ? (
                        <Text style={styles.detail}>📍 {locationLine}</Text>
                    ) : null}
                    {landLine ? (
                        <Text style={styles.detail}>🏡 {landLine}</Text>
                    ) : null}
                    {cropLine ? (
                        <Text style={styles.detail}>
                            {cropEmoji} {cropLine}
                            {store.irrigationMethod
                                ? ` · ${t(`farm_screen.${store.irrigationMethod}`)}`
                                : ''}
                        </Text>
                    ) : null}
                </View>
                <Text style={styles.langFlag}>{langFlag}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FAFAFA',
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#E0D6CC',
        padding: 16,
        marginBottom: 16,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    avatar: {
        fontSize: 40,
        marginRight: 14,
        marginTop: 2,
    },
    info: {
        flex: 1,
    },
    greeting: {
        fontSize: 18,
        fontWeight: '700',
        color: '#5C4033',
        marginBottom: 4,
    },
    detail: {
        fontSize: 14,
        color: '#8B7355',
        marginBottom: 2,
    },
    langFlag: {
        fontSize: 24,
        marginLeft: 8,
    },
});
