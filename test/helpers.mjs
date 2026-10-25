import { ModuleInstance } from '../dist/main.js';
import { SavonaClient } from '@ckohen/savona';

export const config = { host: 'example.invalid', port: 80, enableFeedbacks: true, showAudioVariables: false };
export const secrets = { username: 'test', password: 'test' };

export function deferred() {
	let resolve;
	let reject;
	const promise = new Promise((resolvePromise, rejectPromise) => {
		resolve = resolvePromise;
		reject = rejectPromise;
	});
	return { promise, resolve, reject };
}

export function setClientState(client, state) {
	Object.defineProperty(client, 'state', { value: state, configurable: true });
}

export function createClient() {
	const client = new SavonaClient(config.host, secrets.username, secrets.password);
	setClientState(client, 'connected');
	return client;
}

export function createModule(t) {
	const values = {};
	const publications = [];
	const statuses = [];
	const logs = [];
	const instance = new ModuleInstance({
		_isInstanceContext: true,
		id: 'test',
		setActionDefinitions() {},
		setFeedbackDefinitions() {},
		setPresetDefinitions() {},
		setVariableDefinitions() {},
		setVariableValues(update) {
			publications.push(update);
			Object.assign(values, update);
		},
		checkFeedbacks() {},
		updateStatus(status, message) {
			statuses.push({ status, message });
		},
	});
	t.mock.method(instance, 'log', (level, message) => logs.push({ level, message }));
	instance.config = { ...config };
	t.after(async () => instance.destroy());
	return { instance, values, publications, statuses, logs };
}

export function attachClient(fixture, client = createClient()) {
	fixture.instance.client = client;
	fixture.instance.isReady = true;
	fixture.instance.cacheCoordinator.bind(client);
	return client;
}

export function uploadResponse(status) {
	return {
		'Network.Service.Upload.Progress.Service': { 1001: 1001 },
		'Network.Service.Upload.Progress.Status': { 1001: status },
		'Network.Service.Upload.Progress.ClipName': { 1001: 'TEST0001' },
	};
}
