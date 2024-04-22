// import * as imjoyCore from 'imjoy-core';
import * as imjoyRPC from 'imjoy-rpc';
import { default as axios, AxiosProgressEvent } from 'axios';
import UserInfo from './user_info';
import {login_url, token, connection_tries, hypha_version} from '../stores/hypha'; 
import user_state from "../stores/user";
// import { persist } from '../stores/store_util';
import { get } from 'svelte/store';
import {SERVER_URL, SANDBOX } from './config';

const set_login_url = (context: {login_url: string}) => {
    login_url.set(context.login_url);
    console.log("Login url is:", context.login_url);
}


const set_user = (user: UserInfo|undefined) =>{
    user_state.set({
        is_logged_in: user !== null,
        is_reviewer: true, // await functions.is_reviewer(),
        user_info: user ? user : undefined,
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
    is_reviewer?: () => Promise<unknown>,
    chat?: (resource_id: string, version: string, message: string) => Promise<unknown>,
    stage?: (resource_id: string, package_url: string, sandbox: boolean) => Promise<unknown>,
    review?: (resource_id: string, version: string, action: string, message: string) => Promise<unknown>,
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
const uploader_service_id = "public/workspace-manager:bioimageio-uploader-service";

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
        hypha_storage = await server!.get_service("s3-storage");
        hypha_storage_info = await hypha_storage.generate_credential!();
        if(login_info){
            const user_email = ((login_info.user_info || {}).email || ""); 
            const user_id = ((login_info.user_info || {}).id || ""); 
            set_user({email: user_email, id: user_id});
        }
        connection_tries.set(0);
       
        console.warn("TODO: REMOVE THIS IN PRODUCTION");
        const services = await server.list_services('public');
        const uploader_service_ids = services.filter((item: HyphaServiceInfo) => item.id.endsWith('bioimageio-uploader-service'));
        if(uploader_service_ids.length < 1){
            console.error("No uploader services found in hypha server"); 
            // throw new Error("No uploader services found in hypha server");
            alert("Uploader service not found; You will not be able to upload anything.") 
            return 
        }
        if(uploader_service_ids.length > 1){
            console.warn("More than 1 public uploader service found on hypha server!!"); 
            alert("More than 1 public uploader service found on hypha server!!"); 
        }
        
        const uploader_service_id = uploader_service_ids[0].id;
        upload_service = await server!.get_service(uploader_service_id);

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
        token.set(undefined);
        set_user(undefined);
        login_url.set("");
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
        await axios.put(url_put, file, config);
        return url_get;
    }
}

export const functions = {
    check_hypha: async () => {
        return await (await fetch(SERVER_URL)).json();},
    stage: async (resource_path: string, package_url: string) => {
        return await upload_service.stage!(resource_path, package_url, SANDBOX);},
    chat: async(resource_id: string, version: string, message: string) =>{
        return await upload_service.chat!(resource_id, version, message);},
    is_reviewer: async () => {
        return await upload_service.is_reviewer!();},
    review: async(resource_id: string, version: string, action: string, message: string) => {
        return await upload_service.review!(resource_id, version, action, message);},
    proxy: (url: string) => {return upload_service.proxy!(url)},
}

functions.check_hypha().then((version_info)=>{
    hypha_version.set(version_info.version);
}).catch(err => {
    hypha_version.set("unreachable");
    console.warn("Hypha not reachable");
    console.error(err);
});

