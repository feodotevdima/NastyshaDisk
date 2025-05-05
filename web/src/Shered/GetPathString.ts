const GetPathString = (Path: string[]) => {
    const newArr = Path.slice(1)
    let path = ""
    
    if(newArr.length==0)
        path = "\\";
    else
    {
        newArr.forEach(item => {
            path+=item+'\\';
        });
    }
    
    return path;
}

export default GetPathString;