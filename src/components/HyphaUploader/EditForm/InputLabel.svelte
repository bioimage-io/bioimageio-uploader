<script charset="utf-8">
    export let label;
    export let required=false;
</script>

<div class="field">
    <label class="label">
    {label}
    {#if required}
        <small><sup>*</sup></small>
    {/if}
    {#if $$slots.help}
        <span class="has-text-weight-light is-italic is-size-7">
            <slot name="help"/>
        </span>
    {/if}   
    <slot/>
    </label>
</div>
