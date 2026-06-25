import { SomeCompanionActionInputField } from '@companion-module/base';
import { createModuleAction } from '../index.js';
import { optionalText, runSavonaAction } from '../_util.js';
import type { ModuleInstance } from '../../main.js';

const fallbackShutterSpeeds = [
	'1/24',
	'1/25',
	'1/30',
	'1/48',
	'1/50',
	'1/60',
	'1/96',
	'1/100',
	'1/120',
	'1/125',
	'1/250',
	'1/500',
	'1/1000',
	'1/2000',
] as const;

const shutterAngles = ['360', '300', '270', '240', '216', '180', '172.8', '144', '120', '90', '45', '22.5', '11.25'];

function generateOptions(companionModule: ModuleInstance) {
	const shutterSpeeds = companionModule.client?.shutter.shutterSpeedList.length
		? companionModule.client.shutter.shutterSpeedList
		: fallbackShutterSpeeds;

	return [
		{
			type: 'dropdown',
			id: 'shutterType',
			label: 'Type',
			default: 'Speed',
			disableAutoExpression: true,
			choices: [
				{ id: 'Speed', label: 'Speed' },
				{ id: 'Angle', label: 'Angle' },
				{ id: 'ECS', label: 'ECS' },
			],
		},
		{
			type: 'dropdown',
			id: 'speedValue',
			label: 'Speed',
			default: shutterSpeeds.includes('1/60') ? '1/60' : shutterSpeeds[0],
			choices: shutterSpeeds.map((speed) => ({ id: speed, label: speed })),
			allowCustom: true,
			minChoicesForSearch: 8,
			isVisibleExpression: '$(options:shutterType) == "Speed"',
		},
		{
			type: 'dropdown',
			id: 'angleValue',
			label: 'Angle',
			default: '180',
			choices: shutterAngles.map((angle) => ({ id: angle, label: `${angle} degrees` })),
			allowCustom: true,
			minChoicesForSearch: 8,
			isVisibleExpression: '$(options:shutterType) == "Angle"',
		},
		{
			type: 'textinput',
			id: 'ecsValue',
			label: 'ECS Value',
			default: '1/60',
			useVariables: true,
			isVisibleExpression: '$(options:shutterType) == "ECS"',
		},
	] as const satisfies SomeCompanionActionInputField[];
}

export const setShutterValue = createModuleAction<ReturnType<typeof generateOptions>>(
	{
		name: 'Set Shutter Value',
		async callback(companionModule, action) {
			await runSavonaAction(companionModule, 'setting shutter value', async (client) => {
				if (action.options.shutterType === 'ECS') {
					const value = optionalText(action.options.ecsValue);
					if (!value) throw new Error('ECS value is required');

					await client.shutter.setECSValue(value);
					return;
				}

				if (action.options.shutterType === 'Angle') {
					const value = optionalText(action.options.angleValue?.toString());
					if (!value) throw new Error('Shutter angle is required');

					await client.shutter.setValue(value, false, 'Angle');
					return;
				}

				const value = optionalText(action.options.speedValue?.toString());
				if (!value) throw new Error('Shutter speed is required');

				await client.shutter.setValue(value, false, 'Speed');
			});
		},
	},
	generateOptions,
);
