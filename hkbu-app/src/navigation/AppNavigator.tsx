import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { RootStackParamList } from '../types';
import { COLORS } from '../utils/constants';

import WelcomeScreen from '../screens/WelcomeScreen';
import SignUpScreen from '../screens/SignUpScreen';
import LoginScreen from '../screens/LoginScreen';
import MainScreen from '../screens/MainScreen';
import MatchScreen from '../screens/MatchScreen';
import EventsScreen from '../screens/EventsScreen';
import FeedScreen from '../screens/FeedScreen';
import ChatScreen from '../screens/ChatScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary }}>
        <ActivityIndicator color={COLORS.secondary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {user ? (
          // Authenticated screens
          <>
            <Stack.Screen name="Main" component={MainScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Match" component={MatchScreen} options={{ title: 'Buddy Matches', headerShown: false }} />
            <Stack.Screen name="Events" component={EventsScreen} options={{ title: 'School Events', headerShown: false }} />
            <Stack.Screen name="Feed" component={FeedScreen} options={{ title: 'Community Feed', headerShown: false }} />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={({ route }) => ({ title: route.params.partnerNickname })}
            />
            <Stack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ title: 'Leaderboard', headerShown: false }} />
          </>
        ) : (
          // Auth screens
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Create Account' }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Log In' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
