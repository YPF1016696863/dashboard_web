import * as _ from "lodash";

import template from './public-dashboard.html';

import './public-dashboard.less';
import { Widget } from '@/services/widget';
import { Dashboard } from '@/services/dashboard';

function loadToken($route, appSettings) {
  return Promise.resolve($route.current.params.token);
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
    $q,
    $route,
    dashboardGridOptions,
    Title,
    appSettings
  ) {
    'ngInject';

    this.globalParameters = [];
    this.dashboard = null;

    const vm = this;

    this.extractGlobalParameters = () => {
      this.globalParameters = this.dashboard.getParametersDefs();
      // 由参数设置url
      const params = _.extend({}, $location.search());
      this.globalParameters.forEach((param) => {
        _.extend(params, param.toUrlParams());
      });
      $location.search(params);
    };

    const collectFilters = (dashboard, forceRefresh) => {
      const queryResultPromises = _.compact(
          this.dashboard.widgets.map(widget => {
            widget.getParametersDefs(); // Force widget to read parameters values from URL
            return widget.load(forceRefresh);
          })
      );

      $q.all(queryResultPromises).then(queryResults => {
        const filters = {};
        queryResults.forEach(queryResult => {
          const queryFilters = queryResult.getFilters();
          queryFilters.forEach(queryFilter => {
            const hasQueryStringValue = _.has(
                $location.search(),
                queryFilter.name
            );

            if (!(hasQueryStringValue || dashboard.dashboard_filters_enabled)) {
              // If dashboard filters not enabled, or no query string value given,
              // skip filters linking.
              return;
            }

            if (hasQueryStringValue) {
              queryFilter.current = $location.search()[queryFilter.name];
            }

            if (!_.has(filters, queryFilter.name)) {
              const filter = _.extend({}, queryFilter);
              filters[filter.name] = filter;
              filters[filter.name].originFilters = [];
            }

            // TODO: merge values.
            filters[queryFilter.name].originFilters.push(queryFilter);
          });
        });

        this.filters = _.values(filters);
        this.filtersOnChange = filter => {
          _.each(filter.originFilters, originFilter => {
            originFilter.current = filter.current;
          });
        };
      });
    };

    const renderDashboard = (dashboard, force) => {
      Title.set(dashboard.name);
      this.extractGlobalParameters();
      // collectFilters(dashboard, force);
    };

/*
    this.dashboard.widgets = Dashboard.prepareDashboardWidgets(
      this.dashboard.widgets
    );
*/

    Dashboard.public({ token: $route.current.params.token }, dashboard => {

      this.dashboard = dashboard;

      Title.set(this.dashboard.name);

      this.dashboardStyle = {
        'background-image': 'url("' + this.dashboard.background_image + '")',
        'background-position': 'center',
        'background-repeat': 'no-repeat',
        'background-size': 'cover'
      };

      renderDashboard(dashboard, true);

    });

    $scope.$on('dashboard.update-parameters', () => {
      this.extractGlobalParameters();
    });

    this.openParamDraw = false;
    this.openParameterDialog = ()=>{
      this.openParamDraw = true;
    }
    this.onPramClose = ()=>{
      this.openParamDraw = false;
    }
    this.onSubmit = (updatedParameters)=>{
      // Read parameter and reset url
      // 由参数设置url
      const params = _.extend({}, $location.search());
      updatedParameters.forEach((param) => {
        _.extend(params, param.toUrlParams());
      });
      $location.search(params);
      this.refreshDashboard();
      $scope.$applyAsync();
      this.openParamDraw = false;
    }

    const refreshRate = Math.max(30, parseFloat($location.search().refresh));

    if (refreshRate) {
      const refresh = () => {
      };

      $timeout(refresh, refreshRate * 1000.0);
    }

    this.refreshDashboard = () => {
      renderDashboard(this.dashboard, true);
    };

  }
};

export default function init(ngModule) {
  ngModule.component('publicDashboardPage', PublicDashboardPage);

  function loadPublicToken($route, appSettings) {
    'ngInject';

    return loadToken($route, appSettings);
  }

  function session($http, $route, Auth) {
    const token = $route.current.params.token;
    Auth.setApiKey(token);
    return Auth.loadConfig();
  }

  ngModule.config($routeProvider => {
    $routeProvider.when('/public/dashboards/:token', {
      template:
        '<public-dashboard-page></public-dashboard-page>',
      layout: 'dashboardView',
      pageID: 'publicShare',
      reloadOnSearch: false,
      resolve: {
        session
      }
    });
  });

  return [];
}

init.init = true;
