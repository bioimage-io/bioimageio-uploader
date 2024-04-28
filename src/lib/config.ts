// @ts-ignore: env is non standard property added by vite  
export const SERVER_URL = import.meta.env.VITE_HYPHA_SERVER_URL || "https://ai.imjoy.io";
// @ts-ignore: env is non standard property added by vite  
export const SANDBOX = import.meta.env.VITE_SANDBOX === "true" || false;
// @ts-ignore: env is non standard property added by vite  
const S3_HOST = import.meta.env.VITE_S3_HOST || "https://uk1s3.embassy.ebi.ac.uk";
// @ts-ignore: env is non standard property added by vite  
const S3_BUCKET = import.meta.env.VITE_S3_BUCKET || "public-datasets";
// @ts-ignore: env is non standard property added by vite  
const S3_PREFIX = import.meta.env.VITE_S3_PREFIX || SANDBOX ? "sandbox.bioimage.io" : "bioimage.io";
export const RESOURCE_URL = `${S3_HOST}/${S3_BUCKET}/${S3_PREFIX}`; 
// @ts-ignore: env is non standard property added by vite  
export const COLLECTION_URL= import.meta.env.VITE_COLLECTION_URL || `${RESOURCE_URL}/collection.json`;
// @ts-ignore: env is non standard property added by vite  
export const BASE_URL = import.meta.env.BASE_URL;

console.warn("TODO: Migrate animals and adjectives urls");
export const ANIMALS_URL = ` https://raw.githubusercontent.com/bioimage-io/collection-bioimage-io/main/animals.txt`;
export const ADJECTIVES_URL = `https://raw.githubusercontent.com/bioimage-io/collection-bioimage-io/main/adjectives.txt`;
// export const ANIMALS_URL = `${RESOURCE_URL}/animals.json`;
// export const ADJECTIVES_URL = `${RESOURCE_URL}/adjectives.json`;i
export const URL_JSON_SCHEMA_LATEST = "https://raw.githubusercontent.com/bioimage-io/spec-bioimage-io/gh-pages/bioimageio_schema_latest.json"; 

export const REGEX_ZIP = /\.zip$/gi;
export const REGEX_RDF = /(rdf\.yml|rdf\.yaml|bioimage\.yml|bioimage\.yaml)$/gi;
export const MAX_CONNECTION_RETRIES = 3;
export const UPLOADER_SERVICE_ID = "public/workspace-manager:bioimageio-uploader-service";

console.debug("Uploader configuration loaded:");
console.debug(`    SANDBOX          : ${SANDBOX}`);
console.debug(`    RESOURCE_URL     : ${RESOURCE_URL}`);
console.debug("    import.meta.env  : ", import.meta.env);

