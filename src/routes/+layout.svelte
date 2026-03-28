<script lang="ts">
	import './layout.css';
	import Toaster from "$lib/components/toaster.svelte";

	const { children } = $props();
</script>

{@render children()}
<Toaster />
