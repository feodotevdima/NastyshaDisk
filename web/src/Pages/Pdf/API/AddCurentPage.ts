import axios from "axios"
import { Ip, getToken } from "../../../Shered/TokenProvider";
import { FileEvents, fileEventEmitter } from '../../../Shered/UpdateFiles';

const AddCurentPage= async (path: string | null, isPublic: boolean, curentPage: number) =>{
    const token= await getToken();
    const query = Ip + ":7003/Files/add_pdf_page";
    const response = await axios.post(
        query,
        {
          'isPublic': isPublic,
          'path': path,
          'curentPage': curentPage
        },
        {
          headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + token,
          },
        }
    );
    
    return;
}

export default AddCurentPage;