import React from "react";
import axios from "axios";
import { Ip, getToken } from "../../../shared/TokenProvider";
import { fileEventEmitter, FileEvents } from '../../../shared/UpdateFiles';

const NewDir= async (path: string | null, isPublic: boolean) =>{
    const token= await getToken();
    const query = Ip + ":7003/Files/make_dir";
    const response = await axios.post(
        query,
        {
          'isPublic': isPublic,
          'path': path
        },
        {
          headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + token,
          },
        }
    );

    console.log(response.status)
    if (response.status == 200)
    {
      setTimeout(() => {
        fileEventEmitter.emit(FileEvents.FILES_UPDATED);
      }, 500);
    }
    
    return;
}

export default NewDir;