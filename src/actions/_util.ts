import type { SavonaClient } from '@ckohen/savona';
import type { ModuleInstance } from '../main.js';

export async function runSavonaAction(
	companionModule: ModuleInstance,
	actionName: string,
	callback: (client: SavonaClient) => unknown | Promise<unknown>,
): Promise<void> {
	const client = companionModule.client;
	if (!client) {
		companionModule.log('warn', `Cannot ${actionName}: Savona client is not connected`);
		return;
	}

	try {
		await callback(client);
	} catch (error) {
		companionModule.log('error', `Error while ${actionName}: ${formatError(error)}`);
	}
}

export function optionalText(value: string | undefined): string | undefined {
	const trimmed = value?.trim();
	return trimmed ? trimmed : undefined;
}

export function parseNumberList(value: string | undefined): number[] {
	return (value ?? '')
		.split(/[\s,]+/)
		.map((entry) => Number(entry.trim()))
		.filter((entry) => Number.isInteger(entry));
}

function formatError(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
