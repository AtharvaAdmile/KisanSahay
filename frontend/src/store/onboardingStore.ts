import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'hi' | 'mr' | 'en';
export type Category = 'general' | 'obc' | 'sc' | 'st' | null;
export type Gender = 'male' | 'female' | 'other' | null;

interface OnboardingState {
    // Screen 0: Personal Details
    name: string;
    dob: string;
    mobile: string;
    email: string;

    // Screen 1: Language & Location
    language: Language;
    state: string;
    district: string;
    taluka: string;

    // Screen 2: Credentials
    category: Category;
    gender: Gender;
    hasAadhaar: boolean;
    hasBankAccount: boolean;
    hasRationCard: boolean;

    // Meta
    currentStep: number;
    isComplete: boolean;
    activeSchemeContext: string | null;
    documents: Record<string, string | null>;

    // Actions
    setPersonalDetails: (name: string, dob: string, mobile: string, email: string) => void;
    setLanguage: (lang: Language) => void;
    setLocation: (state: string, district: string, taluka: string) => void;
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
    setActiveSchemeContext: (ctx: string | null) => void;
    setDocument: (docType: string, uri: string | null) => void;
}

const initialState = {
    name: '',
    dob: '',
    mobile: '',
    email: '',
    language: 'hi' as Language,
    state: '',
    district: '',
    taluka: '',
    category: null as Category,
    gender: null as Gender,
    hasAadhaar: false,
    hasBankAccount: false,
    hasRationCard: false,
    currentStep: 1,
    isComplete: false,
    activeSchemeContext: null as string | null,
    documents: {},
};

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set) => ({
            ...initialState,

            setPersonalDetails: (name, dob, mobile, email) =>
                set({ name, dob, mobile, email }),

            setLanguage: (lang) => set({ language: lang }),

            setLocation: (state, district, taluka) =>
                set({ state, district, taluka }),

            setCredentials: (creds) =>
                set((prev) => ({ ...prev, ...creds })),

            setCurrentStep: (step) => set({ currentStep: step }),

            markComplete: () => set({ isComplete: true }),

            resetOnboarding: () => set(initialState),

            setActiveSchemeContext: (ctx) => set({ activeSchemeContext: ctx }),

            setDocument: (docType, uri) =>
                set((state) => ({
                    documents: {
                        ...state.documents,
                        [docType]: uri,
                    },
                })),
        }),
        {
            name: 'kisansahay-onboarding',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
