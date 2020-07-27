import { appSettingsConfig } from '@/config/app-settings';
import template from './public-visualization.html';
import './public-visualization.less';

const BK_URL = appSettingsConfig.server.backendUrl;

function loadVisualization($http, $route) {
  const token = $route.current.params.token;
  console.log("loadVisualization");
  return $http
    .get(BK_URL + `/api/visualizations/public/${token}`)
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
          id: 'widget#-public',
          visualization: this.visualization,
          options: {
            position: {
              autoHeight: true,
              sizeX: 6,
              col: 0
            },
            isHidden: false,
            parameterMappings: {}
          }
        }
      ])
    };

    const refreshRate = Math.max(1, parseFloat($location.search().refresh));
    // const refreshRate = 10;

    if (refreshRate) {
      const refresh = () => {
        // console.log(refreshRate);
       
        loadVisualization($http, $route).then(data => {
          // console.log(data);
          this.dashboard.widgets[0].visualization= data;
          // this.visualization = data;
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
