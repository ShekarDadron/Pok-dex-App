import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import PokedexScreen from '../screens/PokedexScreen';
import DetailScreen from '../screens/DetailScreen';
import TeamScreen from '../screens/TeamScreen';
import GameScreen from '../screens/GameScreen';
import { RETRO_COLORS } from '../constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function PokedexStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PokedexList" component={PokedexScreen} />
      <Stack.Screen name="Detail" component={DetailScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        lazy: false, // Pre-renders background tabs for immediate switching
        tabBarActiveTintColor: RETRO_COLORS?.pokedexRed || '#E60012',
        tabBarInactiveTintColor: '#888888',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 6,
        },
      }}
    >
      <Tab.Screen
        name="Pokedex"
        component={PokedexStack}
        options={{
          tabBarLabel: 'Pokédex',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="pokeball" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="MyTeam"
        component={TeamScreen}
        options={{
          tabBarLabel: 'My Team',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cards-playing-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Game"
        component={GameScreen}
        options={{
          tabBarLabel: 'Game',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="gamepad-variant" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}