<script charset="utf-8">
    import { X } from 'lucide-svelte'
    export let name
    export let handleClick = () => {};
</script>

<!--<kbd on:click={(e)=>{console.log("DB"); e.cancelBubble=true; e.stopPropagation();}} on:keypress={()=>{}} role="tag">-->
<div on:click={(e)=>{console.log("DB"); e.cancelBubble=true; e.stopPropagation();}} on:keypress={()=>{}} role="tag">
    {name}
    <span on:click={handleClick} on:keypress={()=>{}} role="button" class="contrast">
        <X />
    </span>
<!--</kbd>-->
</div>
