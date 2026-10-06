import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useApp } from "../context/AppContext";
import { colors } from "../theme/colors";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import StaffHomeScreen from "../screens/StaffHomeScreen";
import CashierPOSScreen from "../screens/CashierPOSScreen";
import KitchenTimerScreen from "../screens/KitchenTimerScreen";
import StockCountScreen from "../screens/StockCountScreen";
import AttendanceScreen from "../screens/AttendanceScreen";
import ManagerDashboardScreen from "../screens/ManagerDashboardScreen";
import ManagerStationsScreen from "../screens/ManagerStationsScreen";

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.bgCard },
  headerTintColor: colors.textPrimary,
  headerTitleStyle: { fontWeight: "700" },
  contentStyle: { backgroundColor: colors.bg },
};

export default function AppNavigator() {
  const { user } = useApp();

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          background: colors.bg,
          card: colors.bgCard,
          text: colors.textPrimary,
          border: colors.border,
          primary: colors.accentRed,
          notification: colors.accentOrange,
        },
      }}
    >
      <Stack.Navigator screenOptions={screenOptions}>
        {!user ? (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: "Create Account" }}
            />{/**/}
          </>
        ) : user.role === "manager" ? (
            <>
              <Stack.Screen
                name="ManagerDashboard"
                component={ManagerDashboardScreen}
                options={{ title: "Manager Dashboard" }}
              />
              <Stack.Screen
                name="ManagerStations"
                component={ManagerStationsScreen}
                options={{ title: "Station Assignment" }}
              />
            </>
          ) : (
          <>
            <Stack.Screen
              name="StaffHome"
              component={StaffHomeScreen}
              options={{ title: "Staff Home" }}
            />
            <Stack.Screen
              name="CashierPOS"
              component={CashierPOSScreen}
              options={{ title: "Cashier POS" }}
            />
            <Stack.Screen
              name="KitchenTimer"
              component={KitchenTimerScreen}
              options={{ title: "Kitchen Timer" }}
            />
            <Stack.Screen
              name="StockCount"
              component={StockCountScreen}
              options={{ title: "Stock Count" }}
            />
            <Stack.Screen
              name="Attendance"
              component={AttendanceScreen}
              options={{ title: "Attendance" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}