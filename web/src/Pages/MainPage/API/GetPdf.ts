import axios from "axios";
import { Ip, getToken } from "../../../Shered/TokenProvider";

const GetPdf= async (isPublic: boolean, path: string) =>{
    const token= await getToken();
    const query = Ip + ":7003/Files/open_pdf?isPublic="+isPublic+"&path="+path;
    const response = await fetch(query, {
        method: 'GET',
        headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + token,
          },
        }
    );
    if(response.status == 200)
    {
        const blob = await response.blob();
        return blob
    }
    return null;
}

export default GetPdf;