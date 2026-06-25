import { Regex, type JsonObject, type SomeCompanionConfigField } from '@companion-module/base';

export interface ModuleConfig extends JsonObject {
	host: string;
	port: number;
	enableFeedbacks: boolean;
	showAudioVariables: boolean;
}

export interface ModuleSecrets extends JsonObject {
	username: string;
	password: string;
}

export function getConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 8,
			regex: Regex.IP,
		},
		{
			type: 'number',
			id: 'port',
			label: 'Port',
			width: 8,
			min: 1,
			max: 65535,
			default: 80,
		},
		{
			type: 'secret-text',
			id: 'username',
			label: 'Username',
			width: 8,
		},
		{
			type: 'secret-text',
			id: 'password',
			label: 'Password',
			width: 8,
		},
		{
			type: 'checkbox',
			id: 'enableFeedbacks',
			label: 'Subscribe to Feedbacks',
			width: 8,
			default: true,
			description:
				'Subscribes to camera notifications for live device updates used by feedbacks and variables. Actions do not require this, but leave it enabled if you want Companion state to track camera changes.',
		},
		{
			type: 'checkbox',
			id: 'showAudioVariables',
			label: 'Show Audio Variables',
			width: 8,
			default: false,
			description:
				'Creates variables for audio levels, this data is updated very frequently and may be a performance issue on some systems.',
		},
	] as const satisfies SomeCompanionConfigField[];
}
