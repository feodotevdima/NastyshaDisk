function TokenProvider(){

    const Ip = 'http://192.168.54.222';

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
        if (localStorage.accessToken==null || localStorage.accessToken=="" || localStorage.accessToken==" ") 
            return null;
 
        if (isExpired(getExpirationDate(localStorage.accessToken))) 
        {
            if (!isExpired(getExpirationDate(localStorage.accessToken))) 
                return localStorage.accessToken;

            const updatedToken = await fetch(Ip + ":7002/Auth/refreshToken/"+localStorage.refreshToken, {method: 'PUT',});
            if (updatedToken.status!==200)
            {
                if (isExpired(getExpirationDate(localStorage.accessToken))) 
                {
                    setToken(null, null);
                    return;
                }
                else return localStorage.accessToken;
            }
            if (updatedToken.status===200)
            {
                const j = await updatedToken.json()
                setToken(j.accessToken, j.refreshToken);
            }
        }
        return localStorage.accessToken;       
    };

    const setToken = (accessToken : string | null, refreshToken : string | null) => {
        if (accessToken !=null && refreshToken!=null) {
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
        } else {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
        }
    };

    const Login = async (email: string, pass: string) => {
        const response = await fetch(Ip + ":7002/Auth/login",
            {
              method: "POST",
              headers:     
              {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                login: email,
                password: pass
              })
            });
              
            if(response.ok)
            {
              let json = await response.json();
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
            window.location.reload();
        }
    }       

    return {
        Ip,
        getToken,
        setToken,
        Login,
        Logout
    };
};

export const {Ip, getToken, setToken, Login, Logout} = TokenProvider();