<script>
    import Dropzone from "svelte-file-dropzone/Dropzone.svelte";
    import { onMount } from 'svelte';
    import {login,  connectToServer } from '$lib/imjoy-rpc-hypha/websocket-client';
	import { createEventDispatcher } from 'svelte';
    let storage;
    let storage_info;
    let token;
    let upload_headers;
    let workspace;
    let login_url = "";
    let files = [];
    let _files_rejected = [];
    let upload_succeeded =false;
    const server_url = "https://ai.imjoy.io";

    function show_login_message(context){
        login_url = context.login_url;
    }

    async function initHypha(){
        console.log("Initializing Hypha...");
        if(!token){
            token = await login({
                server_url:server_url, 
                login_callback: show_login_message,
            });
        }
        upload_headers = {Authorization: `Bearer ${token}`};

        console.log(token);
        let server = await connectToServer({
                name: 'BioImageIO.uploader',
                server_url,
                token,
        });
        workspace = server.config.workspace;

        console.log("server");
        console.log(server);
        storage = await server.get_service("s3-storage");
        console.log("storage");
        console.log(storage);
        window.storage = storage;
        storage_info = await storage.generate_credential();
        return 
    };
    onMount(async () => {
        if(!storage) initHypha();
    });

	const dispatch = createEventDispatcher();

	function is_done() {
		dispatch('done', {
		});
    }

    function handle_files_select(e){
        const { acceptedFiles, fileRejections } = e.detail;
        files = [...files, ...acceptedFiles];
        _files_rejected = [..._files_rejected, ...fileRejections];
    }
    
    async function upload(){
        console.log("Uploading files...");
        // console.log(files);
        console.log(files);
        window.files = files;
        for(const file of files){
            const filename = file.name; 
            let url = `${server_url}/${workspace}/files/${filename}`;
            let response = await fetch(
                url, 
                {
                    method:"PUT", 
                    body:file, 
                    credentials:"include", 
                    headers:upload_headers
                });
            console.log("Upload result:", await response.text());
            let presigned_url = await storage.generate_presigned_url(
                storage_info["bucket"], 
                storage_info["prefix"] + filename
            )
            console.log('Done!');
            window.presigned_url = presigned_url;
        }
        upload_succeeded = true;
    }

</script>

<svelte:head>
    <!--script src="https://cdn.jsdelivr.net/npm/imjoy-rpc@latest/dist/imjoy-rpc.min.js" on:load={initHypha}></script-->
    <!--script src="https://lib.imjoy.io/imjoy-loader.js"></script-->
</svelte:head>

<h1>Welcome</h1>

{#if !token}
    Connecting to Imjoy
    {#if login_url}
        <button on:click={()=>{window.open(login_url, '_blank')}}>Login to Imjoy</button>
    {/if}
{:else if !storage}
    Initializing...
{:else}
Please upload your model zip file here 

<Dropzone on:drop={handle_files_select}>
    <p>
    {#each files as file}{file.name},{/each}
    </p>
</Dropzone>
<!--input bind:files id="zip-file-upload" type="file" /-->

{#if files.length > 0}
<button on:click={upload}>Upload</button>
{/if}
{#if upload_succeeded}
<button on:click={is_done}>Next</button>
{/if}
{/if}

