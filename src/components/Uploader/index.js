import * as imjoyRPC from 'imjoy-rpc';
import * as imjoyCore from 'imjoy-core'

import JSZip from "jszip";
import yaml from "js-yaml";


const regex_zip = /\.zip$/gi ;
const regex_rdf = /(rdf\.yml|rdf\.yaml)$/gi ;


const hostname = `${window.location.protocol}//${window.location.host}`;
const generate_name_url = `${hostname}/.netlify/functions/generate_name`;
const notify_ci_url = `${hostname}/.netlify/functions/notify_ci`;



async function FileFromJSZipZipOject(zipObject){
    if(zipObject.dir) throw new Error("Zip file must be flat (no internal folders)");
    const res =  new File([await zipObject.async("blob")], zipObject.name);
    return res;
}


export default class Uploader{

    MAX_CONNECTION_RETRIES = 3;

    server_url = "https://ai.imjoy.io";

    constructor(){
        console.log("Creating uploader...");
        this.connection_retry = 0;
        this.render_callbacks = [];
        this.token = window.sessionStorage.getItem('token');
        this.model_nickname = null;
        this.initHypha();
    }

    reset(){
        this.model_nickname = null;
        this.rdf = {};

    }

    set_login_url(ctx){
        window.open(ctx.login_url, '_blank');
        this.login_url = ctx.login_url
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
            return this;
        }
        console.log("Initializing Hypha...");
        console.log(`  connecting to ${this.server_url}`); 
        if(!this.token){
            console.log("    Getting token...");
            console.log(`    from: ${imjoyRPC}`);
            console.log(`    using url: ${this.server_url}`);
            this.token = await imjoyRPC.hyphaWebsocketClient.login({
                server_url: this.server_url, 
                //login_callback: this.set_login_url (ctx) => {this.login_url = ctx.login_url},
                login_callback: this.set_login_url.bind(this),
            });
            window.sessionStorage.setItem('token', this.token);
            console.log('    token saved');
            console.log('    🥳🥳🥳🥳');
        }
        console.log(`Token: ${this.token.slice(0,5)}...`);
        
        try{

            this.server = await imjoyRPC.hyphaWebsocketClient.connectToServer({
                    name: 'BioImageIO.this',
                    server_url: this.server_url,
                    token: this.token,
            });
            this.render();
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
        console.log("this instance:");
        console.log(this);
    }

    show_login_message(context){
        this.login_url = context.login_url;
    }

     

    async load_from_file(input_file){
        if(input_file.name.search(regex_zip) !== -1){
            await this.load_zip_file(input_file);
        }else if (input_file.name.search(regex_rdf) !== -1){
            await this.load_rdf_file(input_file);
        }else{
            throw Error("Invalid file given");
        }
    }


    async load_zip_file(zip_file){
        console.log("Loading zip file...");
        const zip_package = await JSZip.loadAsync(zip_file);
        console.log(zip_package);
        // Obtain the RDF file
        const file_names = Object.keys(zip_package.files);
        const candidates = file_names.filter((file) => file.search(regex_rdf) !== -1)
        console.log(file_names);
        console.log(candidates);

        if(candidates.length === 0){
            console.error("Unable to find any RDF files in Zip");
            return [
                "Invalid Zip file: no RDF file found!",
                "Entries in zip file:",
                ...Object.keys(zip_package.files)
            ]
        }
        const rdf_file = zip_package.files[candidates[0]];
        const rdf_text = await rdf_file.async("string");
        this.read_model_text(rdf_text);
        // Empty files and repopulate from the zip file
        this.files = [];
        console.log("About to read");


        for(const item of Object.values(zip_package.files)){
            console.log(item);
            this.files.push( await FileFromJSZipZipOject(item))
        };
        // files = new_files;
        console.log("Files:");
        console.log(this.files);

        return [
            `Zip file: ${zip_file.name}`,
            `with ${Object.keys(zip_package.files).length} entries`,
            `And RDF file: ${rdf_file.name}`];
    }


