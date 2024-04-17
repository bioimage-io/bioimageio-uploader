import * as imjoyCore from 'imjoy-core';
import * as imjoyRPC from 'imjoy-rpc';
import { default as axios, AxiosProgressEvent } from 'axios';
import UserInfo from './user_info';
import {login_url, token, connection_tries} from '../stores/hypha'; 
import { persist } from '../stores/store_util';

type AuthStateChangeFunction = (user: UserInfo) => void;

let auth_state_changed = (_: UserInfo) => {};
const server_url = import.meta.env.VITE_HYHPA_SERVER_URL || "https://ai.imjoy.io";
const set_login_url = (context: {login_url: string}) => {
    login_url.set(context.login_url);
    console.log("Login url is:", context.login_url);
}
let server;

token.subscribe(async (value: string) => {
    if(!value) return; 
    try {

        server = await imjoyRPC.hyphaWebsocketClient.connectToServer({
            name: 'BioImageIO.uploader',
            server_url: server_url,
            token: value,
        });
        const login_info = await server.get_connection_info();
        console.log("Login info from Hypha:");
        console.log(login_info);
        
        // .user_info.email;
        if(login_info){
            const user_email = ((login_info.user_info || {}).email || ""); 
            const user_id = ((login_info.user_info || {}).id || ""); 
            auth_state_changed({email: user_email, id: user_id});
        }

    } catch (error) {
        console.error("Connection to Hypha failed:");
        console.error(error);
        connection_tries.update((n: number) => n + 1);
        token.set(null);
        // window.sessionStorage.setItem('token', '');
        await auth.login();
    }
    connection_tries.set(0);
});


export const auth = {
    onAuthStateChanged: (func: AuthStateChangeFunction)=>{
        auth_state_changed = func;
    },
    login: async () => {
        const _token = await imjoyRPC.hyphaWebsocketClient.login({
            server_url: server_url,
            login_callback: set_login_url,
        });
        if(!_token){
            console.error("No token from hypha!");
            return
        }
        token.set(_token);
        console.log(`Token: ${_token!.slice(0, 5)}...`);
    },
    signOut: ()=> {
        token.set(null);
        auth_state_changed(null);
    }, 
};


export const storage = {
    upload_file: (file: File) => {
        throw new Error("Implement Me");
    }

}

export const functions = {
    check_hypha: async () => {
        return await (await fetch(server_url)).json();
    },
    get_from_storage: (url: string): unknown => {
        // Call the hypha "get_json" function    
        throw new Error("Implement Me");
        return null;
    },
}

//export default class Hypha{
    //static MAX_CONNECTION_RETRIES = 3;
    //connection_retry = 0;
    //login_url: string | null = null;
    //server: any = null;
    //server_url: string | null = null;
    //show_login_window: (url: string) => void;
    //storage: any = null;
    //storage_info: any = null;
    //user_email: string | null  = ''; 
    //token: string | null = '';


    //constructor() {
        //this.token = window.sessionStorage.getItem('token');
        //this.show_login_window = (url) => { globalThis.open(url, '_blank') };
    //}

    //async init_storage(){
        //this.storage = await this.server.get_service("s3-storage");
        //this.storage_info = await this.storage.generate_credential();
    //}

    //async login(){
        //console.log(`Connecting to ${Hypha.server_url}`);

        //// Init Imjoy-Hypha
        //if (this.connection_retry > Hypha.MAX_CONNECTION_RETRIES) {
            //console.error("Max retries reached. Please try again later or contact support");
            //return
        //}
        //if (!this.token) {
            //console.log("    Getting token...");
            //console.log("    from:");
            //console.log(imjoyRPC);
            //console.log(`    using url: ${Hypha.server_url}`);
            //this.token = await imjoyRPC.hyphaWebsocketClient.login({
                //server_url: Hypha.server_url,
                //login_callback: this.set_login_url.bind(this),

            //});
            //window.sessionStorage.setItem('token', this.token!);
            //console.log('    token saved');
        //}
        //console.log(`Token: ${this.token!.slice(0, 5)}...`);

        //try {

            //this.server = await imjoyRPC.hyphaWebsocketClient.connectToServer({
                //name: 'BioImageIO.this',
                //server_url: Hypha.server_url,
                //token: this.token,
            //});
            //const login_info = await this.server.get_connection_info();
            
            //// .user_info.email;
            //if(login_info){
                //this.user_email = ((login_info.user_info || {}).email || ""); 
            //}

        //} catch (error) {
            //console.error("Connection to Hypha failed:");
            //console.error(error);
            //this.connection_retry = this.connection_retry + 1;
            //this.token = null;
            //window.sessionStorage.setItem('token', '');
            //this.login();
        //}
        //this.connection_retry = 0;
        //console.log("Hypha connected");

    //}

    //set_login_url(ctx: any) {
        //this.show_login_window(ctx.login_url);
        //this.login_url = ctx.login_url
    //}


    //async upload_file(file: File, filename: string, progress_callback: (event: AxiosProgressEvent) => void) {

        //await this.init_storage();
        //const url_put = await this.storage.generate_presigned_url(
            //this.storage_info.bucket,
            //this.storage_info.prefix + filename,
            //{ client_method: "put_object", _rkwargs: true }
        //)
        //const url_get = await this.storage.generate_presigned_url(
            //this.storage_info.bucket,
            //this.storage_info.prefix + filename
        //)
        //const config = {'onUploadProgress': progress_callback }; 
        //const response = await axios.put(url_put, file, config);
        //console.log("Upload result:", response.data);
        //// TODO: Check response status
        //return { 'get': url_get, 'put': url_put };
    //}

