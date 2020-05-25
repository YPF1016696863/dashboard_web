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

    dashboards: {
      method: 'GET', cache: false, isArray: true, url: appSettings.server.backendUrl + '/api/groups/:id/dashboards',
    },
    addDashboard: {
      method: 'POST', url: appSettings.server.backendUrl + '/api/groups/:id/dashboards',
    },
    removeDashboard: {
      method: 'DELETE', url: appSettings.server.backendUrl + '/api/groups/:id/dashboards/:dashboard_id',
    },
    updateDashboardPermission: {
      method: 'POST', url: appSettings.server.backendUrl + '/api/groups/:id/dashboards/:dashboard_id',
    },
    groupsByDashboardId: {
      method: 'GET', cache: false, isArray: true, url: appSettings.server.backendUrl + '/api/groups/:id/dashboard_groups',
    },

    queries: {
      method: 'GET', cache: false, isArray: true, url: appSettings.server.backendUrl + '/api/groups/:id/queries',
    },
    addQuery: {
      method: 'POST', url: appSettings.server.backendUrl + '/api/groups/:id/queries',
    },
    removeQuery: {
      method: 'DELETE', url: appSettings.server.backendUrl + '/api/groups/:id/queries/:query_id',
    },
    updateQueryPermission: {
      method: 'POST', url: appSettings.server.backendUrl + '/api/groups/:id/queries/:query_id',
    },
    groupsByQueryId: {
      method: 'GET', cache: false, isArray: true, url: appSettings.server.backendUrl + '/api/groups/:id/query_groups',
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
