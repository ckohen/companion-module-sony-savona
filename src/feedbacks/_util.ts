import type { ModuleInstance } from '../main.js';

export function getConnectedClient(companionModule: ModuleInstance): NonNullable<ModuleInstance['client']> | null {
	const client = companionModule.client;
	return String(client?.state) === 'connected' ? client : null;
}
