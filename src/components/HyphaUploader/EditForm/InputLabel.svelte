<script charset="utf-8">
    export let label;
    export let required=false;
</script>

<label class="label">
    {label}
    {#if required}
        <small><sup>*</sup></small>
    {/if}
    {#if $$slots.help}
        <span><small><em>
            <slot name="help"/>
        </em></small></span>
    {/if}   
    <slot/>
</label>
