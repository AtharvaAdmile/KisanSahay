import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useOnboardingStore } from '../store/onboardingStore';

interface PersonalDetailsScreenProps {
    onNext: () => void;
}

export const PersonalDetailsScreen: React.FC<PersonalDetailsScreenProps> = ({ onNext }) => {
    const {
        name,
        dob,
        mobile,
        email,
        setPersonalDetails
    } = useOnboardingStore();

    const [localName, setLocalName] = useState(name);
    const [localDob, setLocalDob] = useState(dob);
    const [localMobile, setLocalMobile] = useState(mobile);
    const [localEmail, setLocalEmail] = useState(email);

    const handleDobChange = (text: string) => {
        // Remove all non-numeric characters
        const cleaned = text.replace(/\D/g, '');

        // Format as DD-MM-YYYY
        let formatted = cleaned;
        if (cleaned.length >= 3 && cleaned.length <= 4) {
            formatted = `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`;
        } else if (cleaned.length >= 5) {
            formatted = `${cleaned.slice(0, 2)}-${cleaned.slice(2, 4)}-${cleaned.slice(4, 8)}`;
        }

        setLocalDob(formatted);
    };

    const handleNext = () => {
        setPersonalDetails(localName, localDob, localMobile, localEmail);
        onNext();
    };

    const isComplete = localName.trim().length > 0 && localMobile.trim().length >= 10;

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Personal Details</Text>
                <Text style={styles.headerSubtitle}>Please enter your basic information.</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Full Name*</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Ramesh Kumar"
                        value={localName}
                        onChangeText={setLocalName}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Date of Birth</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="DD-MM-YYYY"
                        value={localDob}
                        onChangeText={handleDobChange}
                        keyboardType="numeric"
                        maxLength={10}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Mobile Number*</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="9876543210"
                        value={localMobile}
                        onChangeText={setLocalMobile}
                        keyboardType="phone-pad"
                        maxLength={10}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="ramesh@example.com"
                        value={localEmail}
                        onChangeText={setLocalEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.nextButton, !isComplete && styles.nextButtonDisabled]}
                    onPress={handleNext}
                    disabled={!isComplete}
                >
                    <Text style={styles.nextButtonText}>Next</Text>
                    <MaterialIcons name="arrow-forward" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F0E1',
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 24,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#555',
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2e7d32',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        color: '#333',
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        paddingTop: 16,
        backgroundColor: '#F5F0E1',
        borderTopWidth: 1,
        borderTopColor: 'rgba(46, 125, 50, 0.1)',
        alignItems: 'flex-end',
    },
    nextButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2e7d32',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 25,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    nextButtonDisabled: {
        backgroundColor: '#A5D6A7',
        elevation: 0,
        shadowOpacity: 0,
    },
    nextButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 8,
    },
});
