import React from "react";
import axios from "axios";
import {getToken } from "../../../Shered/TokenProvider";

const ChangeFileName= async (OldPath: string, NewPath: string, isPublic: boolean) =>{
    const token= await getToken();
    const query = "http://localhost:7003/Files/change_name";
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
        // setTimeout(() => {
        //     fileEventEmitter.emit(FileEvents.FILES_UPDATED);
        // }, 500);
    }
    else
    {
        alert('Ошибка' + response.status.toString());
    }

    return;
}

export default ChangeFileName;