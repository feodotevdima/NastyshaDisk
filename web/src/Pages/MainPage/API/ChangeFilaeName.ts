import React from "react";
import axios from "axios";
import { Ip, getToken } from "../../../Shered/TokenProvider";
import { FileEvents, fileEventEmitter } from '../../../Shered/UpdateFiles';

const ChangeFileName= async (OldPath: string, NewPath: string, isPublic: boolean) =>{
    const token= await getToken();
    const query = Ip + ":7003/Files/change_name";
    const response = await axios.put(
        query,
        {
            'IsPublic': isPublic,
            'OldPath': OldPath,
            'NewPath': NewPath
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

export default ChangeFileName;