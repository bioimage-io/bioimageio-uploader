import * as imjoyRPC from 'imjoy-rpc';
import * as imjoyCore from 'imjoy-core';
// import axios from 'axios'; ///dist/browser/axios.cjs';
import { default as axios } from 'axios';

import { FileFromJSZipZipOject } from "./utils.js";
//import { fetch_with_progress } from "./utils.js";

import JSZip from "jszip";
import yaml from "js-yaml";


const regex_zip = /\.zip$/gi ;
const regex_rdf = /(rdf\.yml|rdf\.yaml|bioimage\.yml|bioimage\.yaml)$/gi ;


const hostname = `${window.location.protocol}//${window.location.host}`;
const generate_name_url = `${hostname}/.netlify/functions/generate_name`;
const notify_ci_url = `${hostname}/.netlify/functions/notify_ci`;

export default class Uploader{

    MAX_CONNECTION_RETRIES = 3;

    server_url = "https://ai.imjoy.io";

    constructor(){
        console.log("Creating uploader...");
        this.connection_retry = 0;
        this.render_callbacks = [];
        this.token = window.sessionStorage.getItem('token');
        this.model_nickname = null;
        this.model_zip_url = null;
        this.rdf = null;
        this.status = {message:"", is_finished: false, is_uploading: false};
        this.ci_status = {message:""};
        this.show_login_window = (url) => {window.open(url, '_blank')};
        this.error_object = null;

    }

    async init(){
        await this.initHypha();
    }

    reset(){
        this.model_nickname = null;
        this.rdf = null;
        this.status = {message:"", is_finished: false, is_uploading: false};
        this.ci_status = {message:""};
        this.ci_failed = null;
        this.is_finished = false;
    }

