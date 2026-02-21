import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { runAgentTask } from '../services/agentApi';

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

    isAgentLoading: boolean;
    agentResult: any;

    // Secure Data Extracted from Documents
    aadhaarNumber: string | null;

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
    syncWithAgent: (prompt: string) => Promise<void>;
    setAadhaarNumber: (num: string | null) => void;
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
    isAgentLoading: false,
    agentResult: null,
    aadhaarNumber: null,
};

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set, get) => ({
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

            setAadhaarNumber: (num) => set({ aadhaarNumber: num }),

            syncWithAgent: async (prompt: string) => {
                set({ isAgentLoading: true });
                try {
                    const state = get();

                    const documents_available = [];
                    if (state.hasAadhaar || state.documents?.aadhaar) documents_available.push('Aadhaar');
                    if (state.hasBankAccount || state.documents?.bank) documents_available.push('Bank Account');
                    if (state.documents?.ration) documents_available.push('Ration Card');
                    if (state.documents?.land712) documents_available.push('Land Record 7/12');

                    const profileData = {
                        name: state.name,
                        dob: state.dob,
                        mobile: state.mobile,
                        email: state.email,
                        state: state.state,
                        district: state.district,
                        taluka: state.taluka,
                        documents_available
                    };

                    const result = await runAgentTask(prompt, profileData);
                    set({ agentResult: result, isAgentLoading: false });
                } catch (error) {
                    console.error("Agent sync failed", error);
                    set({ isAgentLoading: false });
                }
            },
        }),
        {
            name: 'kisansahay-onboarding',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
