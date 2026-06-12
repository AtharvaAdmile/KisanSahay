import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { runAgentTask } from '../services/agentApi';

export type Language = 'hi' | 'mr' | 'en';
export type Category = 'general' | 'obc' | 'sc' | 'st' | null;
export type Gender = 'male' | 'female' | 'other' | null;
export type LandOwnership = 'own' | 'leased';
export type LandSize = 'below_1_acre' | '1_to_2_acres' | '2_to_5_acres' | 'above_5_acres';
export type CropType = 'cotton' | 'sugarcane' | 'wheat' | 'rice' | 'soybean' | 'other';
export type IrrigationMethod = 'rainfed' | 'well' | 'canal';

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

    // Screen 2: Farm Profile
    landOwnership: LandOwnership | null;
    landSize: LandSize | null;
    primaryCrop: CropType | null;
    irrigationMethod: IrrigationMethod | null;

    // Screen 3: Credentials
    category: Category;
    gender: Gender;
    hasAadhaar: boolean;
    hasBankAccount: boolean;
    hasRationCard: boolean;

    // Meta
    currentStep: number;
    isComplete: boolean;
    hasSeenWelcome: boolean;

    // Agent / Document fields
    activeSchemeContext: string | null;
    documents: Record<string, string | null>;
    isAgentLoading: boolean;
    agentResult: any;
    aadhaarNumber: string | null;

    // Actions
    setPersonalDetails: (name: string, dob: string, mobile: string, email: string) => void;
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
    setHasSeenWelcome: () => void;
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
    landOwnership: null as LandOwnership | null,
    landSize: null as LandSize | null,
    primaryCrop: null as CropType | null,
    irrigationMethod: null as IrrigationMethod | null,
    category: null as Category,
    gender: null as Gender,
    hasAadhaar: false,
    hasBankAccount: false,
    hasRationCard: false,
    currentStep: 1,
    isComplete: false,
    // hasSeenWelcome intentionally excluded — resetOnboarding should not clear it
    activeSchemeContext: null as string | null,
    documents: {} as Record<string, string | null>,
    isAgentLoading: false,
    agentResult: null,
    aadhaarNumber: null as string | null,
};

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set, get) => ({
            ...initialState,
            hasSeenWelcome: false,

            setPersonalDetails: (name, dob, mobile, email) =>
                set({ name, dob, mobile, email }),

            setLanguage: (lang) => set({ language: lang }),

            setLocation: (state, district, taluka) =>
                set({ state, district, taluka }),

            setFarmDetails: (details) =>
                set((prev) => ({ ...prev, ...details })),

            setCredentials: (creds) =>
                set((prev) => ({ ...prev, ...creds })),

            setCurrentStep: (step) => set({ currentStep: step }),

            markComplete: () => set({ isComplete: true }),

            setHasSeenWelcome: () => set({ hasSeenWelcome: true }),

            // Does NOT reset hasSeenWelcome — returning users skip the welcome screen
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
                        full_name: state.name,
                        mobile: state.mobile,
                        age: state.dob ? String(new Date().getFullYear() - new Date(state.dob).getFullYear()) : undefined,
                        gender: state.gender ? state.gender.charAt(0).toUpperCase() + state.gender.slice(1) : undefined,
                        caste: state.category ? state.category.toUpperCase() : undefined,
                        aadhaar: state.aadhaarNumber || undefined,
                        state: state.state,
                        district: state.district,
                        sub_district: state.taluka,
                        language: state.language,
                        documents_available,
                    };

                    const result = await runAgentTask(prompt, profileData);
                    set({ agentResult: result, isAgentLoading: false });
                } catch (error) {
                    console.error('Agent sync failed', error);
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
