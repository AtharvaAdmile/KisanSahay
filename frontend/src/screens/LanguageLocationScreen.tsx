import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { BigToggle } from '../components/BigToggle';
import { useOnboardingStore, Language } from '../store/onboardingStore';
import i18n from '../i18n';

// Sample location data — in production, load from API or local JSON
const LOCATION_DATA: Record<string, Record<string, string[]>> = {
    Maharashtra: {
        Pune: ['Haveli', 'Mulshi', 'Baramati', 'Junnar', 'Maval'],
        Nashik: ['Nashik', 'Sinnar', 'Dindori', 'Igatpuri', 'Trimbakeshwar'],
        Nagpur: ['Nagpur', 'Kamptee', 'Hingna', 'Katol', 'Umred'],
        Kolhapur: ['Kolhapur', 'Karveer', 'Panhala', 'Hatkanangle', 'Shirol'],
    },
    'Madhya Pradesh': {
        Indore: ['Indore', 'Mhow', 'Depalpur', 'Sanwer'],
        Bhopal: ['Bhopal', 'Berasia', 'Phanda'],
        Jabalpur: ['Jabalpur', 'Sihora', 'Patan', 'Shahpura'],
    },
    Rajasthan: {
        Jaipur: ['Jaipur', 'Amber', 'Sanganer', 'Chomu', 'Bassi'],
        Jodhpur: ['Jodhpur', 'Phalodi', 'Shergarh', 'Bilara'],
        Udaipur: ['Udaipur', 'Vallabhnagar', 'Girwa', 'Mavli'],
    },
    Gujarat: {
        Ahmedabad: ['Ahmedabad', 'Daskroi', 'Sanand', 'Bavla', 'Dholka'],
        Rajkot: ['Rajkot', 'Lodhika', 'Kotda Sangani', 'Jasdan'],
        Surat: ['Surat', 'Olpad', 'Kamrej', 'Bardoli'],
    },
};

const LANGUAGES: { key: Language; label: string; flag: string }[] = [
    { key: 'hi', label: 'हिंदी', flag: '🇮🇳' },
    { key: 'mr', label: 'मराठी', flag: '🏛️' },
    { key: 'en', label: 'English', flag: '🌐' },
];

interface LanguageLocationScreenProps {
    onNext: () => void;
}

