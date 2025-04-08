import React, {useState, useEffect} from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator,  StackScreenProps } from '@react-navigation/stack';
import MainPage from '../pages/MainPage/MainPage';
import { getToken } from '../shared/TokenProvider';
import LoginPage from '../pages/LoginPage/LoginPage';



export default function App() {
  const [access, setAccess] = useState<string | null | undefined>("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () =>{
    const token = await getToken()
    setAccess(token)
  }


  if(access!="")
  {
    if(access==null)
      return(
        <LoginPage checkAuth = {checkAuth} />
      )
    else
    return (
      // <NavigationContainer>
      //   <Stack.Navigator>
      //     <Stack.Screen name="Home" component={HomeScreen} />
      //     <Stack.Screen name="Details" component={DetailsScreen} />
      //   </Stack.Navigator>
      // </NavigationContainer>
      // <LoginScreen />
      <View style={styles.container}>
        < MainPage />
      </View>
    );
 }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 10,
    backgroundColor: '#ffddf1',
  },
})

