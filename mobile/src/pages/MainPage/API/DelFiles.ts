import React from "react";
import axios from "axios";
import { Ip, getToken } from "../../../sheared/TokenProvider";
import { fileEventEmitter, FileEvents } from '../../../sheared/UpdateFiles';

const DelFiles= async (path: string[], isPublic: boolean) =>{
    const token= await getToken();
    const query = Ip + ":7003/Files";
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
      setTimeout(() => {
        fileEventEmitter.emit(FileEvents.FILES_UPDATED);
      }, 500);
    }
    else
    {
        Alert.alert('Ошибка', response.status);
    }
    return;
}

export default DelFiles;