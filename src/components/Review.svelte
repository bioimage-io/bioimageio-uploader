<script lang="ts">
    export let resource_id="";
    export let version_number="";

    async function update_status(){
        if(!resource_id) return;
        if(!version_number) return;
    }
</script>

<strong>Review Area</strong>
<button>Request Changes</button>
<button>Accept</button>


