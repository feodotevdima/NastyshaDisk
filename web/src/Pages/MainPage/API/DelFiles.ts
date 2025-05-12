import React from "react";
import axios from "axios";
import { getToken } from "../../../Shered/TokenProvider";
import { FileEvents, fileEventEmitter } from '../../../Shered/UpdateFiles';

const DelFiles= async (path: string[], isPublic: boolean) =>{
    const token= await getToken();
    const query = "http://localhost:7003/Files";
    const response = await axios.delete(
        query,
        {
          headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + token,
          },
          data: {
            'IsPublic':isPublic,
            'Pathes' : path
          }
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

export default DelFiles;