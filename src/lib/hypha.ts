import * as imjoyCore from 'imjoy-core';
import * as imjoyRPC from 'imjoy-rpc';
import { default as axios, AxiosProgressEvent } from 'axios';

export default class Hypha{
    static MAX_CONNECTION_RETRIES = 3;
    static server_url = "https://ai.imjoy.io";
    
    api: any;
    connection_retry = 0;
    login_url: string | null = null;
    server: any = null;
    server_url: string | null = null;
    show_login_window: (url: string) => void;
    storage: any = null;
    storage_info: any = null;
    user_email: string | null  = ''; 
    token: string | null = '';


    constructor() {
        this.token = window.sessionStorage.getItem('token');
        this.show_login_window = (url) => { globalThis.open(url, '_blank') };
    }

    async init_imjoy() {
        console.log("Starting Imjoy...");
        // Init Imjoy-Core
        const imjoy = new imjoyCore.ImJoy({
            imjoy_api: {},
            //imjoy config
        });

        await imjoy.start({ workspace: 'default' });
        console.log('ImJoy started');
        this.api = imjoy.api;

    }


    async init_storage(){
        this.storage = await this.server.get_service("s3-storage");
        this.storage_info = await this.storage.generate_credential();
    }

    is_logged_in(): boolean{
        if (!this.server) return false;
        return true;
    }

    is_reviewer(): boolean{
        if(!this.is_logged_in()) return false;
        return this.user_email === "metz.jp@gmail.com";
    }

    async login(){
        console.log(`Connecting to ${Hypha.server_url}`);

        // Init Imjoy-Hypha
        if (this.connection_retry > Hypha.MAX_CONNECTION_RETRIES) {
            console.error("Max retries reached. Please try again later or contact support");
            return
        }
        if (!this.token) {
            console.log("    Getting token...");
            console.log("    from:");
            console.log(imjoyRPC);
            console.log(`    using url: ${Hypha.server_url}`);
            this.token = await imjoyRPC.hyphaWebsocketClient.login({
                server_url: Hypha.server_url,
                login_callback: this.set_login_url.bind(this),

            });
            window.sessionStorage.setItem('token', this.token!);
            console.log('    token saved');
        }
        console.log(`Token: ${this.token!.slice(0, 5)}...`);

        try {

            this.server = await imjoyRPC.hyphaWebsocketClient.connectToServer({
                name: 'BioImageIO.this',
                server_url: Hypha.server_url,
                token: this.token,
            });
            const login_info = await this.server.get_connection_info();
            
            // .user_info.email;
            if(login_info){
                this.user_email = ((login_info.user_info || {}).email || ""); 
            }

        } catch (error) {
            console.error("Connection to Hypha failed:");
            console.error(error);
            this.connection_retry = this.connection_retry + 1;
            this.token = null;
            window.sessionStorage.setItem('token', '');
            this.login();
        }
        this.connection_retry = 0;
        console.log("Hypha connected");

    }

    set_login_url(ctx: any) {
        this.show_login_window(ctx.login_url);
        this.login_url = ctx.login_url
    }


    async upload_file(file: File, filename: string, progress_callback: (event: AxiosProgressEvent) => void) {

        await this.init_storage();
        const url_put = await this.storage.generate_presigned_url(
            this.storage_info.bucket,
            this.storage_info.prefix + filename,
            { client_method: "put_object", _rkwargs: true }
        )
        const url_get = await this.storage.generate_presigned_url(
            this.storage_info.bucket,
            this.storage_info.prefix + filename
        )
        console.log(
            "Used bucket and prefix:",
            this.storage_info.bucket,
            this.storage_info.prefix);
        console.log("url_get:");
        console.log(url_get);
        console.log("url_put");
        console.log(url_put);

        const config = {'onUploadProgress': progress_callback }; 
        const response = await axios.put(url_put, file, config);
        console.log("Upload result:", response.data);
        return { 'get': url_get, 'put': url_put };
    }

}