//}


//[> TODO: REPLACE THE FOLLOWING FUNCS WITH HYPHA EQUIV
 //*
//// Import the functions you need from the SDKs you need
//import firebase from 'firebase/compat/app';
//import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";
//import * as firebaseui from 'firebaseui';

//import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL } from "firebase/storage";
//import 'firebaseui/dist/firebaseui.css';
//import { getFunctions, httpsCallable } from "firebase/functions";

//import { getAuth, signOut } from 'firebase/auth';

////import { getAuth, signOut } from 'firebase/auth';
//// TODO: Add SDKs for Firebase products that you want to use
//// https://firebase.google.com/docs/web/setup#available-libraries

//// Your web app's Firebase configuration
//// For Firebase JS SDK v7.20.0 and later, measurementId is optional
//const firebaseConfig = {
  //apiKey: "AIzaSyCrFU6IotD3jzjGusR_zDMoXhvsUl2h1TY", 
  //authDomain: "bioimageio-fb463.firebaseapp.com",
  //projectId: "bioimageio-fb463",
  //storageBucket: "bioimageio-fb463.appspot.com",
  //messagingSenderId: "861528698214",
  //appId: "1:861528698214:web:e6665d84c3b4a2086f2ca7",
  //measurementId: "G-FCRSWHEQX0"
//};

//export const app = initializeApp(firebaseConfig);
//export const analytics = getAnalytics(app);
//export const auth = getAuth(app);
//const _functions = getFunctions(app);
//const storage = getStorage();


//export const upload_file = async (filepath: string, file: File, progress_callback: (tx: number, total: number)=>null )=>{
    //const storage_ref = ref(storage, filepath);
    //const uploadTask = uploadBytesResumable(storage_ref, file);
    //const download_url = "";
    //let url = await new Promise(function(resolve, reject) {

        //// Listen for state changes, errors, and completion of the upload.
        //uploadTask.on('state_changed',
            //(snapshot) => {
                //// Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                //if(progress_callback !== null)
                    //progress_callback(snapshot.bytesTransferred, snapshot.totalBytes);
            //}, 
            //(error) => {
                //// A full list of error codes is available at
                //// https://firebase.google.com/docs/storage/web/handle-errors
                //switch (error.code) {
                    //case 'storage/unauthorized':
                    //// User doesn't have permission to access the object
                    //break;
                //case 'storage/canceled':
                    //// User canceled the upload
                    //break;

                    //// ...

                //case 'storage/unknown':
                    //// Unknown error occurred, inspect error.serverResponse
                    //break;
                //}
            //}, 
            //async () => {
                //// Upload completed successfully, now we can get the download URL
                //let download_url = await getDownloadURL(uploadTask.snapshot.ref);
                //resolve(download_url);
            //}
        //);
    //});
    //return url;
//} 
    
//export const functions = {
    //get_temporary_upload_url: httpsCallable(_functions, 'get_temporary_upload_url'), 
    //stage : httpsCallable(_functions, 'stage'),
    //get_json : httpsCallable(_functions, 'get_json'),
    //upload_file: upload_file,
//};

//*/
