import * as imjoyCore from 'imjoy-core';
import * as imjoyRPC from 'imjoy-rpc';
// import axios from 'axios'; ///dist/browser/axios.cjs';
import { default as axios, AxiosProgressEvent } from 'axios';
//import { Draft, JsonError } from "json-schema-library";
import { Validator } from '@cfworker/json-schema';

import { FileFromJSZipZipOject, clean_rdf } from "./utils.ts";
//import { fetch_with_progress } from "./utils.ts";

import yaml from "js-yaml";
import { default as JSZip } from "jszip";

const regex_zip = /\.zip$/gi;
const regex_rdf = /(rdf\.yml|rdf\.yaml|bioimage\.yml|bioimage\.yaml)$/gi;

const hostname = `${window.location.protocol}//${window.location.host}`;
const generate_name_url = `${hostname}/.netlify/functions/generate_name`;
const notify_ci_url = `${hostname}/.netlify/functions/notify_ci`;
const validator_url = "https://raw.githubusercontent.com/bioimage-io/spec-bioimage-io/main/scripts/bio-rdf-validator.imjoy.html"
const url_json_schema_latest = "https://raw.githubusercontent.com/bioimage-io/spec-bioimage-io/gh-pages/bioimageio_schema_latest.json"; 
//const validator_url = `${hostname}/static/bio-rdf-validator.imjoy.html`

export enum UploaderStep {
    NOT_STARTED = "not-started",
    ZIPPING = "zipping",
    UPLOADING = "uploading",
    NOTIFYING_CI = "notifying-ci",
    FINISHED = "finished",
    FAILED = "failed",
}

class UploaderStatus {
    message = "";
    step = UploaderStep.NOT_STARTED;
    upload_progress_value = '';
    upload_progress_max = '';

    constructor() {
    }

    reset() {
        this.message = "";
        this.step = UploaderStep.NOT_STARTED;
        this.upload_progress_value = "";
        this.upload_progress_max = "";
    }
}

class ResourceId {
    id = "";
    emoji = "";
}


export class Uploader {

    static MAX_CONNECTION_RETRIES = 3;
    static server_url = "https://ai.imjoy.io";

    api: any;
    connection_retry = 0;
    error_object: Error | null = null;
    files: File[] = [];
    login_url: string | null = null;
    user_email: string | null  = ''; 
    resource_path: ResourceId | null = null;
    package_url: string | null = null;
    rdf: any = null;
    render_callbacks: (() => void)[] = [];
    server: any = null;
    server_url: string | null = null;
    show_login_window: (url: string) => void;
    status: UploaderStatus;
    storage: any = null;
    storage_info: any = null;
    token: string | null = '';
    validator: any = null
    zip_urls: { get: string, put: string } | null = null;
    //this.status = {message:"", is_finished: false, is_uploading: false, ci_failed: false};
    //server_url = "https://hypha.bioimage.io";
    //server_url = "https://hypha.bioimage.io/public/apps/hypha-login/";

    constructor() {
        console.log("Creating uploader...");
        this.token = window.sessionStorage.getItem('token');
        //this.status = {message:"", is_finished: false, is_uploading: false, ci_failed: false};
        this.status = new UploaderStatus();
        this.show_login_window = (url) => { globalThis.open(url, '_blank') };
        globalThis.uploader = this;
    }

    async init() {
        await this.initImjoy();
    }

    reset() {
        this.resource_path = null;
        this.rdf = null;
        this.status.reset();
    }

    set_login_url(ctx: any) {
        this.show_login_window(ctx.login_url);
        this.login_url = ctx.login_url
    }


