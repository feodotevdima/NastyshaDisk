import React, { useState } from 'react';
import { ActivityIndicator, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getToken, Login } from '../../sheared/TokenProvider';


interface LoginPageProps {
  checkAuth: () => void;
}


const LoginPage : React.FC<LoginPageProps> = ({checkAuth}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }
    var pattern = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
    // if(!email.match(pattern))
    // {
    //     Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
    //     return;
    // }
        
    setLoading(true);
    const response: number = await Login(email, password);
    if(response===200)
      await checkAuth();

    setLoading(false);
    if((response===400) || (response===401))
      Alert.alert("Неверный логин или пароль");
    else if(response!=200)
      Alert.alert("Ошибка сервера");
    return response;
  };

  if (loading) 
  {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color='rgb(253, 93, 187)' />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Вход в приложение</Text>

      <TextInput
        style={styles.input}
        placeholder="Введите вашу почту"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Введите ваш пароль"
        value={password}
        onChangeText={setPassword}
        secureTextEntry 
      />

      <TouchableOpacity
        onPress={handleLogin}
        style={styles.button}
      >
        <Text>Вход</Text>
      </TouchableOpacity>
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgb(247, 228, 239)',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(247, 228, 239)',
  },
  button :{
    backgroundColor: "#f38bc8",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
});

export default LoginPage;