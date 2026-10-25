import {
	InstanceBase,
	InstanceStatus,
	type CompanionActionSchema,
	type CompanionFeedbackSchema,
	type CompanionOptionValues,
	type CompanionVariableValues,
	type InstanceTypes,
	type JsonValue,
	type SomeCompanionConfigField,
} from '@companion-module/base';
import { getConfigFields, ModuleSecrets, type ModuleConfig } from './config.js';
import { UpgradeScripts } from './upgrades.js';
import { getActions } from './actions/index.js';
import { getFeedbacks } from './feedbacks/index.js';
import { getPresets } from './presets/index.js';
import { getVariableDefinitions } from './variables/index.js';
import { SavonaClient, SavonaEvent } from '@ckohen/savona';
import { CacheCoordinator } from './state/cacheCoordinator.js';

export interface ModuleInstanceTypes extends InstanceTypes {
	config: ModuleConfig;
	secrets: ModuleSecrets;
	actions: Record<
		string,
		CompanionActionSchema<CompanionOptionValues, void> | CompanionActionSchema<CompanionOptionValues, JsonValue>
	>;
	feedbacks: Record<string, CompanionFeedbackSchema<CompanionOptionValues, JsonValue>>;
	variables: CompanionVariableValues;
}

export class ModuleInstance extends InstanceBase<ModuleInstanceTypes> {
	public config: Required<ModuleConfig> | null = null; // Setup in init()
	public client: SavonaClient | null = null;
	public isReady = false;
	public readonly cacheCoordinator = new CacheCoordinator(this);
	private retryTimeout: NodeJS.Timeout | null = null;
	private disposeClientListeners: (() => void) | null = null;
	private initialization: Promise<void> | null = null;
	private configurationGeneration = 0;
	private connectionGeneration = 0;
	private destroyed = false;

	public constructor(internal: unknown) {
		super(internal);
	}

	public async init(config: ModuleConfig, _isFirstInit: boolean, secrets: ModuleSecrets): Promise<void> {
		this.updateCompanionDefinitions();
		this.updateStatus(InstanceStatus.Disconnected);

		await this.configUpdated(config, secrets);
	}

	public async destroy(): Promise<void> {
		this.log('debug', 'destroy');
		this.destroyed = true;
		this.configurationGeneration++;
		this.clearRetry();
		await this.discardClient();
	}

	public async configUpdated(config: ModuleConfig, secrets: ModuleSecrets): Promise<void> {
		if (this.destroyed) return;
		const generation = ++this.configurationGeneration;
		this.clearRetry();
		await this.discardClient();
		if (this.destroyed || this.configurationGeneration !== generation) return;

		this.config = config;
		this.updateCompanionDefinitions();

		if (!config.host || !secrets.username || !secrets.password) {
			this.log('error', 'Cannot instantiate without all config options');
			this.updateStatus(InstanceStatus.BadConfig);
			return;
		}

		const client = new SavonaClient(
			`${config.host}${config.port ? `:${config.port}` : ''}`,
			secrets.username,
			secrets.password,
			{ subscribeToNotifications: config.enableFeedbacks },
		);
		this.client = client;
		this.cacheCoordinator.bind(client);

		const onConnect = (): void => {
			if (this.client !== client) return;
			this.initialization = this.initializeClient(client);
		};

		const onDisconnect = (): void => {
			if (this.client !== client) return;
			this.connectionGeneration++;
			this.initialization = null;
			this.isReady = false;
			this.updateStatus(InstanceStatus.Disconnected);
			this.cacheCoordinator.clearVariables();
		};

		const onError = (error: string): void => {
			if (this.client === client) this.log('error', `Savona Client Error: ${error}`);
		};
		const onDebug = (message: string): void => {
			if (this.client === client) this.log('debug', `Savona Client Debug: ${message}`);
		};

		client.on(SavonaEvent.Connect, onConnect);
		client.on(SavonaEvent.Disconnect, onDisconnect);
		client.on(SavonaEvent.Error, onError);
		client.on(SavonaEvent.Debug, onDebug);
		this.disposeClientListeners = () => {
			client.off(SavonaEvent.Connect, onConnect);
			client.off(SavonaEvent.Disconnect, onDisconnect);
			client.off(SavonaEvent.Error, onError);
			client.off(SavonaEvent.Debug, onDebug);
		};

		this.updateStatus(InstanceStatus.Connecting);
		try {
			await client.connect();
		} catch (error) {
			if (this.client !== client || this.configurationGeneration !== generation) return;
			this.log('error', `Error Logging in during init: ${error}`);
			if (isAuthenticationError(error)) {
				this.updateStatus(InstanceStatus.AuthenticationFailure, 'Check camera username and password');
			} else {
				this.updateStatus(InstanceStatus.ConnectionFailure, formatError(error));
				this.retryTimeout = setTimeout(() => {
					this.retryTimeout = null;
					if (this.destroyed || this.client !== client || this.configurationGeneration !== generation) return;
					void this.configUpdated(config, secrets).catch((retryError: unknown) => {
						this.log('error', `Error retrying connection: ${formatError(retryError)}`);
					});
				}, 10_000);
				this.retryTimeout.unref();
			}
			return;
		}

		if (this.client === client) await this.initialization;
	}

	// Return config fields for web config
	public getConfigFields(): SomeCompanionConfigField[] {
		return getConfigFields();
	}

	public get readyClient(): SavonaClient | null {
		return this.isReady && String(this.client?.state) === 'connected' ? this.client : null;
	}

	private async initializeClient(client: SavonaClient): Promise<void> {
		const generation = ++this.connectionGeneration;
		this.isReady = false;
		this.cacheCoordinator.clearVariables();
		this.updateStatus(InstanceStatus.Connecting, 'Fetching camera state');
		try {
			await this.cacheCoordinator.refreshAll({ publish: false });
			if (this.client !== client || this.connectionGeneration !== generation || String(client.state) !== 'connected')
				return;
			this.isReady = true;
			this.cacheCoordinator.publishAll();
			this.updateStatus(InstanceStatus.Ok);
		} catch (error) {
			if (this.client !== client || this.connectionGeneration !== generation) return;
			this.isReady = false;
			this.log('error', `Error initializing camera state: ${formatError(error)}`);
			this.updateStatus(InstanceStatus.ConnectionFailure, formatError(error));
		}
	}

	private clearRetry(): void {
		if (this.retryTimeout) clearTimeout(this.retryTimeout);
		this.retryTimeout = null;
	}

	private async discardClient(): Promise<void> {
		this.isReady = false;
		this.connectionGeneration++;
		this.initialization = null;
		const client = this.client;
		this.client = null;
		this.disposeClientListeners?.();
		this.disposeClientListeners = null;
		this.cacheCoordinator.unbind();
		this.cacheCoordinator.clearVariables();
		try {
			await client?.disconnect();
		} catch (error) {
			this.log('error', `Error disconnecting discarded client: ${formatError(error)}`);
		}
	}

	public updateCompanionDefinitions(): void {
		this.setActionDefinitions(getActions(this));
		this.setFeedbackDefinitions(getFeedbacks(this));
		this.setPresetDefinitions(...getPresets(this));
		this.setVariableDefinitions(getVariableDefinitions(this));
	}
}

function isAuthenticationError(error: unknown): boolean {
	if (!(error instanceof Error)) return false;
	if (error.message.includes('401')) return true;
	return 'data' in error && Array.isArray(error.data) && [403, 5001].includes(error.data[0]);
}

function formatError(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

export { UpgradeScripts };
export default ModuleInstance;
