import * as imjoyRPC from 'imjoy-rpc';
import * as imjoyCore from 'imjoy-core';
// import axios from 'axios'; ///dist/browser/axios.cjs';
import { default as axios } from 'axios';

import { FileFromJSZipZipOject, clean_rdf } from "./utils.ts";
//import { fetch_with_progress } from "./utils.ts";

import {default as JSZip} from "jszip";
import yaml from "js-yaml";


const regex_zip = /\.zip$/gi ;
const regex_rdf = /(rdf\.yml|rdf\.yaml|bioimage\.yml|bioimage\.yaml)$/gi ;


const hostname = `${window.location.protocol}//${window.location.host}`;
const generate_name_url = `${hostname}/.netlify/functions/generate_name`;
const notify_ci_url = `${hostname}/.netlify/functions/notify_ci`;


export enum UploaderStep {
    NOT_STARTED     = "not-started",
    ZIPPING         = "zipping",
    UPLOADING       = "uploading",
    NOTIFYING_CI    = "notifying-ci",
    FINISHED        = "finished",
    FAILED          = "failed",
}


class UploaderStatus{
    message = "";
    step=UploaderStep.NOT_STARTED;
    upload_progress_value = '';
    upload_progress_max = '';

    constructor(){
    }

    reset(){
        this.message = "";
        this.step=UploaderStep.NOT_STARTED;
        this.upload_progress_value = "";
        this.upload_progress_max = "";
    }
}

class ModelNickname{
    name = "";
    emoji = "";
}


export class Uploader{

    static MAX_CONNECTION_RETRIES = 3;
    static server_url = "https://ai.imjoy.io";

    api: any;
    connection_retry = 0;
    error_object: Error | null  = null;
    files: File[] = [];
    login_url: string | null = null;
    model_nickname: ModelNickname | null = null;
    model_zip_url: string | null  = null;
    rdf : any = null;
    render_callbacks: (() => void)[] = [];
    server: any = null; 
    server_url: string | null = null;
    show_login_window: (url:string) => void; 
    status: UploaderStatus; 
    storage: any = null;
    storage_info: any = null;
    token: string | null= ''; 
    validator: any = null
    zip_urls: {get: string, put: string} | null = null;
    //this.status = {message:"", is_finished: false, is_uploading: false, ci_failed: false};
    //server_url = "https://hypha.bioimage.io";
    //server_url = "https://hypha.bioimage.io/public/apps/hypha-login/";

    constructor(){
        console.log("Creating uploader...");
        this.token = window.sessionStorage.getItem('token');
        //this.status = {message:"", is_finished: false, is_uploading: false, ci_failed: false};
        this.status = new UploaderStatus(); 
        this.show_login_window = (url) => {window.open(url, '_blank')};
    }

    async init(){
        await this.initHypha();
    }

    reset(){
        this.model_nickname = null;
        this.rdf = null;
        this.status.reset(); 
    }

    set_login_url(ctx: any){
        this.show_login_window(ctx.login_url);
        this.login_url = ctx.login_url
    }


