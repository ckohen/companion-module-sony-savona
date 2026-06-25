import { CompanionActionDefinitions, SomeCompanionActionInputField } from '@companion-module/base';
import type { ModuleInstance } from '../main.js';
import { DeepImmutable, ModuleAction } from './_types.js';
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

export function createModuleAction<const Options extends DeepImmutable<SomeCompanionActionInputField[]>>(
	action: Omit<ModuleAction<Options>, 'options'>,
	options: Options | ((companionModule: ModuleInstance) => Options),
): ModuleAction<Options> {
	return { options, ...action };
}

export function getActions(companionModule: ModuleInstance): CompanionActionDefinitions {
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
