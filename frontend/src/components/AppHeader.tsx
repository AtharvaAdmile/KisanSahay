import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AppHeaderProps {
    title: string;
    showBack?: boolean;
    onBack?: () => void;
    rightElement?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
    title,
    showBack = false,
    onBack,
    rightElement,
}) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F0E1" />
            {showBack ? (
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={onBack}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Text style={styles.backIcon}>‹</Text>
                </TouchableOpacity>
            ) : (
                <View style={styles.sideSlot} />
            )}

            <Text style={styles.title} numberOfLines={1}>
                {title}
            </Text>

            {rightElement ? (
                <View style={styles.sideSlot}>{rightElement}</View>
            ) : (
                <View style={styles.sideSlot} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F0E1',
        paddingBottom: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E0D6CC',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    backIcon: {
        fontSize: 32,
        color: '#5C4033',
        lineHeight: 36,
        marginTop: -4,
    },
    title: {
        flex: 1,
        fontSize: 20,
        fontWeight: '700',
        color: '#5C4033',
        textAlign: 'center',
    },
    sideSlot: {
        width: 40,
    },
});
