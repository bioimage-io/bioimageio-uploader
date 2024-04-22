export const SERVER_URL = import.meta.env.VITE_HYPHA_SERVER_URL || "https://ai.imjoy.io";
export const SANDBOX = import.meta.env.VITE_USE_S3_SANDBOX || true;
const S3_HOST = import.meta.env.VITE_S3_HOST || "https://uk1s3.embassy.ebi.ac.uk";
const S3_BUCKET = import.meta.env.VITE_S3_BUCKET || "public-datasets";
const S3_FOLDER = import.meta.env.VITE_S3_FOLDER || (SANDBOX) ? "sandbox.bioimage.io" : "sandbox.bioimage.io";
export const RESOURCE_URL = `${S3_HOST}/${S3_BUCKET}/${S3_FOLDER}`; 
