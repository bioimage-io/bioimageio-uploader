<script lang="ts">
    import { onMount } from 'svelte';
    // Import the functions you need from the SDKs you need
    //import firebase from 'firebase/compat/app';
    //import { initializeApp } from "firebase/app";
    //import { getAnalytics } from "firebase/analytics";
    //import * as firebaseui from 'firebaseui';
    //import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL } from "firebase/storage";
    //import 'firebaseui/dist/firebaseui.css';
    //import { getAuth, signInWithPopup, signOut, GithubAuthProvider } from 'firebase/auth';
    //import { auth } from "../lib/firebase";
    import user_state from "../stores/user";
    export let show = false;
    export let user = null;

    const providers = {
        "google": {
            login: () => {
            },
        },
        "github": {
            login: async () => {
                const provider = new GithubAuthProvider();
                const result = await signInWithPopup(auth, provider);
                // This gives you a GitHub Access Token. You can use it to access the GitHub API.
                const credential = GithubAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;

                // The signed-in user info.
                const user = result.user;
                // IdP data available using getAdditionalUserInfo(result)
            },
        },
        "username": {
            login: () => {
            },
        },
    }


    function login(provider_name){
        if(provider_name in providers){
            providers[provider_name].login();
        }else{
            throw new Error(`Unknown provider: ${provider_name}`);
        }
        
    }

    //var uiConfig = {
        //callbacks: {
          //signInSuccessWithAuthResult: function(authResult: any, redirectUrl: string) {
            //user_state.set(authResult.user);
            //var credential = authResult.credential;
            //var isNewUser = authResult.additionalUserInfo.isNewUser;
            //var providerId = authResult.additionalUserInfo.providerId;
            //var operationType = authResult.operationType;
            //// Do something with the returned AuthResult.
            //// Return type determines whether we continue the redirect
            //// automatically or whether we leave that to developer to handle.
            //return false;// true;
            
          //},
          //signInFailure: function(error: Error) {
            //// Some unrecoverable error occurred during sign-in.
            //// Return a promise when error handling is completed and FirebaseUI
            //// will reset, clearing any UI. This commonly occurs for error code
            //// 'firebaseui/anonymous-upgrade-merge-conflict' when merge conflict
            //// occurs. Check below for more details on this.
            //user_state.set(null);  
            //return handleUIError(error);
          //},
          //uiShown: function() {
            //// The widget is rendered.
            //// Hide the loader.
            //// document.getElementById('loader').style.display = 'none';
          //}
        //},
        //credentialHelper: firebaseui.auth.CredentialHelper.NONE,
        //// Query parameter name for mode.
        //queryParameterForWidgetMode: 'mode',
        //// Query parameter name for sign in success url.
        //queryParameterForSignInSuccessUrl: 'signInSuccessUrl',
        //// Will use popup for IDP Providers sign-in flow instead of the default, redirect.
        //signInFlow: 'popup',
        ////signInSuccessUrl: '<url-to-redirect-to-on-success>',
        //signInOptions: [
          //// Leave the lines as is for the providers you want to offer your users.
          //firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          ////firebase.auth.FacebookAuthProvider.PROVIDER_ID,
          ////firebase.auth.TwitterAuthProvider.PROVIDER_ID,
          //firebase.auth.GithubAuthProvider.PROVIDER_ID,
          //{
            //provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
            //// Whether the display name should be displayed in the Sign Up page.
            //requireDisplayName: true
          //},
        //],
        //// Set to true if you only have a single federated provider like
        //// firebase.auth.GoogleAuthProvider.PROVIDER_ID and you would like to
        //// immediately redirect to the provider's site instead of showing a
        //// 'Sign in with Provider' button first. In order for this to take
        //// effect, the signInFlow option must also be set to 'redirect'.
        //immediateFederatedRedirect: false,
        //// tosUrl and privacyPolicyUrl accept either url string or a callback
        //// function.
        //// Terms of service url/callback.
        //tosUrl: '<your-tos-url>',
        //// Privacy policy url/callback.
        //privacyPolicyUrl: function() {
          //window.location.assign('<your-privacy-policy-url>');
        //}
      //};

    onMount(async () => {
        // Initialize Firebase
        //let result = await hello_world({ text: 'aaaa'});
        //// Read result of the Cloud Function.
        //var sanitizedMessage = result.data.message;
        //alert(sanitizedMessage);
        
        console.log(auth);
        //var ui = new firebaseui.auth.AuthUI(auth);
        //ui.start('#firebaseui-auth-container', uiConfig);

        auth.onAuthStateChanged((new_user) => {
            user_state.set({
                is_logged_in: new_user !== null,
                user_info: new_user,
            });
            console.log("Auth state changed, user (in Login element) is");
            console.log(new_user);
            user = new_user;
            //if(new_user !== null) show=false;
            show=false;
        });

    })



    async function handleSignout(){
        await signOut(auth); 
        user_state.set(null);
        show=false;
    }

</script> 
<dialog open={show}>
    <article>
        {#if user === null} 
            <header>Login using one of the following providers</header>
            <div id="providers" >
                <button on:click={()=>{login("google")}}>Google</button>
                <button on:click={()=>{login("github")}}>Github</button>
                <button on:click={()=>{login("username")}}>Username + Password</button>
            </div>
        {:else}
            <button on:click={handleSignout}>Logout</button>
        {/if}
    </article>
</dialog>
