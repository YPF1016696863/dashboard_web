export let Group = {}; // eslint-disable-line import/no-mutable-exports

function GroupService($resource, appSettings) {
  const actions = {
    get: { method: 'GET', cache: false, isArray: false },
    query: { method: 'GET', cache: false, isArray: true },

    members: {
      method: 'GET', cache: false, isArray: true, url: appSettings.server.backendUrl + '/api/groups/:id/members',
    },
    addMember: {
      method: 'POST', url: appSettings.server.backendUrl + '/api/groups/:id/members',
    },
    removeMember: {
      method: 'DELETE', url: appSettings.server.backendUrl + '/api/groups/:id/members/:userId',
    },

    dataSources: {
      method: 'GET', cache: false, isArray: true, url: appSettings.server.backendUrl + '/api/groups/:id/data_sources',
    },
    addDataSource: {
      method: 'POST', url: appSettings.server.backendUrl + '/api/groups/:id/data_sources',
    },
    removeDataSource: {
      method: 'DELETE', url: appSettings.server.backendUrl + '/api/groups/:id/data_sources/:dataSourceId',
    },
    updateDataSource: {
      method: 'POST', url: appSettings.server.backendUrl + '/api/groups/:id/data_sources/:dataSourceId',
    },
  };
  return $resource(appSettings.server.backendUrl + '/api/groups/:id', { id: '@id' }, actions);
}

export default function init(ngModule) {
  ngModule.factory('Group', GroupService);

  ngModule.run(($injector) => {
    Group = $injector.get('Group');
  });
}

init.init = true;