    async initHypha(){

        // Init Imjoy-Core
        const imjoy = new imjoyCore.ImJoy({
            imjoy_api: {},
            //imjoy config
        });
        
        await imjoy.start({workspace: 'default'});
        console.log('ImJoy started');
        this.api = imjoy.api;

        // Init Imjoy-Hypha
        if(this.connection_retry > Uploader.MAX_CONNECTION_RETRIES){
            console.error("Max retries reached. Please try again later or contact support"); 
            return this;
        }
        console.log("Initializing Hypha...");
        console.log(`  connecting to ${Uploader.server_url}`); 
        if(!this.token){
            console.log("    Getting token...");
            console.log("    from:");
            console.log(imjoyRPC);
            console.log(`    using url: ${Uploader.server_url}`);
            this.token = await imjoyRPC.hyphaWebsocketClient.login({
                server_url: Uploader.server_url, 
                login_callback: this.set_login_url.bind(this),
            });
            window.sessionStorage.setItem('token', this.token!);
            console.log('    token saved');
            console.log('    🥳🥳🥳🥳');
        }
        console.log(`Token: ${this.token!.slice(0,5)}...`);
        
        try{

            this.server = await imjoyRPC.hyphaWebsocketClient.connectToServer({
                    name: 'BioImageIO.this',
                    server_url: Uploader.server_url,
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

    show_login_message(context: any){
        this.login_url = context.login_url;
    }


    async load_from_file(input_file: File){
        if(input_file.name.search(regex_zip) !== -1){
            await this.load_zip_file(input_file);
        }else if (input_file.name.search(regex_rdf) !== -1){
            await this.load_rdf_file(input_file);
        }else{
            throw Error("Invalid file given");
        }
    }
    
    async load_from_files(files: File[]){
        console.debug("Loading model from files");
        const candidates = files.filter((file) => file.name.search(regex_rdf) !== -1)
        // Obtain the RDF file
        if( candidates.length > 1){
            console.error("Given too many RDF files. Please make sure at most one RDF file is present");
            console.debug("Found files:");
            for(const item of files){
                console.debug(item.name);
            }
            throw Error(`Invalid files given: ${candidates.length} model-definition files found!`);
        }
        if (candidates.length === 1){
            const rdf_file = candidates[0];
            await this.load_rdf_file(rdf_file);
        }else{
            this.rdf = {};
        }
        console.debug('RDF:');
        console.debug(this.rdf);
        // Empty files and repopulate from the zip file
        this.files = files;
    }

    async load_zip_file(zip_file: File){
        console.log("Loading zip file...");
        const zip_package = await JSZip.loadAsync(zip_file);
        console.log(zip_package);

        const files = [];
        for(const item of Object.values(zip_package.files)){
            files.push( await FileFromJSZipZipOject(item));
        };
        await this.load_from_files(files);
    }

    async load_rdf_file(rdf_file: File){
        const rdf_text = await rdf_file.text();
        this.read_model_text(rdf_text);
    }

    read_model_text(rdf_text: string){
        this.rdf = yaml.load(rdf_text);
    }

    load_validator(){
        if(this.validator) return this.validator;
        this.validator = this.api.getPlugin(
            "https://raw.githubusercontent.com/jmetz/spec-bioimage-io/dev/scripts/bio-rdf-validator.imjoy.html"
        );
        return this.validator;
    }

    async validate(){
        
        /* 
         * Lazy loading of validator
         */
        const validator = await this.load_validator();
        let rdf = yaml.load(yaml.dump(this.rdf));
        rdf = clean_rdf(rdf);
        console.log("RDF after cleaning: ", rdf);
        const results = await validator.validate(rdf);
        if (results.error){
            throw new Error(results.error);
        }
        this.rdf = rdf;
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
            const model_name = Object.assign(new ModelNickname, await (await fetch(generate_name_url)).json()); 
            console.log("Generated name:", model_name);
            const error = "";
            this.model_nickname = model_name;
            this.rdf.nickname = model_name.name;
            return {model_name, error};
        }catch(err){
            console.error("Failed to generate name:")
            console.error(err);
            console.error(`URL used: ${generate_name_url}`); 
            throw Error(err);
        }    
    }

    async upload_file(file: File, progress_callback: null | ((val: string, tot:string)=>null)){
        if(!this.model_nickname){
            throw new Error("Unable to upload, model_nickname not set");
        };
        this.status.message = "Uploading"; 
        this.status.step = UploaderStep.UPLOADING;
        this.render();
        const filename = `${this.model_nickname.name}/${file.name}`; 
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
            const config : any = {};
            if(typeof progress_callback === "function"){
                config.onUploadProgress = (progressEvent: any) => {
                    this.status.upload_progress_value = progressEvent.loaded;
                    this.status.upload_progress_max = progressEvent.total;
                    console.log("Progress (with callback):", this.status);
                    //var percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
                    progress_callback(progressEvent.loaded, progressEvent.total);
                    this.render();
                };
            }else{
                config.onUploadProgress = (progressEvent: any) => {
                    this.status.upload_progress_value = progressEvent.loaded;
                    this.status.upload_progress_max = progressEvent.total;
                    console.log("Progress (no callback):", this.status);
                    this.render();
                };
            }

            const response = await axios.put(url_put, file, config);
            //const response = await fetch(url_put, {method:"PUT", body:file});
            //const response = await fetch_with_progress(
                    //url_put, 
                    //{
                        //method:"PUT", 
                        //body:file, 
                        //upload_listener: (evt) => {
                            //if (evt.lengthComputable) {
                                //console.log("upload progress:", evt.loaded / evt.total);
                            //}
                        //}
                    //}
            //);
            console.log("Upload result:", response.data);
            return {'get': url_get, 'put': url_put};
        }catch(error){
            console.error("Upload failed!");
            console.error(`Unable to PUT ${filename} to ${url_put}`);
            console.error(error);
            return error;
        }
    }

    async create_zip(){
        this.status.message = "Zipping model";
        this.status.step = UploaderStep.ZIPPING;
        this.render();
        console.debug("Finding yaml file...");
        const rdf_file = this.files.filter(item => item.name === "rdf.yaml")
        if(rdf_file.length !== 1){
            this.status.message = "Publishing failed - unable to find rdf.yaml"; 
            this.status.step = UploaderStep.FAILED;
            this.render();
            throw new Error("Could not find RDF file in file list");
        }
        const zip = new JSZip();

        for(const file of this.files){
            zip.file(file.name, file);
        }
        
        const blob = await zip.generateAsync({type: "blob"});
        const zipfile = new File([blob], "model.zip");
        this.status.message = "Created zip file";
        this.render();
        return zipfile;
    }

    async publish(){
        console.log("Running upload steps (zip, upload, notify CI)");
        this.render();
        const zipfile = await this.create_zip();
        this.render();
        console.log(`
            hostname                : ${hostname}
            generate_name_url       : ${generate_name_url}
            notify_ci_url           : ${notify_ci_url}`);
        this.storage = await this.server.get_service("s3-storage");
        this.storage_info = await this.storage.generate_credential();
        this.zip_urls = await this.upload_file(zipfile, null);
        
        try{
            await this.notify_ci_bot();
        }catch(err){
            console.error("Nofiying the ci-bot failed:");
            console.error(err);
            this.error_object = err;
            this.status.message = err.message, 
            this.status.step = UploaderStep.FAILED;
            this.render();
            return 
        }

        this.status.step = UploaderStep.FINISHED;
        this.render();
    }

    render(){
        this.render_callbacks.forEach(callback => callback());
    }

    add_render_callback(callback: ()=>void){
        this.render_callbacks.push(callback);
    }
    
    async notify_ci_bot() {
        if(!notify_ci_url){
            console.error("notify_ci_url not set")
            throw new Error("notify_ci_url not set");
        } 
        this.status.message = "⌛ Trying to notify bioimage-bot for the new item...";
        this.status.step = UploaderStep.NOTIFYING_CI;
        this.render();
        // trigger CI with the bioimageio bot endpoint
        try{
            const resp = await fetch(notify_ci_url, {
                    method: 'POST', 
                    headers: {"Content-Type": "application/json"}, 
                    body: JSON.stringify({'model_nickname': this.model_nickname!.name, 'model_zip_url': this.zip_urls!.get})});
            if (resp.status === 200) {
                const ci_resp = (await resp.json());
                if(ci_resp.status == 200){
                    this.status.message = `🎉 bioimage-bot has successfully detected the item: ${ci_resp.message}`;
                }else{
                    throw new Error(`😬 bioimage-bot notification ran into an issue [${ci_resp.status}]: ${ci_resp.message}`);
                }

            } else {
                const ci_resp = await resp.text();
                throw new Error(`😬 bioimage-bot failed to detected the new item, please report the issue to the admin team of bioimage.io: ${ci_resp}`);
            }
        }catch(err){
            throw new Error(`😬 Failed to reach to the bioimageio-bot, please report the issue to the admin team of bioimage.io: ${err}`);
        }
        this.render();
    }
}

