import axios from "axios";
import { getToken } from "../../../Shered/TokenProvider";

const GetVolume= async () =>{
    const token= await getToken();
    const query = "http://localhost:7003/Files/volume";
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