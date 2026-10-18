import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

import PokedexScreen from './src/screens/PokedexScreen';

// Load screens safely
let DetailScreenComponent = () => null;
let TeamScreenComponent = () => null;
let GameScreenComponent = () => null;

try {
  DetailScreenComponent = require('./src/screens/DetailScreen').default;
} catch (e) {}

try {
  TeamScreenComponent = require('./src/screens/TeamScreen').default;
} catch (e) {}

try {
  GameScreenComponent = require('./src/screens/GameScreen').default;
} catch (e) {}

// Load Context Provider safely
let TeamProvider = ({ children }) => children;
try {
  const contextModule = require('./src/context/TeamContext');
  TeamProvider = contextModule.TeamProvider || contextModule.default;
} catch (e) {
  try {
    const pokeContextModule = require('./src/context/PokemonContext');
    TeamProvider = pokeContextModule.PokemonProvider || pokeContextModule.default;
  } catch (err) {}
}

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function PokedexStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PokedexMain" component={PokedexScreen} />
      <Stack.Screen name="Detail" component={DetailScreenComponent} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <TeamProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarActiveTintColor: '#E60012',
              tabBarInactiveTintColor: '#888888',
              tabBarStyle: {
                height: 72,
                paddingBottom: 16,
                paddingTop: 6,
                backgroundColor: '#FFFFFF',
                borderTopWidth: 1,
                borderTopColor: '#E0E0E0',
              },
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '600',
                marginTop: -2,
                includeFontPadding: false,
              },
            }}
          >
            <Tab.Screen
              name="Pokédex"
              component={PokedexStack}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="pokeball" size={size} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="My Team"
              component={TeamScreenComponent}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <MaterialCommunityIcons name="cards-outline" size={size} color={color} />
                ),
              }}
            />
            <Tab.Screen
              name="Game"
              component={GameScreenComponent}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Ionicons name="game-controller" size={size} color={color} />
                ),
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </TeamProvider>
    </SafeAreaProvider>
  );
}