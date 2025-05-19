import { Ip, getToken } from "../../../Shered/TokenProvider";

interface PdfResponse {
    blob: Blob | null;
    currentPage: number | null;
}

const GetPdf = async (isPublic: boolean, path: string): Promise<PdfResponse> => {
    const token = await getToken();
    const query = `${Ip}:7003/Files/open_pdf?isPublic=${isPublic}&path=${encodeURIComponent(path)}`;
    
    try {
        const response = await fetch(query, {
            method: 'GET',
            headers: {
                'Accept': 'application/pdf',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.status === 200) {
            const currentPage = response.headers.get('X-Current-Page');  
            const blob = await response.blob();          
            return {
                blob,
                currentPage: currentPage ? parseInt(currentPage) : null
            };
        }
        
        return { blob: null, currentPage: null };
    } catch (error) {
        console.error('Error fetching PDF:', error);
        return { blob: null, currentPage: null };
    }
};

export default GetPdf;