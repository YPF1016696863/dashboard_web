import { $http } from '@/services/ng';


export default function uploadXmlFileToServer(file, uploadUrl) {
    const fd = new FormData();
    fd.append('file', file);
    return $http.post(uploadUrl, fd, {
        withCredentials: true,
        transformRequest: [() => ''],
        headers: {'Content-Type': undefined}
    })
        .then(response => {
            return response;
        })
        .catch((err)=>{
        });
}
