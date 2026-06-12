import { SCHEMES, type Condition, type Scheme } from '../data/schemes';
import type { OnboardingState } from '../store/onboardingStore';

export interface ConditionResult {
    labelKey: string;
    met: boolean;
}

export interface SchemeResult {
    scheme: Scheme;
    eligible: boolean;
    conditionResults: ConditionResult[];
    failedConditionKeys: string[];
}

function resolveField(
    field: string,
    state: OnboardingState,
): string | boolean | null {
    const map: Record<string, string | boolean | null> = {
        'farm.land_ownership': state.landOwnership,
        'farm.land_size': state.landSize,
        'farm.primary_crop': state.primaryCrop,
        'farm.irrigation_method': state.irrigationMethod,
        'credentials.has_aadhaar': state.hasAadhaar,
        'credentials.has_bank_account': state.hasBankAccount,
        'credentials.has_ration_card': state.hasRationCard,
        'credentials.category': state.category,
        'credentials.gender': state.gender,
        'location.state': state.state,
        'location.district': state.district,
        'location.taluka': state.taluka,
    };
    return map[field] ?? null;
}

function evaluateCondition(condition: Condition, state: OnboardingState): boolean {
    const fieldValue = resolveField(condition.field, state);
    switch (condition.operator) {
        case 'eq':
            return fieldValue === condition.value;
        case 'exists':
            return fieldValue === condition.value;
        case 'in':
            return (
                Array.isArray(condition.value) &&
                typeof fieldValue === 'string' &&
                condition.value.includes(fieldValue)
            );
        default:
            return false;
    }
}

export function evaluateEligibility(state: OnboardingState): SchemeResult[] {
    return SCHEMES.map((scheme) => {
        // Deduplicate by labelKey — same label shown once in UI
        const seen = new Set<string>();
        const conditionResults: ConditionResult[] = [];

        for (const condition of scheme.conditions) {
            if (seen.has(condition.labelKey)) continue;
            seen.add(condition.labelKey);
            conditionResults.push({
                labelKey: condition.labelKey,
                met: evaluateCondition(condition, state),
            });
        }

        const failedConditionKeys = conditionResults
            .filter((r) => !r.met)
            .map((r) => r.labelKey);

        return {
            scheme,
            eligible: failedConditionKeys.length === 0,
            conditionResults,
            failedConditionKeys,
        };
    });
}
