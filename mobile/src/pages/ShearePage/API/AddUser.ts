import axios from "axios";
import { Ip, getToken } from "../../../sheared/TokenProvider";

const AddUser= async (path: string, connectedUserId: string) =>{
  console.log(1)
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
    console.log(2)
    console.log(response)
    return response;
}

export default AddUser