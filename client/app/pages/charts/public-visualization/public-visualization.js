import template from './public-visualization.html';

import './public-visualization.less';

function loadVisualization($http, $route, appSettings) {
  const token = $route.current.params.token;
  return $http
    .get(appSettings.server.backendUrl + `/api/visualizations/public/${token}`)
    .then(response => response.data);
}

const PublicVisualizationPage = {
  template,
  bindings: {
    visualization: '<'
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

    Title.set(this.visualization.name);

    this.dashboard = {
      widgets: Dashboard.prepareDashboardWidgets([
        {
          id:'widget#-public',
          visualization: this.visualization,
          options: {
            position:{
              autoHeight: true,
              sizeX: 6,
              col: 0
            },
            isHidden:false,
            parameterMappings: {}
          }
        }
      ])
    };

    const refreshRate = Math.max(30, parseFloat($location.search().refresh));

    if (refreshRate) {
      const refresh = () => {
        loadVisualization($http, $route).then(data => {
          this.visualization = data;
          $timeout(refresh, refreshRate * 1000.0);
        });
      };

      $timeout(refresh, refreshRate * 1000.0);
    }
  }
};

export default function init(ngModule) {
  ngModule.component('publicVisualizationPage', PublicVisualizationPage);

  function loadPublicVisualization($http, $route, appSettings) {
    'ngInject';

    return loadVisualization($http, $route, appSettings);
  }

  function session($http, $route, Auth) {
    const token = $route.current.params.token;
    Auth.setApiKey(token);
    return Auth.loadConfig();
  }

  ngModule.config($routeProvider => {
    $routeProvider.when('/public/visualizations/:token', {
      template:
        '<public-visualization-page visualization="$resolve.visualization"></public-visualization-page>',
      layout: 'dashboardView',
      pageID: 'publicShare',
      reloadOnSearch: false,
      resolve: {
        visualization: loadVisualization,
        session
      }
    });
  });

  return [];
}

init.init = true;
