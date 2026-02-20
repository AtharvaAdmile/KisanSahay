import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    View,
    AccessibilityRole,
} from 'react-native';

interface BigToggleProps {
    label: string;
    isSelected: boolean;
    onPress: () => void;
    icon?: string;
    accessibilityLabel?: string;
    variant?: 'toggle' | 'checkbox';
}

export const BigToggle: React.FC<BigToggleProps> = ({
    label,
    isSelected,
    onPress,
    icon,
    accessibilityLabel,
    variant = 'toggle',
}) => {
    return (
        <TouchableOpacity
            style={[
                styles.container,
                isSelected && styles.containerSelected,
                variant === 'checkbox' && styles.containerCheckbox,
            ]}
            onPress={onPress}
            activeOpacity={0.7}
            accessibilityRole={
                (variant === 'checkbox' ? 'checkbox' : 'button') as AccessibilityRole
            }
            accessibilityLabel={accessibilityLabel || label}
            accessibilityState={{
                selected: isSelected,
                checked: variant === 'checkbox' ? isSelected : undefined,
            }}
        >
            {variant === 'checkbox' && (
                <View
                    style={[styles.checkbox, isSelected && styles.checkboxSelected]}
                >
                    {isSelected && <Text style={styles.checkIcon}>✓</Text>}
                </View>
            )}
            {icon && <Text style={styles.icon}>{icon}</Text>}
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
                {label}
            </Text>
            {variant === 'toggle' && isSelected && (
                <View style={styles.selectedDot} />
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#E0D6CC',
        paddingVertical: 16,
        paddingHorizontal: 20,
        marginBottom: 10,
        // Minimum touch target: 48dp height
        minHeight: 56,
    },
    containerSelected: {
        backgroundColor: '#EAF5EA',
        borderColor: '#2E7D32',
        borderWidth: 3,
    },
    containerCheckbox: {
        paddingLeft: 16,
    },
    checkbox: {
        width: 28,
        height: 28,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#8B7355',
        marginRight: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FAFAFA',
    },
    checkboxSelected: {
        backgroundColor: '#2E7D32',
        borderColor: '#2E7D32',
    },
    checkIcon: {
        color: '#FAFAFA',
        fontSize: 16,
        fontWeight: 'bold',
    },
    icon: {
        fontSize: 24,
        marginRight: 12,
    },
    label: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1B1B1B',
        flex: 1,
    },
    labelSelected: {
        color: '#2E7D32',
        fontWeight: '700',
    },
    selectedDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#2E7D32',
        marginLeft: 8,
    },
});
