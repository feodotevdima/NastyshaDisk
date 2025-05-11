import axios from "axios";
import { getToken } from "../../../Shered/TokenProvider";
import { FileEvents, fileEventEmitter } from "../../../Shered/UpdateFiles";

const DelUser= async (path: string, connectedUserId: string) =>{
    const token= await getToken();
    const query = "http://localhost:7003/Files/del_user";
    const response = await axios.delete(
        query, 
        {
            data: { 
                Path: path,
                ConnectedUserId: connectedUserId
            },
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + token,
            }
        }
    );
    fileEventEmitter.emit(FileEvents.CHECK_CONNECTED_USERS);
    return response;
}

export default DelUser