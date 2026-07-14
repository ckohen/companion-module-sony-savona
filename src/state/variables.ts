import type { CompanionVariableDefinitions, CompanionVariableValue, DropdownChoice } from '@companion-module/base';
import type { SavonaClient, UploadJob } from '@ckohen/savona';
import type { ModuleInstance } from '../main.js';

export interface VariableDescriptor {
	id: string;
	name: string;
	facetId: string;
	include?: (companionModule: ModuleInstance) => boolean;
	getValue(client: SavonaClient, companionModule: ModuleInstance): CompanionVariableValue;
}

const assignableButtonVariables = [1, 2, 3, 4, 5, 6, 7, 8, 9].flatMap((id): VariableDescriptor[] => [
	{
		id: `assignable_${id}_assignment`,
		name: `Assignable ${id} Assignment`,
		facetId: 'assignableButtons',
		getValue: (client) => client.assignableButtons.buttons.get(id)?.value,
	},
	{
		id: `assignable_${id}_active`,
		name: `Assignable ${id} Active`,
		facetId: 'assignableButtons',
		getValue: (client) => client.assignableButtons.buttons.get(id)?.status,
	},
]);

const audioVariables = [1, 2, 3, 4].map((channel): VariableDescriptor => ({
	id: `audio_${channel}_level`,
	name: `Audio ${channel} Level`,
	facetId: 'audio',
	include: (companionModule) => companionModule.config?.showAudioVariables === true,
	getValue: (client) => client.audio.channels.get(channel as 1 | 2 | 3 | 4),
}));

const mediaCardVariables = [
	{ id: 'a', label: 'A', card: (client: SavonaClient) => client.mediaCards.cardA },
	{ id: 'b', label: 'B', card: (client: SavonaClient) => client.mediaCards.cardB },
	{ id: 'c', label: 'C', card: (client: SavonaClient) => client.mediaCards.cardC },
].flatMap(({ id, label, card }): VariableDescriptor[] => [
	{
		id: `media_card_${id}_status`,
		name: `Media Card ${label} Status`,
		facetId: 'mediaCards',
		getValue: (client) => card(client).status,
	},
	{
		id: `media_card_${id}_type`,
		name: `Media Card ${label} Type`,
		facetId: 'mediaCards',
		getValue: (client) => card(client).type,
	},
	{
		id: `media_card_${id}_record_target`,
		name: `Media Card ${label} Record Target`,
		facetId: 'mediaCards',
		getValue: (client) => card(client).isRecording,
	},
	{
		id: `media_card_${id}_playback_target`,
		name: `Media Card ${label} Playback Target`,
		facetId: 'mediaCards',
		getValue: (client) => card(client).isPlaying,
	},
	{
		id: `media_card_${id}_write_protected`,
		name: `Media Card ${label} Write Protected`,
		facetId: 'mediaCards',
		getValue: (client) => card(client).writeProtected,
	},
	{
		id: `media_card_${id}_file_status`,
		name: `Media Card ${label} File Status`,
		facetId: 'mediaCards',
		getValue: (client) => card(client).fileStatus,
	},
	{
		id: `media_card_${id}_available_time`,
		name: `Media Card ${label} Available Time (Raw)`,
		facetId: 'mediaCards',
		getValue: (client) => card(client).availableTime,
	},
	{
		id: `media_card_${id}_available_size`,
		name: `Media Card ${label} Available Size (Bytes)`,
		facetId: 'mediaCards',
		getValue: (client) => card(client).availableSize,
	},
	{
		id: `media_card_${id}_available_size_mb`,
		name: `Media Card ${label} Available Size (MB)`,
		facetId: 'mediaCards',
		getValue: (client) => scaleBytes(card(client).availableSize, 1_000_000),
	},
	{
		id: `media_card_${id}_available_size_gb`,
		name: `Media Card ${label} Available Size (GB)`,
		facetId: 'mediaCards',
		getValue: (client) => scaleBytes(card(client).availableSize, 1_000_000_000),
	},
	{
		id: `media_card_${id}_available_size_display`,
		name: `Media Card ${label} Available Size (Formatted)`,
		facetId: 'mediaCards',
		getValue: (client) => formatBytes(card(client).availableSize),
	},
]);

function scaleBytes(bytes: number | null, divisor: number): number | undefined {
	return bytes === null ? undefined : Math.round((bytes / divisor) * 100) / 100;
}

