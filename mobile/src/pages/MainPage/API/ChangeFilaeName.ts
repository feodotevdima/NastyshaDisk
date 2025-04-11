import React from "react";
import axios from "axios";
import { Ip, getToken } from "../../../shared/TokenProvider";
import { fileEventEmitter, FileEvents } from '../../../shared/UpdateFiles';

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

    console.log(response.status)
    if (response.status == 200)
    {
        setTimeout(() => {
            fileEventEmitter.emit(FileEvents.FILES_UPDATED);
        }, 500);
    }

    return;
}

export default ChangeFileName;