import React, {useState, useEffect} from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainPage from '../pages/MainPage/MainPage';
import { getToken } from '../sheared/TokenProvider';
import LoginPage from '../pages/LoginPage/LoginPage';
import SheareScreen from '../pages/ShearePage/ShearePage';
import { RootStackParamList } from './NavigationType';
import { fileEventEmitter, FileEvents } from '../sheared/UpdateFiles';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [access, setAccess] = useState<string | null | undefined>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    checkAuth();

    fileEventEmitter.on(FileEvents.CHECK_AUTH, checkAuth);
    
    return () => {
      fileEventEmitter.off(FileEvents.CHECK_AUTH, checkAuth);
    };
  }, []);

  const checkAuth = async () => {
    try{
      const token = await getToken()
      setAccess(token)
    }
    finally{
      setLoading(false);
    }
  }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color='rgb(253, 93, 187)' />
            </View>
        );
    }

    return (
      access?
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
      : <LoginPage checkAuth={checkAuth} />
    );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(247, 228, 239)',
  },
})
