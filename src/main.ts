import {
	InstanceBase,
	InstanceStatus,
	type CompanionActionSchema,
	type CompanionFeedbackSchema,
	type CompanionOptionValues,
	type CompanionVariableValues,
	type InstanceTypes,
	type SomeCompanionConfigField,
} from '@companion-module/base';
import { getConfigFields, ModuleSecrets, type ModuleConfig } from './config.js';
import { UpgradeScripts } from './upgrades.js';
import { getActions } from './actions/index.js';
import { getFeedbacks } from './feedbacks/index.js';
import { getVariableDefinitions } from './variables/index.js';
import { SavonaClient, SavonaEvent } from '@ckohen/savona';

export interface ModuleInstanceTypes extends InstanceTypes {
	config: ModuleConfig;
	secrets: ModuleSecrets;
	actions: Record<string, CompanionActionSchema<CompanionOptionValues>>;
	feedbacks: Record<string, CompanionFeedbackSchema<CompanionOptionValues>>;
	variables: CompanionVariableValues;
}

export class ModuleInstance extends InstanceBase<ModuleInstanceTypes> {
	public config: Required<ModuleConfig> | null = null; // Setup in init()
	private authError: boolean = false;
	public client: SavonaClient | null = null;
	private retryTimeout: NodeJS.Timeout | null = null;

	public constructor(internal: unknown) {
		super(internal);
	}

	public async init(config: ModuleConfig, _isFirstInit: boolean, secrets: ModuleSecrets): Promise<void> {
		this.updateCompanionStuff();
		this.updateStatus(InstanceStatus.Disconnected);

		await this.configUpdated(config, secrets);
	}

	// When module gets deleted
	public async destroy(): Promise<void> {
		this.log('debug', 'destroy');
		await this.client?.disconnect();
		this.client = null;
		if (this.retryTimeout) {
			clearTimeout(this.retryTimeout);
			this.retryTimeout = null;
		}
		return Promise.resolve();
	}

	public async configUpdated(config: ModuleConfig, secrets: ModuleSecrets): Promise<void> {
		if (this.retryTimeout) {
			clearTimeout(this.retryTimeout);
			this.retryTimeout = null;
		}
		try {
			await this.client?.disconnect();
		} catch (error) {
			this.log('error', `Error disconnecting discarded client: ${error}`);
		}
		this.client = null;

		if (!config.host || !secrets.username || !secrets.password) {
			this.log('error', 'Cannot instantiate without all config options');
			this.updateStatus(InstanceStatus.BadConfig);
			return Promise.resolve();
		}

		this.config = config;
		this.client = new SavonaClient(
			`${config.host}${config.port ? `:${config.port}` : ''}`,
			secrets.username,
			secrets.password,
			{ subscribeToNotifications: config.enableFeedbacks },
		);

		this.client.on(SavonaEvent.Connect, () => {
			this.updateStatus(InstanceStatus.Ok);
		});

		this.client.on(SavonaEvent.Disconnect, () => {
			this.updateStatus(InstanceStatus.Disconnected);
		});

		this.client.on(SavonaEvent.Error, (error) => {
			this.log('error', `Savona Client Error: ${error}`);
		});

		this.client.on(SavonaEvent.Debug, (message) => {
			this.log('debug', `Savona Client Debug: ${message}`);
		});

		try {
			await this.login();
		} catch (error) {
			this.log('error', `Error Logging in during init: ${error}`);
			if (!this.authError) {
				this.retryTimeout = setTimeout(() => void this.configUpdated(config, secrets), 10_000);
			}
			return;
		}

		this.updateCompanionStuff();
		return Promise.resolve();
	}

	// Return config fields for web config
	public getConfigFields(): SomeCompanionConfigField[] {
		return getConfigFields();
	}

	private async login() {
		const config = this.config;

		if (!config || !this.client) {
			this.log('warn', 'Attempted to login before configured');
			throw new Error('Not ready');
		}

		this.updateStatus(InstanceStatus.Connecting);

		try {
			this.authError = false;
			await this.client.connect();
			this.updateStatus(InstanceStatus.Ok);
		} catch (error) {
			if (error instanceof Error && error.message.includes('401')) {
				this.updateStatus(InstanceStatus.AuthenticationFailure);
				this.authError = true;
				throw new Error('Login Failed, check username and password', { cause: error });
			}
			this.updateStatus(InstanceStatus.ConnectionFailure, error instanceof Error ? error.message : 'Unknown error');
			throw new Error(`Login Failed, ${error}`, { cause: error });
		}
	}

	private updateCompanionStuff() {
		this.setActionDefinitions(getActions(this));
		this.setFeedbackDefinitions(getFeedbacks(this));
		this.setVariableDefinitions(getVariableDefinitions(this));
	}
}

export { UpgradeScripts };
export default ModuleInstance;