export const LanguageLocationScreen: React.FC<LanguageLocationScreenProps> = ({
    onNext,
}) => {
    const { t } = useTranslation();
    const store = useOnboardingStore();

    const [selectedState, setSelectedState] = useState(store.state);
    const [selectedDistrict, setSelectedDistrict] = useState(store.district);
    const [selectedTaluka, setSelectedTaluka] = useState(store.taluka);

    const states = Object.keys(LOCATION_DATA);
    const districts = selectedState ? Object.keys(LOCATION_DATA[selectedState] || {}) : [];
    const talukas =
        selectedState && selectedDistrict
            ? LOCATION_DATA[selectedState]?.[selectedDistrict] || []
            : [];

    const handleLanguageChange = (lang: Language) => {
        store.setLanguage(lang);
        i18n.changeLanguage(lang);
    };

    const handleStateSelect = (state: string) => {
        setSelectedState(state);
        setSelectedDistrict('');
        setSelectedTaluka('');
    };

    const handleDistrictSelect = (district: string) => {
        setSelectedDistrict(district);
        setSelectedTaluka('');
    };

    const handleTalukaSelect = (taluka: string) => {
        setSelectedTaluka(taluka);
        store.setLocation(selectedState, selectedDistrict, taluka);
    };

    const isComplete = selectedState && selectedDistrict && selectedTaluka;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Progress */}
            <Text style={styles.stepText}>
                {t('onboarding.step', { current: 1, total: 3 })}
            </Text>
            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '33%' }]} />
            </View>

            {/* Language Selection */}
            <Text style={styles.title}>{t('language_screen.title')}</Text>
            <Text style={styles.subtitle}>{t('language_screen.subtitle')}</Text>

            <View style={styles.languageRow}>
                {LANGUAGES.map((lang) => (
                    <TouchableOpacity
                        key={lang.key}
                        style={[
                            styles.langButton,
                            store.language === lang.key && styles.langButtonSelected,
                        ]}
                        onPress={() => handleLanguageChange(lang.key)}
                        accessibilityLabel={`Select ${lang.label} language`}
                        accessibilityState={{ selected: store.language === lang.key }}
                    >
                        <Text style={styles.langFlag}>{lang.flag}</Text>
                        <Text
                            style={[
                                styles.langLabel,
                                store.language === lang.key && styles.langLabelSelected,
                            ]}
                        >
                            {lang.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Location Selection */}
            <Text style={styles.sectionTitle}>{t('language_screen.location_title')}</Text>

            {/* State */}
            <Text style={styles.fieldLabel}>{t('language_screen.state')}</Text>
            <View style={styles.optionsGrid}>
                {states.map((state) => (
                    <BigToggle
                        key={state}
                        label={state}
                        isSelected={selectedState === state}
                        onPress={() => handleStateSelect(state)}
                    />
                ))}
            </View>

            {/* District (cascading) */}
            {selectedState && (
                <>
                    <Text style={styles.fieldLabel}>{t('language_screen.district')}</Text>
                    <View style={styles.optionsGrid}>
                        {districts.map((district) => (
                            <BigToggle
                                key={district}
                                label={district}
                                isSelected={selectedDistrict === district}
                                onPress={() => handleDistrictSelect(district)}
                            />
                        ))}
                    </View>
                </>
            )}

            {/* Taluka (cascading) */}
            {selectedDistrict && (
                <>
                    <Text style={styles.fieldLabel}>{t('language_screen.taluka')}</Text>
                    <View style={styles.optionsGrid}>
                        {talukas.map((taluka) => (
                            <BigToggle
                                key={taluka}
                                label={taluka}
                                isSelected={selectedTaluka === taluka}
                                onPress={() => handleTalukaSelect(taluka)}
                            />
                        ))}
                    </View>
                </>
            )}

            {/* Next Button */}
            <TouchableOpacity
                style={[styles.nextButton, !isComplete && styles.nextButtonDisabled]}
                onPress={isComplete ? onNext : undefined}
                disabled={!isComplete}
                accessibilityLabel={t('onboarding.next')}
                accessibilityState={{ disabled: !isComplete }}
            >
                <Text style={styles.nextButtonText}>{t('onboarding.next')} →</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F0E1',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    stepText: {
        fontSize: 14,
        color: '#8B7355',
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: '600',
    },
    progressBar: {
        height: 6,
        backgroundColor: '#E0D6CC',
        borderRadius: 3,
        marginBottom: 24,
    },
    progressFill: {
        height: 6,
        backgroundColor: '#2E7D32',
        borderRadius: 3,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#5C4033',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 16,
        color: '#8B7355',
        marginBottom: 24,
    },
    languageRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    langButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        marginHorizontal: 4,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#E0D6CC',
        backgroundColor: '#FAFAFA',
        minHeight: 80,
    },
    langButtonSelected: {
        borderColor: '#2E7D32',
        borderWidth: 3,
        backgroundColor: '#EAF5EA',
    },
    langFlag: {
        fontSize: 32,
        marginBottom: 6,
    },
    langLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1B1B1B',
    },
    langLabelSelected: {
        color: '#2E7D32',
        fontWeight: '700',
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#5C4033',
        marginBottom: 16,
    },
    fieldLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#5C4033',
        marginBottom: 10,
        marginTop: 8,
    },
    optionsGrid: {
        marginBottom: 12,
    },
    nextButton: {
        backgroundColor: '#2E7D32',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 24,
        minHeight: 56,
    },
    nextButtonDisabled: {
        backgroundColor: '#C4C4C4',
    },
    nextButtonText: {
        color: '#FAFAFA',
        fontSize: 20,
        fontWeight: 'bold',
    },
});
