import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { SplashScreen } from '../screens/SplashScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { LanguageLocationScreen } from '../screens/LanguageLocationScreen';
import { FarmProfileScreen } from '../screens/FarmProfileScreen';
import { CredentialsScreen } from '../screens/CredentialsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SchemeDetailScreen } from '../screens/SchemeDetailScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => (
    <NavigationContainer>
        <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                contentStyle: { backgroundColor: '#F5F0E1' },
            }}
        >
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen
                name="Welcome"
                component={WelcomeScreen}
                options={{ animation: 'fade' }}
            />
            <Stack.Screen name="OnboardingStep1" component={LanguageLocationScreen} />
            <Stack.Screen name="OnboardingStep2" component={FarmProfileScreen} />
            <Stack.Screen name="OnboardingStep3" component={CredentialsScreen} />
            <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ animation: 'fade', gestureEnabled: false }}
            />
            <Stack.Screen name="SchemeDetail" component={SchemeDetailScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
    </NavigationContainer>
);
