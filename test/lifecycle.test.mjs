import assert from 'node:assert/strict';
import { setImmediate as nextTurn } from 'node:timers/promises';
import { test } from 'node:test';
import { SavonaClient, SavonaEvent } from '@ckohen/savona';
import { InstanceStatus } from '@companion-module/base';
import { config, createModule, deferred, secrets, setClientState } from './helpers.mjs';

function mockConnection(t) {
	const connect = t.mock.method(SavonaClient.prototype, 'connect', async function () {
		setClientState(this, 'connected');
		this.emit(SavonaEvent.Connect);
	});
	const disconnect = t.mock.method(SavonaClient.prototype, 'disconnect', async function () {
		setClientState(this, 'disconnected');
		this.emit(SavonaEvent.Disconnect, 1000);
	});
	return { connect, disconnect };
}

test('initial connect and every reconnect wait for refreshed state before becoming ready', async (t) => {
	mockConnection(t);
	const fixture = createModule(t);
	let pending = deferred();
	const refresh = t.mock.method(fixture.instance.cacheCoordinator, 'refreshAll', async () => {
		const client = fixture.instance.client;
		await pending.promise;
		fixture.instance.cacheCoordinator.markUpdated(client, 'record');
	});
	const startup = fixture.instance.configUpdated(config, secrets);
	await nextTurn();
	const client = fixture.instance.client;
	assert.equal(fixture.instance.readyClient, null);
	assert.notEqual(fixture.statuses.at(-1).status, InstanceStatus.Ok);
	pending.resolve();
	await startup;
	assert.equal(fixture.instance.readyClient, client);
	assert.equal(fixture.values.record_status, 'Standby');

	setClientState(client, 'disconnected');
	client.emit(SavonaEvent.Disconnect, 1006);
	assert.equal(fixture.values.record_status, undefined);
	assert.equal(fixture.instance.readyClient, null);
	pending = deferred();
	client.record.status = 'Recording';
	setClientState(client, 'connected');
	client.emit(SavonaEvent.Connect);
	assert.equal(fixture.instance.readyClient, null);
	pending.resolve();
	await nextTurn();
	assert.equal(refresh.mock.callCount(), 2);
	assert.equal(fixture.values.record_status, 'Recording');
	assert.equal(fixture.instance.readyClient, client);
});

test('replacing a client detaches handlers and ignores its unfinished initialization', async (t) => {
	const { disconnect } = mockConnection(t);
	const fixture = createModule(t);
	const firstRefresh = deferred();
	let refreshes = 0;
	t.mock.method(fixture.instance.cacheCoordinator, 'refreshAll', async () => {
		if (++refreshes === 1) await firstRefresh.promise;
	});
	const firstConfig = fixture.instance.configUpdated(config, secrets);
	await nextTurn();
	const oldClient = fixture.instance.client;
	await fixture.instance.configUpdated({ ...config, host: 'replacement.invalid' }, secrets);
	const replacement = fixture.instance.client;
	assert.notEqual(replacement, oldClient);
	assert.equal(disconnect.mock.calls[0].this, oldClient);
	assert.equal(oldClient.listenerCount(SavonaEvent.Connect), 0);
	assert.equal(oldClient.listenerCount(SavonaEvent.CacheUpdate), 0);
	const statuses = fixture.statuses.length;
	firstRefresh.resolve();
	await firstConfig;
	oldClient.emit(SavonaEvent.Connect);
	oldClient.emit(SavonaEvent.Disconnect, 1006);
	assert.equal(fixture.instance.readyClient, replacement);
	assert.equal(fixture.statuses.length, statuses);
});

test('destroy during connection setup cannot schedule a later retry', async (t) => {
	t.mock.timers.enable({ apis: ['setTimeout'] });
	const attempt = deferred();
	const connect = t.mock.method(SavonaClient.prototype, 'connect', async () => attempt.promise);
	t.mock.method(SavonaClient.prototype, 'disconnect', async () => {});
	const fixture = createModule(t);
	const startup = fixture.instance.configUpdated(config, secrets);
	await nextTurn();
	await fixture.instance.destroy();
	attempt.reject(new Error('camera offline'));
	await startup;
	t.mock.timers.tick(20_000);
	assert.equal(connect.mock.callCount(), 1);
	assert.equal(fixture.instance.client, null);
	assert.equal(fixture.instance.isReady, false);
});

test('initial connection failure retries, and destroy cancels the next retry', async (t) => {
	t.mock.timers.enable({ apis: ['setTimeout'] });
	const connect = t.mock.method(SavonaClient.prototype, 'connect', async () => {
		throw new Error('camera offline');
	});
	t.mock.method(SavonaClient.prototype, 'disconnect', async () => {});
	const fixture = createModule(t);
	await fixture.instance.configUpdated(config, secrets);
	t.mock.timers.tick(10_000);
	await nextTurn();
	assert.equal(connect.mock.callCount(), 2);
	await fixture.instance.destroy();
	t.mock.timers.tick(20_000);
	assert.equal(connect.mock.callCount(), 2);
});

test('authentication failures use authentication status without a retry loop', async (t) => {
	t.mock.timers.enable({ apis: ['setTimeout'] });
	const error = new Error('Linear Response Error');
	error.data = [403, 'Authentication failed'];
	const connect = t.mock.method(SavonaClient.prototype, 'connect', async () => {
		throw error;
	});
	t.mock.method(SavonaClient.prototype, 'disconnect', async () => {});
	const fixture = createModule(t);
	await fixture.instance.configUpdated(config, secrets);
	assert.equal(fixture.statuses.at(-1).status, InstanceStatus.AuthenticationFailure);
	t.mock.timers.tick(20_000);
	assert.equal(connect.mock.callCount(), 1);
});

test('a newer configuration wins while the previous client is still disconnecting', async (t) => {
	const { connect } = mockConnection(t);
	const fixture = createModule(t);
	t.mock.method(fixture.instance.cacheCoordinator, 'refreshAll', async () => {});
	await fixture.instance.configUpdated(config, secrets);
	const oldClient = fixture.instance.client;
	const disconnected = deferred();
	t.mock.method(oldClient, 'disconnect', async () => disconnected.promise);
	const supersededConfig = fixture.instance.configUpdated({ ...config, host: 'superseded.invalid' }, secrets);
	await nextTurn();
	await fixture.instance.configUpdated({ ...config, host: 'latest.invalid' }, secrets);
	const latestClient = fixture.instance.client;
	disconnected.resolve();
	await supersededConfig;
	assert.equal(latestClient.hostname, 'latest.invalid:80');
	assert.equal(fixture.instance.readyClient, latestClient);
	assert.equal(connect.mock.callCount(), 2);
});

test('an interrupted initialization cannot mark the next connection ready early', async (t) => {
	mockConnection(t);
	const fixture = createModule(t);
	const initialRefresh = deferred();
	const reconnectRefresh = deferred();
	let refreshes = 0;
	t.mock.method(fixture.instance.cacheCoordinator, 'refreshAll', async () => {
		await (++refreshes === 1 ? initialRefresh.promise : reconnectRefresh.promise);
	});
	const startup = fixture.instance.configUpdated(config, secrets);
	await nextTurn();
	const client = fixture.instance.client;
	setClientState(client, 'disconnected');
	client.emit(SavonaEvent.Disconnect, 1006);
	setClientState(client, 'connected');
	client.emit(SavonaEvent.Connect);
	initialRefresh.resolve();
	await startup;
	assert.equal(fixture.instance.readyClient, null);
	reconnectRefresh.resolve();
	await nextTurn();
	assert.equal(fixture.instance.readyClient, client);
});
