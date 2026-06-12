import React from 'react';
import {
    TouchableOpacity,
    View,
    Text,
    StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { Scheme } from '../data/schemes';

interface SchemeCardProps {
    scheme: Scheme;
    isEligible: boolean;
    failedConditionKeys: string[];
    language: string;
    onPress: () => void;
}

function getLocalizedName(scheme: Scheme, language: string): string {
    if (language === 'hi') return scheme.name_hi;
    if (language === 'mr') return scheme.name_mr;
    return scheme.name;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({
    scheme,
    isEligible,
    failedConditionKeys,
    language,
    onPress,
}) => {
    const { t } = useTranslation();

    return (
        <TouchableOpacity
            style={[styles.card, isEligible ? styles.cardEligible : styles.cardIneligible]}
            onPress={onPress}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={getLocalizedName(scheme, language)}
        >
            {/* Left accent bar */}
            <View style={[styles.accentBar, { backgroundColor: scheme.accentColor }]} />

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.topRow}>
                    <Text style={styles.icon}>{scheme.icon}</Text>
                    <Text style={styles.name} numberOfLines={2}>
                        {getLocalizedName(scheme, language)}
                    </Text>
                    <View style={[styles.chip, isEligible ? styles.chipEligible : styles.chipIneligible]}>
                        <Text style={[styles.chipText, isEligible ? styles.chipTextEligible : styles.chipTextIneligible]}>
                            {isEligible ? t('scheme_detail.eligible_chip') : '✗'}
                        </Text>
                    </View>
                </View>

                <Text style={styles.amount}>{scheme.amount}</Text>

                {!isEligible && failedConditionKeys.length > 0 && (
                    <Text style={styles.requires} numberOfLines={2}>
                        {t('results_screen.requires')}:{' '}
                        {failedConditionKeys.map((k) => t(k)).join(', ')}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        borderRadius: 16,
        borderWidth: 1.5,
        marginBottom: 12,
        overflow: 'hidden',
        minHeight: 80,
    },
    cardEligible: {
        backgroundColor: '#EAF5EA',
        borderColor: '#2E7D32',
    },
    cardIneligible: {
        backgroundColor: '#FAFAFA',
        borderColor: '#E0D6CC',
    },
    accentBar: {
        width: 6,
        minHeight: 80,
    },
    content: {
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    icon: {
        fontSize: 24,
        marginRight: 10,
        marginTop: 1,
    },
    name: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        color: '#1B1B1B',
        lineHeight: 22,
    },
    chip: {
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 3,
        marginLeft: 8,
        alignSelf: 'flex-start',
    },
    chipEligible: {
        backgroundColor: '#2E7D32',
    },
    chipIneligible: {
        backgroundColor: '#E0D6CC',
    },
    chipText: {
        fontSize: 12,
        fontWeight: '700',
    },
    chipTextEligible: {
        color: '#FAFAFA',
    },
    chipTextIneligible: {
        color: '#8B7355',
    },
    amount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#5C4033',
        marginBottom: 4,
    },
    requires: {
        fontSize: 13,
        color: '#8B7355',
        fontStyle: 'italic',
    },
});
