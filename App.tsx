import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  ContractScreen,
  MainAltarScreen,
  RitualScreen,
  EffigyScreen,
  RitualDemoteScreen,
  RitualLoveScreen,
  RitualServerScreen,
  KarmaScreen,
  GrimoireScreen,
} from './src/screens';
import { RootStackParamList } from './src/types';
import { ConfigProvider } from './src/context/ConfigContext';
import DrawerContent from './src/components/DrawerContent';

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ConfigProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            <Drawer.Navigator
              drawerContent={(props) => <DrawerContent {...props} />}
              screenOptions={{
                headerShown: false,
                drawerType: 'front',
                drawerStyle: {
                  backgroundColor: '#0d050a',
                  width: 280,
                },
                overlayColor: 'rgba(0,0,0,0.7)',
              }}
            >
              <Drawer.Screen name="Altar" component={MainAltarScreen} />
              <Drawer.Screen name="Ritual" component={RitualScreen} />
              <Drawer.Screen name="Effigy" component={EffigyScreen} />
              <Drawer.Screen name="Grimoire" component={GrimoireScreen} />
              <Drawer.Screen name="Contract" component={ContractScreen} />
              <Drawer.Screen name="RitualDemote" component={RitualDemoteScreen} />
              <Drawer.Screen name="RitualLove" component={RitualLoveScreen} />
              <Drawer.Screen name="RitualServer" component={RitualServerScreen} />
              <Drawer.Screen name="Karma" component={KarmaScreen} />
            </Drawer.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </ConfigProvider>
    </GestureHandlerRootView>
  );
}
