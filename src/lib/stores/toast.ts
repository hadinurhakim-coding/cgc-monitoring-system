import { writable } from "svelte/store";

export type ToastType = "success" | "error" | "info";

export type ToastItem = {
	id: string;
	type: ToastType;
	message: string;
};

const { subscribe, update } = writable<ToastItem[]>([]);

function remove(id: string) {
	update((items) => items.filter((item) => item.id !== id));
}

function pushToast(type: ToastType, message: string, durationMs = 3200) {
	const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
	update((items) => [...items, { id, type, message }]);
	const timeout = setTimeout(() => remove(id), durationMs);
	return () => {
		clearTimeout(timeout);
		remove(id);
	};
}

export const toastStore = {
	subscribe,
	pushToast,
	remove
};
