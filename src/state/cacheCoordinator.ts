import type { SavonaClient } from '@ckohen/savona';
import type { ModuleInstance } from '../main.js';
import { cacheFacets, type CacheFacet } from './facets.js';
import { getClearedVariableValues, getVariableValues } from './variables.js';

const defaultFlushDelayMs = 50;
const definitionFacetIds = new Set(['actionChoices', 'assignableButtons', 'uploadSettings']);
const stateFeedbackIds = [
	'recordingState',
	'uploadJobState',
	'mediaCardState',
	'systemAlertActive',
	'remoteControlAllowed',
	'autoUploadEnabled',
	'stateMatches',
] as const;

export class CacheCoordinator {
	private client: SavonaClient | null = null;
	private readonly disposeListeners: (() => void)[] = [];
	private readonly dirtyFacetIds = new Set<string>();
	private flushTimer: NodeJS.Timeout | null = null;

	public constructor(private readonly companionModule: ModuleInstance) {}

	public bind(client: SavonaClient): void {
		this.unbind();
		this.client = client;

		for (const facet of this.includedFacets()) {
			for (const property of facet.notifications?.value ?? []) {
				this.listen(client.notifications.propertyValueChanged, property, facet);
			}
			for (const property of facet.notifications?.status ?? []) {
				this.listen(client.notifications.propertyStatusChanged, property, facet);
			}
			for (const property of facet.notifications?.process ?? []) {
				this.listen(client.notifications.process, property, facet);
			}
		}
	}

	public unbind(): void {
		for (const dispose of this.disposeListeners) {
			dispose();
		}
		this.disposeListeners.length = 0;
		if (this.flushTimer) {
			clearTimeout(this.flushTimer);
			this.flushTimer = null;
		}
		this.dirtyFacetIds.clear();
		this.client = null;
	}

	public async refreshAll(options: { publish?: boolean } = {}): Promise<void> {
		await this.refresh(
			this.includedFacets().map((facet) => facet.id),
			options,
		);
	}

	public async refresh(facetIds: Iterable<string>, options: { publish?: boolean } = {}): Promise<void> {
		const publish = options.publish ?? true;
		const requestedIds = new Set(facetIds);
		const requestedFacets = this.includedFacets().filter((facet) => requestedIds.has(facet.id) && facet.fetch);
		const client = this.client;
		if (!client) return;

		const results = await Promise.allSettled(
			requestedFacets.map(async (facet) => {
				try {
					await facet.fetch?.(client);
				} catch (error) {
					throw new Error(`Unable to fetch ${facet.name}: ${formatError(error)}`, { cause: error });
				}
			}),
		);

		for (const result of results) {
			if (result.status === 'rejected') {
				this.companionModule.log('warn', formatError(result.reason));
			}
		}

		if (publish) this.publish(requestedIds);
	}

	public markUpdated(...facetIds: string[]): void {
		this.queue(facetIds, defaultFlushDelayMs);
	}

	public publishAll(): void {
		this.publish(this.includedFacets().map((facet) => facet.id));
	}

	public clearVariables(): void {
		this.companionModule.setVariableValues(getClearedVariableValues(this.companionModule));
		this.checkStateFeedbacks();
	}

	private listen(
		emitter: SavonaClient['notifications']['propertyValueChanged'],
		property: string,
		facet: CacheFacet,
	): void {
		const listener = (): void => this.queue([facet.id], facet.throttleMs ?? defaultFlushDelayMs);
		emitter.on(property, listener);
		this.disposeListeners.push(() => emitter.removeListener(property, listener));
	}

	private queue(facetIds: Iterable<string>, delayMs: number): void {
		for (const facetId of facetIds) {
			this.dirtyFacetIds.add(facetId);
		}
		if (this.flushTimer) return;

		this.flushTimer = setTimeout(() => {
			this.flushTimer = null;
			this.flush();
		}, delayMs);
		this.flushTimer.unref();
	}

	private flush(): void {
		const facetIds = new Set(this.dirtyFacetIds);
		this.dirtyFacetIds.clear();
		if (facetIds.size === 0) return;

		this.publish(facetIds);
	}

	private publish(facetIds: Iterable<string>): void {
		const publishedFacetIds = new Set(facetIds);
		if (!this.client) return;

		for (const facetId of publishedFacetIds) {
			if (definitionFacetIds.has(facetId)) {
				this.companionModule.updateCompanionDefinitions();
				break;
			}
		}
		this.companionModule.setVariableValues(getVariableValues(this.companionModule, publishedFacetIds));
		this.checkStateFeedbacks();
	}

	private includedFacets(): readonly CacheFacet[] {
		return cacheFacets.filter((facet) => facet.include?.(this.companionModule) ?? true);
	}

	private checkStateFeedbacks(): void {
		this.companionModule.checkFeedbacks(...stateFeedbackIds);
	}
}

function formatError(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}
