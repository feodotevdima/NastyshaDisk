import React from "react";
import axios from "axios";
import { Ip, getToken } from "../../../Shered/TokenProvider";
import { FileEvents, fileEventEmitter } from '../../../Shered/UpdateFiles';

const UnionFiles= async (path: string, names: string[], dirName: string, isPublic: boolean) =>{
  console.log(path)
  console.log(names)
    const token= await getToken();
    const query = Ip + ":7003/Files/union_files";
    const response = await axios.put(
        query,
        {
          'Path': path,
          'Names': names,
          'DirName': dirName,
          'IsPublic': isPublic
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
          setTimeout(() => {
            fileEventEmitter.emit(FileEvents.FILES_UPDATED);
          }, 500);
        }

    
    return;
}

export default UnionFiles;