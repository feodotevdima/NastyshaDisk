import React from "react";
import axios from "axios"
import { getToken } from "../../../Shered/TokenProvider";
import { FileEvents, fileEventEmitter } from '../../../Shered/UpdateFiles';

const NewDir= async (path: string | null, isPublic: boolean) =>{
    const token= await getToken();
    const query = "http://localhost:7003/Files/make_dir";
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

    if (response.status == 200)
    {
      fileEventEmitter.emit(FileEvents.FILES_UPDATED);
    }
    else
    {
        alert('Ошибка' + response.status.toString());
    }
    
    return;
}

export default NewDir;