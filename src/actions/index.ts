import {
	CompanionActionContext,
	CompanionActionDefinition,
	CompanionActionDefinitions,
	CompanionActionEvent,
	CompanionActionInfo,
	CompanionActionLearnContext,
	CompanionActionSchema,
	CompanionOptionValues,
	JsonValue,
	SomeCompanionActionInputField,
} from '@companion-module/base';
import type { ModuleInstance } from '../main.js';
import { AnyModuleAction, DeepImmutable, ModuleAction } from './_types.js';
import { pressAssignableButton } from './assignableButtons/press.js';
import { setAutoUploadEnabled } from './autoUpload/setEnabled.js';
import { setColorBarsEnabled } from './colorBars/setEnabled.js';
import { setFocusVelocity } from './focus/setVelocity.js';
import { stepFocusVelocity } from './focus/stepVelocity.js';
import { setGammaValue } from './gamma/setValue.js';
import { setGainMode } from './gain/setMode.js';
import { setGainValue } from './gain/setValue.js';
import { setIrisClosed } from './iris/setClosed.js';
import { setIrisMode } from './iris/setMode.js';
import { setIrisValue } from './iris/setValue.js';
import { deleteProxyClip } from './media/deleteProxyClip.js';
import { uploadClip } from './media/uploadClip.js';
import { uploadLatestRecording } from './media/uploadLatestRecording.js';
import { setNdMode } from './nd/setMode.js';
import { setNdValue } from './nd/setValue.js';
import { openRecorder } from './record/open.js';
import { startRecording } from './record/start.js';
import { stopRecording } from './record/stop.js';
import { disableShutter } from './shutter/disable.js';
import { setShutterMode } from './shutter/setMode.js';
import { setShutterValue } from './shutter/setValue.js';
import { abortUploadJobs } from './uploadJobs/abort.js';
import { clearCompletedUploadJobs } from './uploadJobs/clearCompleted.js';
import { deleteUploadJobs } from './uploadJobs/delete.js';
import { restartUploadJobs } from './uploadJobs/restart.js';
import { setDefaultUploadSetting } from './uploadSettings/setDefault.js';
import { executeWhiteBalance } from './whiteBalance/execute.js';
import { setWhiteBalanceMode } from './whiteBalance/setMode.js';
import { setWhiteBalanceTrackingMode } from './whiteBalance/setTrackingMode.js';
import { setWhiteBalanceValue } from './whiteBalance/setValue.js';
import { setZoomVelocity } from './zoom/setVelocity.js';
import { stepZoomVelocity } from './zoom/stepVelocity.js';

export function createModuleAction<
	const Options extends DeepImmutable<SomeCompanionActionInputField[]>,
	const Result extends JsonValue,
>(
	action: Omit<ModuleAction<Options, Result>, 'options'> & { hasResult: true },
	options: Options | ((companionModule: ModuleInstance) => Options),
): ModuleAction<Options, Result>;
export function createModuleAction<const Options extends DeepImmutable<SomeCompanionActionInputField[]>>(
	action: Omit<ModuleAction<Options, void>, 'options'>,
	options: Options | ((companionModule: ModuleInstance) => Options),
): ModuleAction<Options, void>;
export function createModuleAction<const Options extends DeepImmutable<SomeCompanionActionInputField[]>>(
	action: Omit<ModuleAction<Options>, 'options'>,
	options: Options | ((companionModule: ModuleInstance) => Options),
): AnyModuleAction<Options> {
	return { options, ...action } as AnyModuleAction<Options>;
}

type ModuleActionSchema =
	CompanionActionSchema<CompanionOptionValues, void> | CompanionActionSchema<CompanionOptionValues, JsonValue>;
type ModuleActionSchemas = Record<string, ModuleActionSchema>;

export function getActions(companionModule: ModuleInstance): CompanionActionDefinitions<ModuleActionSchemas> {
	return convertActions(companionModule, {
		abortUploadJobs,
		clearCompletedUploadJobs,
		deleteProxyClip,
		deleteUploadJobs,
		disableShutter,
		executeWhiteBalance,
		openRecorder,
		pressAssignableButton,
		restartUploadJobs,
		setAutoUploadEnabled,
		setColorBarsEnabled,
		setDefaultUploadSetting,
		setFocusVelocity,
		setGammaValue,
		setGainMode,
		setGainValue,
		setIrisClosed,
		setIrisMode,
		setIrisValue,
		setNdMode,
		setNdValue,
		setShutterMode,
		setShutterValue,
		setWhiteBalanceMode,
		setWhiteBalanceTrackingMode,
		setWhiteBalanceValue,
		setZoomVelocity,
		startRecording,
		stepFocusVelocity,
		stepZoomVelocity,
		stopRecording,
		uploadClip,
		uploadLatestRecording,
	});
}

function convertActions(
	companionModule: ModuleInstance,
	actions: Record<string, AnyModuleAction<DeepImmutable<SomeCompanionActionInputField[]>>>,
) {
	const companionActions: CompanionActionDefinitions<ModuleActionSchemas> = {};
	for (const [action, actionDef] of Object.entries(actions)) {
		const options = (
			typeof actionDef.options === 'function' ? actionDef.options(companionModule) : actionDef.options
		) as SomeCompanionActionInputField[];
		const learn = actionDef.learn;
		const subscribe = actionDef.subscribe;
		const unsubscribe = actionDef.unsubscribe;
		const common = {
			name: actionDef.name,
			options,
			...(actionDef.sortName !== undefined ? { sortName: actionDef.sortName } : {}),
			...(actionDef.description !== undefined ? { description: actionDef.description } : {}),
			...(learn !== undefined
				? {
						learn: async (event: CompanionActionEvent<CompanionOptionValues>, context: CompanionActionLearnContext) =>
							learn(companionModule, event as Parameters<typeof learn>[1], context),
					}
				: {}),
			...(actionDef.learnTimeout !== undefined ? { learnTimeout: actionDef.learnTimeout } : {}),
			...(subscribe !== undefined
				? {
						optionsToMonitorForSubscribe: actionDef.optionsToMonitorForSubscribe,
						...(actionDef.skipUnsubscribeOnOptionsChange !== undefined
							? { skipUnsubscribeOnOptionsChange: actionDef.skipUnsubscribeOnOptionsChange }
							: {}),
						subscribe: async (event: CompanionActionInfo<CompanionOptionValues>, context: CompanionActionContext) =>
							subscribe(companionModule, event as Parameters<typeof subscribe>[1], context),
						...(unsubscribe !== undefined
							? {
									unsubscribe: async (
										event: CompanionActionInfo<CompanionOptionValues>,
										context: CompanionActionContext,
									) => unsubscribe(companionModule, event as Parameters<typeof unsubscribe>[1], context),
								}
							: {}),
					}
				: {}),
		};

		if (actionDef.hasResult === true) {
			companionActions[action] = {
				...common,
				hasResult: true,
				callback: async (event, context) =>
					actionDef.callback(companionModule, event as Parameters<typeof actionDef.callback>[1], context),
			} as CompanionActionDefinition<CompanionActionSchema<CompanionOptionValues, JsonValue>>;
		} else {
			companionActions[action] = {
				...common,
				callback: async (event, context) => {
					await actionDef.callback(companionModule, event as Parameters<typeof actionDef.callback>[1], context);
				},
			} as CompanionActionDefinition<CompanionActionSchema<CompanionOptionValues, void>>;
		}
	}
	return companionActions;
}
