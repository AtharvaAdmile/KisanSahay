import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'hi' | 'mr' | 'en';
export type LandOwnership = 'own' | 'leased' | null;
export type LandSize = 'below_1_acre' | '1_to_2_acres' | '2_to_5_acres' | 'above_5_acres' | null;
export type CropType = 'cotton' | 'sugarcane' | 'wheat' | 'rice' | 'soybean' | 'other' | null;
export type IrrigationMethod = 'rainfed' | 'well' | 'canal' | null;
export type Category = 'general' | 'obc' | 'sc' | 'st' | null;
export type Gender = 'male' | 'female' | 'other' | null;

interface OnboardingState {
    // Screen 1: Language & Location
    language: Language;
    state: string;
    district: string;
    taluka: string;

    // Screen 2: Farm Profile
    landOwnership: LandOwnership;
    landSize: LandSize;
    primaryCrop: CropType;
    irrigationMethod: IrrigationMethod;

    // Screen 3: Credentials
    category: Category;
    gender: Gender;
    hasAadhaar: boolean;
    hasBankAccount: boolean;
    hasRationCard: boolean;

    // Meta
    currentStep: number;
    isComplete: boolean;

    // Actions
    setLanguage: (lang: Language) => void;
    setLocation: (state: string, district: string, taluka: string) => void;
    setFarmDetails: (details: {
        landOwnership?: LandOwnership;
        landSize?: LandSize;
        primaryCrop?: CropType;
        irrigationMethod?: IrrigationMethod;
    }) => void;
    setCredentials: (creds: {
        category?: Category;
        gender?: Gender;
        hasAadhaar?: boolean;
        hasBankAccount?: boolean;
        hasRationCard?: boolean;
    }) => void;
    setCurrentStep: (step: number) => void;
    markComplete: () => void;
    resetOnboarding: () => void;
}

const initialState = {
    language: 'hi' as Language,
    state: '',
    district: '',
    taluka: '',
    landOwnership: null as LandOwnership,
    landSize: null as LandSize,
    primaryCrop: null as CropType,
    irrigationMethod: null as IrrigationMethod,
    category: null as Category,
    gender: null as Gender,
    hasAadhaar: false,
    hasBankAccount: false,
    hasRationCard: false,
    currentStep: 1,
    isComplete: false,
};

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set) => ({
            ...initialState,

            setLanguage: (lang) => set({ language: lang }),

            setLocation: (state, district, taluka) =>
                set({ state, district, taluka }),

            setFarmDetails: (details) =>
                set((prev) => ({ ...prev, ...details })),

            setCredentials: (creds) =>
                set((prev) => ({ ...prev, ...creds })),

            setCurrentStep: (step) => set({ currentStep: step }),

            markComplete: () => set({ isComplete: true }),

            resetOnboarding: () => set(initialState),
        }),
        {
            name: 'kisansahay-onboarding',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
