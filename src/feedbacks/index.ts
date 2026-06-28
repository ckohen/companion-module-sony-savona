import {
	CompanionFeedbackAdvancedEvent,
	CompanionFeedbackBooleanEvent,
	CompanionFeedbackCallbackContext,
	CompanionFeedbackContext,
	CompanionFeedbackDefinitions,
	CompanionFeedbackInfo,
	CompanionFeedbackLearnContext,
	CompanionFeedbackValueEvent,
	CompanionOptionValues,
	SomeCompanionFeedbackInputField,
} from '@companion-module/base';
import type { ModuleInstance } from '../main.js';
import { ModuleAdvancedFeedback, ModuleBooleanFeedback, ModuleFeedback, ModuleValueFeedback } from './_types.js';
import { DeepImmutable } from '../actions/_types.js';
import { autoUploadEnabled } from './autoUploadEnabled.js';
import { mediaCardState } from './mediaCardState.js';
import { recordingState } from './recordingState.js';
import { remoteControlAllowed } from './remoteControlAllowed.js';
import { stateMatches } from './stateMatches.js';
import { systemAlertActive } from './systemAlertActive.js';
import { uploadJobState } from './uploadJobState.js';

export function createModuleBooleanFeedback<const Options extends DeepImmutable<SomeCompanionFeedbackInputField[]>>(
	feedback: Omit<ModuleBooleanFeedback<Options>, 'options' | 'type'>,
	options: Options | ((companionModule: ModuleInstance) => Options),
): ModuleFeedback<Options> {
	return { options, ...feedback, type: 'boolean' };
}

export function createModuleValueFeedback<const Options extends DeepImmutable<SomeCompanionFeedbackInputField[]>>(
	feedback: Omit<ModuleValueFeedback<Options>, 'options' | 'type'>,
	options: Options | ((companionModule: ModuleInstance) => Options),
): ModuleFeedback<Options> {
	return { options, ...feedback, type: 'value' };
}

export function createModuleAdvancedFeedback<const Options extends DeepImmutable<SomeCompanionFeedbackInputField[]>>(
	feedback: Omit<ModuleAdvancedFeedback<Options>, 'options' | 'type'>,
	options: Options | ((companionModule: ModuleInstance) => Options),
): ModuleFeedback<Options> {
	return { options, ...feedback, type: 'advanced' };
}

export function getFeedbacks(companionModule: ModuleInstance): CompanionFeedbackDefinitions {
	return convertFeedbacks(companionModule, {
		recordingState,
		uploadJobState,
		mediaCardState,
		systemAlertActive,
		remoteControlAllowed,
		autoUploadEnabled,
		stateMatches,
	});
}

function convertFeedbacks(
	companionModule: ModuleInstance,
	feedbacks: Record<string, ModuleFeedback<DeepImmutable<SomeCompanionFeedbackInputField[]>>>,
) {
	const companionFeedbacks: CompanionFeedbackDefinitions = {};
	for (const [feedback, feedbackDef] of Object.entries(feedbacks)) {
		const options = (
			typeof feedbackDef.options === 'function' ? feedbackDef.options(companionModule) : feedbackDef.options
		) as SomeCompanionFeedbackInputField[];
		const common = {
			name: feedbackDef.name,
			options,
			...(feedbackDef.sortName !== undefined ? { sortName: feedbackDef.sortName } : {}),
			...(feedbackDef.description !== undefined ? { description: feedbackDef.description } : {}),
			...(feedbackDef.learn !== undefined
				? {
						learn: async (
							event: CompanionFeedbackInfo<CompanionOptionValues>,
							context: CompanionFeedbackLearnContext,
						) =>
							feedbackDef.learn!(
								companionModule,
								event as Parameters<NonNullable<typeof feedbackDef.learn>>[1],
								context,
							),
					}
				: {}),
			...(feedbackDef.learnTimeout !== undefined ? { learnTimeout: feedbackDef.learnTimeout } : {}),
			...(feedbackDef.unsubscribe !== undefined
				? {
						unsubscribe: async (
							event: CompanionFeedbackInfo<CompanionOptionValues>,
							context: CompanionFeedbackContext,
						) =>
							feedbackDef.unsubscribe!(
								companionModule,
								event as Parameters<NonNullable<typeof feedbackDef.unsubscribe>>[1],
								context,
							),
					}
				: {}),
		};

		switch (feedbackDef.type) {
			case 'boolean':
				companionFeedbacks[feedback] = {
					...common,
					type: 'boolean',
					defaultStyle: feedbackDef.defaultStyle,
					showInvert: feedbackDef.showInvert,
					async callback(
						event: CompanionFeedbackBooleanEvent<CompanionOptionValues>,
						context: CompanionFeedbackCallbackContext,
					) {
						return feedbackDef.callback(companionModule, event as Parameters<typeof feedbackDef.callback>[1], context);
					},
				};
				break;
			case 'value':
				companionFeedbacks[feedback] = {
					...common,
					type: 'value',
					async callback(
						event: CompanionFeedbackValueEvent<CompanionOptionValues>,
						context: CompanionFeedbackCallbackContext,
					) {
						return feedbackDef.callback(companionModule, event as Parameters<typeof feedbackDef.callback>[1], context);
					},
				};
				break;
			case 'advanced':
				companionFeedbacks[feedback] = {
					...common,
					type: 'advanced',
					affectedProperties: feedbackDef.affectedProperties,
					async callback(
						event: CompanionFeedbackAdvancedEvent<CompanionOptionValues>,
						context: CompanionFeedbackCallbackContext,
					) {
						return feedbackDef.callback(companionModule, event as Parameters<typeof feedbackDef.callback>[1], context);
					},
				};
				break;
		}
	}
	return companionFeedbacks;
}
