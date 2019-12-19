import template from './public-dashboard.html';

import './public-dashboard.less';

function loadDashboard($http, $route, appSettings) {
  const token = $route.current.params.token;
  return $http
    .get(appSettings.server.backendUrl + `/api/dashboards/public/${token}`)
    .then(response => response.data);
}

const PublicDashboardPage = {
  template,
  bindings: {
    dashboard: '<'
  },
  controller(
    $scope,
    $rootScope,
    $timeout,
    $location,
    $http,
    $route,
    dashboardGridOptions,
    Dashboard,
    Title
  ) {
    'ngInject';

    Title.set(this.dashboard.name);

    this.dashboard.widgets = Dashboard.prepareDashboardWidgets(
      this.dashboard.widgets
    );

    this.dashboardStyle = {
      'background-image': 'url("' + this.dashboard.background_image + '")',
      'background-position': 'center',
      'background-repeat': 'no-repeat',
      'background-size': 'cover'
    };

    const refreshRate = Math.max(30, parseFloat($location.search().refresh));

    if (refreshRate) {
      const refresh = () => {
        loadDashboard($http, $route).then(data => {
          this.dashboard = data;
          this.dashboard.widgets = Dashboard.prepareDashboardWidgets(
            this.dashboard.widgets
          );

          $timeout(refresh, refreshRate * 1000.0);
        });
      };

      $timeout(refresh, refreshRate * 1000.0);
    }
  }
};

export default function init(ngModule) {
  ngModule.component('publicDashboardPage', PublicDashboardPage);

  function loadPublicDashboard($http, $route, appSettings) {
    'ngInject';

    return loadDashboard($http, $route, appSettings);
  }

  function session($http, $route, Auth) {
    const token = $route.current.params.token;
    Auth.setApiKey(token);
    return Auth.loadConfig();
  }

  ngModule.config($routeProvider => {
    $routeProvider.when('/public/dashboards/:token', {
      template:
        '<public-dashboard-page dashboard="$resolve.dashboard"></public-dashboard-page>',
      layout: 'dashboardView',
      pageID: 'publicShare',
      reloadOnSearch: false,
      resolve: {
        dashboard: loadPublicDashboard,
        session
      }
    });
  });

  return [];
}

init.init = true;
