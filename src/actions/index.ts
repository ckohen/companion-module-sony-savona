import { CompanionActionDefinitions, SomeCompanionActionInputField } from '@companion-module/base';
import type { ModuleInstance } from '../main.js';
import { DeepImmutable, ModuleAction } from './_types.js';

export function createModuleAction<const Options extends DeepImmutable<SomeCompanionActionInputField[]>>(
	action: Omit<ModuleAction<Options>, 'options'>,
	options: Options | ((companionModule: ModuleInstance) => Options),
): ModuleAction<Options> {
	return { options, ...action };
}

export function getActions(companionModule: ModuleInstance): CompanionActionDefinitions {
	return convertActions(companionModule, {});
}

function convertActions(
	companionModule: ModuleInstance,
	actions: Record<string, ModuleAction<DeepImmutable<SomeCompanionActionInputField[]>>>,
) {
	const companionActions: CompanionActionDefinitions = {};
	for (const [action, actionDef] of Object.entries(actions)) {
		companionActions[action] = {
			name: actionDef.name,
			options: (typeof actionDef.options === 'function'
				? actionDef.options(companionModule)
				: actionDef.options) as SomeCompanionActionInputField[],
			description: actionDef.description,
			callback: async (event, context) =>
				actionDef.callback(companionModule, event as Parameters<typeof actionDef.callback>[1], context),
			learn: actionDef.learn
				? async (event, context) =>
						actionDef.learn!(companionModule, event as Parameters<NonNullable<typeof actionDef.learn>>[1], context)
				: undefined,
			learnTimeout: actionDef.learnTimeout,
			subscribe: actionDef.subscribe
				? async (event, context) =>
						actionDef.subscribe!(
							companionModule,
							event as Parameters<NonNullable<typeof actionDef.subscribe>>[1],
							context,
						)
				: undefined,
			unsubscribe: actionDef.unsubscribe
				? async (event, context) =>
						actionDef.unsubscribe!(
							companionModule,
							event as Parameters<NonNullable<typeof actionDef.unsubscribe>>[1],
							context,
						)
				: undefined,
		};
	}
	return companionActions;
}
