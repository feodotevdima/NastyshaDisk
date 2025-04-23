import React from "react";
import axios from "axios";
import { Ip, getToken } from "../../../sheared/TokenProvider";
import { fileEventEmitter, FileEvents } from '../../../sheared/UpdateFiles';

const GetUsers= async (path: string) =>{
    const token= await getToken();
    const query = Ip + ":7003/Files/all_to_add?path="+path;
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
        Alert.alert('Ошибка', response.status);
    }
    
    return;
}

export default GetUsers;