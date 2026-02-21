import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Platform, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import MlkitOcr from 'react-native-mlkit-ocr';
import { useOnboardingStore } from '../store/onboardingStore';
import { Alert, Modal, TextInput } from 'react-native';

interface UserProfileScreenProps {
    onHome: () => void;
}

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ onHome }) => {
    const { name, state, district, documents, aadhaarNumber, setDocument, setAadhaarNumber } = useOnboardingStore();
    const [isManualModalVisible, setManualModalVisible] = React.useState(false);
    const [manualAadhaar, setManualAadhaar] = React.useState('');

    const handleDocumentUpload = async (docType: string) => {
        if (docType !== 'aadhaar') {
            Alert.alert("Notice", "Only Aadhaar upload is currently supported.");
            return;
        }

        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: false,
            });

            if (result.canceled) return;

            const file = result.assets[0];
            const fileUri = file.uri;

            // Perform On-Device OCR Verification for Aadhaar
            try {
                const ocrResult = await MlkitOcr.detectFromUri(fileUri);
                const fullText = ocrResult.map(block => block.text).join(' ');
                const lowerText = fullText.toLowerCase();

                const isGovtDoc = lowerText.includes("government of india") || lowerText.includes("unique identification authority of india");

                // Regex to find 12 digit numbers formatted as XXXX XXXX XXXX or XXXXXXXXXXXX
                const twelveDigitRegex = /\b\d{4}\s?\d{4}\s?\d{4}\b/g;
                const matches = fullText.match(twelveDigitRegex);

                if (!isGovtDoc || !matches || matches.length === 0) {
                    Alert.alert("Verification Failed", "The uploaded document does not appear to be a valid Aadhaar card. Please ensure it is clear and authentic.");
                    return;
                }

                // First matched 12-digit number is the Aadhaar Number. (Second may be VID)
                let aadhaarNumberFound = matches[0].replace(/\s/g, '');
                setAadhaarNumber(aadhaarNumberFound);

            } catch (ocrError) {
                console.error("OCR Check failed:", ocrError);
                Alert.alert("Verification Error", "Could not process document text. Please try again.");
                return;
            }

            // Save document securely locally
            const newPath = FileSystem.documentDirectory + `${docType}_${Date.now()}_${file.name}`;

            await FileSystem.copyAsync({
                from: fileUri,
                to: newPath,
            });

            setDocument(docType, newPath);
            Alert.alert("Success", "Aadhaar verified and uploaded successfully!");
        } catch (error) {
            console.error("Error picking document:", error);
            Alert.alert("Error", "Failed to upload document. Please try again.");
        }
    };

    const submitManualAadhaar = () => {
        const cleaned = manualAadhaar.replace(/\s/g, '');
        if (cleaned.length === 12 && /^\d+$/.test(cleaned)) {
            setAadhaarNumber(cleaned);
            setDocument('aadhaar', 'manual_entry');
            setManualModalVisible(false);
            Alert.alert("Success", "Aadhaar number saved manually!");
        } else {
            Alert.alert("Invalid Format", "Aadhaar must be exactly 12 digits.");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F0E1" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.iconButton} onPress={onHome}>
                    <MaterialIcons name="arrow-back" size={24} color="#8C705F" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Profile</Text>

            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Profile Info */}
                <View style={styles.profileSection}>

                    <Text style={styles.profileName}>{name || 'Farmer'}</Text>
                    <View style={styles.locationRow}>
                        <MaterialIcons name="location-on" size={18} color="#8C705F" />
                        <Text style={styles.locationText}>{district || 'District'}, {state || 'State'} • 2 Acres • Cotton</Text>
                    </View>
                </View>

                {/* Scheme Readiness */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Scheme Readiness</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAllText}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.schemeCard}>
                        <View style={[styles.schemeIconBox, { backgroundColor: '#e8f5e9' }]}>
                            <MaterialIcons name="agriculture" size={24} color="#2e7d32" />
                        </View>
                        <View style={styles.schemeContent}>
                            <View style={styles.schemeTitleRow}>
                                <Text style={styles.schemeTitle}>PM-KISAN</Text>
                                <View style={[styles.statusBadge, { backgroundColor: '#e8f5e9' }]}>
                                    <MaterialIcons name="check-circle" size={12} color="#2e7d32" style={{ marginRight: 2 }} />
                                    <Text style={[styles.statusText, { color: '#2e7d32' }]}>Active DBT</Text>
                                </View>
                            </View>
                            <Text style={styles.schemeSubtext}>Next installment of ₹2,000 due in Oct</Text>
                        </View>
                    </View>

                    <View style={[styles.schemeCard, { borderColor: 'rgba(46, 125, 50, 0.3)' }]}>
                        <View style={[styles.schemeIconBox, { backgroundColor: 'rgba(46, 125, 50, 0.1)' }]}>
                            <MaterialIcons name="umbrella" size={24} color="#2e7d32" />
                        </View>
                        <View style={styles.schemeContent}>
                            <View style={styles.schemeTitleRow}>
                                <Text style={styles.schemeTitle}>PMFBY Insurance</Text>
                                <View style={[styles.statusBadge, { backgroundColor: 'rgba(46, 125, 50, 0.1)' }]}>
                                    <MaterialIcons name="warning" size={12} color="#2e7d32" style={{ marginRight: 2 }} />
                                    <Text style={[styles.statusText, { color: '#2e7d32' }]}>Action</Text>
                                </View>
                            </View>
                            <Text style={[styles.schemeSubtext, { marginBottom: 8 }]}>Sowing details for Cotton incomplete.</Text>
                            <TouchableOpacity style={styles.updateButton}>
                                <Text style={styles.updateButtonText}>Update Sowing Details</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Documents Upload Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Documents</Text>
                        <MaterialIcons name="lock" size={20} color="rgba(92, 64, 51, 0.5)" />
                    </View>

                    <View style={styles.documentsGrid}>
                        {/* Aadhaar */}
                        <TouchableOpacity style={styles.docCard} onPress={() => handleDocumentUpload('aadhaar')}>
                            <View style={styles.docIconWrapper}>
                                {documents.aadhaar && <MaterialIcons name="verified" size={18} color="#2e7d32" style={styles.verifiedIcon} />}
                                <View style={[styles.docIcon, { backgroundColor: '#fff3e0' }]}>
                                    <MaterialIcons name="badge" size={24} color="#f57c00" />
                                </View>
                            </View>
                            <Text style={styles.docTitle}>Aadhaar Scanner</Text>
                            <Text style={[styles.docSubtitle, documents.aadhaar && styles.docUploadedText]}>
                                {documents.aadhaar ? 'Uploaded' : 'Smart Upload via OCR'}
                            </Text>
                        </TouchableOpacity>

                        {/* Manual Aadhaar Entry */}
                        <TouchableOpacity style={styles.docCard} onPress={() => setManualModalVisible(true)}>
                            <View style={styles.docIconWrapper}>
                                {documents.aadhaar === 'manual_entry' && <MaterialIcons name="verified" size={18} color="#2e7d32" style={styles.verifiedIcon} />}
                                <View style={[styles.docIcon, { backgroundColor: '#e8f5e9' }]}>
                                    <MaterialIcons name="keyboard" size={24} color="#2e7d32" />
                                </View>
                            </View>
                            <Text style={styles.docTitle}>Manual Entry</Text>
                            <Text style={[styles.docSubtitle, documents.aadhaar === 'manual_entry' && styles.docUploadedText]}>
                                {aadhaarNumber ? `xxxx-xxxx-${aadhaarNumber.slice(-4)}` : 'Type Aadhaar ID'}
                            </Text>
                        </TouchableOpacity>

                        {/* Bank Details */}
                        <TouchableOpacity style={[styles.docCard, styles.disabledCard]} onPress={() => handleDocumentUpload('bank')} activeOpacity={1}>
                            <View style={styles.docIconWrapper}>
                                {documents.bank && <MaterialIcons name="verified" size={18} color="#2e7d32" style={styles.verifiedIcon} />}
                                <View style={[styles.docIcon, { backgroundColor: '#f5f5f5' }]}>
                                    <MaterialIcons name="account-balance" size={24} color="#bdbdbd" />
                                </View>
                            </View>
                            <Text style={[styles.docTitle, { color: '#9e9e9e' }]}>Bank Details</Text>
                            <Text style={[styles.docSubtitle, { color: '#bdbdbd' }]}>
                                Feature Disabled
                            </Text>
                        </TouchableOpacity>

                        {/* Ration Card */}
                        <TouchableOpacity style={[styles.docCard, styles.disabledCard]} onPress={() => handleDocumentUpload('ration')} activeOpacity={1}>
                            <View style={styles.docIconWrapper}>
                                {documents.ration && <MaterialIcons name="verified" size={18} color="#2e7d32" style={styles.verifiedIcon} />}
                                <View style={[styles.docIcon, { backgroundColor: '#f5f5f5' }]}>
                                    <MaterialIcons name="shopping-basket" size={24} color="#bdbdbd" />
                                </View>
                            </View>
                            <Text style={[styles.docTitle, { color: '#9e9e9e' }]}>Ration Card</Text>
                            <Text style={[styles.docSubtitle, { color: '#bdbdbd' }]}>
                                Feature Disabled
                            </Text>
                        </TouchableOpacity>

                        {/* Land 7/12 */}
                        <TouchableOpacity style={[styles.docCard, styles.disabledCard]} onPress={() => handleDocumentUpload('land712')} activeOpacity={1}>
                            <View style={styles.docIconWrapper}>
                                {!documents.land712 ? (
                                    <MaterialIcons name="error" size={18} color="#bdbdbd" style={styles.verifiedIcon} />
                                ) : (
                                    <MaterialIcons name="verified" size={18} color="#2e7d32" style={styles.verifiedIcon} />
                                )}
                                <View style={[styles.docIcon, { backgroundColor: '#f5f5f5' }]}>
                                    <MaterialIcons name="landscape" size={24} color="#bdbdbd" />
                                </View>
                            </View>
                            <Text style={[styles.docTitle, { color: '#9e9e9e' }]}>Land 7/12</Text>
                            <Text style={[styles.docSubtitle, { color: '#bdbdbd' }]}>
                                Feature Disabled
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Helper Actions */}
                <View style={styles.helperActions}>
                    <TouchableOpacity style={styles.helperBtn}>
                        <MaterialIcons name="translate" size={20} color="#5C4033" />
                        <Text style={styles.helperBtnText}>Language</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.helperBtn}>
                        <MaterialIcons name="support-agent" size={20} color="#5C4033" />
                        <Text style={styles.helperBtnText}>Help</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={onHome}>
                    <MaterialIcons name="home" size={24} color="#9e9e9e" />
                    <Text style={styles.navText}>Home</Text>
                </TouchableOpacity>
                <View style={styles.scannerWrapper}>
                    <TouchableOpacity style={styles.scannerBtn}>
                        <MaterialIcons name="qr-code-scanner" size={28} color="#FFF" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.navItem}>
                    <MaterialIcons name="person" size={24} color="#2e7d32" />
                    <Text style={[styles.navText, { color: '#2e7d32', fontWeight: 'bold' }]}>Profile</Text>
                </TouchableOpacity>
            </View>

            {/* Manual Entry Modal */}
            <Modal visible={isManualModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Enter Aadhaar Number</Text>
                        <Text style={styles.modalSubtitle}>Please enter your 12-digit Aadhaar ID below if OCR scan is failing.</Text>

                        <TextInput
                            style={styles.textInput}
                            placeholder="e.g. 1234 5678 9012"
                            keyboardType="numeric"
                            maxLength={14}
                            value={manualAadhaar}
                            onChangeText={setManualAadhaar}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setManualModalVisible(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.submitBtn} onPress={submitManualAadhaar}>
                                <Text style={styles.submitBtnText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F0E1',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 10 : 20,
        paddingBottom: 8,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(92, 64, 51, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconButtonRelative: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(92, 64, 51, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    notificationDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ef4444',
        borderWidth: 1,
        borderColor: '#F5F0E1',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#5C4033',
    },
    scrollContent: {
        paddingTop: 24,
        paddingHorizontal: 24,
    },
    profileSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 16,
    },
    avatarContainer: {
        width: 112,
        height: 112,
        borderRadius: 56,
        borderWidth: 4,
        borderColor: '#FFF',
        overflow: 'hidden',
        backgroundColor: 'rgba(238, 140, 43, 0.2)',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    editBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#ee8c2b',
        borderWidth: 2,
        borderColor: '#F5F0E1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#5C4033',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    locationText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#8C705F',
        marginLeft: 4,
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#5C4033',
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2e7d32',
    },
    schemeCard: {
        flexDirection: 'row',
        backgroundColor: '#FFFBF2',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(92, 64, 51, 0.1)',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    schemeIconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    schemeContent: {
        flex: 1,
    },
    schemeTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    schemeTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#5C4033',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    schemeSubtext: {
        fontSize: 12,
        color: '#8C705F',
        marginTop: 4,
    },
    updateButton: {
        width: '100%',
        backgroundColor: '#2e7d32',
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: 'center',
    },
    updateButtonText: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    documentsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    docCard: {
        width: '48%',
        backgroundColor: '#FFFBF2',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(92, 64, 51, 0.05)',
        position: 'relative',
    },
    disabledCard: {
        backgroundColor: '#fdfdfd',
        borderColor: '#eee',
        opacity: 0.7,
    },
    docCardWarning: {
        borderWidth: 2,
        borderColor: 'rgba(46, 125, 50, 0.2)',
    },
    docIconWrapper: {
        position: 'relative',
        marginBottom: 12,
    },
    docIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    verifiedIcon: {
        position: 'absolute',
        top: -4,
        right: -4,
        zIndex: 1,
    },
    docTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#5C4033',
    },
    docSubtitle: {
        fontSize: 10,
        color: '#8C705F',
        marginTop: 4,
    },
    docWarningText: {
        color: '#2e7d32',
        fontWeight: 'bold',
    },
    docUploadedText: {
        color: '#2e7d32',
        fontWeight: 'bold',
    },
    helperActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    helperBtn: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(92, 64, 51, 0.2)',
        backgroundColor: 'transparent',
    },
    helperBtnText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#5C4033',
        marginLeft: 8,
    },
    bottomPadding: {
        height: 100,
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: Platform.OS === 'ios' ? 20 : 0,
        borderTopWidth: 1,
        borderTopColor: 'rgba(92, 64, 51, 0.1)',
        elevation: 10,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
    },
    navText: {
        fontSize: 10,
        fontWeight: '500',
        color: '#9e9e9e',
        marginTop: 4,
    },
    scannerWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 64,
        marginTop: -32,
    },
    scannerBtn: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#2e7d32',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 4,
        borderColor: '#F5F0E1',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        width: '85%',
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 24,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#5C4033',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#8C705F',
        marginBottom: 20,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        fontSize: 18,
        letterSpacing: 2,
        color: '#333',
        backgroundColor: '#FAFAFA',
        marginBottom: 24,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    cancelBtn: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginRight: 12,
    },
    cancelBtnText: {
        color: '#8C705F',
        fontWeight: 'bold',
        fontSize: 14,
    },
    submitBtn: {
        backgroundColor: '#2e7d32',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    submitBtnText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
    },
});
