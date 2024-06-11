<script lang="ts">
    import LoginButton from './LoginButton.svelte';
    import { SANDBOX } from '../lib/config';
    import HamburgerMenu  from './HamburgerMenu.svelte';
    import { hypha_version } from '../stores/hypha';
</script>
<style>
/* Desktop etc*/ 
@media only screen and (min-width: 600px){
    .right-menu.hamburger{
        display: none;
    }
}


/* Mobile */
@media only screen and (max-width: 600px) {
    .right-menu.horizontal{
        display: none;
    }
}    

</style>

<nav>
<!--<nav class="container-fluid">-->
    <ul>
        <li><img style="height: 50px;" src="https://bioimage.io/static/img/bioimage-io-logo-white.svg" alt="BioImage.IO"><strong>{#if SANDBOX}SANDBOX{/if}</strong></li>
    </ul>
    <ul class="right-menu horizontal">
        <li><a href="/uploader" style="color: white;">New Upload</a></li>
        <li><a href="/status" style="color: white;">Pending Uploads</a></li>
        <li>
            <LoginButton />
        </li>
    </ul>
    <ul class="right-menu hamburger">
        <HamburgerMenu {hypha_version}/>
    </ul>
</nav>
