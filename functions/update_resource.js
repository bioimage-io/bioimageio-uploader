import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
const { S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env;

export default async (event, context) => {

    const data = await event.json();
    //const url = data.url;
    const root_folder = "sandbox.bioimage.io";
    const resource_id = data.resource_id;
    const folder = data.resource_id; 
    const update_type = data.type;
    const filename = "chat.json";

    const client = new S3Client({
        endpoint: S3_ENDPOINT, // from env "http://localhost:9001"
        region: 'eu-west-1',
        credentials: {
            accessKeyId: S3_ACCESS_KEY_ID, // from env variables
            secretAccessKey: S3_SECRET_ACCESS_KEY,
        },
        s3ForcePathStyle: true,
    });

    const get_command = new GetObjectCommand({
        Bucket: "public-datasets",
        Key: `${root_folder}/${folder}/${filename}`,
    });
    let resp_get = await client.send(get_command);
    let chats = resp_get.json();
    chats.chats.push({
        time: new Date().toUTCString(),
        user: data.user,
        text: data.text,
    })

    const put_command = new PutObjectCommand({
        Bucket: "public-datasets",
        Key: `${root_folder}/${folder}/${filename}`,
        Body: JSON.stringify(chats),
    });
    const resp = await client.send(put_command);
    console.log(resp);

    const res = Response.json({ "message": "Success" });
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.append("Access-Control-Allow-Headers", "*");
    res.headers.append("Access-Control-Allow-Methods", "*");
    return res;
}
