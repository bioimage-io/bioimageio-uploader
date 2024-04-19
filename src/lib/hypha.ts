import * as imjoyCore from 'imjoy-core';
import * as imjoyRPC from 'imjoy-rpc';
import { default as axios, AxiosProgressEvent } from 'axios';
import UserInfo from './user_info';
import {login_url, token, connection_tries} from '../stores/hypha'; 
import user_state from "../stores/user";
import { persist } from '../stores/store_util';
import { get } from 'svelte/store';
import {SERVER_URL, SANDBOX } from './config';

type AuthStateChangeFunction = (user: UserInfo) => void;

let auth_state_changed = (_: UserInfo) => {};
const set_login_url = (context: {login_url: string}) => {
    login_url.set(context.login_url);
    console.log("Login url is:", context.login_url);
}


const set_user = async (user: UserInfo|null) =>{
    user_state.set({
        is_logged_in: user !== null,
        is_reviewer: true, // await functions.is_reviewer(),
        user_info: user ? user : null,
    })
}

interface HyphaConnectionInfo{
    user_info: {email: string, id:string},
}

interface HyphaServer{
    get_connection_info: () => Promise<HyphaConnectionInfo>,
    get_service: (_: string) => Promise<HyphaService>,
    list_services: (_: string) => Promise<Array<HyphaServiceInfo>>,
}

// Has to be generic enough to handle all services we use 
interface HyphaService{
    // Storage service
    generate_credential?: () => Promise<HyphaStorageInfo>,
    generate_presigned_url?: (bucket: string, 
                              path: string, 
                              options?: { client_method: string, _rkwargs: boolean }) => Promise<string>,
    // Uploader service 
    is_reviewer?: () => Promise<boolean>,
    chat?: (resource_id: string, version_number: string, message: string) => Promise<boolean>,
    stage?: (resource_id: string, package_url: string, sandbox: boolean) => Promise<Response>,
    proxy?: (url: string) => Promise<string>,
}

interface HyphaServiceInfo{
    config: { 
        visibility: string, 
        require_context: boolean, 
        workspace: string
    }
    description: string,
    id: string,
    name: string,
    type: string
}

interface HyphaStorageInfo{
    bucket: string,
    prefix: string,
}


const MAX_CONNECTION_RETRIES = 3;
// Dev value
const uploader_service_id = "github|1950756/KwN5e4iwTMwNGZsVA87iCQ:bioimageio-uploader-service";
// Final value should be the following: 
// const uploader_service_id = "public/workspace-manager:bioimageio-uploader-service";

let server: HyphaServer;
let upload_service: HyphaService;
let hypha_storage: HyphaService;
let hypha_storage_info: HyphaStorageInfo;

token.subscribe(async (value: string) => {
    if(!value) return; 
    try {

        server = await imjoyRPC.hyphaWebsocketClient.connectToServer({
            name: 'BioImageIO.uploader',
            server_url: SERVER_URL,
            token: value,
        });
        const login_info = await server.get_connection_info();
        console.log("Login info from Hypha:");
        console.log(login_info);
        window.server = server;
       
        console.warn("TODO: REMOVE THIS IN PRODUCTION");
        const services = await server.list_services('public');
        const uploader_service_ids = services.filter((item: HyphaServiceInfo) => item.id.endsWith('bioimageio-uploader-service'));
        if(uploader_service_ids.length < 1){
            console.error("No uploader services found in hypha server"); 
            throw new Error("No uploader services found in hypha server");
        }
        if(uploader_service_ids.length > 1){
            console.warn("More than 1 public uploader service found on hypha server!!"); 
            alert("More than 1 public uploader service found on hypha server!!"); 
        }
        
        const uploader_service_id = uploader_service_ids[0].id;

        upload_service = await server!.get_service(uploader_service_id);
        hypha_storage = await server!.get_service("s3-storage");
        //if (hypha_storage){
        hypha_storage_info = await hypha_storage.generate_credential!();
        window.upload_service = upload_service;
        window.storage = hypha_storage;
        // }
        // .user_info.email;
        if(login_info){
            const user_email = ((login_info.user_info || {}).email || ""); 
            const user_id = ((login_info.user_info || {}).id || ""); 
            set_user({email: user_email, id: user_id});
        }
        connection_tries.set(0);
    } catch (error) {
        console.error("Connection to Hypha failed:");
        console.error(error);
        connection_tries.update((n: number) => n + 1);
        token.set(null);
        // window.sessionStorage.setItem('token', '');
        await auth.login();
    }
});



export const auth = {
    login: async () => {
        const num_tries = get(connection_tries);
        console.debug(`Logging into Hypha, try ${num_tries} / ${MAX_CONNECTION_RETRIES}`); 
        if(num_tries > MAX_CONNECTION_RETRIES){
            console.error("There appears to be a connection problem. Aborting login");
            console.error("Please try again later");
            connection_tries.set(0);
            return;
        } 
        const _token = await imjoyRPC.hyphaWebsocketClient.login({
            server_url: SERVER_URL,
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
        set_user(null);
        login_url.set(null);
    }, 
};


export const storage = {
    upload_file: async (file: File, filename: string, progress_callback: (event: AxiosProgressEvent) => void) => {
        const url_put = await hypha_storage!.generate_presigned_url!(
            hypha_storage_info.bucket,
            hypha_storage_info.prefix + filename,
            { client_method: "put_object", _rkwargs: true }
        )
        const url_get = await hypha_storage.generate_presigned_url!(
            hypha_storage_info.bucket,
            hypha_storage_info.prefix + filename
        )
        const config = {'onUploadProgress': progress_callback }; 
        const response = await axios.put(url_put, file, config);
        console.log("Upload result:", response.data);
        // TODO: Check response status
        //return { 'get': url_get, 'put': url_put };
        return url_get;
    }
}

export const functions = {
    check_hypha: async () => {
        return await (await fetch(SERVER_URL)).json();
    },
    stage: async (resource_path: string, package_url: string): Promise<Response> => {
        return await upload_service.stage!(resource_path, package_url, SANDBOX)
    },
    chat: async(resource_id: string, version: string, message: string) =>{
        await upload_service.chat!(resource_id, version, message)},
    is_reviewer: () => {return upload_service.is_reviewer!()},
    proxy: (url: string) => {return upload_service.proxy!(url)},
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
