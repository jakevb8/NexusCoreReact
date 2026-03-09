import React from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../auth/AuthContext";
import LoginScreen from "../screens/login/LoginScreen";
import OnboardingScreen from "../screens/login/OnboardingScreen";
import PendingApprovalScreen from "../screens/login/PendingApprovalScreen";
import DashboardScreen from "../screens/dashboard/DashboardScreen";
import AssetsScreen from "../screens/assets/AssetsScreen";
import AssetDetailScreen from "../screens/assets/AssetDetailScreen";
import TeamScreen from "../screens/team/TeamScreen";
import ReportsScreen from "../screens/reports/ReportsScreen";
import EventsScreen from "../screens/events/EventsScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import { COLORS } from "../components/theme";

export type RootStackParamList = {
  Login: undefined;
  Onboarding: undefined;
  PendingApproval: undefined;
  Dashboard: undefined;
  Assets: undefined;
  AssetDetail: { assetId: string };
  Team: undefined;
  Reports: undefined;
  Events: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen
              name="PendingApproval"
              component={PendingApprovalScreen}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Assets" component={AssetsScreen} />
            <Stack.Screen name="AssetDetail" component={AssetDetailScreen} />
            <Stack.Screen name="Team" component={TeamScreen} />
            <Stack.Screen name="Reports" component={ReportsScreen} />
            <Stack.Screen name="Events" component={EventsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
