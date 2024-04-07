
// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import * as firebaseui from 'firebaseui';

import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import 'firebaseui/dist/firebaseui.css';
import { getFunctions, httpsCallable } from "firebase/functions";

import { getAuth, signOut } from 'firebase/auth';

//import { getAuth, signOut } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCrFU6IotD3jzjGusR_zDMoXhvsUl2h1TY", 
  authDomain: "bioimageio-fb463.firebaseapp.com",
  projectId: "bioimageio-fb463",
  storageBucket: "bioimageio-fb463.appspot.com",
  messagingSenderId: "861528698214",
  appId: "1:861528698214:web:e6665d84c3b4a2086f2ca7",
  measurementId: "G-FCRSWHEQX0"
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
const _functions = getFunctions(app);
const storage = getStorage();


export const upload_file = async (filepath: string, file: File, progress_callback: (tx: number, total: number)=>null )=>{
    const storage_ref = ref(storage, filepath);
    const uploadTask = uploadBytesResumable(storage_ref, file);
    const download_url = "";
    let url = await new Promise(function(resolve, reject) {

        // Listen for state changes, errors, and completion of the upload.
        uploadTask.on('state_changed',
            (snapshot) => {
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                if(progress_callback !== null)
                    progress_callback(snapshot.bytesTransferred, snapshot.totalBytes);
            }, 
            (error) => {
                // A full list of error codes is available at
                // https://firebase.google.com/docs/storage/web/handle-errors
                switch (error.code) {
                    case 'storage/unauthorized':
                    // User doesn't have permission to access the object
                    break;
                case 'storage/canceled':
                    // User canceled the upload
                    break;

                    // ...

                case 'storage/unknown':
                    // Unknown error occurred, inspect error.serverResponse
                    break;
                }
            }, 
            async () => {
                // Upload completed successfully, now we can get the download URL
                let download_url = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(download_url);
            }
        );
    });
    return url;
} 
    
export const functions = {
    get_temporary_upload_url: httpsCallable(_functions, 'get_temporary_upload_url'), 
    stage : httpsCallable(_functions, 'stage'),
    get_json : httpsCallable(_functions, 'get_json'),
    upload_file: upload_file,
};


