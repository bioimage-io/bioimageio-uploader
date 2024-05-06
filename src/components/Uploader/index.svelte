<script lang="ts">
    //import {Route, router} from 'tinro'; 
    import { Route } from 'tinro'; 
    // import { Toaster } from 'svelte-french-toast';
    import { Uploader } from '../../lib/uploader';
    import user_state from "../../stores/user";
    import type { UserState } from "../../stores/user";
    import Add      from './Add.svelte';
    import Edit     from './Edit.svelte';
    import Review   from './Review.svelte';
    import ValidateJson from './ValidateJson.svelte';
    import UploadStatus   from './UploadStatus.svelte';
    //import Notification from '../Notification.svelte';
    export let uploader : Uploader;

    
    user_state.subscribe((user: UserState)=>{
        if(user.user_info && user.user_info.email){
            uploader.set_email(user.user_info.email);
        } 
    });

</script>

<Route path="/add">
    <Add {uploader} />
</Route>
<Route path="/edit">
    <Edit {uploader} />
</Route>
<Route path="/validate">
    <ValidateJson {uploader} />
</Route>
<Route path="/review">
    <Review {uploader} />
</Route>
<Route path="/uploading">
    <UploadStatus {uploader} />
</Route>
