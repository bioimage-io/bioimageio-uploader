import { hyphaWebsocketClient } from "hypha-rpc";
import { default as axios, AxiosProgressEvent } from 'axios';
import UserInfo from './user_info';
import {login_url, token, connection_tries, hypha_version} from '../stores/hypha'; 
import user_state from "../stores/user";
// import { persist } from '../stores/store_util';
import { get } from 'svelte/store';
import {SERVER_URL, SANDBOX, MAX_CONNECTION_RETRIES } from './config';

interface HyphaConnectionInfo{
    user: {email: string, id:string},
}

interface HyphaServer{
    config: any,
    getService: (_: string) => Promise<HyphaService>,
    listServices: (_: string) => Promise<Array<HyphaServiceInfo>>,
}

interface UploadServiceResponse{
    success: boolean,
    data?: any,
    error?: string,
}

interface ValidationResult{
    success: boolean,
    details: string,
    icon: string,
}
interface ChatMessages{
    messages: Array<{author: string, text: string, timestamp: string}>
}

// Has to be generic enough to handle all services we use 
interface HyphaService{
    // Storage service
    generate_credential?: () => Promise<HyphaStorageInfo>,
    generate_presigned_url?: (path: string, 
                            client_method?: string) => Promise<string>,
    // Uploader service 
    is_reviewer?: () => Promise<UploadServiceResponse>,
    chat?: (resource_id: string, version: string, message: string, sandbox: boolean) => Promise<ChatMessages>,
    stage?: (resource_id: string, package_url: string, sandbox: boolean) => Promise<UploadServiceResponse>,
    review?: (resource_id: string, version: string, action: string, message: string, sandbox:boolean) => Promise<UploadServiceResponse>,
    proxy?: (url: string) => Promise<UploadServiceResponse>,
    validate?: (rdf_dict: object) => Promise<ValidationResult>,
    trigger_test?: (resource_path: string, version: string, sandbox:boolean) => Promise<UploadServiceResponse>,
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
        const login_info = server.config;
        console.log("Login info from Hypha:");
        console.log(login_info);
        try{

            upload_service = await server!.getService("ws-user-github|478667/bioimageio-uploader-service");
        }
        catch(e){
            console.error(e);
            alert("Uploader service not found; You will not be able to upload anything.") 
        }
        
        if(login_info){
            const user_email = ((login_info.user || {}).email || ""); 
            const user_id = ((login_info.user || {}).id || ""); 
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

const connect_server = async (_token?: string) => {
    server = await hyphaWebsocketClient.connectToServer({
        name: 'BioImageIO.uploader',
        server_url: SERVER_URL,
        token: _token,
    });
    const login_info = server.config;
    console.log("Login info from Hypha:");
    console.log(login_info);

    // const TODO_REMOVE_ME_JM_USERID = 'github|1950756';
    // console.warn("TODO: CURRENTLY CONNECTING TO UPLOADER SERVICE MATCHING", TODO_REMOVE_ME_JM_USERID);
    try{

        upload_service = await server!.getService("ws-user-github|478667/bioimageio-uploader-service");
    }
    catch(e){
        console.error(e);
        alert("Uploader service not found; You will not be able to upload anything.") 
    }
    
    if(login_info){
        const user_email = ((login_info.user || {}).email || ""); 
        const user_id = ((login_info.user || {}).id || ""); 
        await set_user({email: user_email, id: user_id});
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
        const _token = await hyphaWebsocketClient.login({
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
        const url = `${SERVER_URL}/${server.config.workspace}/files/${filename}`;
        const config = {'onUploadProgress': progress_callback, headers: { 'Authorization': `Bearer ${get(token)}` } }; 
        await axios.put(url, file, config);
        const storage = await server.getService("public/s3-storage");
        const downloadUrl = await storage.generate_presigned_url(filename, "get_object");
        return downloadUrl;
    }
}

export const functions = {
    check_hypha: async () => {
        return await (await fetch(SERVER_URL + "/assets/config.json")).json();},
    is_reviewer: async () => {
        if(!upload_service) return {success: false, error: "Upload-service not connected"};
        return await upload_service.is_reviewer!();},
    stage: async (resource_path: string, package_url: string) => {
        if(!upload_service) return {success: false, error: "Upload-service not connected"};
        return await upload_service.stage!(resource_path, package_url, SANDBOX);},
    chat: async(resource_id: string, version: string, message: string) =>{
        if(!upload_service) throw new Error("Upload-service not connected");
        return await upload_service.chat!(resource_id, version, message, SANDBOX);},
    review: async(resource_id: string, version: string, action: string, message: string) => {
        if(!upload_service) return {success: false, error: "Upload-service not connected"};
        return await upload_service.review!(resource_id, version, action, message, SANDBOX);},
    proxy: (url: string) => {
        if(!upload_service) return {success: false, error: "Upload-service not connected"};
        return upload_service.proxy!(url)},
    validate: async (rdf_dict: object) => {
        if(!upload_service) await connect_server();
        return await upload_service.validate!(rdf_dict);},
    trigger_test: async (resource_path: string, version: string) => {
        if(!upload_service) return {success: false, error: "Upload-service not connected"};
        return await upload_service.trigger_test!(resource_path, version, SANDBOX);},
}

globalThis.functions = functions;

functions.check_hypha().then((version_info)=>{
    hypha_version.set(version_info.version);
}).catch(err => {
    hypha_version.set("unreachable");
    console.warn("Hypha not reachable");
    console.error(err);
});
