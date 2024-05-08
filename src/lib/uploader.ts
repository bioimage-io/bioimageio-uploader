//import Hypha from './hypha.ts';
// import axios from 'axios'; ///dist/browser/axios.cjs';
// import axios from 'axios';
//import { Draft, JsonError } from "json-schema-library";
import { AxiosProgressEvent } from 'axios';
import { Validator } from '@cfworker/json-schema';
import Ajv from 'ajv';
import { default as JSZip } from "jszip";

import generate_name from './generate_name';
import { FileFromJSZipZipOject, load_yaml, dump_yaml } from "./utils";
import { storage, functions } from "./hypha";
import { URL_JSON_SCHEMA_LATEST, REGEX_RDF, REGEX_ZIP } from './config';
import { ResourceId } from './resource';
import { RDF } from './rdf'; 

const ajv = new Ajv({allErrors: true, strict: false});

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


export class Uploader {
    error_object: Error | null = null;
    files: File[] = [];
    user_email?: string; 
    resource_path?: ResourceId;
    package_url: string | null = null;
    rdf?: RDF;
    render_callbacks: (() => void)[] = [];
    status: UploaderStatus;
    zip_url: string | null = null;

    constructor() {
        console.debug("Creating uploader...");
        this.status = new UploaderStatus();
    }

    async init() {
    }

    reset() {
        this.resource_path = undefined;
        this.rdf = undefined;
        this.status.reset();
    }

    //set_login_url(ctx: any) {
        //this.show_login_window(ctx.login_url);
        //this.login_url = ctx.login_url
    //}


    set_email(email: string){
        this.user_email = email;
        if(this.rdf){
            if(this.rdf.uploader){
                this.rdf.uploader.email = this.user_email;
            }else{
                this.rdf.uploader = {"email": this.user_email}
            }
        }
    }

    async load(files: File[]) {
        console.debug("Loading model");
        
        if( files.length === 1){
            const input_file = files[0];
            if (input_file.name.search(REGEX_ZIP) !== -1) {
                await this.load_zip_file(input_file);
                return
            } 
        }
    
        const candidates = files.filter((file) => file.name.search(REGEX_RDF) !== -1)
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
        this.rdf!.uploader = {email: this.user_email || ''};
        console.debug('RDF:');
        console.debug(this.rdf);
        // Empty files and repopulate from the zip file, except for the RDF file

        // Set files to all files other than the RDF file
        this.files = files.filter((file) => file.name.search(REGEX_RDF) === -1);
    }

    async load_zip_file(zip_file: File) {
        console.log("Loading zip file...");
        const zip_package = await JSZip.loadAsync(zip_file);
        console.log(zip_package);

        const files: File[] = [];
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
        this.rdf = load_yaml(rdf_text) as RDF;
        if(this.rdf.id){
            // Model already has an id, set the resource path
            this.resource_path = {
                id: this.rdf.id,
                emoji: this.rdf.id_emoji!,
            };
        }
    }

    async validate() {
        console.debug("Validating RDF: ", this.rdf);
        const result = await functions.validate(this.rdf);
        console.log(result);
        
        if (!result.success) {
            console.error("Validation errors:");
            console.error(result.details);
            throw new Error(`${result.details}`);
        }
        else{
            console.log("Validation successful");
        }
    }

    ready_for_review() {
        if (!this.rdf) return false;
        if (!this.files) return false;
        return true;
    }

    ready_to_stage(): boolean{
        console.log("Checking ready to stage");
        if (!this.ready_for_review()) return false;
        if (!this.resource_path) return false;
        if (!this.user_email) return false;
        return true;
    }

    async regenerate_nickname() {
        const model_name = await generate_name();
        console.log("Generated name:", model_name);
        const error = "";
        this.resource_path = model_name;
        this.rdf!.nickname = model_name.id;
        this.rdf!.id_emoji = model_name.emoji;
        return { model_name, error };
    }

    async upload_file(file: File, progress_callback: null | ((val: string, tot: string) => null)) {
        if (!this.resource_path) {
            throw new Error("Unable to upload, resource_path not set");
        };
        if(!storage){
            throw new Error("storage not correctly initialised");
        }
        if(!storage.upload_file){
            throw new Error("storage does not have an 'upload_file' entry");
        }
        // HYPHA VERSION - PLACE IN LIB?
        let onUploadProgress: (evt: AxiosProgressEvent) => void;
        if (typeof progress_callback === "function") {
            onUploadProgress = (progressEvent: AxiosProgressEvent) => {
                this.status.upload_progress_value = `${progressEvent.loaded}`;
                this.status.upload_progress_max = `${progressEvent.total}`;
                console.log("Progress (with callback):", this.status);
                //var percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
                progress_callback(`{progressEvent.loaded}`, `{progressEvent.total}`);
                this.render();
            };
        } else {
            onUploadProgress = (progressEvent: AxiosProgressEvent) => {
                this.status.upload_progress_value = `${progressEvent.loaded}`;
                this.status.upload_progress_max = `${progressEvent.total}`;
                console.log("Progress (no callback):", this.status);
                this.render();
            };
        }

        this.status.message = "Uploading";
        this.status.step = UploaderStep.UPLOADING;
        this.render();
        const filename = `${this.resource_path.id}/${file.name}`;
        try {
            return await storage.upload_file(file, filename, onUploadProgress)
        } catch (error) {
            console.error("Upload failed!");
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
        
        zip.file("rdf.yaml", dump_yaml(this.rdf));

        for (const file of this.files) {
            zip.file(file.name, file);
        }

        const blob = await zip.generateAsync({ type: "blob" });
        const zipfile = new File([blob], "model.zip");
        this.status.message = "Created zip file";
        this.render();
        return zipfile;
    }

    async stage() {
        console.log("Running upload steps (zip, upload, notify CI)");
        this.render();
        const zipfile = await this.create_zip();
        this.render();
        
        try{
            this.zip_url = await this.upload_file(zipfile, null);
        }catch(err){
            throw err;
        }

        try {
            await this.ci_stage(); 
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

    async ci_stage() {
        this.status.message = "⌛ Trying to notify bioimage-bot for the new item...";
        this.status.step = UploaderStep.NOTIFYING_CI;
        this.render();
        console.debug("Notifying CI bot using:");
        console.debug(this.resource_path);
        console.debug(this.zip_url);
        try {
            const response_stage = await functions.stage(this.resource_path!.id, this.zip_url!);
            console.log(response_stage);
            if(!response_stage.success){
                throw new Error(`😬 Failed to reach to the bioimageio-bot, please report the issue to the admin team of bioimage.io: Message: ${response_stage.error}`);
            } 
        } catch (err) {
            throw new Error(`😬 Error calling bioimageio-bot, please report the issue to the admin team of bioimage.io: ${err}`);
        }
        this.render();
    }
}
