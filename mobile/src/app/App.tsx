import React, {useState, useEffect} from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainPage from '../pages/MainPage/MainPage';
import { getToken } from '../sheared/TokenProvider';
import LoginPage from '../pages/LoginPage/LoginPage';
import SheareScreen from '../pages/ShearePage/ShearePage';
import { RootStackParamList } from './NavigationType';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [access, setAccess] = useState<string | null | undefined>("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = await getToken()
    setAccess(token)
  }

  if(access !== "") {
    if(access === null) {
      return <LoginPage checkAuth={checkAuth} />;
    }
    return (
      <NavigationContainer>
        <Stack.Navigator>
        <Stack.Screen 
          name="Home" 
          component={MainPage} 
          options={{ headerShown: false }}
        />
          <Stack.Screen 
            name="Sheare" 
            component={SheareScreen}
            options={{ title: 'Управление доступом' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return null; 
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 10,
    backgroundColor: '#ffddf1',
  },
})
