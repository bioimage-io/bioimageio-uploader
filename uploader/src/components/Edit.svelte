<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function is_done() {
		dispatch('done', {
		});
	}
</script>

<button on:click={is_done}>Next</button>
