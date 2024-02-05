<script charset="utf-8">
    import { X } from 'lucide-svelte'
    export let name
    export let handleClickDelete = () => {};
    export let handleClick = (e) => {
        e.preventDefault();
        e.cancelBubble=true; 
        e.stopPropagation();
    };
</script>

<!--<kbd on:click={(e)=>{console.log("DB"); e.cancelBubble=true; e.stopPropagation();}} on:keypress={()=>{}} role="tag">-->
<div on:click={(e)=> {handleClick(e)}} on:keypress={()=>{}} role="tag">
    {name}
    <span on:click={(e) => {
            e.preventDefault();
            e.cancelBubble=true; 
            e.stopPropagation();
            handleClickDelete(e);
          }} on:keypress={()=>{}} role="button" class="contrast">
        <X />
    </span>
<!--</kbd>-->
</div>
