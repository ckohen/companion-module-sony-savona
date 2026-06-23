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
import { getConfigFields as getS2ConfigFields, type ModuleConfig } from './config.js';
import { UpgradeScripts } from './upgrades.js';
import { getActions } from './actions/index.js';
import { getFeedbacks } from './feedbacks/index.js';
import { getVariableDefinitions } from './variables/index.js';

export interface ModuleInstanceTypes extends InstanceTypes {
	config: ModuleConfig;
	secrets: undefined;
	actions: Record<string, CompanionActionSchema<CompanionOptionValues>>;
	feedbacks: Record<string, CompanionFeedbackSchema<CompanionOptionValues>>;
	variables: CompanionVariableValues;
}

export class ModuleInstance extends InstanceBase<ModuleInstanceTypes> {
	public config: Required<ModuleConfig> | null = null; // Setup in init()

	public constructor(internal: unknown) {
		super(internal);
	}

	public async init(config: ModuleConfig, _isFirstInit: boolean, secrets: undefined): Promise<void> {
		this.updateStatus(InstanceStatus.Disconnected);

		await this.configUpdated(config, secrets);
	}

	// When module gets deleted
	public async destroy(): Promise<void> {
		this.log('debug', 'destroy');
		return Promise.resolve();
	}

	public async configUpdated(config: ModuleConfig, _secrets: undefined): Promise<void> {
		if (!config.host || !config.port) {
			this.log('error', 'Cannot instantiate without all config options');
			this.updateStatus(InstanceStatus.BadConfig);
			return Promise.resolve();
		}

		this.config = config;

		this.updateCompanionStuff();
		return Promise.resolve();
	}

	// Return config fields for web config
	public getConfigFields(): SomeCompanionConfigField[] {
		return getS2ConfigFields();
	}

	private updateCompanionStuff() {
		this.setActionDefinitions(getActions(this));
		this.setFeedbackDefinitions(getFeedbacks(this));
		this.setVariableDefinitions(getVariableDefinitions(this));
	}
}

export { UpgradeScripts };
export default ModuleInstance;
