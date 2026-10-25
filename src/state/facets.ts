import type { SavonaClient, SavonaStructureName } from '@ckohen/savona';
import type { ModuleInstance } from '../main.js';

export interface CacheFacet {
	id: SavonaStructureName;
	name: string;
	fetch: (client: SavonaClient) => Promise<unknown>;
	include?: (companionModule: ModuleInstance) => boolean;
	throttleMs?: number;
}

export const cacheFacets: readonly CacheFacet[] = [
	{
		id: 'assignableButtons',
		name: 'assignable buttons',
		fetch: async (client) => {
			await client.assignableButtons.fetchCapabilities();
			await client.assignableButtons.fetchValues();
		},
	},
	{
		id: 'audio',
		name: 'audio levels',
		fetch: async (client) => client.audio.fetchValue(),
		include: (companionModule) => companionModule.config?.showAudioVariables === true,
		throttleMs: 250,
	},
	{ id: 'autoUpload', name: 'auto upload', fetch: async (client) => client.autoUpload.fetchValue() },
	{ id: 'mainBattery', name: 'main battery', fetch: async (client) => client.mainBattery.fetchValue() },
	{
		id: 'clipInfo',
		name: 'clip info',
		fetch: async (client) => {
			await Promise.all([client.clipInfo.fetchValue(), client.clipInfo.fetchName()]);
		},
	},
	{ id: 'colorBars', name: 'color bars', fetch: async (client) => client.colorBars.fetchValue() },
	{ id: 'deviceInfo', name: 'device info', fetch: async (client) => client.deviceInfo.fetchValue() },
	{
		id: 'focus',
		name: 'focus',
		fetch: async (client) => {
			await Promise.all([client.focus.fetchValue(), client.focus.fetchStatus()]);
		},
	},
	{
		id: 'gain',
		name: 'gain',
		fetch: async (client) => {
			await Promise.all([
				client.gain.fetchValue(),
				client.gain.fetchMode(),
				client.gain.fetchStatus(),
				client.gain.fetchModeStatus(),
			]);
		},
	},
	{
		id: 'gamma',
		name: 'gamma',
		fetch: async (client) => {
			await Promise.all([client.gamma.fetchValue(), client.gamma.fetchStatus()]);
		},
	},
	{ id: 'globalStatus', name: 'remote control permission', fetch: async (client) => client.globalStatus.fetchValue() },
	{
		id: 'iris',
		name: 'iris',
		fetch: async (client) => {
			await Promise.all([
				client.iris.fetchValue(),
				client.iris.fetchAutomaticValue(),
				client.iris.fetchStatus(),
				client.iris.fetchAutomaticStatus(),
			]);
		},
	},
	{ id: 'lensMount', name: 'lens mount', fetch: async (client) => client.lensMount.fetchValue() },
	{ id: 'mainFile', name: 'main file format', fetch: async (client) => client.mainFile.fetchValue() },
	{ id: 'mediaCards', name: 'media cards', fetch: async (client) => client.mediaCards.fetchValue() },
	{
		id: 'ND',
		name: 'ND filter',
		fetch: async (client) => {
			await Promise.all([
				client.ND.fetchValue(),
				client.ND.fetchAutomaticValue(),
				client.ND.fetchStatus(),
				client.ND.fetchAutomaticStatus(),
			]);
		},
	},
	{ id: 'record', name: 'record', fetch: async (client) => client.record.fetchValue() },
	{
		id: 'shutter',
		name: 'shutter',
		fetch: async (client) => {
			await Promise.all([
				client.shutter.fetchValue(),
				client.shutter.fetchAutomaticValue(),
				client.shutter.fetchStatus(),
				client.shutter.fetchAutomaticStatus(),
				client.shutter.fetchShutterSpeedList(),
			]);
		},
	},
	{
		id: 'slowAndQuick',
		name: 'slow and quick motion',
		fetch: async (client) => {
			await Promise.all([
				client.slowAndQuick.fetchValue(),
				client.slowAndQuick.fetchCapability(),
				client.slowAndQuick.fetchStatus(),
			]);
		},
	},
	{ id: 'systemMessages', name: 'system messages', fetch: async (client) => client.systemMessages.fetchValue() },
	{ id: 'uploadJobs', name: 'upload jobs', fetch: async (client) => client.uploadJobs.fetchValue() },
	{
		id: 'uploadSettings',
		name: 'upload settings',
		fetch: async (client) => {
			await Promise.all([client.uploadSettings.fetchValue(), client.uploadSettings.fetchCredentialStatus()]);
		},
	},
	{
		id: 'whiteBalance',
		name: 'white balance',
		fetch: async (client) => {
			await Promise.all([
				client.whiteBalance.fetchValue(),
				client.whiteBalance.fetchAutomaticEnabled(),
				client.whiteBalance.fetchTrackingMode(),
				client.whiteBalance.fetchStatus(),
				client.whiteBalance.fetchTrackingModeStatus(),
			]);
		},
	},
	{
		id: 'zoom',
		name: 'zoom',
		fetch: async (client) => {
			await Promise.all([client.zoom.fetchValue(), client.zoom.fetchStatus()]);
		},
	},
] as const;
