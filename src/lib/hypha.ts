// import * as imjoyCore from 'imjoy-core';
import * as imjoyRPC from 'imjoy-rpc';
import { default as axios, AxiosProgressEvent } from 'axios';
import UserInfo from './user_info';
import {login_url, token, connection_tries, hypha_version} from '../stores/hypha'; 
import user_state from "../stores/user";
// import { persist } from '../stores/store_util';
import { get } from 'svelte/store';
import {SERVER_URL, SANDBOX, MAX_CONNECTION_RETRIES } from './config';
import { copy_to_clipboard } from './utils';

interface HyphaConnectionInfo{
    user_info: {email: string, id:string},
}

interface HyphaServer{
    get_connection_info: () => Promise<HyphaConnectionInfo>,
    get_service: (_: string) => Promise<HyphaService>,
    list_services: (_: string) => Promise<Array<HyphaServiceInfo>>,
}

interface UploadServiceResponse{
    success: boolean,
    data?: any,
    error?: string,
}

// Has to be generic enough to handle all services we use 
interface HyphaService{
    // Storage service
    generate_credential?: () => Promise<HyphaStorageInfo>,
    generate_presigned_url?: (bucket: string, 
                              path: string, 
                              options?: { client_method: string, _rkwargs: boolean }) => Promise<string>,
    // Uploader service 
    is_reviewer?: () => Promise<UploadServiceResponse>,
    chat?: (resource_id: string, version: string, message: string, sandbox: boolean) => Promise<UploadServiceResponse>,
    stage?: (resource_id: string, package_url: string, sandbox: boolean) => Promise<UploadServiceResponse>,
    review?: (resource_id: string, version: string, action: string, message: string, sandbox:boolean) => Promise<UploadServiceResponse>,
    proxy?: (url: string) => Promise<UploadServiceResponse>,
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

const set_login_url = (context: {login_url: string}) => {
    login_url.set(context.login_url);
    console.log("Login url is:", context.login_url);
}

const set_user = async (user: UserInfo|undefined, is_reviewer?: boolean) =>{
    if(is_reviewer === undefined){
        const resp = await functions.is_reviewer();
        is_reviewer = resp.success && resp.data;
    }
    
    user_state.set({
        is_logged_in: user !== null,
        is_reviewer: is_reviewer,
        user_info: user ? user : undefined,
    })
}

let server: HyphaServer;
let upload_service: HyphaService;
let hypha_storage: HyphaService;
let hypha_storage_info: HyphaStorageInfo;

export const update_token = (value:string|null) => {
    if(value === get(token)) return;    
    if(token) 
    token.set(value);
};

const try_connect_server = async(_token: string) =>{
    // Catch if already tried too much
    const num_tries = get(connection_tries);
    console.debug(`Trying to connect to hypha [${num_tries} / ${MAX_CONNECTION_RETRIES}]`); 
    if(num_tries > MAX_CONNECTION_RETRIES){
        console.error("There appears to be a connection problem. Aborting connection with current token");
        console.error("Please try again later");
        update_token(null);
        connection_tries.set(0);
        return;
    } 
    
    try {
        await connect_server(_token);
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

        const TODO_REMOVE_ME_JM_USERID = 'github|478667';
        console.warn("TODO: CURRENTLY CONNECTING TO UPLOADER SERVICE MATCHING", TODO_REMOVE_ME_JM_USERID);
        const services = await server.list_services('public');
        const uploader_service_ids = services
                .filter((item: HyphaServiceInfo) => item.id.endsWith('bioimageio-uploader-service'))
                .filter((item: HyphaServiceInfo) => item.id.includes(TODO_REMOVE_ME_JM_USERID));
        if(uploader_service_ids.length < 1){
            console.error("No uploader services found in hypha server"); 
            alert("Uploader service not found; You will not be able to upload anything.") 
        }else{
            if(uploader_service_ids.length > 1){
                console.warn("More than 1 public uploader service found on hypha server!!"); 
                alert("More than 1 public uploader service found on hypha server!!"); 
            }
            const uploader_service_id = uploader_service_ids[0].id;
            console.log('Connecting to service', uploader_service_id)
            upload_service = await server!.get_service(uploader_service_id);
        }
        
        if(login_info){
            const user_email = ((login_info.user_info || {}).email || ""); 
            const user_id = ((login_info.user_info || {}).id || ""); 
            await set_user({email: user_email, id: user_id});
        }
        connection_tries.set(0);
    } catch (error) {
        console.error("Connection to Hypha failed:");
        console.error(error);
        connection_tries.update((n: number) => n + 1);
        // await auth.login();
        await try_connect_server(_token);
    }
};

const connect_server = async (_token: string) => {
    server = await imjoyRPC.hyphaWebsocketClient.connectToServer({
        name: 'BioImageIO.uploader',
        server_url: SERVER_URL,
        token: _token,
    });
    const login_info = await server.get_connection_info();
    console.log("Login info from Hypha:");
    console.log(login_info);
    hypha_storage = await server!.get_service("s3-storage");
    hypha_storage_info = await hypha_storage.generate_credential!();

    // const TODO_REMOVE_ME_JM_USERID = 'github|1950756';
    // console.warn("TODO: CURRENTLY CONNECTING TO UPLOADER SERVICE MATCHING", TODO_REMOVE_ME_JM_USERID);
    const services = await server.list_services('public');
    const uploader_service_ids = services
            .filter((item: HyphaServiceInfo) => item.id.endsWith('bioimageio-uploader-service'));
            // .filter((item: HyphaServiceInfo) => item.id.includes(TODO_REMOVE_ME_JM_USERID));
    if(uploader_service_ids.length < 1){
        console.error("No uploader services found in hypha server"); 
        alert("Uploader service not found; You will not be able to upload anything.") 
    }else{
        if(uploader_service_ids.length > 1){
            console.warn("More than 1 public uploader service found on hypha server!!"); 
            alert("More than 1 public uploader service found on hypha server!!"); 
        }
        const uploader_service_id = uploader_service_ids[0].id;
        console.log('Connecting to service', uploader_service_id)
        upload_service = await server!.get_service(uploader_service_id);
    }
    
    if(login_info){
        const user_email = ((login_info.user_info || {}).email || ""); 
        const user_id = ((login_info.user_info || {}).id || ""); 
        await set_user({email: user_email, id: user_id});
        copy_to_clipboard(_token); 
    }
};

token.subscribe(async (value: string|null) => {
    if(!value) return; 
    await try_connect_server(value);
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
        update_token(_token);
        console.log(`Token: ${_token!.slice(0, 5)}...`);
    },
    signOut: ()=> {
        update_token(null);
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
    is_reviewer: async () => {
        if(!upload_service) return {success: false, error: "Upload-service not connected"};
        return await upload_service.is_reviewer!();},
    stage: async (resource_path: string, package_url: string) => {
        return await upload_service.stage!(resource_path, package_url, SANDBOX);},
    chat: async(resource_id: string, version: string, message: string) =>{
        return await upload_service.chat!(resource_id, version, message, SANDBOX);},
    review: async(resource_id: string, version: string, action: string, message: string) => {
        return await upload_service.review!(resource_id, version, action, message, SANDBOX);},
    proxy: (url: string) => {return upload_service.proxy!(url)},
}

globalThis.functions = functions;

functions.check_hypha().then((version_info)=>{
    hypha_version.set(version_info.version);
}).catch(err => {
    hypha_version.set("unreachable");
    console.warn("Hypha not reachable");
    console.error(err);
});
