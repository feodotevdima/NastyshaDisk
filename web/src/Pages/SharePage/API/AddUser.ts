import axios from "axios";
import { Ip, getToken } from "../../../Shered/TokenProvider";
import { FileEvents, fileEventEmitter } from "../../../Shered/UpdateFiles";

const AddUser= async (path: string, connectedUserId: string) =>{
    const token= await getToken();
    const query = Ip + ":7003/Files/add_user";
    const response = await axios.post(
        query,
        {
          'Path': path,
          'ConnectedUserId': connectedUserId
        },
        {
          headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + token,
          },
        }
    );
    fileEventEmitter.emit(FileEvents.CHECK_CONNECTED_USERS);
    return response;
}

export default AddUser