import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

function TokenProvider(){

    // const Ip : string ="http://192.168.42.222";
    const Ip : string ="http://192.168.10.27";

    const getExpirationDate = (jwtToken : string) => {
        if ((jwtToken==null) || (jwtToken=="")|| (jwtToken==" ")) {
            return null;
        }
        const jwt = JSON.parse(atob(jwtToken.split('.')[1]));
        return jwt && jwt.exp && jwt.exp * 1000 || null;
    };


    const isExpired = (exp : number | null ) => {
        if (!exp) {
            return false;
        }
        return Date.now() > exp;
    };


    const getToken = async () => 
    {
        const Access = await AsyncStorage.getItem('AccessToken');
        
        const Refresh = await AsyncStorage.getItem('RefreshToken');


        if (!Access || !Refresh) 
            return null;
        else if(Access=='' || Refresh=='')
            return null;

    
        if (isExpired(getExpirationDate(Access))) 
        {
            if (!isExpired(getExpirationDate(Access))) 
                return Access;

            const updatedToken = await fetch(Ip +":7002/Auth/refreshToken/"+Refresh, {method: 'PUT',});
            if (updatedToken.status!==200)
            {
                if (isExpired(getExpirationDate(Access))) 
                {
                    setToken(null, null);
                    return;
                }
                else return null;
            }
            if (updatedToken.status===200)
            {
                const j = await updatedToken.json()
                setToken(j.accessToken, j.refreshToken);
            }
        }
        return await AsyncStorage.getItem('AccessToken');    
    };

    const setToken = async (accessToken : string | null, refreshToken : string | null) => {
        if (accessToken !=null && refreshToken!=null) {
            await AsyncStorage.setItem(
                'AccessToken',
                accessToken,
              );
            await AsyncStorage.setItem(
                'RefreshToken',
                refreshToken,
              );
        } else {
            await AsyncStorage.removeItem('AccessToken');
            await AsyncStorage.removeItem('RefreshToken');
        }
    };

    const Login = async (email: string, pass: string) => {
        const response = await axios.post(
            Ip + ":7002/Auth/login",
            {
              login: email,
              password: pass,
            },
            {
              headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json',
              },
            }
          );
            if(response.status==200)
            {
              let json = await response.data;
              console.log(json)
              setToken(json.accessToken, json.refreshToken)
            }
            return response.status;
    }
    

    async function Logout()
    {
        const token = await getToken();
        const response = await fetch(Ip + ":7002/Auth/logout/"+token,
        {
            method: "DELETE",
            headers:     
            {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        });
        if(response.ok)
        {
            setToken(null, null)
        }
    }   
    

    return {
        getToken,
        setToken,
        Login,
        Logout,
        Ip
    };
};

export const {getToken, setToken, Login, Logout, Ip} = TokenProvider();