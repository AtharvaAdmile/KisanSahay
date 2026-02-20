import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    View,
    AccessibilityRole,
} from 'react-native';

interface IconCardProps {
    icon: string;
    label: string;
    isSelected: boolean;
    onPress: () => void;
    accessibilityLabel?: string;
    size?: 'normal' | 'large';
}

export const IconCard: React.FC<IconCardProps> = ({
    icon,
    label,
    isSelected,
    onPress,
    accessibilityLabel,
    size = 'normal',
}) => {
    const cardSize = size === 'large' ? styles.cardLarge : styles.cardNormal;

    return (
        <TouchableOpacity
            style={[styles.card, cardSize, isSelected && styles.cardSelected]}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole={'button' as AccessibilityRole}
            accessibilityLabel={accessibilityLabel || label}
            accessibilityState={{ selected: isSelected }}
        >
            <Text style={[styles.icon, size === 'large' && styles.iconLarge]}>
                {icon}
            </Text>
            <Text
                style={[styles.label, isSelected && styles.labelSelected]}
                numberOfLines={2}
            >
                {label}
            </Text>
            {isSelected && (
                <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FAFAFA',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E0D6CC',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        position: 'relative',
        // Minimum touch target: 64x64dp
        minWidth: 64,
        minHeight: 64,
    },
    cardNormal: {
        width: '47%',
        aspectRatio: 1,
        marginBottom: 12,
    },
    cardLarge: {
        width: '47%',
        paddingVertical: 20,
        marginBottom: 12,
    },
    cardSelected: {
        backgroundColor: '#EAF5EA',
        borderColor: '#2E7D32',
        borderWidth: 3,
    },
    icon: {
        fontSize: 36,
        marginBottom: 8,
    },
    iconLarge: {
        fontSize: 48,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1B1B1B',
        textAlign: 'center',
    },
    labelSelected: {
        color: '#2E7D32',
        fontWeight: '700',
    },
    checkmark: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#2E7D32',
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmarkText: {
        color: '#FAFAFA',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
