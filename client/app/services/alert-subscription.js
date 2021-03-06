export let AlertSubscription = null; // eslint-disable-line import/no-mutable-exports

function AlertSubscriptionService($resource, appSettings) {
  return $resource(appSettings.server.backendUrl + '/api/alerts/:alertId/subscriptions/:subscriberId', { alertId: '@alert_id', subscriberId: '@id' });
}

export default function init(ngModule) {
  ngModule.factory('AlertSubscription', AlertSubscriptionService);

  ngModule.run(($injector) => {
    AlertSubscription = $injector.get('AlertSubscription');
  });
}

init.init = true;
