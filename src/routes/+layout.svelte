<script lang="ts">
	import "./layout.css";
	import { Toaster } from "svelte-sonner";

	const { children } = $props();
</script>

{@render children()}
<Toaster position="top-right" richColors />