    async load_rdf_file(rdf_file){
        const rdf_text = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {resolve(event.target.result);};
            reader.onerror = reject;
            reader.readAsText(rdf_file);
        });
        this.read_model_text(rdf_text);
    }

    read_model_text(rdf_text){
        this.rdf = yaml.load(rdf_text);
        console.log('RDF:');
        console.log(this.rdf);
    }

    async validate(){
        return 
        let rdf = yaml.load(yaml.dump(this.rdf));
        delete rdf._metadata;
        if (rdf?.config?._deposit) delete rdf.config._deposit;
        console.log("RDF after cleaning: ", rdf);
        const validator = await this.api.getPlugin(
            "https://raw.githubusercontent.com/jmetz/spec-bioimage-io/dev/scripts/bio-rdf-validator.imjoy.html"
        );
        const results = await validator.validate(rdf);
        if (results.error){
            throw Error(results.error);
        }
    }

    ready_for_review(){
        if(!this.rdf) return false;
        if(!this.files) return false;
        return true;
    }
    
    ready_to_publish(){
        if(!this.ready_for_review()) return false;
        if(!this.model_nickname) return false;
        return true;
    }

    logged_in(){
    
        if(!this.server) return false;
        return true;
    }

    async regenerate_nickname(){
        try{
            const model_name = await (await fetch(generate_name_url)).json(); 

            console.log("Generated name:", model_name);
            const error = "";
            this.model_nickname = model_name;
            this.rdf.nickname = model_name.name;
            return {model_name, error};
        }catch(err){
            console.error("Failed to generate name:")
            console.error(err);
            throw Error(err);
        }    
    }


    async upload_file(file){
        if(!this.model_nickname) return;
        const filename = `${this.model_nickname.name}/${file.name}`; 
        //status_message = `Uploading ${filename}`;

        const url_put = await this.storage.generate_presigned_url(
            this.storage_info.bucket, 
            this.storage_info.prefix + filename,
            {client_method: "put_object", _rkwargs: true}
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

        try{
            const response = await fetch(url_put, {method:"PUT", body:file});
            console.log("Upload result:", await response.text());
            return {'get': url_get, 'put': url_put};
        }catch(error){
            console.error("Upload failed!");
            console.error(error);
            return error;
        }
    }

    async publish(){
        console.log("Publishing...");
        console.log(`
            hostname                : ${hostname}
            generate_name_url       : ${generate_name_url}
            notify_ci_url           : ${notify_ci_url}`);
        // let workspace = server.config.workspace;
        this.storage = await this.server.get_service("s3-storage");
        this.storage_info = await this.storage.generate_credential();

        const status_file = new File([
            new Blob(
                [JSON.stringify({status:'uploaded'}, null, 2)], 
                {type: "application/json"})],
            "status.json");
        this.status_urls = await this.upload_file(status_file);
        if(!this.status_urls){
            return
        }
        console.log("SUCCESS: this.status_urls:");
        console.log(this.status_urls);
        this.status_url = this.status_urls.get;
        let rdf_file = this.files.filter(item => item.name === "rdf.yaml")
        if(rdf_file.length !== 1){
            throw new Error("Could not find RDF file in file list");
        }
        rdf_file = rdf_file[0];

        // TODO: The following still needs work
        const rdf_url = (await this.upload_file(rdf_file)).get;
        if(!rdf_url){
            return
        }
        console.log("SUCCESS: rdf_url:" + rdf_url);
        console.log("Uploading:");
        for(const file of this.files){
            if(file.name === "rdf.yaml") continue
            console.log(file.name);
            const result = await this.upload_file(file);
            if(!result){
                return
            }
        }
        await this.notify_ci_bot();
        await new Promise(r => setTimeout(r, 1000));
    }

    async refresh_status(){
        try{
            if(!this.status_url){
                console.log("No status_url");
                return {status:"No status url"}
            }
            const resp = await fetch(this.status_url);
            const status = await resp.json();
            if(!status){
                return {status:"No status"}
            }
            return status;
        }catch(err){
            console.warn("Refresh failed:");
            console.error(err);
            return {status: `Error! ${err}`};
        }
    }

    render(data){
        console.log(`Calling render with ${this.render_callbacks.length} callbacks`);
        this.render_callbacks.forEach(callback => callback(data));
    }

    add_render_callback(callback){
        this.render_callbacks.push(callback);
    }

    
    async notify_ci_bot() {
        if(!notify_ci_url){
            console.error("notify_ci_url not set")
            return 
        } 

        this.render({
            message:"⌛ Trying to notify bioimage-bot for the new item...",
            flag:false
        })
        // trigger CI with the bioimageio bot endpoint
        try{
            const resp = await fetch(notify_ci_url, {
                    method: 'POST', 
                    headers: {"Content-Type": "application/json"}, 
                    body: JSON.stringify({'status_url': this.status_urls.put, 'model_nickname': this.model_nickname.name})});
            if (resp.status === 200) {
                this.render({
                    message:
                    "🎉 bioimage-bot has successfully detected the item: " +
                    (await resp.json())["message"]});
            } else {
                this.render({
                    ci_failed:true,
                    message:
                    "😬 bioimage-bot failed to detected the new item, please report the issue to the admin team of bioimage.io: " +
                    (await resp.text())});
            }
        }catch(err){

            this.render({
                ci_failed:true,
                message:
                `😬 Failed to reach to the bioimageio-bot, please report the issue to the admin team of bioimage.io: ${err}`,
            });
        }
    }

}

