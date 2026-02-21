import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, StatusBar, Modal, TextInput, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useOnboardingStore } from '../store/onboardingStore';

interface SchemePageProps {
    onBack: () => void;
    onAskShayak?: () => void;
}

export const SchemePage: React.FC<SchemePageProps> = ({ onBack, onAskShayak }) => {
    const { name, hasAadhaar, hasBankAccount, state, setActiveSchemeContext, syncWithAgent, isAgentLoading, agentResult } = useOnboardingStore();

    const [showEligibilityForm, setShowEligibilityForm] = useState(false);

    // Local form state for missing PMFBY check data
    const [isCultivator, setIsCultivator] = useState<boolean | null>(null);
    const [hasLandDocs, setHasLandDocs] = useState<boolean | null>(null);
    const [crop, setCrop] = useState('');
    const [eligibilityResult, setEligibilityResult] = useState<'pending' | 'eligible' | 'not_eligible'>('pending');

    const handleCheckEligibility = async () => {
        if (!isCultivator || !hasLandDocs || crop.trim() === '') {
            Alert.alert("Form Incomplete", "Please fill in all details to check eligibility.");
            return;
        }

        // PMFBY Evaluation Logic
        if (isCultivator && hasLandDocs && hasAadhaar && hasBankAccount) {
            setEligibilityResult('eligible');
        } else {
            setEligibilityResult('not_eligible');
        }

        // Background sync to Backend Agent processing profile eligibility
        syncWithAgent("Check my eligibility for PMFBY based on my profile.").catch(err => console.error("Agent Request Error", err));
    };

    const handleCheckDocuments = () => {
        Alert.alert(
            "Feature Not Implemented",
            "The document verification and upload feature is currently under development. Please check back later!"
        );
    };

    const handleAskShayak = () => {
        setActiveSchemeContext('PMFBY');
        if (onAskShayak) {
            onAskShayak();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#2e7d32" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Pradhan Mantri Fasal Bima Yojna (PMFBY)</Text>
                    <Text style={styles.headerSubtitle}>Ministry Of Agriculture and Farmers Welfare</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.card}>
                    <View style={styles.sectionHeaderRow}>
                        <MaterialIcons name="star" size={20} color="#f57c00" />
                        <Text style={styles.sectionTitle}>Benefits</Text>
                    </View>
                    <Text style={styles.paragraph}>• Financial Assistance for crop loss due to natural disasters, pests, and diseases.</Text>
                    <Text style={styles.paragraph}>• Income Stabilization to ensure farmers can continue farming.</Text>
                    <Text style={styles.paragraph}>• Modernization Incentives to encourage innovative agricultural practices.</Text>
                    <Text style={styles.paragraph}>• Comprehensive Coverage including standing crops and 14 days post-harvest for specific risks.</Text>
                    <Text style={styles.paragraph}>• Prevented Sowing compensation up to 25% if weather prevents planting.</Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.sectionHeaderRow}>
                        <MaterialIcons name="check-circle" size={20} color="#2e7d32" />
                        <Text style={styles.sectionTitle}>Eligibility Criteria</Text>
                    </View>
                    <Text style={styles.paragraph}>• Open to all farmers, including tenant farmers and sharecroppers.</Text>
                    <Text style={styles.paragraph}>• Must be growing notified crops in notified areas.</Text>
                    <Text style={styles.paragraph}>• Must have a clear insurable interest in the crops.</Text>
                    <Text style={styles.paragraph}>• Requires valid land ownership certificate or tenancy agreement.</Text>
                    <Text style={styles.paragraph}>• Application must be submitted within 2 weeks of the sowing season start.</Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.sectionHeaderRow}>
                        <MaterialIcons name="cancel" size={20} color="#d32f2f" />
                        <Text style={styles.sectionTitle}>Exclusions</Text>
                    </View>
                    <Text style={styles.paragraph}>• Crop losses in non-notified areas.</Text>
                    <Text style={styles.paragraph}>• Losses resulting from farmer negligence or avoidable risks (war, malicious damage).</Text>
                    <Text style={styles.paragraph}>• Losses outside the specific crop cycle window.</Text>
                    <Text style={styles.paragraph}>• Cases where compensation was already received from another source.</Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.sectionHeaderRow}>
                        <MaterialIcons name="description" size={20} color="#1976d2" />
                        <Text style={styles.sectionTitle}>Required Documents</Text>
                    </View>
                    <Text style={styles.paragraph}>• Aadhaar Card (mandatory) or other Identity Proof.</Text>
                    <Text style={styles.paragraph}>• Address Proof (Aadhaar, Electricity Bill).</Text>
                    <Text style={styles.paragraph}>• Record of Rights (RoR) or Land Possession Certificate (LPC) / Tenancy Agreement.</Text>
                    <Text style={styles.paragraph}>• Bank account tracking details (Passbook with IFSC).</Text>
                    <Text style={styles.paragraph}>• Sowing Certificate or declaration.</Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.sectionHeaderRow}>
                        <MaterialIcons name="help" size={20} color="#607d8b" />
                        <Text style={styles.sectionTitle}>FAQs</Text>
                    </View>
                    <Text style={styles.faqQ}>Q: Can a tenant farmer apply without land documents?</Text>
                    <Text style={styles.faqA}>A: Yes, provided they can prove cultivation through a tenancy agreement.</Text>

                    <Text style={styles.faqQ}>Q: Is post-harvest damage covered?</Text>
                    <Text style={styles.faqA}>A: Yes, for up to 14 days after harvest for risks like hailstorms and landslides while drying in the field.</Text>
                </View>

                <View style={styles.bottomSpace} />
            </ScrollView>

            {/* Action Bar */}
            <View style={styles.actionBar}>
                <TouchableOpacity style={[styles.actionButton, styles.checkDocsBtn]} onPress={handleCheckDocuments}>
                    <MaterialIcons name="folder-shared" size={20} color="#2e7d32" />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, styles.shayakBtn]} onPress={handleAskShayak}>
                    <MaterialIcons name="record-voice-over" size={20} color="#FFF" />
                    <Text style={styles.shayakText}>Ask Shayak</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, styles.checkEligBtn]} onPress={() => setShowEligibilityForm(true)}>
                    <MaterialIcons name="fact-check" size={20} color="#FFF" />
                    <Text style={styles.checkEligText}>Eligibility Check</Text>
                </TouchableOpacity>
            </View>

            {/* Eligibility Form Modal */}
            <Modal
                visible={showEligibilityForm}
                transparent={true}
                animationType="slide"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>PMFBY Eligibility Check</Text>
                            <TouchableOpacity onPress={() => { setShowEligibilityForm(false); setEligibilityResult('pending'); }}>
                                <MaterialIcons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {eligibilityResult === 'pending' ? (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <Text style={styles.modalDesc}>Please provide a few missing details to complete your eligibility check for {name || 'your profile'}:</Text>

                                <Text style={styles.inputLabel}>Are you a cultivator or sharecropper on the insured land?</Text>
                                <View style={styles.radioGroup}>
                                    <TouchableOpacity style={[styles.radioBtn, isCultivator === true && styles.radioActive]} onPress={() => setIsCultivator(true)}>
                                        <Text style={[styles.radioText, isCultivator === true && styles.radioTextActive]}>Yes</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.radioBtn, isCultivator === false && styles.radioActive]} onPress={() => setIsCultivator(false)}>
                                        <Text style={[styles.radioText, isCultivator === false && styles.radioTextActive]}>No</Text>
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.inputLabel}>Do you have a valid land ownership certificate or tenancy agreement?</Text>
                                <View style={styles.radioGroup}>
                                    <TouchableOpacity style={[styles.radioBtn, hasLandDocs === true && styles.radioActive]} onPress={() => setHasLandDocs(true)}>
                                        <Text style={[styles.radioText, hasLandDocs === true && styles.radioTextActive]}>Yes</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.radioBtn, hasLandDocs === false && styles.radioActive]} onPress={() => setHasLandDocs(false)}>
                                        <Text style={[styles.radioText, hasLandDocs === false && styles.radioTextActive]}>No</Text>
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.inputLabel}>What crop are you insuring?</Text>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="e.g. Cotton, Wheat"
                                    value={crop}
                                    onChangeText={setCrop}
                                />

                                <TouchableOpacity style={styles.submitCheckBtn} onPress={handleCheckEligibility}>
                                    <Text style={styles.submitCheckText}>Evaluate Eligibility</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        ) : (
                            <View style={styles.resultContainer}>
                                {eligibilityResult === 'eligible' ? (
                                    <>
                                        <MaterialIcons name="verified" size={64} color="#2e7d32" />
                                        <Text style={styles.resultTitleSuccess}>You are Eligible!</Text>
                                        <Text style={styles.resultDesc}>Based on your profile and answers, you qualify for PMFBY. You have the required Aadhaar, Bank Account, and land documentation.</Text>
                                    </>
                                ) : (
                                    <>
                                        <MaterialIcons name="error-outline" size={64} color="#d32f2f" />
                                        <Text style={styles.resultTitleError}>Not Eligible Yet</Text>
                                        <Text style={styles.resultDesc}>You must be a cultivator with valid land documents. Also ensure you have an Aadhaar and Bank Account mapped in your profile credentials.</Text>
                                    </>
                                )}

                                {isAgentLoading ? (
                                    <Text style={[styles.resultDesc, { color: '#f57c00', marginTop: 8 }]}>Loading Backend Agent API verification...</Text>
                                ) : agentResult ? (
                                    <Text style={[styles.resultDesc, { color: '#2e7d32', marginTop: 8 }]}>Backend Agent Validation Successfully Finished!</Text>
                                ) : null}

                                <TouchableOpacity style={styles.closeBtn} onPress={() => { setShowEligibilityForm(false); setEligibilityResult('pending'); }}>
                                    <Text style={styles.closeBtnText}>Done</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        backgroundColor: '#2e7d32',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 4,
        zIndex: 10,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    headerSubtitle: {
        color: '#c8e6c9',
        fontSize: 12,
    },
    scrollContent: {
        padding: 16,
    },
    card: {
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 8,
    },
    paragraph: {
        fontSize: 14,
        color: '#555',
        marginBottom: 8,
        lineHeight: 20,
    },
    faqQ: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#444',
        marginTop: 8,
    },
    faqA: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
        marginBottom: 8,
        lineHeight: 20,
    },
    bottomSpace: {
        height: 80,
    },
    actionBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF',
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 8,
        marginHorizontal: 4,
    },
    checkDocsBtn: {
        flex: 0.5,
        backgroundColor: '#e8f5e9',
        borderWidth: 1,
        borderColor: '#2e7d32',
    },
    shayakBtn: {
        backgroundColor: '#f57c00',
    },
    shayakText: {
        color: '#FFF',
        fontWeight: 'bold',
        marginLeft: 6,
        fontSize: 12,
    },
    checkEligBtn: {
        backgroundColor: '#2e7d32',
    },
    checkEligText: {
        color: '#FFF',
        fontWeight: 'bold',
        marginLeft: 6,
        fontSize: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    modalDesc: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#444',
        marginBottom: 10,
    },
    radioGroup: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    radioBtn: {
        flex: 1,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    radioActive: {
        backgroundColor: '#e8f5e9',
        borderColor: '#2e7d32',
    },
    radioText: {
        color: '#555',
        fontWeight: '500',
    },
    radioTextActive: {
        color: '#2e7d32',
        fontWeight: 'bold',
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 24,
    },
    submitCheckBtn: {
        backgroundColor: '#2e7d32',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
    },
    submitCheckText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    resultContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    resultTitleSuccess: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2e7d32',
        marginTop: 16,
        marginBottom: 8,
    },
    resultTitleError: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#d32f2f',
        marginTop: 16,
        marginBottom: 8,
    },
    resultDesc: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    closeBtn: {
        backgroundColor: '#eee',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
    },
    closeBtnText: {
        color: '#333',
        fontWeight: 'bold',
    }
});