function formatBytes(bytes: number | null): string | undefined {
	if (bytes === null) return undefined;
	if (bytes >= 1_000_000_000) return `${scaleBytes(bytes, 1_000_000_000)} GB`;
	if (bytes >= 1_000_000) return `${scaleBytes(bytes, 1_000_000)} MB`;
	if (bytes >= 1_000) return `${scaleBytes(bytes, 1_000)} kB`;
	return `${bytes} bytes`;
}

export const variableDescriptors: readonly VariableDescriptor[] = [
	...assignableButtonVariables,
	...audioVariables,
	{
		id: 'auto_upload_enabled',
		name: 'Auto Upload Enabled',
		facetId: 'autoUpload',
		getValue: (client) => client.autoUpload.enabled,
	},
	{
		id: 'auto_upload_mode',
		name: 'Auto Upload Mode',
		facetId: 'autoUpload',
		getValue: (client) => client.autoUpload.mode,
	},
	{
		id: 'battery_type',
		name: 'Battery Type',
		facetId: 'battery',
		getValue: (client) => client.mainBattery.type,
	},
	{
		id: 'battery_percentage',
		name: 'Battery Percentage',
		facetId: 'battery',
		getValue: (client) => client.mainBattery.percentage,
	},
	{
		id: 'battery_voltage',
		name: 'Battery Voltage',
		facetId: 'battery',
		getValue: (client) => client.mainBattery.voltage,
	},
	{
		id: 'battery_minutes',
		name: 'Battery Minutes',
		facetId: 'battery',
		getValue: (client) => client.mainBattery.minute,
	},
	{
		id: 'battery_display',
		name: 'Battery Display',
		facetId: 'battery',
		getValue: (client) => client.mainBattery.display,
	},
	{
		id: 'clip_total',
		name: 'Clip Total',
		facetId: 'clipInfo',
		getValue: (client) => client.clipInfo.total,
	},
	{
		id: 'clip_position',
		name: 'Clip Position',
		facetId: 'clipInfo',
		getValue: (client) => client.clipInfo.position,
	},
	{
		id: 'clip_status',
		name: 'Clip Status',
		facetId: 'clipInfo',
		getValue: (client) => client.clipInfo.status,
	},
	{
		id: 'clip_name',
		name: 'Clip Name',
		facetId: 'clipInfo',
		getValue: (client) => client.clipInfo.name,
	},
	{
		id: 'color_bars_enabled',
		name: 'Color Bars Enabled',
		facetId: 'colorBars',
		getValue: (client) => client.colorBars.enabled,
	},
	{
		id: 'color_bars_type',
		name: 'Color Bars Type',
		facetId: 'colorBars',
		getValue: (client) => client.colorBars.type,
	},
	{
		id: 'device_name',
		name: 'Device Name',
		facetId: 'deviceInfo',
		getValue: (client) => client.deviceInfo.name,
	},
	{
		id: 'device_model',
		name: 'Device Model',
		facetId: 'deviceInfo',
		getValue: (client) => client.deviceInfo.modelName,
	},
	{
		id: 'device_serial',
		name: 'Device Serial Number',
		facetId: 'deviceInfo',
		getValue: (client) => client.deviceInfo.serialNumber,
	},
	{
		id: 'device_date_time',
		name: 'Device Date Time',
		facetId: 'deviceInfo',
		getValue: (client) => client.deviceInfo.dateTime,
	},
	{
		id: 'focus_distance',
		name: 'Focus Distance',
		facetId: 'focus',
		getValue: (client) => client.focus.distance,
	},
	{
		id: 'focus_mode',
		name: 'Focus Mode',
		facetId: 'focus',
		getValue: (client) => client.focus.mode,
	},
	{
		id: 'focus_unit',
		name: 'Focus Unit',
		facetId: 'focus',
		getValue: (client) => client.focus.unit,
	},
	{
		id: 'focus_status',
		name: 'Focus Status',
		facetId: 'focus',
		getValue: (client) => client.focus.distanceStatus,
	},
	{
		id: 'gain_value',
		name: 'Gain Value',
		facetId: 'gain',
		getValue: (client) => client.gain.value,
	},
	{
		id: 'gain_mode',
		name: 'Gain Mode',
		facetId: 'gain',
		getValue: (client) => client.gain.mode,
	},
	{
		id: 'gain_status',
		name: 'Gain Status',
		facetId: 'gain',
		getValue: (client) => client.gain.status,
	},
	{
		id: 'gamma_enabled',
		name: 'Gamma Enabled',
		facetId: 'gamma',
		getValue: (client) => client.gamma.enabled,
	},
	{
		id: 'gamma_type',
		name: 'Gamma Type',
		facetId: 'gamma',
		getValue: (client) => client.gamma.type,
	},
	{
		id: 'gamma_value',
		name: 'Gamma Value',
		facetId: 'gamma',
		getValue: (client) => client.gamma.value,
	},
	{
		id: 'gamma_hdr_value',
		name: 'Gamma HDR Value',
		facetId: 'gamma',
		getValue: (client) => client.gamma.HDRValue,
	},
	{
		id: 'global_read_allowed',
		name: 'Remote Read Allowed',
		facetId: 'globalStatus',
		getValue: (client) => client.globalStatus.read,
	},
	{
		id: 'global_write_allowed',
		name: 'Remote Write Allowed',
		facetId: 'globalStatus',
		getValue: (client) => client.globalStatus.write,
	},
	{
		id: 'global_execute_allowed',
		name: 'Remote Execute Allowed',
		facetId: 'globalStatus',
		getValue: (client) => client.globalStatus.execute,
	},
	{
		id: 'iris_value',
		name: 'Iris Value',
		facetId: 'iris',
		getValue: (client) => client.iris.value,
	},
	{
		id: 'iris_closed',
		name: 'Iris Closed',
		facetId: 'iris',
		getValue: (client) => client.iris.closed,
	},
	{
		id: 'iris_mode',
		name: 'Iris Mode',
		facetId: 'iris',
		getValue: (client) => client.iris.mode,
	},
	{
		id: 'iris_status',
		name: 'Iris Status',
		facetId: 'iris',
		getValue: (client) => client.iris.status,
	},
	{
		id: 'lens_connected',
		name: 'Lens Connected',
		facetId: 'lensMount',
		getValue: (client) => client.lensMount.connected,
	},
	{
		id: 'main_file_width',
		name: 'Main File Width',
		facetId: 'mainFile',
		getValue: (client) => client.mainFile.formatWidth,
	},
	{
		id: 'main_file_height',
		name: 'Main File Height',
		facetId: 'mainFile',
		getValue: (client) => client.mainFile.formatHeight,
	},
	{
		id: 'main_file_encoding',
		name: 'Main File Encoding',
		facetId: 'mainFile',
		getValue: (client) => client.mainFile.formatEncoding,
	},
	{
		id: 'main_file_frame_rate',
		name: 'Main File Frame Rate',
		facetId: 'mainFile',
		getValue: (client) => client.mainFile.frameRate,
	},
	{
		id: 'main_file_scan_mode',
		name: 'Main File Scan Mode',
		facetId: 'mainFile',
		getValue: (client) => client.mainFile.scanMode,
	},
	...mediaCardVariables,
	{
		id: 'nd_enabled',
		name: 'ND Enabled',
		facetId: 'nd',
		getValue: (client) => client.ND.enabled,
	},
	{
		id: 'nd_value',
		name: 'ND Value',
		facetId: 'nd',
		getValue: (client) => client.ND.value,
	},
	{
		id: 'nd_mode',
		name: 'ND Mode',
		facetId: 'nd',
		getValue: (client) => client.ND.mode,
	},
	{
		id: 'record_status',
		name: 'Record Status',
		facetId: 'record',
		getValue: (client) => client.record.status,
	},
	{
		id: 'record_mode',
		name: 'Record Mode',
		facetId: 'record',
		getValue: (client) => client.record.mode,
	},
	{
		id: 'record_timecode',
		name: 'Record Timecode',
		facetId: 'record',
		getValue: (client) => client.record.timeCodeValue,
	},
	{
		id: 'record_timecode_type',
		name: 'Record Timecode Type',
		facetId: 'record',
		getValue: (client) => client.record.timeCodeType,
	},
	{
		id: 'record_timecode_locked',
		name: 'Record Timecode Locked',
		facetId: 'record',
		getValue: (client) => client.record.timeCodeLocked,
	},
	{
		id: 'record_simul_rec_enabled',
		name: 'Simul Rec Enabled',
		facetId: 'record',
		getValue: (client) => client.record.simulRecEnabled,
	},
	{
		id: 'record_simul_rec_mode',
		name: 'Simul Rec Mode',
		facetId: 'record',
		getValue: (client) => client.record.simulRecMode,
	},
	{
		id: 'shutter_enabled',
		name: 'Shutter Enabled',
		facetId: 'shutter',
		getValue: (client) => client.shutter.enabled,
	},
	{
		id: 'shutter_mode',
		name: 'Shutter Mode',
		facetId: 'shutter',
		getValue: (client) => client.shutter.mode,
	},
	{
		id: 'shutter_value',
		name: 'Shutter Value',
		facetId: 'shutter',
		getValue: (client) => client.shutter.value,
	},
	{
		id: 'shutter_ecs_enabled',
		name: 'Shutter ECS Enabled',
		facetId: 'shutter',
		getValue: (client) => client.shutter.ecsEnabled,
	},
	{
		id: 'shutter_slow_enabled',
		name: 'Slow Shutter Enabled',
		facetId: 'shutter',
		getValue: (client) => client.shutter.slowEnabled,
	},
	{
		id: 'shutter_slow_frames',
		name: 'Slow Shutter Frames',
		facetId: 'shutter',
		getValue: (client) => client.shutter.slowFrames,
	},
	{
		id: 'shutter_auto_mode',
		name: 'Shutter Auto Mode',
		facetId: 'shutter',
		getValue: (client) => client.shutter.automaticMode,
	},
	{
		id: 'slow_and_quick_enabled',
		name: 'Slow and Quick Enabled',
		facetId: 'slowAndQuick',
		getValue: (client) => client.slowAndQuick.enabled,
	},
	{
		id: 'slow_and_quick_framerate',
		name: 'Slow and Quick Frame Rate',
		facetId: 'slowAndQuick',
		getValue: (client) => client.slowAndQuick.framerate,
	},
	{
		id: 'slow_and_quick_high_framerate_enabled',
		name: 'Slow and Quick High Frame Rate Enabled',
		facetId: 'slowAndQuick',
		getValue: (client) => client.slowAndQuick.highFramerateEnabled,
	},
	{
		id: 'system_error_count',
		name: 'System Error Count',
		facetId: 'systemMessages',
		getValue: (client) => client.systemMessages.activeMessages.filter((message) => message.type === 'error').length,
	},
	{
		id: 'system_warning_count',
		name: 'System Warning Count',
		facetId: 'systemMessages',
		getValue: (client) => client.systemMessages.activeMessages.filter((message) => message.type === 'warning').length,
	},
	{
		id: 'system_message_summary',
		name: 'System Message Summary',
		facetId: 'systemMessages',
		getValue: (client) => client.systemMessages.activeMessages.map((message) => message.code).join(', '),
	},
	{
		id: 'upload_jobs_total',
		name: 'Upload Jobs Total',
		facetId: 'uploadJobs',
		getValue: (client) => client.uploadJobs.jobs.size,
	},
	{
		id: 'upload_jobs_waiting',
		name: 'Upload Jobs Waiting',
		facetId: 'uploadJobs',
		getValue: (client) => getUploadJobCount(client.uploadJobs.jobs.values(), (job) => job.statusCode === 0),
	},
	{
		id: 'upload_jobs_transferring',
		name: 'Upload Jobs Transferring',
		facetId: 'uploadJobs',
		getValue: (client) => getUploadJobCount(client.uploadJobs.jobs.values(), (job) => job.statusCode === 100),
	},
	{
		id: 'upload_jobs_completed',
		name: 'Upload Jobs Completed',
		facetId: 'uploadJobs',
		getValue: (client) => getUploadJobCount(client.uploadJobs.jobs.values(), (job) => job.statusCode === 200),
	},
	{
		id: 'upload_jobs_aborted',
		name: 'Upload Jobs Aborted',
		facetId: 'uploadJobs',
		getValue: (client) => getUploadJobCount(client.uploadJobs.jobs.values(), (job) => job.statusCode === 300),
	},
	{
		id: 'upload_jobs_failed',
		name: 'Upload Jobs Failed',
		facetId: 'uploadJobs',
		getValue: (client) => getUploadJobCount(client.uploadJobs.jobs.values(), (job) => job.statusCode >= 400),
	},
	{
		id: 'upload_jobs_percentage',
		name: 'Upload Jobs Percentage',
		facetId: 'uploadJobs',
		getValue: (client) => client.uploadJobs.summary.percentage,
	},
	{
		id: 'upload_jobs_remaining_clips',
		name: 'Upload Jobs Remaining Clips',
		facetId: 'uploadJobs',
		getValue: (client) => client.uploadJobs.summary.remainingClips,
	},
	{
		id: 'upload_jobs_remaining_minutes',
		name: 'Upload Jobs Remaining Minutes',
		facetId: 'uploadJobs',
		getValue: (client) => client.uploadJobs.summary.remainingMinutes,
	},
	{
		id: 'upload_jobs_current_mbps',
		name: 'Upload Jobs Current Mbps',
		facetId: 'uploadJobs',
		getValue: (client) => client.uploadJobs.summary.currentMegabitsPerSecond,
	},
	{
		id: 'upload_jobs_current_clip',
		name: 'Upload Jobs Current Clip',
		facetId: 'uploadJobs',
		getValue: (client) => getCurrentUploadJob(client)?.clipName,
	},
	{
		id: 'upload_settings_default_service',
		name: 'Default Upload Setting',
		facetId: 'uploadSettings',
		getValue: (client) => client.uploadSettings.defaultService,
	},
	{
		id: 'upload_settings_count',
		name: 'Upload Settings Count',
		facetId: 'uploadSettings',
		getValue: (client) => client.uploadSettings.settings.size,
	},
	{
		id: 'upload_settings_credential_status',
		name: 'Upload Settings Credential Status',
		facetId: 'uploadSettings',
		getValue: (client) => client.uploadSettings.credentialStatus,
	},
	{
		id: 'white_balance_mode',
		name: 'White Balance Mode',
		facetId: 'whiteBalance',
		getValue: (client) => client.whiteBalance.mode,
	},
	{
		id: 'white_balance_memory_a',
		name: 'White Balance Memory A',
		facetId: 'whiteBalance',
		getValue: (client) => client.whiteBalance.memoryValue['Memory A'],
	},
	{
		id: 'white_balance_memory_b',
		name: 'White Balance Memory B',
		facetId: 'whiteBalance',
		getValue: (client) => client.whiteBalance.memoryValue['Memory B'],
	},
	{
		id: 'white_balance_memory_c',
		name: 'White Balance Memory C',
		facetId: 'whiteBalance',
		getValue: (client) => client.whiteBalance.memoryValue['Memory C'],
	},
	{
		id: 'white_balance_automatic_enabled',
		name: 'White Balance Automatic Enabled',
		facetId: 'whiteBalance',
		getValue: (client) => client.whiteBalance.automaticEnabled,
	},
	{
		id: 'white_balance_tracking_mode',
		name: 'White Balance Tracking Mode',
		facetId: 'whiteBalance',
		getValue: (client) => client.whiteBalance.trackingMode,
	},
	{
		id: 'zoom_value',
		name: 'Zoom Value',
		facetId: 'zoom',
		getValue: (client) => client.zoom.value,
	},
	{
		id: 'zoom_status',
		name: 'Zoom Status',
		facetId: 'zoom',
		getValue: (client) => client.zoom.status,
	},
] as const;