    set_login_url(ctx){

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
        if(this.connection_retry > this.MAX_CONNECTION_RETRIES){
            console.error("Max retries reached. Please try again later or contact support"); 
            return this;
        }
        console.log("Initializing Hypha...");
        console.log(`  connecting to ${this.server_url}`); 
        if(!this.token){
            console.log("    Getting token...");
            console.log("    from:");
            console.log(imjoyRPC);
            console.log(`    using url: ${this.server_url}`);
            this.token = await imjoyRPC.hyphaWebsocketClient.login({
                server_url: this.server_url, 
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
    
    async load_from_files(files){
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

    async load_zip_file(zip_file){
        console.log("Loading zip file...");
        const zip_package = await JSZip.loadAsync(zip_file);
        console.log(zip_package);

        const files = [];
        for(const item of Object.values(zip_package.files)){
            files.push( await FileFromJSZipZipOject(item));
        };
        await this.load_from_files(files);
    }

    async load_rdf_file(rdf_file){
        const rdf_text = await rdf_file.text();
        this.read_model_text(rdf_text);
    }

    read_model_text(rdf_text){
        this.rdf = yaml.load(rdf_text);
    }

    async validate(){
        
        /* 
         * Lazy loading of validator
         */
        if(!this.validator){
            this.validator = await this.api.getPlugin(
                "https://raw.githubusercontent.com/jmetz/spec-bioimage-io/dev/scripts/bio-rdf-validator.imjoy.html"
            );
        }
        const rdf = yaml.load(yaml.dump(this.rdf));
        delete rdf._metadata;
        if (rdf?.config?._deposit) delete rdf.config._deposit;
        // Null or zero-length orcid causes issues 
        for (let index=0; index < rdf.authors.length; index++){
            if(!rdf.authors[index].orcid){
                delete rdf.authors[index].orcid;
            }
        }
        for (let index=0; index < rdf.maintainers.length; index++){
            if(!rdf.maintainers[index].email){
                delete rdf.maintainers[index].email;
            }
        }
        console.log("RDF after cleaning: ", rdf);
        const results = await this.validator.validate(rdf);
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
            const model_name = await (await fetch(generate_name_url)).json(); 

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

    /**  
     * Uploads a file with PUT to the uploaders storage_bucket
     *
     * @method
     * @name Uploader.upload_file 
     * @param {File} file: file to be uploaded 
     * @param {function} progress_callback: function that should take inputs `current` and `total`.
     * @returns {Promise<Object>} Promise resolving to Object containing the uploaded 
     *                            files presigned get and put urls or error information  
     */
    async upload_file(file, progress_callback){
        if(!this.model_nickname) return;
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
            let config = {};
            if(typeof progress_callback === "function"){
                config.onUploadProgress = (progressEvent) => {
                    this.status.value = progressEvent.loaded;
                    this.status.max = progressEvent.total;
                    //var percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
                    progress_callback(progressEvent.loaded, progressEvent.total);
                };
            }else{
                config.onUploadProgress = (progressEvent) => {
                    this.status.value = progressEvent.loaded;
                    this.status.max = progressEvent.total;
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
        console.log("Packaging files...");
        this.is_zipping = true;
        this.publish_status = "Packaging files...";
        this.render();
        const zip = new JSZip();
        const rdf_file = this.files.filter(item => item.name === "rdf.yaml")
        if(rdf_file.length !== 1){
            this.is_zipping = false;
            this.publish_succeeded = false;
            this.publish_status = "Publishing failed - unable to find rdf.yaml"; 
            this.render();
            throw new Error("Could not find RDF file in file list");
        }

        for(const file of this.files){
            zip.file(file.name, file);
        }
        
        const blob = await zip.generateAsync({type: "blob"});
        const zipfile = new File([blob], "model.zip");
        this.is_zipping = false;
        this.publish_status = "Created zip file";
        this.render();
        return zipfile;
    }

    async publish(){
        console.log("Running upload steps (zip, upload, notify CI)");
        this.is_zipping = true;
        this.status = {message: "Zipping model", is_uploading: true, is_finished: false}; 
        this.render();
        const zipfile = await this.create_zip();
        this.is_zipping = false;
        this.publish_status = "Uploading"; 
        this.render();
        console.log(`
            hostname                : ${hostname}
            generate_name_url       : ${generate_name_url}
            notify_ci_url           : ${notify_ci_url}`);
        this.storage = await this.server.get_service("s3-storage");
        this.storage_info = await this.storage.generate_credential();
        this.zip_urls = await this.upload_file(zipfile, null);
        this.status.is_uploading = false;
        this.status.succeeded = true;
        
        try{
            await this.notify_ci_bot();
            this.is_finished = true;
        }catch(err){
            console.error("Nofiying the ci-bot failed:");
            console.error(err);
            this.error_object = err;
            this.ci_failed = true;
            this.ci_status = err.message;
        }

        this.render();
    }

    render(data){
        this.render_callbacks.forEach(callback => callback(data));
    }

    add_render_callback(callback){
        this.render_callbacks.push(callback);
    }
    
    async notify_ci_bot() {
        if(!notify_ci_url){
            console.error("notify_ci_url not set")
            throw new Error("notify_ci_url not set");
        } 
        this.ci_status.message = "⌛ Trying to notify bioimage-bot for the new item...";
        console.debug(this.ci_status);
        this.render();
        // trigger CI with the bioimageio bot endpoint
        try{
            const resp = await fetch(notify_ci_url, {
                    method: 'POST', 
                    headers: {"Content-Type": "application/json"}, 
                    body: JSON.stringify({'model_nickname': this.model_nickname.name, 'model_zip_url': this.zip_urls.get})});
            if (resp.status === 200) {
                const ci_resp = (await resp.json());
                if(ci_resp.status == 200){
                    this.ci_status.message = `🎉 bioimage-bot has successfully detected the item: ${ci_resp.message}`;
                    console.log(ci_resp);
                    this.ci_status.failed = false;
                    console.log(this.ci_status);
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

