function TokenProvider(){

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
        if (sessionStorage.accessToken==null || sessionStorage.accessToken=="" || sessionStorage.accessToken==" ") 
            return null;
 
        if (isExpired(getExpirationDate(sessionStorage.accessToken))) 
        {
            if (!isExpired(getExpirationDate(sessionStorage.accessToken))) 
                return sessionStorage.accessToken;

            const updatedToken = await fetch("http://localhost:7002/Auth/refreshToken/"+sessionStorage.refreshToken, {method: 'PUT',});
            if (updatedToken.status!==200)
            {
                if (isExpired(getExpirationDate(sessionStorage.accessToken))) 
                {
                    setToken(null, null);
                    return;
                }
                else return sessionStorage.accessToken;
            }
            if (updatedToken.status===200)
            {
                const j = await updatedToken.json()
                setToken(j.accessToken, j.refreshToken);
            }
        }
        return sessionStorage.accessToken;       
    };

    const setToken = (accessToken : string | null, refreshToken : string | null) => {
        if (accessToken !=null && refreshToken!=null) {
            sessionStorage.setItem("accessToken", accessToken);
            sessionStorage.setItem("refreshToken", refreshToken);
        } else {
            sessionStorage.removeItem("accessToken");
            sessionStorage.removeItem("refreshToken");
        }
    };

    const Login = async (email: string, pass: string) => {
        const response = await fetch("http://localhost:7002/Auth/login",
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
        const response = await fetch("http://localhost:7002/Auth/logout/"+token,
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
        getToken,
        setToken,
        Login,
        Logout
    };
};

export const {getToken, setToken, Login, Logout} = TokenProvider();