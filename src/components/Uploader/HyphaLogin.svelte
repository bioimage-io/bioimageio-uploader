<script lang="ts">
    import Modal    from '../Modal.svelte';
    import Notification from './Notification.svelte';
    import { Uploader } from '../../lib/uploader';
    export let uploader : Uploader;
    export let modal = true;
    let show_login = false;
    let agree_email = false;


    if (uploader !== null) {
        if(!uploader.token){
            show_login = true;
        }
        uploader.show_login_window = (url) => {
            console.debug(url);
            show_login = true;
        }
    }
</script>

{#key uploader.token}
{#if !uploader.token}
    <Notification deletable={false} >
    {#if uploader.login_url}
        <!--<button on:click={()=>{uploader.init();}}>Login to BioEngine</button>-->
        {#if modal} 
            <Modal show={show_login}   >
                <h1>Login</h1>
                <p>
                    <input bind:checked={agree_email} type="checkbox" />
                    I agree that the email address I use to login will be <br> 
                    added to my upload and published as the "uploader" field 
                </p>

                {#if agree_email}
                    <iframe title="Login" src="{uploader.login_url}" width="400" height="400"></iframe>
                {/if}
            </Modal>
        {:else}
            <h1>Login</h1>
            <p>
                <input bind:checked={agree_email} type="checkbox" />
                I agree that the email address I use to login will be <br> 
                added to my upload and published as the "uploader" field 
            </p>
            {#if agree_email}
                <iframe title="Login" src="{uploader.login_url}" width="400" height="400"></iframe>
            {/if}
        {/if}
    {/if}
    </Notification>
{:else if !uploader.server}
    <Notification>
    <span aria-busy="true">Initializing login</span>
    </Notification>
{/if}
{/key}
