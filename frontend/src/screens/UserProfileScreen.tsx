import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Platform, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useOnboardingStore } from '../store/onboardingStore';

interface UserProfileScreenProps {
    onHome: () => void;
}

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ onHome }) => {
    const { name, state, district, documents, setDocument } = useOnboardingStore();

    const handleDocumentUpload = async (docType: string) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: false,
            });

            if (result.canceled) return;

            const file = result.assets[0];
            const fileUri = file.uri;
            const newPath = FileSystem.documentDirectory + `${docType}_${Date.now()}_${file.name}`;

            await FileSystem.copyAsync({
                from: fileUri,
                to: newPath,
            });

            setDocument(docType, newPath);
        } catch (error) {
            console.error("Error picking document:", error);
            alert("Failed to upload document. Please try again.");
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
                <View style={styles.iconButtonRelative}>
                    <MaterialIcons name="notifications" size={24} color="#8C705F" />
                    <View style={styles.notificationDot} />
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Profile Info */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarWrapper}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCU4eoKaC6hbJ5STvfqRNXqa_nWBINKgiM44JbM885kkn1b1NuEmwkBIGj5zboD9-0eIv4MmEyFaofAEChmkqNwk9tvN2EZCv2qM7rmwW9oDfl9jyzKisNvOlsFPgeEOMRVnKO52t6vJ9jrJHtVGr8W88t-OzxrJZRWd7fZNAWs8gyMWmFjTeuBg4-PvyXinfoKDmyVeMbl-rJfdHa926dFauj5KwX5hDq-XwjxOC8kKlERkvb9ZJBNbfETBJjA6Zz4vOoGsIbxPawC' }}
                                style={styles.avatar}
                            />
                        </View>
                        <TouchableOpacity style={styles.editBadge}>
                            <MaterialIcons name="edit" size={14} color="#FFF" />
                        </TouchableOpacity>
                    </View>
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

                    <View style={[styles.schemeCard, { borderColor: 'rgba(238, 140, 43, 0.3)' }]}>
                        <View style={[styles.schemeIconBox, { backgroundColor: 'rgba(238, 140, 43, 0.1)' }]}>
                            <MaterialIcons name="umbrella" size={24} color="#ee8c2b" />
                        </View>
                        <View style={styles.schemeContent}>
                            <View style={styles.schemeTitleRow}>
                                <Text style={styles.schemeTitle}>PMFBY Insurance</Text>
                                <View style={[styles.statusBadge, { backgroundColor: 'rgba(238, 140, 43, 0.1)' }]}>
                                    <MaterialIcons name="warning" size={12} color="#ee8c2b" style={{ marginRight: 2 }} />
                                    <Text style={[styles.statusText, { color: '#ee8c2b' }]}>Action</Text>
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
                            <Text style={styles.docTitle}>Aadhaar</Text>
                            <Text style={[styles.docSubtitle, documents.aadhaar && styles.docUploadedText]}>
                                {documents.aadhaar ? 'Uploaded' : 'xxxx-xxxx-4821'}
                            </Text>
                        </TouchableOpacity>

                        {/* Bank Details */}
                        <TouchableOpacity style={styles.docCard} onPress={() => handleDocumentUpload('bank')}>
                            <View style={styles.docIconWrapper}>
                                {documents.bank && <MaterialIcons name="verified" size={18} color="#2e7d32" style={styles.verifiedIcon} />}
                                <View style={[styles.docIcon, { backgroundColor: '#e3f2fd' }]}>
                                    <MaterialIcons name="account-balance" size={24} color="#1976d2" />
                                </View>
                            </View>
                            <Text style={styles.docTitle}>Bank Details</Text>
                            <Text style={[styles.docSubtitle, documents.bank && styles.docUploadedText]}>
                                {documents.bank ? 'Uploaded' : 'SBI •••• 8922'}
                            </Text>
                        </TouchableOpacity>

                        {/* Ration Card */}
                        <TouchableOpacity style={styles.docCard} onPress={() => handleDocumentUpload('ration')}>
                            <View style={styles.docIconWrapper}>
                                {documents.ration && <MaterialIcons name="verified" size={18} color="#2e7d32" style={styles.verifiedIcon} />}
                                <View style={[styles.docIcon, { backgroundColor: '#fff8e1' }]}>
                                    <MaterialIcons name="shopping-basket" size={24} color="#fbc02d" />
                                </View>
                            </View>
                            <Text style={styles.docTitle}>Ration Card</Text>
                            <Text style={[styles.docSubtitle, documents.ration && styles.docUploadedText]}>
                                {documents.ration ? 'Uploaded' : 'Priority HH'}
                            </Text>
                        </TouchableOpacity>

                        {/* Land 7/12 */}
                        <TouchableOpacity style={[styles.docCard, !documents.land712 && styles.docCardWarning]} onPress={() => handleDocumentUpload('land712')}>
                            <View style={styles.docIconWrapper}>
                                {!documents.land712 ? (
                                    <MaterialIcons name="error" size={18} color="#ee8c2b" style={styles.verifiedIcon} />
                                ) : (
                                    <MaterialIcons name="verified" size={18} color="#2e7d32" style={styles.verifiedIcon} />
                                )}
                                <View style={[styles.docIcon, { backgroundColor: 'rgba(238, 140, 43, 0.1)' }]}>
                                    <MaterialIcons name="landscape" size={24} color="#ee8c2b" />
                                </View>
                            </View>
                            <Text style={styles.docTitle}>Land 7/12</Text>
                            <Text style={[styles.docSubtitle, !documents.land712 ? styles.docWarningText : styles.docUploadedText]}>
                                {documents.land712 ? 'Uploaded' : 'Update Needed'}
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
                <TouchableOpacity style={styles.navItem}>
                    <MaterialIcons name="inventory" size={24} color="#9e9e9e" />
                    <Text style={styles.navText}>My Schemes</Text>
                </TouchableOpacity>

                <View style={styles.scannerWrapper}>
                    <TouchableOpacity style={styles.scannerBtn}>
                        <MaterialIcons name="qr-code-scanner" size={28} color="#FFF" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.navItem}>
                    <MaterialIcons name="storefront" size={24} color="#9e9e9e" />
                    <Text style={styles.navText}>Market</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <MaterialIcons name="person" size={24} color="#ee8c2b" />
                    <Text style={[styles.navText, { color: '#ee8c2b', fontWeight: 'bold' }]}>Profile</Text>
                </TouchableOpacity>
            </View>
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
        color: '#ee8c2b',
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
        backgroundColor: '#ee8c2b',
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
    docCardWarning: {
        borderWidth: 2,
        borderColor: 'rgba(238, 140, 43, 0.2)',
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
        color: '#ee8c2b',
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
        backgroundColor: '#ee8c2b',
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
});
