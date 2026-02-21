export const runAgentTask = async (prompt: string, profileData: any) => {
    const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

    if (!backendUrl) {
        throw new Error("EXPO_PUBLIC_BACKEND_URL is not defined in environment variables.");
    }

    try {
        const response = await fetch(`${backendUrl}/agent/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                prompt,
                profile: profileData
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Agent API Error: ${response.status} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to run agent task:", error);
        throw error;
    }
};

export const chatWithRegistrationAgent = async (sessionId: string, userInput: string | null, profileData: any) => {
    const backendUrl = process.env.EXPO_PUBLIC_BACKEND_URL;

    if (!backendUrl) {
        throw new Error("EXPO_PUBLIC_BACKEND_URL is not defined in environment variables.");
    }

    try {
        const response = await fetch(`${backendUrl}/agent/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                session_id: sessionId,
                message: userInput,
                profile: profileData
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Agent Chat API Error: ${response.status} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to execute multi-turn agent chat:", error);
        throw error;
    }
};
