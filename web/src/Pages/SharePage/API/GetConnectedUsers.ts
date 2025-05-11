import axios from "axios";
import { getToken } from "../../../Shered/TokenProvider";

const GetConnectedUsers= async (path: string) =>{
    const token= await getToken();
    const query = "http://localhost:7003/Files/get_connected_users?path="+path;
    const response = await axios.get(
        query,
        {
          headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + token,
          },
        }
    );
    return response;
}

export default GetConnectedUsers;