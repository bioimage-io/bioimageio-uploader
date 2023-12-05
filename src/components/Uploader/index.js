import * as imjoyRPC from 'imjoy-rpc';
import * as imjoyCore from 'imjoy-core'


export default class Uploader{

    MAX_CONNECTION_RETRIES = 3;

    server_url = "https://ai.imjoy.io";

    constructor(){
        console.log("Creating uploader...");
        this.connection_retry = 0;

        
        this.token = window.sessionStorage.getItem('token');

        this.initHypha();

    }

    show_login_message(context){
        this.login_url = context.login_url;
    }

    async initHypha(){

        // Init Imjoy-Core
        const imjoy = new imjoyCore.ImJoy({
            imjoy_api: {},
            //imjoy config
        });
        imjoy.start({workspace: 'default'}).then(async ()=>{
            console.log('ImJoy started');
            this.api = imjoy.api;
        })

        // Init Imjoy-Hypha
        if(this.connection_retry > this.MAX_CONNECTION_RETRIES){
            console.error("Max retries reached. Please try again later or contact support"); 
            return;
        }
        console.log("Initializing Hypha...");
        console.log(`  connecting to ${this.server_url}`); 
        if(!this.token){
            console.log("Getting token...");
            console.log("from");
            console.log(imjoyRPC);
            this.token = await imjoyRPC.hyphaWebsocketClient.login({
                server_url:this.server_url, 
                login_callback: (ctx) => {this.login_url = ctx.login_url},
            });
            window.sessionStorage.setItem('token', this.token);
            console.log('    token saved');
        }
        console.log(`Token: ${this.token.slice(0,5)}...`);
        
        try{
            this.server = await imjoyRPC.hyphaWebsocketClient.connectToServer({
                    name: 'BioImageIO.uploader',
                    server_url: this.server_url,
                    token: this.token,
            });
        }catch(error){
            console.error("Connection to Hypha failed:");
            console.error(error);
            this.connection_retry = this.connection_retry + 1;
            this.token = null;
            window.sessionStorage.setItem('token', '');
            this.initHypha();
        }
        this.connection_retry = 0;
        console.log("Hypha connected");
    }

}

