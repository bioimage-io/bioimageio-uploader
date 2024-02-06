<script charset="utf-8">
    export let server;
    let filename = "";
    let put_url = "";
    let get_url = "";
    let storage;
    let storage_info;

    async function init(){
        storage = await server.get_service("s3-storage");
        storage_info = await storage.generate_credential();
    }

    async function generate_get_url(){
        get_url = await storage.generate_presigned_url(
            storage_info["bucket"], 
            storage_info["prefix"] + filename
        )
    };
    async function generate_put_url(){
        put_url = await storage.generate_presigned_url(
            storage_info.bucket, 
            storage_info.prefix + filename,
            {client_method: "put_object", _rkwargs: true}
        )
    };
    
    init();
</script>

<div><h3>DEBUG</h3>
    <input bind:value={filename}/>
    <p>Put url: <code>{put_url}</code><button on:click={generate_put_url}>Generate</button></p>
    <p>Get url: <code>{get_url}</code><button on:click={generate_get_url}>Generate</button></p>
</div>



