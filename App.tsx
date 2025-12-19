import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  ContractScreen,
  MainAltarScreen,
  RitualScreen,
  EffigyScreen,
  RitualDemoteScreen,
  RitualLoveScreen,
  RitualServerScreen,
  KarmaScreen,
} from './src/screens';
import { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="Altar"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: '#121212' },
          }}
        >
          <Stack.Screen name="Contract" component={ContractScreen} />
          <Stack.Screen name="Altar" component={MainAltarScreen} />
          <Stack.Screen name="Ritual" component={RitualScreen} />
          <Stack.Screen name="Effigy" component={EffigyScreen} />
          <Stack.Screen name="RitualDemote" component={RitualDemoteScreen} />
          <Stack.Screen name="RitualLove" component={RitualLoveScreen} />
          <Stack.Screen name="RitualServer" component={RitualServerScreen} />
          <Stack.Screen name="Karma" component={KarmaScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
