<script lang="ts">
    import { onMount } from 'svelte';
    //import { getAuth, signInWithPopup, signOut, GoogleAuthProvider, GithubAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
    import { auth, functions } from "../lib/hypha";
    import user_state from "../stores/user";
    import {login_url, token} from '../stores/hypha'; 
    import type UserInfo from "../lib/user_info";
    import { CircleUserRound, X } from 'lucide-svelte'
    import toast  from 'svelte-french-toast';

    export let show = false;
    export let user = null;
    export let auth_offline=false;

    onMount(async () => {
        user_state.subscribe(value => {
            user = value.user_info;
            show = false;
        });

        try{
            await functions.check_hypha();
        }catch{
            toast.error("Login not available!");
            auth_offline = true;
        }
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

{#if auth_offline}
    <span title="Authentication system is offline">Login Temporarily<br>Unavailable</span>
{:else}
    {#if !user }
        <button on:click={()=>{auth.login();}}>
            Login
        </button>
    {:else}
        <button on:click={()=>{show=true;}}><CircleUserRound /> {user.email}</button>
    {/if}
{/if}


<dialog open={show}>
    <article>
        <button on:click={()=>{show = false;}}><X /></button>
        {#if !user && $login_url} 
            <iframe title="Login" src="{$login_url}"></iframe>
        {:else}
            <button on:click={handleSignout}>Logout</button>
        {/if}
    </article>
</dialog>
