import type { SavonaClient } from '@ckohen/savona';
import type { ModuleInstance } from '../main.js';

interface CacheFacetNotifications {
	value?: string[];
	status?: string[];
	process?: string[];
}

export interface CacheFacet {
	id: string;
	name: string;
	fetch?: (client: SavonaClient) => Promise<unknown>;
	include?: (companionModule: ModuleInstance) => boolean;
	notifications?: CacheFacetNotifications;
	throttleMs?: number;
}

export const cacheFacets: readonly CacheFacet[] = [
	{
		id: 'actionChoices',
		name: 'action choice data',
		fetch: async (client) => {
			await Promise.all([
				client.uploadSettings.fetchValue(),
				client.shutter.fetchShutterSpeedList(),
				client.assignableButtons.fetchCapabilities(),
			]);
		},
	},
	{
		id: 'assignableButtons',
		name: 'assignable buttons',
		fetch: async (client) => {
			await Promise.all([client.assignableButtons.fetchCapabilities(), client.assignableButtons.fetchValues()]);
		},
		notifications: {
			value: ['Button.Assign', 'P.Control.ProxyRec.StartStop', 'ProxyRecStartStop'],
		},
	},
	{
		id: 'audio',
		name: 'audio levels',
		fetch: async (client) => client.audio.fetchValue(),
		include: (companionModule) => companionModule.config?.showAudioVariables === true,
		notifications: { value: ['Output.Audio.Level'] },
		throttleMs: 250,
	},
	{
		id: 'autoUpload',
		name: 'auto upload',
		fetch: async (client) => client.autoUpload.fetchValue(),
		notifications: { value: ['Clip.Recorder.PostProcessing'] },
	},
	{
		id: 'battery',
		name: 'main battery',
		fetch: async (client) => client.mainBattery.fetchValue(),
		notifications: {
			value: [
				'System.Battery.Active.Type',
				'System.Battery.Active.Remain.Percentage',
				'System.Battery.Active.Remain.Minute',
				'System.Battery.Active.Remain.Voltage',
				'System.Battery.Active.Remain.Display',
			],
		},
	},
	{
		id: 'clipInfo',
		name: 'clip info',
		fetch: async (client) => {
			await Promise.all([client.clipInfo.fetchValue(), client.clipInfo.fetchName()]);
		},
		notifications: {
			value: [
				'P.Clip.Mediabox.TotalClips',
				'P.Clip.Mediabox.ClipPosition',
				'P.Clip.Mediabox.Status',
				'P.Clip.Mediabox.ClipName',
			],
		},
	},
	{
		id: 'colorBars',
		name: 'color bars',
		fetch: async (client) => client.colorBars.fetchValue(),
		notifications: { value: ['Camera.ColorBar.Enabled', 'Camera.ColorBar.Type'] },
	},
	{
		id: 'deviceInfo',
		name: 'device info',
		fetch: async (client) => client.deviceInfo.fetchValue(),
		notifications: {
			value: [
				'System.DateTime.Time',
				'Interface.USB.Receptacle',
				'System.ModelName',
				'System.SerialNumber',
				'Interface.USB.Name',
			],
		},
	},
	{
		id: 'focus',
		name: 'focus',
		fetch: async (client) => {
			await Promise.all([client.focus.fetchValue(), client.focus.fetchStatus()]);
		},
		notifications: {
			value: [
				'Camera.Focus.Distance',
				'Camera.Focus.SettingMethod',
				'Camera.Focus.Distance.Unit',
				'P.Menu.pmw-f5x.Event.EventID',
			],
			status: ['Camera.Focus.Distance', 'Camera.Focus.SettingMethod', 'Camera.Focus.Distance.Unit'],
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
		notifications: {
			value: ['Camera.Gain.Value', 'Camera.Gain.SettingMethod', 'P.Menu.pmw-f5x.Event.EventID'],
			status: ['Camera.Gain.Value', 'Camera.Gain.SettingMethod'],
		},
	},
	{
		id: 'gamma',
		name: 'gamma',
		fetch: async (client) => {
			await Promise.all([client.gamma.fetchValue(), client.gamma.fetchStatus()]);
		},
		notifications: {
			value: [
				'Paint.Gamma.Enabled',
				'Paint.Gamma.Type',
				'Paint.Gamma.Value',
				'Paint.Gamma.HDR.Value',
				'Camera.ShootingMode',
				'Camera.ShootingMode.QFHD.RecOut',
				'P.Menu.pmw-f5x.Event.EventID',
			],
			status: ['Paint.Gamma.Enabled'],
		},
	},
	{
		id: 'globalStatus',
		name: 'remote control permission',
		fetch: async (client) => client.globalStatus.fetchValue(),
		notifications: { value: ['Network.RemoteControl.Allow'] },
	},
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
		notifications: {
			value: [
				'Camera.Iris.Value',
				'Camera.Iris.Close.Enabled',
				'Camera.Iris.SettingMethod',
				'P.Menu.pmw-f5x.Event.EventID',
			],
			status: ['Camera.Iris.SettingMethod', 'Camera.Iris.Mode'],
		},
	},
	{
		id: 'lensMount',
		name: 'lens mount',
		fetch: async (client) => client.lensMount.fetchValue(),
		notifications: { value: ['Camera.Lens.Mount'] },
	},
	{
		id: 'mainFile',
		name: 'main file format',
		fetch: async (client) => client.mainFile.fetchValue(),
		notifications: {
			value: [
				'P.Clip.Mediabox.Video.Format.Width',
				'P.Clip.Mediabox.Video.Format.Height',
				'P.Clip.Mediabox.Video.Format.Encoding',
				'P.Clip.Mediabox.Video.Format.FrameRate',
				'P.Clip.Mediabox.Video.Format.Scanning.Format',
				'P.Clip.Mediabox.Video.Format.Chroma.Subsampling',
				'P.Clip.Mediabox.Video.Format.BitRate.Value',
				'P.Clip.Mediabox.Video.Format.AspectRatio.Height',
				'P.Clip.Mediabox.Video.Format.AspectRatio.Width',
			],
		},
	},
	{
		id: 'mediaCards',
		name: 'media cards',
		fetch: async (client) => client.mediaCards.fetchValue(),
		notifications: {
			value: [
				'System.Storage',
				'Storage.Media.WriteProtected',
				'Storage.Drive.Status',
				'Storage.Drive.Type',
				'Storage.Media.File.Status',
				'Storage.Media.MediaProfileUrl',
				'Storage.Media.AvailableTime',
				'Storage.Media.AvailableSize',
				'System.Function',
			],
		},
	},
	{
		id: 'nd',
		name: 'ND filter',
		fetch: async (client) => {
			await Promise.all([
				client.ND.fetchValue(),
				client.ND.fetchAutomaticValue(),
				client.ND.fetchStatus(),
				client.ND.fetchAutomaticStatus(),
			]);
		},
		notifications: {
			value: ['Camera.NDFilter.Value', 'Camera.NDFilter.Enabled', 'Camera.NDFilter.SettingMethod'],
			status: ['Camera.NDFilter.Value', 'Camera.NDFilter.SettingMethod'],
		},
	},
	{
		id: 'record',
		name: 'record',
		fetch: async (client) => client.record.fetchValue(),
		notifications: {
			value: [
				'P.Clip.Mediabox.Status',
				'P.Clip.Mediabox.Mode',
				'P.Clip.Mediabox.Speed',
				'P.Clip.Mediabox.TimeCode.Type',
				'P.Clip.Mediabox.TimeCode.Value',
				'P.Clip.Mediabox.TimeCode.Locked',
				'P.Clip.Mediabox.SimulRec.Enabled',
				'P.Clip.Mediabox.SimulRec.Mode',
			],
		},
	},
	{
		id: 'shutter',
		name: 'shutter',
		fetch: async (client) => {
			await Promise.all([
				client.shutter.fetchValue(),
				client.shutter.fetchAutomaticValue(),
				client.shutter.fetchStatus(),
				client.shutter.fetchAutomaticStatus(),
			]);
		},
		notifications: {
			value: [
				'Camera.Shutter.Enabled',
				'Camera.Shutter.Slow.Enabled',
				'Camera.Shutter.Slow.Frames',
				'Camera.Shutter.ECS.Enabled',
				'Camera.Shutter.Mode',
				'Camera.Shutter.Value',
				'Camera.Shutter.SettingMethod',
				'P.Menu.pmw-f5x.Event.EventID',
			],
			status: ['Camera.Shutter.Enabled', 'Camera.Shutter.SettingMethod'],
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
		notifications: {
			value: [
				'Camera.SlowAndQuickMotion.Enabled',
				'Camera.SlowAndQuickMotion.FrameRate',
				'Camera.SlowAndQuickMotion.HighFrameRate.Enabled',
				'P.Menu.pmw-f5x.Event.EventID',
			],
			status: ['Camera.SlowAndQuickMotion.Enabled'],
		},
	},
	{
		id: 'systemMessages',
		name: 'system messages',
		fetch: async (client) => client.systemMessages.fetchValue(),
		notifications: { value: ['System.Error', 'System.Warning'] },
	},
	{
		id: 'uploadJobs',
		name: 'upload jobs',
		fetch: async (client) => client.uploadJobs.fetchValue(),
		notifications: {
			value: [
				'Network.Service.Upload.Progress.Service',
				'Network.Service.Upload.Progress.Drive',
				'Network.Service.Upload.Progress.ClipName',
				'Network.Service.Upload.Progress.Status',
				'Network.Service.Upload.Progress.Percentage',
				'Network.Service.Upload.Progress.Total',
				'Network.Service.Upload.Progress.Transferred',
				'Network.Service.Upload.Progress.Name',
				'Network.Service.Upload.History.Service',
				'Network.Service.Upload.History.Drive',
				'Network.Service.Upload.History.ClipName',
				'Network.Service.Upload.History.Status',
				'Network.Service.Upload.History.Percentage',
				'Network.Service.Upload.History.Total',
				'Network.Service.Upload.History.Transferred',
				'Network.Service.Upload.History.Name',
			],
		},
		throttleMs: 250,
	},
	{
		id: 'uploadSettings',
		name: 'upload settings',
		fetch: async (client) => {
			await Promise.all([client.uploadSettings.fetchValue(), client.uploadSettings.fetchCredentialStatus()]);
		},
		notifications: {
			value: [
				'Network.Service.Upload.Name',
				'Network.Service.Upload.DisplayName',
				'Network.Service.Upload.Option',
				'Network.Service.Upload.Credential',
				'Network.Service.Upload.DefaultService',
				'System.Network.Publickey.Status',
			],
			status: ['Network.Service.Upload.Credential'],
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
		notifications: {
			value: [
				'Camera.WhiteBalance.ColorTemperature.MemoryValue',
				'Camera.WhiteBalance.Mode',
				'Camera.WhiteBalance.AutoAdjust.Enabled',
				'Camera.WhiteBalance.SettingMethod',
				'P.Menu.pmw-f5x.Event.EventID',
			],
			status: [
				'Camera.WhiteBalance.ColorTemperature.Value',
				'Camera.WhiteBalance.AutoAdjust.Enabled',
				'Camera.WhiteBalance.SettingMethod',
			],
		},
	},
	{
		id: 'zoom',
		name: 'zoom',
		fetch: async (client) => {
			await Promise.all([client.zoom.fetchValue(), client.zoom.fetchStatus()]);
		},
		notifications: {
			value: ['Camera.Zoom.Value', 'Camera.Zoom.Velocity'],
			status: ['Camera.Zoom.Value'],
		},
	},
] as const;
