// eslint-disable-line import/no-mutable-exports

export default function init(ngModule) {
  ngModule.run(($httpBackend) => {
    $httpBackend.whenGET('api/organization/status').respond(
      {
        object_counters: {
          queries: 0,
          alerts: 0,
          dashboards: 0,
          users: 1,
          data_sources: 0,
        },
      },
    );

    $httpBackend.whenGET('api/queries/favorites').respond(
      {
        count: 0,
        page: 1,
        page_size: 25,
        results: [],
      },
    );

    $httpBackend.whenGET('api/dashboards/favorites').respond(
      {
        count: 0,
        page: 1,
        page_size: 25,
        results: [],
      },
    );

    $httpBackend.whenGET('api/queries/favorites').respond(
      {
        count: 0,
        page: 1,
        page_size: 25,
        results: [],
      },
    );

    $httpBackend.whenGET('api/dashboards/favorites').respond(
      {
        count: 0,
        page: 1,
        page_size: 25,
        results: [],
      },
    );

    $httpBackend.whenPOST('api/events').respond(
      null,
    );

    $httpBackend.whenGET('api/session').respond(
      {
        org_slug: 'default',
        messages: [],
        user: {
          name: '中科蜂巢科技测试用户',
          profile_image_url: 'https://www.gravatar.com/avatar/53444f91e698c0c7caa2dbc3bdbf93fc?s=40&d=identicon',
          id: 1,
          groups: [1, 2],
          email: 'demo@demo.com',
          permissions: ['admin', 'super_admin', 'create_dashboard', 'create_query', 'edit_dashboard', 'edit_query', 'view_query', 'view_source', 'execute_query', 'list_users', 'schedule_query', 'list_dashboards', 'list_alerts', 'list_data_sources'],
        },
        client_config: {
          allowScriptsInUserInput: false,
          googleLoginEnabled: false,
          dateFormatList: ['DD/MM/YY', 'YYYY-MM-DD', 'MM/DD/YY'],
          pageSize: 20,
          showPermissionsControl: false,
          dateFormat: 'DD/MM/YY',
          floatFormat: '0,0.00',
          mailSettingsMissing: true,
          basePath: 'http://localhost:8080/',
          autoPublishNamedQueries: true,
          queryRefreshIntervals: [60, 300, 600, 900, 1800, 3600, 7200, 10800, 14400, 18000, 21600, 25200, 28800,
            32400, 36000, 39600, 43200, 86400, 604800, 1209600, 2592000],
          version: '0.0.1',
          dashboardRefreshIntervals: [60, 300, 600, 1800, 3600, 43200, 86400],
          integerFormat: '0,0',
          dateTimeFormat: 'DD/MM/YY HH:mm',
          newVersionAvailable: false,
          allowCustomJSVisualizations: false,
          pageSizeOptions: [5, 10, 20, 50, 100],
          tableCellMaxJSONSize: 50000,
        },
      },
    );
  });
}

init.init = true;
