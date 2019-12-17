import * as _ from 'lodash';
import PromiseRejectionError from '@/lib/promise-rejection-error';
import { policy } from '@/services/policy';

import { durationHumanize } from '@/filters';
import template from './dashboard-view.html';

import './dashboard-view.less';

function ViewDashboardCtrl(
  $routeParams,
  $location,
  $timeout,
  $q,
  $uibModal,
  $scope,
  $rootScope,
  Title,
  AlertDialog,
  Dashboard,
  currentUser,
  clientConfig,
  Events,
  appSettings
) {
  this.saveInProgress = false;
  const vm = this;

  $scope.$watch(
    function() {
      return vm.slugId;
    },
    function(data) {
      vm.loadDashboard();
    }
  );

  $scope.$watch(
    function() {
      return vm.widgetData;
    },
    function(data) {
      if (vm.widgetData && vm.widgetData.widget) {
        vm.addWidget(
          vm.widgetData.widget,
          vm.widgetData.paramMapping ? vm.widgetData.paramMapping : {}
        );
      }
    }
  );

  $scope.$watch(
      function() {
        return vm.dashboardBgImg;
      },
      function(data) {
        if(_.isEmpty(vm.dashboardBgImg)) {
          vm.dashboardStyle = {
          };
          return;
        }
        vm.dashboardStyle = {
          'background-image': 'url("'+vm.dashboardBgImg+'")',
          'background-position': 'center',
          'background-repeat': 'no-repeat',
          'background-size': 'cover'
        };
      }
  );

  this.saveDelay = false;
  this.editBtnClickedWhileSaving = false;
  this.layoutEditing = false;
  this.isFullscreen = false;
  this.refreshRate = null;
  this.isGridDisabled = false;
  this.updateGridItems = null;
  this.showPermissionsControl = clientConfig.showPermissionsControl;
  this.globalParameters = [];
  this.isDashboardOwner = false;
  this.isLayoutDirty = false;

  // Dashboard Header default style

  const bodyBackgroundImage = $rootScope.theme.bodyBackgroundImage
    ? $rootScope.theme.bodyBackgroundImage
    : '';
  const widgetBackgroundColor = bodyBackgroundImage
    ? 'widget-dark-theme-bg2 '
    : 'widget-dark-theme';

  $rootScope.theme = {
    theme: 'dark',
    bodyBackgroundColor: 'dashboard-dark-theme',
    bodyBackgroundImage,
    dashboardHeaderBackgroundColor: 'widget-dark-theme',
    dashboardHeaderTitleColor: 'header-title-dark-theme',
    widgetBackgroundColor,
    queryLinkTextColor: 'query-link-dark-theme',
    widgetHeaderTextColor: 'widget-header-text-dark-theme',
    widgetFooterTextColor: 'widget-footer-text-dark-theme',
    widgetActionPanelBackgroundColor: 'widget-action-panel-dark-theme',
    dashboardFooterFontColor: 'dashboard-footer-font-color-dark-theme',
    dashboardTableTextColor: 'dashboard-widget-table-text-dark-theme',
    dashboardTableHeaderTextColor:
      'dashboard-widget-table-header-text-dark-theme',
    dashboardWidgetScrollBar: 'dashboard-widget-scrollbox-dark',
    dashboardHeaderButtonColor: true
  };
  //

  this.refreshRates = clientConfig.dashboardRefreshIntervals.map(interval => ({
    name: durationHumanize(interval),
    rate: interval,
    enabled: true
  }));

  const allowedIntervals = policy.getDashboardRefreshIntervals();

  if (_.isArray(allowedIntervals)) {
    _.each(this.refreshRates, rate => {
      rate.enabled = allowedIntervals.indexOf(rate.rate) >= 0;
    });
  }

  this.setRefreshRate = (rate, load = true) => {
    this.refreshRate = rate;
    if (rate !== null) {
      if (load) {
        this.refreshDashboard();
      }
      this.autoRefresh();
    }
  };

  this.extractGlobalParameters = () => {
    this.globalParameters = this.dashboard.getParametersDefs();
  };

  $scope.$on('dashboard.update-parameters', () => {
    this.extractGlobalParameters();
  });

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
    collectFilters(dashboard, force);
  };

  this.loadDashboard = _.throttle(force => {
    Dashboard.get(
      { slug: this.slugId },
      dashboard => {
        this.dashboard = dashboard;

        // Get dashboard style
        this.dashboardStyle = {
          'background-image': 'url("'+dashboard.background_image+'")',
          'background-position': 'center',
          'background-repeat': 'no-repeat',
          'background-size': 'cover'
        };

        this.isDashboardOwner =
          currentUser.id === dashboard.user.id ||
          currentUser.hasPermission('admin');
        Events.record('view', 'dashboard', dashboard.id);
        renderDashboard(dashboard, force);

        if ($location.search().refresh !== undefined) {
          if (this.refreshRate === null) {
            const refreshRate = Math.max(
              30,
              parseFloat($location.search().refresh)
            );

            this.setRefreshRate(
              {
                name: durationHumanize(refreshRate),
                rate: refreshRate
              },
              false
            );
          }
        }
      },
      rejection => {
        const statusGroup = Math.floor(rejection.status / 100);
        if (statusGroup === 5) {
          // recoverable errors - all 5** (server is temporarily unavailable
          // for some reason, but it should get up soon).
          this.loadDashboard();
        } else {
          // all kind of 4** errors are not recoverable, so just display them
          throw new PromiseRejectionError(rejection);
        }
      }
    );
  }, 1000);

  // this.loadDashboard();

  this.refreshDashboard = () => {
    renderDashboard(this.dashboard, true);
  };

  this.autoRefresh = () => {
    $timeout(() => {
      this.refreshDashboard();
    }, this.refreshRate.rate * 1000).then(() => this.autoRefresh());
  };

}

// eslint-disable-next-line import/prefer-default-export
export const ViewDashboard = {
  template,
  bindings: {
    slugId: '<',
    widgetData: '<',
    dashboardBgImg: '<',
    editing:'<'
  },
  controller: ViewDashboardCtrl
};

export default function init(ngModule) {
  ngModule.component('viewDashboard', ViewDashboard);
}

init.init = true;
