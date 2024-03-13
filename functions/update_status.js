import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
const { S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env;

export default async (event, context) => {


    console.log(S3_ENDPOINT);
    console.log(S3_ACCESS_KEY_ID);
    console.log(S3_SECRET_ACCESS_KEY);
    console.log(`Connecting to S3: ${S3_ENDPOINT}`);

    const data = await event.json();
    console.log(data);
    const client = new S3Client({
        endpoint: S3_ENDPOINT, // from env "http://localhost:9001"
        region: 'eu-west-1',
        credentials: {
            accessKeyId: S3_ACCESS_KEY_ID, // from env variables
            secretAccessKey: S3_SECRET_ACCESS_KEY,
        },
        s3ForcePathStyle: true,
    });

    const root_folder = "sandbox.bioimage.io";
    const folder = "jm-test";
    const filename = "ntl-functest.json";

    const command = new PutObjectCommand({
        Bucket: "public-datasets",
        Key: `${root_folder}/${folder}/${filename}`,
        Body: JSON.stringify({ "status": "This works too" }),
    });
    const resp = await client.send(command);
    console.log(resp);

    const res = Response.json({ "message": "Success" });
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.append("Access-Control-Allow-Headers", "*");
    res.headers.append("Access-Control-Allow-Methods", "*");
    return res;
}
