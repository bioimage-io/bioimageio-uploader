<script charset="utf-8">
    export let server;
    let filename = "";
    let put_url = "";
    let get_url = "";
    let storage;

    async function init(){
        storage = await server.getService("public/s3-storage");
    }

    async function generate_get_url(){
        get_url = await storage.generate_presigned_url(filename)
    };
    async function generate_put_url(){
        put_url = await storage.generate_presigned_url(
            filename,"put_object"
        )
    };
    
    init();
</script>

<div><h3>DEBUG</h3>
    <input bind:value={filename}/>
    <p>Put url: <code>{put_url}</code><button on:click={generate_put_url}>Generate</button></p>
    <p>Get url: <code>{get_url}</code><button on:click={generate_get_url}>Generate</button></p>
</div>



