import type { SavonaStructureName } from '@ckohen/savona';
import type { ModuleInstance } from '../main.js';

export function getConnectedClient(
	companionModule: ModuleInstance,
	facetId: SavonaStructureName,
): NonNullable<ModuleInstance['client']> | null {
	return companionModule.cacheCoordinator.isInitialized(facetId) ? companionModule.readyClient : null;
}
