import { SavonaEvent, type SavonaClient, type SavonaStructureName } from '@ckohen/savona';
import type { ModuleInstance } from '../main.js';
import { cacheFacets, type CacheFacet } from './facets.js';
import { getClearedVariableValues, getVariableValues } from './variables.js';

const definitionFacetIds = new Set<SavonaStructureName>(['assignableButtons', 'uploadSettings']);
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
	private disposeListener: (() => void) | null = null;
	private readonly initializedFacets = new Set<SavonaStructureName>();
	private readonly publishTimers = new Map<SavonaStructureName, NodeJS.Timeout>();
	private generation = 0;

	public constructor(private readonly companionModule: ModuleInstance) {}

	public bind(client: SavonaClient): void {
		this.unbind();
		this.client = client;

		const onCacheUpdate = (structure: SavonaStructureName): void => {
			if (this.client !== client || String(client.state) !== 'connected') return;
			const facet = this.includedFacets().find((entry) => entry.id === structure);
			// Notifications can update only one field, so they cannot establish a complete initial snapshot.
			if (!facet || !this.initializedFacets.has(structure)) return;
			if (facet.throttleMs === undefined) {
				this.publish([structure]);
			} else if (!this.publishTimers.has(structure)) {
				const timer = setTimeout(() => {
					this.publishTimers.delete(structure);
					this.publish([structure]);
				}, facet.throttleMs);
				timer.unref();
				this.publishTimers.set(structure, timer);
			}
		};
		client.on(SavonaEvent.CacheUpdate, onCacheUpdate);
		this.disposeListener = () => client.off(SavonaEvent.CacheUpdate, onCacheUpdate);
	}

	public unbind(): void {
		this.disposeListener?.();
		this.disposeListener = null;
		this.reset();
		this.client = null;
	}

	public isInitialized(facetId: SavonaStructureName): boolean {
		return this.initializedFacets.has(facetId);
	}

	public async refreshAll(options: { publish?: boolean } = {}): Promise<void> {
		await this.refresh(
			this.includedFacets().map((facet) => facet.id),
			options,
		);
	}

	public async refresh(facetIds: Iterable<SavonaStructureName>, options: { publish?: boolean } = {}): Promise<void> {
		const requestedIds = new Set(facetIds);
		const requestedFacets = this.includedFacets().filter((facet) => requestedIds.has(facet.id));
		const client = this.client;
		const generation = this.generation;
		if (!client) return;

		const results = await Promise.allSettled(
			requestedFacets.map(async (facet) => {
				try {
					await facet.fetch(client);
					return facet.id;
				} catch (error) {
					throw new Error(`Unable to fetch ${facet.name}: ${formatError(error)}`, { cause: error });
				}
			}),
		);
		if (this.client !== client || this.generation !== generation) return;

		for (const result of results) {
			if (result.status === 'fulfilled') {
				this.initializedFacets.add(result.value);
			} else {
				this.companionModule.log('warn', formatError(result.reason));
			}
		}

		if (options.publish ?? true) this.publish(requestedIds);
	}

	public markUpdated(client: SavonaClient, ...facetIds: SavonaStructureName[]): void {
		if (this.client !== client || String(client.state) !== 'connected') return;
		for (const facetId of facetIds) this.initializedFacets.add(facetId);
		this.publish(facetIds);
	}

	public publishAll(): void {
		this.publish(this.includedFacets().map((facet) => facet.id));
	}

	public clearVariables(): void {
		this.reset();
		this.companionModule.setVariableValues(getClearedVariableValues(this.companionModule));
		this.checkStateFeedbacks();
	}

	private reset(): void {
		this.generation++;
		this.initializedFacets.clear();
		for (const timer of this.publishTimers.values()) clearTimeout(timer);
		this.publishTimers.clear();
	}

	private publish(facetIds: Iterable<SavonaStructureName>): void {
		if (!this.client || this.companionModule.readyClient !== this.client) return;
		const publishedFacetIds = new Set(facetIds);
		if ([...publishedFacetIds].some((facetId) => definitionFacetIds.has(facetId))) {
			this.companionModule.updateCompanionDefinitions();
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
