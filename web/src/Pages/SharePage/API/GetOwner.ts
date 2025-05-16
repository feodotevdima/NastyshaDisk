import React from "react";
import axios from "axios";
import { Ip, getToken } from "../../../Shered/TokenProvider";

const GetOwner= async (path: string) =>{
    const token= await getToken();
    const query = Ip + ":7003/Files/get_owner?path="+path;
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

    return response;
}

export default GetOwner;