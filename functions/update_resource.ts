import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import * as Minio from 'minio';

const { S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env;

export default async (event, context) => {

    const data = await event.json();
    const root_folder = "sandbox.bioimage.io";
    const bucket = "public-datasets";
    const resource_id = data.resource_id;
    const folder = data.resource_id; 
    const update_type = data.type;
    const filename = "chat.json";
    console.log("Creating client...");
    const key = `${root_folder}/${folder}/${filename}`;
    const host = "uk1s3.embassy.ebi.ac.uk";
    const hest_url = `https://${host}`;
    console.log("Using")
    console.log(S3_ACCESS_KEY_ID);
    console.log(S3_SECRET_ACCESS_KEY);
    console.log(`Using object path ${key}`);

    if(true){
    const minioClient = new Minio.Client({
      endPoint: host,
      useSSL: true,
      accessKey: S3_ACCESS_KEY_ID,
      secretKey: S3_SECRET_ACCESS_KEY,
    })
    console.log(key);

    //const objectsStream = minioClient.listObjectsV2(bucket, '', true, '')
    //objectsStream.on('data', function (obj) {
        //console.log(obj)
    //})
    //objectsStream.on('error', function (e) {
        //console.log(e)
    //})

    let size = 0;

    let dataStream = await minioClient.getObject(bucket, key);

    let data = [];
    dataStream.on('data', function (chunk) {
        data.push(chunk);
    })
    let str = "";
    let obj;
    dataStream.on('end', function () {
        str = String.fromCharCode(...data);
        console.log(str);
        obj = JSON.parse(str);
    })
    dataStream.on('error', function (err) {
        console.log(err)
    })

    //await new Promise(resolve => dataStream.on("end", resolve));
    let resss = await dataStream;
    console.log(obj);
    console.log(resss);
    console.log("Done");
    const res = Response.json({ "message": "Success" });
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.append("Access-Control-Allow-Headers", "*");
    res.headers.append("Access-Control-Allow-Methods", "*");
    return res;
    }else{
    const client = new S3Client({
        endpoint: host, // S3_ENDPOINT, // "uk1s3.embassy.ebi.ac.uk",
        //region: 'eu-west-1',
        region: 'us-east-1',
        credentials: {
            accessKeyId: S3_ACCESS_KEY_ID, // from env variables
            secretAccessKey: S3_SECRET_ACCESS_KEY,
        },
        s3ForcePathStyle: true,
    });

    console.log(`Get chat from ${bucket} using ${key}`);
    const get_command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
    });
    let resp_get = await client.send(get_command);
    let chats = resp_get.json();
    chats.chats.push({
        timestamp: new Date().toUTCString(),
        author: data.user,
        text: data.text,
    })

    console.log("Put chat");
    const put_command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
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
}
