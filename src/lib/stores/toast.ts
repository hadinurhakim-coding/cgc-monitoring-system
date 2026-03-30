export type ToastType = "success" | "error" | "info";

export type ToastItem = {
	id: string;
	type: ToastType;
	message: string;
};

// FIX: SMELL-02 — Menggunakan Svelte 5 runes ($state) untuk state management
let items = $state<ToastItem[]>([]);

function remove(id: string) {
	items = items.filter((item) => item.id !== id);
}

function pushToast(type: ToastType, message: string, durationMs = 3200) {
	const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
	items = [...items, { id, type, message }];
	const timeout = setTimeout(() => remove(id), durationMs);
	return () => {
		clearTimeout(timeout);
		remove(id);
	};
}

export const toastStore = {
	get items() { return items; },
	pushToast,
	remove
};