export function getVariableDefinitions(companionModule: ModuleInstance): CompanionVariableDefinitions {
	const definitions: CompanionVariableDefinitions = {};
	for (const variable of getIncludedVariableDescriptors(companionModule)) {
		definitions[variable.id] = { name: variable.name };
	}
	return definitions;
}

export function getVariableValues(
	companionModule: ModuleInstance,
	facetIds?: Iterable<string>,
): Record<string, CompanionVariableValue> {
	const client = companionModule.client;
	if (!client || String(client.state) !== 'connected') return getClearedVariableValues(companionModule);

	const facets = facetIds === undefined ? undefined : new Set(facetIds);
	const values: Record<string, CompanionVariableValue> = {};
	for (const variable of getIncludedVariableDescriptors(companionModule)) {
		if (facets !== undefined && !facets.has(variable.facetId)) continue;
		values[variable.id] = variable.getValue(client, companionModule);
	}
	return values;
}

export function getClearedVariableValues(companionModule: ModuleInstance): Record<string, CompanionVariableValue> {
	const values: Record<string, CompanionVariableValue> = {};
	for (const variable of getIncludedVariableDescriptors(companionModule)) {
		values[variable.id] = undefined;
	}
	return values;
}

export function getVariableChoices(companionModule: ModuleInstance): DropdownChoice<string>[] {
	return getIncludedVariableDescriptors(companionModule).map((variable) => ({
		id: variable.id,
		label: variable.name,
	}));
}

export function getVariableValue(
	companionModule: ModuleInstance,
	variableId: string | undefined,
): CompanionVariableValue {
	if (!variableId || !companionModule.client || String(companionModule.client.state) !== 'connected') return undefined;

	const variable = getIncludedVariableDescriptors(companionModule).find((descriptor) => descriptor.id === variableId);
	return variable?.getValue(companionModule.client, companionModule);
}

function getIncludedVariableDescriptors(companionModule: ModuleInstance): readonly VariableDescriptor[] {
	return variableDescriptors.filter((variable) => variable.include?.(companionModule) ?? true);
}

function getUploadJobCount(jobs: Iterable<UploadJob>, predicate: (job: UploadJob) => boolean): number {
	return Array.from(jobs).filter((job) => predicate(job)).length;
}

function getCurrentUploadJob(client: SavonaClient): UploadJob | undefined {
	return Array.from(client.uploadJobs.jobs.values()).find((job) => job.source === 'Progress' && job.statusCode === 100);
}
