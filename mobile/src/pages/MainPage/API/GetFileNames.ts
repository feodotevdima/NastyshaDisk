import React from "react";
import axios from "axios";
import { Ip, getToken } from "../../../shared/TokenProvider";

const GetFilesName= async (path: string, page: number, pageSize: number, isPublic: boolean) =>{
    const token= await getToken();
    const query = Ip + ":7003/Files/get_files_name?path="+path+"&page="+page+"&pageSize="+pageSize+"&isPublic="+isPublic;
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

    if(response.status==200)
        {
          let json = await response.data;
          return json;
        }
    
        return;
}

export default GetFilesName;