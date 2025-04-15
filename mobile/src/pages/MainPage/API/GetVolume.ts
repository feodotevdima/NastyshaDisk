import axios from "axios";
import { Ip, getToken } from "../../../sheared/TokenProvider";

const GetVolume= async () =>{
    const token= await getToken();
    const query = Ip + ":7003/Files/volume";
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
    let json = await response.data;
    return json;
}

export default GetVolume;