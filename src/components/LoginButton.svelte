<script lang="ts">
    import { onMount } from 'svelte';
    //import { getAuth, signInWithPopup, signOut, GoogleAuthProvider, GithubAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
    import { auth } from "../lib/hypha";
    import user_state from "../stores/user";
    import {hypha_version} from "../stores/hypha";
    import { login_url } from '../stores/hypha'; 
    import { CircleUserRound, X, CloudOff } from 'lucide-svelte'

    export let show = false;
    export let user = null;
    export let accepted_tos = false;

    onMount(async () => {
        user_state.subscribe(value => {
            user = value.user_info;
            show = false;
        });
        if(user) show = false;
    })
    
    login_url.subscribe((url) => {
        console.log("Doing stuff with login url...:", url);
        console.log(user);
        if(!url) return 
        show = true;
    });

    async function handleSignout(){
        auth.signOut(); 
        show=false;
    }

</script> 
<style>
iframe{      
    display: block;  /* iframes are inline by default */   
    height: 90vh;  /* Set height to 100% of the viewport height */   
    width: 100%;  /* Set width to 100% of the viewport width */     
    border: none; /* Remove default border */
}
</style>

{#if $hypha_version === "unreachable" }
    <span title="Authentication system is offline"><CloudOff /></span>
{:else}
    {#if !user }
        <button on:click={()=>{show=true;}}><CircleUserRound /> Login </button>
    {:else}
        <button on:click={()=>{show=true;}}><CircleUserRound /> {user.email}</button>
    {/if}
{/if}


<dialog open={show}>
    <article>
        <button on:click={()=>{show = false;}}><X /></button>
        {#if !user && $login_url} 
            <iframe title="Login" src="{$login_url}"></iframe>
        {:else if !user }
            <input type="checkbox" bind:checked={accepted_tos} name="accept_tos">
            <label for="accept_tos"> I have read and agree to the <a href="https://bioimage.io/docs/#/terms_of_service" target="_blank">TOS</a></label>
            <button disabled={!accepted_tos} on:click={()=>{auth.login();}}>
                Login
            </button>
        {:else}
            <button on:click={handleSignout}>Logout</button>
        {/if}
    </article>
</dialog>
