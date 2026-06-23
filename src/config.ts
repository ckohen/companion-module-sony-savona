import { Regex, type JsonObject, type SomeCompanionConfigField } from '@companion-module/base';

export interface ModuleConfig extends JsonObject {
	host: string;
	port: number;
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
			label: 'Target Port',
			width: 4,
			min: 1,
			max: 65535,
			default: 8000,
		},
	] as const satisfies SomeCompanionConfigField[];
}
