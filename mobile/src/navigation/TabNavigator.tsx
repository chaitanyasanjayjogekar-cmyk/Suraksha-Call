import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme';

import HomeScreen from '../screens/HomeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ContactsScreen from '../screens/ContactsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function tabIcon(route: string, focused: boolean): IoniconsName {
  const icons: Record<string, [string, string]> = {
    Home: ['shield', 'shield-outline'],
    History: ['time', 'time-outline'],
    Contacts: ['people', 'people-outline'],
    Profile: ['person', 'person-outline'],
  };
  const [active, inactive] = icons[route] || ['ellipse', 'ellipse-outline'];
  return (focused ? active : inactive) as IoniconsName;
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.secondaryText,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={tabIcon(route.name, focused)} size={22} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Detect' }} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Contacts" component={ContactsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