    async initImjoy() {
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

    async loginHypha(){
        console.log(`Connecting to ${Uploader.server_url}`);

        // Init Imjoy-Hypha
        if (this.connection_retry > Uploader.MAX_CONNECTION_RETRIES) {
            console.error("Max retries reached. Please try again later or contact support");
            return
        }
        if (!this.token) {
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
        }
        console.log(`Token: ${this.token!.slice(0, 5)}...`);

        try {

            this.server = await imjoyRPC.hyphaWebsocketClient.connectToServer({
                name: 'BioImageIO.this',
                server_url: Uploader.server_url,
                token: this.token,
            });
            const login_info = await this.server.get_connection_info();
            
            // .user_info.email;
            if(login_info){
                this.user_email = ((login_info.user_info || {}).email || ""); 
                if(this.rdf){
                    if(this.rdf.uploader){
                        this.rdf.uploader.email = this.user_email;
                    }else{
                        this.rdf.uploader = {"email": this.user_email}
                    }
                }
            }


            this.render();
        } catch (error) {
            console.error("Connection to Hypha failed:");
            console.error(error);
            this.connection_retry = this.connection_retry + 1;
            this.token = null;
            window.sessionStorage.setItem('token', '');
            this.loginHypha();
        }
        this.connection_retry = 0;
        console.log("Hypha connected");
    }

    show_login_message(context: any) {
        this.login_url = context.login_url;
    }


    async load(files: File[]) {
        console.debug("Loading model");
        
        if( files.length === 1){
            const input_file = files[0];
            if (input_file.name.search(regex_zip) !== -1) {
                await this.load_zip_file(input_file);
                return
            } 
        }
    
        const candidates = files.filter((file) => file.name.search(regex_rdf) !== -1)
        // Obtain the RDF file
        if (candidates.length > 1) {
            console.error("Given too many RDF files. Please make sure at most one RDF file is present");
            console.debug("Found files:");
            for (const item of files) {
                console.debug(item.name);
            }
            throw Error(`Invalid files given: ${candidates.length} model-definition files found!`);
        }
        if (candidates.length === 1) {
            const rdf_file = candidates[0];
            await this.load_rdf_file(rdf_file);
        } else {
            this.rdf = {};
        }
        this.rdf.uploader = {'email': this.user_email};
        console.debug('RDF:');
        console.debug(this.rdf);
        // Empty files and repopulate from the zip file, except for the RDF file

        // Set files to all files other than the RDF file
        this.files = files.filter((file) => file.name.search(regex_rdf) === -1);
    }

    async load_zip_file(zip_file: File) {
        console.log("Loading zip file...");
        const zip_package = await JSZip.loadAsync(zip_file);
        console.log(zip_package);

        const files = [];
        for (const item of Object.values(zip_package.files)) {
            files.push(await FileFromJSZipZipOject(item));
        };
        await this.load(files);
    }

    async load_rdf_file(rdf_file: File) {
        const rdf_text = await rdf_file.text();
        this.read_model_text(rdf_text);
    }

    read_model_text(rdf_text: string) {
        this.rdf = yaml.load(rdf_text);
    }

    load_validator() {
        if (this.validator) return this.validator;
        this.validator = this.api.getPlugin(
            validator_url
        );
        return this.validator;
    }

    /**
     * Alternative validator using JSON-schema
     */
    async validate_json_schema(){
        console.log("Validating using JSON Schema:");
        let schema = await (await fetch(url_json_schema_latest)).json();
        console.debug(schema);

        console.debug("Creating json-schema validator...");
        const validator = new Validator(schema);
        console.debug(validator);
        
        const result = validator.validate(this.rdf);
        console.log(result);
        
    }

    async validate() {

        /*
         * Lazy loading of validator
         */
        const validator = await this.load_validator();
        let rdf = yaml.load(yaml.dump(this.rdf));
        rdf = clean_rdf(rdf);

        console.log("RDF after cleaning: ", rdf);

        console.warn("STRIPPING UNSUPPORTED FIELDS IN RDF: TODO - THIS SHOULD BE A TEMPORARY FIX");
        const rdf_copy = { ...rdf }
        delete rdf_copy.uploader;

        const results = await validator.validate(rdf_copy);
        if (results.error) {
            throw new Error(results.error);
        }
        this.rdf = rdf;
    }

    ready_for_review() {
        if (!this.rdf) return false;
        if (!this.files) return false;
        return true;
    }

    ready_to_publish(): boolean{
        if (!this.ready_for_review()) return false;
        if (!this.resource_path) return false;
        if (!this.user_email) return false;
        return true;
    }

    logged_in(): boolean{
        if (!this.server) return false;
        return true;
    }

    async regenerate_nickname() {
        try {
            const model_name = Object.assign(new ResourceId, await (await fetch(generate_name_url)).json());
            console.log("Generated name:", model_name);
            const error = "";
            this.resource_path = model_name;
            this.rdf.nickname = model_name.id;
            this.rdf.id_emoji = model_name.emoji;
            return { model_name, error };
        } catch (err) {
            console.error("Failed to generate name:")
            console.error(err);
            console.error(`URL used: ${generate_name_url}`);
            throw Error(err);
        }
    }

    async upload_file(file: File, progress_callback: null | ((val: string, tot: string) => null)) {
        if (!this.resource_path) {
            throw new Error("Unable to upload, resource_path not set");
        };
        this.status.message = "Uploading";
        this.status.step = UploaderStep.UPLOADING;
        this.render();
        const filename = `${this.resource_path.id}/${file.name}`;
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

        try {
            //const config: object {onUploadProgress: ((arg: AxiosProgressEvent) => void }) = {};
            const config : {'onUploadProgress': null | ((progressEvent: AxiosProgressEvent) => void) }= {onUploadProgress: null};
            if (typeof progress_callback === "function") {
                config.onUploadProgress = (progressEvent: AxiosProgressEvent) => {
                    this.status.upload_progress_value = `${progressEvent.loaded}`;
                    this.status.upload_progress_max = `${progressEvent.total}`;
                    console.log("Progress (with callback):", this.status);
                    //var percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
                    progress_callback(`{progressEvent.loaded}`, `{progressEvent.total}`);
                    this.render();
                };
            } else {
                config.onUploadProgress = (progressEvent: AxiosProgressEvent) => {
                    this.status.upload_progress_value = `${progressEvent.loaded}`;
                    this.status.upload_progress_max = `${progressEvent.total}`;
                    console.log("Progress (no callback):", this.status);
                    this.render();
                };
            }

            const response = await axios.put(url_put, file, config);
            console.log("Upload result:", response.data);
            return { 'get': url_get, 'put': url_put };
        } catch (error) {
            console.error("Upload failed!");
            console.error(`Unable to PUT ${filename} to ${url_put}`);
            console.error(error);
            return error;
        }
    }

    async create_zip() {
        this.status.message = "Zipping model";
        this.status.step = UploaderStep.ZIPPING;
        this.render();

        console.debug("Creating updated yaml file...");
        const rdf_file = this.files.filter(item => item.name === "rdf.yaml")
        if (rdf_file.length > 0) {
            this.status.message = "Publishing failed - rdf.yaml file should have been purged";
            this.status.step = UploaderStep.FAILED;
            this.render();
            throw new Error("Found existing RDF file in file list before creating the new one");
        } 

        const zip = new JSZip();
        
        zip.file("rdf.yaml", yaml.dump(this.rdf));

        for (const file of this.files) {
            zip.file(file.name, file);
        }

        const blob = await zip.generateAsync({ type: "blob" });
        const zipfile = new File([blob], "model.zip");
        this.status.message = "Created zip file";
        this.render();
        return zipfile;
    }

    async publish() {
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

        try {
            await this.notify_ci_bot();
        } catch (err) {
            console.error("Nofiying the ci-bot failed:");
            console.error(err);
            this.error_object = err;
            this.status.message = err.message;
            this.status.step = UploaderStep.FAILED;
            this.render();
            return
        }

        this.status.step = UploaderStep.FINISHED;
        this.render();
    }

    render() {
        this.render_callbacks.forEach(callback => callback());
    }

    add_render_callback(callback: () => void) {
        this.render_callbacks.push(callback);
    }
    
    clear_render_callback() {
        this.render_callbacks = []; 
    }

    async notify_ci_bot() {
        if (!notify_ci_url) {
            console.error("notify_ci_url not set")
            throw new Error("notify_ci_url not set");
        }
        const payload = { 'resource_path': this.resource_path!.id, 'package_url': this.zip_urls!.get};
        this.status.message = "⌛ Trying to notify bioimage-bot for the new item...";
        this.status.step = UploaderStep.NOTIFYING_CI;
        this.render();
        console.debug("Notifying CI bot using:");
        console.debug(payload)
        // trigger CI with the bioimageio bot endpoint
        try {
            const resp = await fetch(notify_ci_url, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (resp.status === 200) {
                const ci_resp = (await resp.json());
                if (ci_resp.status == 200) {
                    this.status.message = `🎉 bioimage-bot has successfully detected the item: ${ci_resp.message}`;
                } else {
                    throw new Error(`😬 bioimage-bot notification ran into an issue [${ci_resp.status}]: ${ci_resp.message}`);
                }

            } else {
                const ci_resp = await resp.text();
                throw new Error(`😬 bioimage-bot failed to detected the new item, please report the issue to the admin team of bioimage.io: ${ci_resp}`);
            }
        } catch (err) {
            throw new Error(`😬 Failed to reach to the bioimageio-bot, please report the issue to the admin team of bioimage.io: ${err}`);
        }
        this.render();
    }
}

