import React from "react";
import axios from "axios";
import { getToken } from "../../../Shered/TokenProvider";

const GetUsers= async (path: string) =>{
    const token= await getToken();
    const query = "http://localhost:7003/Files/all_to_add?path="+path;
    const response = await axios.get(
        query,
        {
          headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + token,
          },
        }
    );

    if (response.status == 200)
    {
        let json = await response.data;
        return json;
    }
    else
    {
        alert('Ошибка' + response.status);
    }
    
    return;
}

export default GetUsers;