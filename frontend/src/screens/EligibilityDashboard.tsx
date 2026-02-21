import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, Platform, StatusBar, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface EligibilityDashboardProps {
    onVoiceAgentPress: () => void;
    onSchemePress: () => void;
    onProfilePress: () => void;
}

export const EligibilityDashboard: React.FC<EligibilityDashboardProps> = ({
    onVoiceAgentPress,
    onSchemePress,
    onProfilePress
}) => {
    const pulseAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [pulseAnim]);

    const pulseScale = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.3],
    });

    const pulseOpacity = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.6, 0],
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fdf7e7" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.greetingTitle}>नमस्कार, Ramesh</Text>
                        <Text style={styles.greetingSubtitle}>Welcome back to your farm</Text>
                    </View>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnnq0oM0URX1Q1ebOFwN6Td5jDf9GMSUZUt6jdQsRBJOiCVdITP4nuKE1z2-_zg8rBhJlkuQmrWiSPuWYfZj-mff42xv-9BbUaq-KiKtsh7ByoPvuUkVN_Vyuabd5-RaWij5bT1URpsVmUl6ZykSIxq-aCBB1EE1Yb3bLE5KH-IAP5gmX8NJaVCRa5nbzfaEv2HEJrN8Hr7-XM5j3fjeyuqpotCzd8qv-O0AVoE4PjSapBKzlX_4ArUaPoRqABRY4kg3CcEbAVuVBg' }}
                            style={styles.avatarImage}
                        />
                        <View style={styles.kycBadge}>
                            <Text style={styles.kycText}>KYC</Text>
                        </View>
                    </View>
                </View>

                {/* Info Pill */}
                <View style={styles.infoPillContainer}>
                    <View style={styles.infoPill}>
                        <Text style={styles.infoText}>2 Acres</Text>
                        <View style={styles.dot} />
                        <Text style={styles.infoText}>Cotton</Text>
                        <View style={styles.dot} />
                        <Text style={styles.infoText}>Pune</Text>
                        <TouchableOpacity style={styles.editButton}>
                            <MaterialIcons name="edit" size={14} color="#2e7d32" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Eligibility Banner (PMFBY Specific) */}
                <View style={styles.bannerContainer}>
                    {/* Hidden Original 8 Govt Schemes Banner */}
                    {false && (
                        <View style={[styles.banner, { marginBottom: 16 }]}>
                            <View style={styles.watermarkContainer}>
                                <MaterialIcons name="agriculture" size={140} color="rgba(255,255,255,0.1)" />
                            </View>

                            <View style={styles.bannerContent}>
                                <View style={styles.eligibilityTag}>
                                    <View style={styles.starsIconBg}>
                                        <MaterialIcons name="stars" size={16} color="#fff" />
                                    </View>
                                    <Text style={styles.eligibilityTagText}>ELIGIBILITY CHECK</Text>
                                </View>
                                <Text style={styles.bannerTitle}>You qualify for{'\n'}8 Govt. Schemes!</Text>
                                <Text style={styles.bannerSubtext}>Based on your land size and crop details.</Text>
                                <TouchableOpacity style={styles.viewAllButton}>
                                    <Text style={styles.viewAllButtonText}>View All</Text>
                                    <MaterialIcons name="arrow-forward" size={16} color="#2e7d32" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* New PMFBY Banner */}
                    <View style={styles.banner}>
                        <View style={styles.watermarkContainer}>
                            <MaterialIcons name="security" size={140} color="rgba(255,255,255,0.1)" />
                        </View>

                        <View style={styles.bannerContent}>
                            <View style={styles.eligibilityTag}>
                                <View style={styles.starsIconBg}>
                                    <MaterialIcons name="stars" size={16} color="#fff" />
                                </View>
                                <Text style={styles.eligibilityTagText}>ELIGIBILITY CHECK</Text>
                            </View>
                            <Text style={styles.bannerTitle}>Pradhan Mantri Fasal Bima Yojna (PMFBY)</Text>
                            <Text style={styles.bannerSubtext}>Ministry Of Agriculture and Farmers Welfare</Text>
                            <TouchableOpacity style={styles.viewAllButton} onPress={onSchemePress}>
                                <Text style={styles.viewAllButtonText}>View Details</Text>
                                <MaterialIcons name="arrow-forward" size={16} color="#2e7d32" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Categories Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Explore Categories</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
                    <CategoryItem icon="account-balance-wallet" label="Income\nSupport" isActive />
                    <CategoryItem icon="security" label="Crop\nInsurance" />
                    <CategoryItem icon="payments" label="Kisan\nCredit" />
                    <CategoryItem icon="local-florist" label="Fertilizer\nSubsidy" />
                    <CategoryItem icon="precision-manufacturing" label="Farm\nTools" />
                </ScrollView>

                {/* Recommendations Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recommended for You</Text>
                    <TouchableOpacity>
                        <Text style={styles.filterText}>Filters</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.recommendationsList}>
                    {/* PM-KISAN Card */}
                    <SchemeCard
                        title="PM-KISAN"
                        subtitle="Ministry of Agriculture & Farmers Welfare"
                        emoji="🌱"
                        emojiBg="#fff6e5"
                        isVerified={true}
                        amount="₹6,000"
                        amountLabel="/ year"
                        matchText="High Match"
                        progress={85}
                        actionText="Next installment: Oct 2023"
                        actionCta="Apply Now"
                    />

                    {/* PM Fasal Bima Card */}
                    <SchemeCard
                        title="PM Fasal Bima"
                        subtitle="Crop Insurance Scheme"
                        emoji="☂️"
                        emojiBg="#e8f0fe"
                        amount="Coverage upto 100%"
                        tags={['Natural Calamities', 'Pest Attack']}
                        actionText="Deadline: 15 Days left"
                        actionTextHighlight
                        actionCta="Check Details"
                    />

                    {/* Soil Health Card */}
                    <SchemeCard
                        title="Soil Health Card"
                        subtitle="Dept of Agriculture"
                        emoji="🧪"
                        emojiBg="#fdf3dc"
                        amount="Free Soil Testing & Report"
                        description="Improve your cotton yield by understanding your soil."
                        actionText="Nearest Lab: 2.4km"
                        actionCta="Book Slot"
                    />
                </View>

                <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <NavItem icon="home" label="Home" isActive />
                <NavItem icon="inventory" label="My Schemes" />

                {/* Floating Mic Button */}
                <View style={styles.floatingMicContainer}>
                    <Animated.View style={[styles.micPulse, { transform: [{ scale: pulseScale }], opacity: pulseOpacity }]} />
                    <TouchableOpacity style={styles.micButton} onPress={onVoiceAgentPress}>
                        <MaterialIcons name="mic" size={32} color="#fff" />
                    </TouchableOpacity>
                </View>

                <NavItem icon="trending-up" label="Market Prices" />
                <TouchableOpacity style={styles.navItem} onPress={onProfilePress}>
                    <MaterialIcons name="person" size={24} color="#9e9e9e" />
                    <Text style={styles.navItemText}>Profile</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

/* Sub-components for cleaner structure */
const CategoryItem = ({ icon, label, isActive = false }: any) => {
    return (
        <TouchableOpacity style={styles.categoryCard}>
            <View style={[styles.categoryIconBox, isActive ? styles.catIconActive : styles.catIconInactive]}>
                <MaterialIcons name={icon} size={32} color={isActive ? '#ffffff' : '#757575'} />
            </View>
            <Text style={[styles.categoryText, isActive ? styles.catTextActive : styles.catTextInactive]}>
                {label.replace('\\n', '\n')}
            </Text>
        </TouchableOpacity>
    );
};

const SchemeCard = ({ title, subtitle, emoji, emojiBg, isVerified, amount, amountLabel, matchText, progress, tags, description, actionText, actionTextHighlight, actionCta }: any) => {
    return (
        <TouchableOpacity style={styles.schemeCard}>
            <View style={styles.schemeHeader}>
                <View style={styles.schemeHeaderLeft}>
                    <View style={[styles.schemeEmojiBox, { backgroundColor: emojiBg }]}>
                        <Text style={styles.emojiText}>{emoji}</Text>
                    </View>
                    <View>
                        <View style={styles.titleRow}>
                            <Text style={styles.schemeTitle}>{title}</Text>
                            {isVerified && <MaterialIcons name="verified" size={16} color="#2196f3" style={{ marginLeft: 6 }} />}
                        </View>
                        <Text style={styles.schemeSubtitle}>{subtitle}</Text>
                    </View>
                </View>
                {matchText && (
                    <View style={styles.matchBadge}>
                        <Text style={styles.matchText}>{matchText.toUpperCase()}</Text>
                    </View>
                )}
            </View>

            <View style={styles.amountRow}>
                <Text style={styles.schemeAmount}>{amount}</Text>
                {amountLabel && <Text style={styles.schemeAmountLabel}> {amountLabel}</Text>}
            </View>

            {progress !== undefined && (
                <View style={styles.progressTrack}>
                    <View style={[styles.progressBar, { width: `${progress}%` as any }]} />
                </View>
            )}

            {tags && (
                <View style={styles.tagsContainer}>
                    {tags.map((tag: string, index: number) => (
                        <View key={index} style={styles.tag}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                </View>
            )}

            {description && <Text style={styles.schemeDescription}>{description}</Text>}

            <View style={styles.schemeFooter}>
                <Text style={styles.footerText}>
                    {actionTextHighlight ? (
                        <Text style={styles.redHighlight}>{actionText}</Text>
                    ) : (
                        actionText
                    )}
                </Text>
                <View style={styles.ctaContainer}>
                    <Text style={styles.ctaText}>{actionCta}</Text>
                    <MaterialIcons name="chevron-right" size={16} color="#2e7d32" />
                </View>
            </View>
        </TouchableOpacity>
    );
}

const NavItem = ({ icon, label, isActive = false }: any) => (
    <TouchableOpacity style={styles.navItem}>
        <MaterialIcons name={icon} size={24} color={isActive ? '#2e7d32' : '#9e9e9e'} />
        <Text style={[styles.navItemText, isActive && styles.navItemTextActive]}>
            {label.replace(' ', '\n')}
        </Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fdf7e7',
    },
    scrollContent: {
        paddingBottom: 20,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 16,
    },
    headerTextContainer: {
        flex: 1,
    },
    greetingTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#5d4037',
        marginBottom: 4,
    },
    greetingSubtitle: {
        fontSize: 14,
        color: '#616161',
    },
    avatarContainer: {
        position: 'relative',
        marginLeft: 16,
    },
    avatarImage: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#2e7d32',
    },
    kycBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: '#2e7d32',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#fdf7e7',
    },
    kycText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: 'bold',
    },
    infoPillContainer: {
        paddingHorizontal: 20,
        marginBottom: 24,
        alignItems: 'flex-start',
    },
    infoPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#eee',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    infoText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#5d4037',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#e0e0e0',
        marginHorizontal: 8,
    },
    editButton: {
        marginLeft: 8,
    },
    bannerContainer: {
        paddingHorizontal: 20,
        marginBottom: 28,
    },
    banner: {
        backgroundColor: '#2e7d32',
        borderRadius: 16,
        padding: 20,
        overflow: 'hidden',
        position: 'relative',
        elevation: 4,
        shadowColor: '#2e7d32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    watermarkContainer: {
        position: 'absolute',
        right: -20,
        top: -30,
        opacity: 0.8,
    },
    bannerContent: {
        position: 'relative',
        zIndex: 1,
        alignItems: 'flex-start',
    },
    eligibilityTag: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    starsIconBg: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 4,
        borderRadius: 12,
        marginRight: 6,
    },
    eligibilityTagText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    bannerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 6,
        lineHeight: 32,
    },
    bannerSubtext: {
        color: '#c8e6c9',
        fontSize: 14,
        marginBottom: 16,
    },
    viewAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
    },
    viewAllButtonText: {
        color: '#2e7d32',
        fontWeight: 'bold',
        fontSize: 14,
        marginRight: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#5d4037',
    },
    filterText: {
        fontSize: 14,
        color: '#2e7d32',
        fontWeight: '600',
    },
    categoriesScroll: {
        paddingHorizontal: 16,
        paddingBottom: 24,
        alignItems: 'flex-start',
    },
    categoryCard: {
        width: 76,
        marginHorizontal: 4,
        alignItems: 'center',
    },
    categoryIconBox: {
        width: 64,
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    catIconActive: {
        backgroundColor: '#2e7d32',
        borderWidth: 2,
        borderColor: '#2e7d32',
        elevation: 3,
        shadowColor: '#2e7d32',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    catIconInactive: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    categoryText: {
        fontSize: 12,
        textAlign: 'center',
        lineHeight: 14,
    },
    catTextActive: {
        color: '#2e7d32',
        fontWeight: '600',
    },
    catTextInactive: {
        color: '#757575',
        fontWeight: '500',
    },
    recommendationsList: {
        paddingHorizontal: 20,
        gap: 16,
    },
    schemeCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'transparent',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
    },
    schemeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    schemeHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    schemeEmojiBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    emojiText: {
        fontSize: 24,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    schemeTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#212121',
    },
    schemeSubtitle: {
        fontSize: 12,
        color: '#757575',
    },
    matchBadge: {
        backgroundColor: '#e8f5e9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    matchText: {
        color: '#2e7d32',
        fontSize: 10,
        fontWeight: 'bold',
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 12,
    },
    schemeAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#5d4037',
    },
    schemeAmountLabel: {
        fontSize: 14,
        color: '#757575',
    },
    progressTrack: {
        height: 6,
        backgroundColor: '#f5f5f5',
        borderRadius: 3,
        marginBottom: 12,
        width: '100%',
    },
    progressBar: {
        height: 6,
        backgroundColor: '#2e7d32',
        borderRadius: 3,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    tag: {
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    tagText: {
        fontSize: 12,
        color: '#616161',
    },
    schemeDescription: {
        fontSize: 12,
        color: '#757575',
        marginBottom: 12,
    },
    schemeFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f5f5f5',
    },
    footerText: {
        fontSize: 12,
        color: '#757575',
    },
    redHighlight: {
        color: '#f44336',
        fontWeight: '500',
    },
    ctaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ctaText: {
        fontSize: 14,
        color: '#2e7d32',
        fontWeight: '600',
        marginRight: 4,
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
        borderTopColor: '#eeeeee',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 8,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
    },
    navItemText: {
        fontSize: 10,
        fontWeight: '500',
        color: '#9e9e9e',
        textAlign: 'center',
        marginTop: 4,
    },
    navItemTextActive: {
        color: '#2e7d32',
        fontWeight: 'bold',
    },
    floatingMicContainer: {
        width: 64,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -40, // pop up 
        position: 'relative',
    },
    micPulse: {
        position: 'absolute',
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(46, 125, 50, 0.4)',
    },
    micButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#2e7d32',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#fff',
        elevation: 5,
        shadowColor: '#2e7d32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    }
});
