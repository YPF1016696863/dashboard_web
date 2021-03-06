import * as _ from 'lodash';
import PromiseRejectionError from '@/lib/promise-rejection-error';
import getTags from '@/services/getTags';
import { policy } from '@/services/policy';
import { Widget } from '@/services/widget';
import {
  editableMappingsToParameterMappings,
  synchronizeWidgetTitles
} from '@/components/ParameterMappingInput';
import { durationHumanize } from '@/filters';
import template from './dashboards-preview.html';
import AddWidgetDialog from '@/components/dashboards/AddWidgetDialog';
import TextboxDialog from '@/components/dashboards/TextboxDialog';
import notification from '@/services/notification';

import './dashboards-preview.less';

function isWidgetPositionChanged(oldPosition, newPosition) {
  const fields = ['col', 'row', 'sizeX', 'sizeY', 'autoHeight'];
  oldPosition = _.pick(oldPosition, fields);
  newPosition = _.pick(newPosition, fields);
  return !!_.find(fields, key => newPosition[key] !== oldPosition[key]);
}

function getWidgetsWithChangedPositions(widgets) {
  return _.filter(widgets, widget => {
    if (!_.isObject(widget.$originalPosition)) {
      return true;
    }
    return isWidgetPositionChanged(
      widget.$originalPosition,
      widget.options.position
    );
  });
}

function DashboardPreviewCtrl(
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
  appSettings,
  $translate
) {
  this.saveInProgress = false;
  this.saveDelay = false;
  const vm = this;
  const updateDashboard = data => {

    if (!this.dashboard) {
      return;
    }

    _.extend(this.dashboard, data);
    data = _.extend({}, data, {
      slug: this.dashboard.id,
      version: this.dashboard.version
    });
    Dashboard.save(
        data,
        dashboard => {
          _.extend(this.dashboard, _.pick(dashboard, _.keys(data)));
        },
        error => {
          if (error.status === 403) {
            notification.error('可视化面板更新失败', '许可拒绝。');
          } else if (error.status === 409) {
            notification.error(
                '此可视化面板似乎已经被另一个用户修改了。',
                '请复制/备份您的更改并重新加载此页。 ',
                { duration: null }
            );
          }
        }
    );
  };

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
        if(vm.widgetData.widget.text){
          vm.addTextbox(vm.widgetData.widget.text);
        }
        else{
          vm.addWidget(
            vm.widgetData.widget,
            vm.widgetData.paramMapping ? vm.widgetData.paramMapping : {}
          );
        }
      }      
    }
  );

  $scope.$watch(
      function() {
        return vm.dashboardBgImg;
      },
      function(data) {
        if(_.isEmpty(vm.dashboardBgImg) || vm.dashboardBgImg === "") {
          vm.dashboardStyle = {
          };
          updateDashboard({ background_image:"" });
          return;
        }
        vm.dashboardStyle = {
          'background-image': 'url("'+vm.dashboardBgImg+'")',
          'background-position': 'center',
          'background-repeat': 'no-repeat',
          'background-size': 'cover'
        };

        updateDashboard({ background_image:vm.dashboardBgImg });

      }
  );





  this.saveDashboardLayout = () => {
    if (!this.dashboard.canEdit()) {
      return;
    }

    this.isLayoutDirty = true;

    // calc diff, bail if none
    const changedWidgets = getWidgetsWithChangedPositions(
      this.dashboard.widgets
    );
    if (!changedWidgets.length) {
      this.isLayoutDirty = false;
      $scope.$applyAsync();
      return;
    }

    this.saveDelay = false;
    this.saveInProgress = true;
    return $q
      .all(_.map(changedWidgets, widget => widget.save()))
      .then(() => {
        this.isLayoutDirty = false;
        if (this.editBtnClickedWhileSaving) {
          this.layoutEditing = false;
        }
      })
      .catch(() => {
        // in the off-chance that a widget got deleted mid-saving it's position, an error will occur
        // currently left unhandled PR 3653#issuecomment-481699053
        notification.error('Error saving changes.');
      })
      .finally(() => {
        this.saveInProgress = false;
        this.editBtnClickedWhileSaving = false;
      });
  };

  const saveDashboardLayoutDebounced = () => {
    this.saveDelay = true;
    return _.debounce(() => this.saveDashboardLayout(), 2000)();
  };

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

        if ($location.search().edit === true) {
          $location.search('edit', null);
          this.editLayout(true);
        }
        this.editLayout(true);
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

  this.archiveDashboard = () => {
    const archive = () => {
      Events.record('archive', 'dashboard', this.dashboard.id);
      this.dashboard.$delete();
    };

    const title = '收回可视化面板';
    const message = `你确定你想要回收这个可视化面板 "${this.dashboard.name}" ?`;
    const confirm = { class: 'btn-warning', title: '收回' };

    AlertDialog.open(title, message, confirm).then(archive);
  };

  this.showManagePermissionsModal = () => {
    $uibModal.open({
      component: 'permissionsEditor',
      resolve: {
        aclUrl: {
          url:
            appSettings.server.backendUrl +
            `/api/dashboards/${this.dashboard.id}/acl`
        },
        owner: this.dashboard.user
      }
    });
  };

  this.onLayoutChanged = () => {
    // prevent unnecessary save when gridstack is loaded
    if (!this.layoutEditing) {
      return;
    }
    this.isLayoutDirty = true;
    saveDashboardLayoutDebounced();
  };

  this.editLayout = enableEditing => {
    this.layoutEditing = enableEditing;
  };

  this.loadTags = () =>
    getTags(appSettings.server.backendUrl + '/api/dashboards/tags').then(tags =>
      _.map(tags, t => t.name)
    );

  this.saveName = name => {
    updateDashboard({ name });
  };

  this.saveTags = tags => {
    updateDashboard({ tags });
  };

  this.updateDashboardFiltersState = () => {
    collectFilters(this.dashboard, false);
    Dashboard.save(
      {
        slug: this.dashboard.id,
        version: this.dashboard.version,
        dashboard_filters_enabled: this.dashboard.dashboard_filters_enabled
      },
      dashboard => {
        this.dashboard = dashboard;
      },
      error => {
        if (error.status === 403) {
          notification.error('名称修改失败', '许可拒绝。');
        } else if (error.status === 409) {
          notification.error(
            '此可视化面板似乎已经被另一个用户修改了。 ',
            '请复制/备份您的更改并重新加载此页。 ',
            { duration: null }
          );
        }
      }
    );
  };

  this.showAddTextboxDialog = () => {
    TextboxDialog.showModal({
      dashboard: this.dashboard,
      onConfirm: this.addTextbox,
      $translate
    });
  };

  this.addTextbox = text => {
    const widget = new Widget({
      dashboard_id: this.dashboard.id,
      options: {
        isHidden: false,
        position: {}
      },
      text,
      visualization: null,
      visualization_id: null
    });

    const position = this.dashboard.calculateNewWidgetPosition(widget);
    widget.options.position.col = position.col;
    widget.options.position.row = position.row;

    return widget.save().then(() => {
      this.dashboard.widgets.push(widget);
      this.onWidgetAdded();
    });
  };

  this.showAddWidgetDialog = () => {
    AddWidgetDialog.showModal({
      dashboard: this.dashboard,
      onConfirm: this.addWidget,
      $translate
    });
  };

  this.addWidget = (selectedVis, parameterMappings) => {
    const widget = new Widget({
      visualization_id: selectedVis && selectedVis.id,
      dashboard_id: this.dashboard.id,
      options: {
        isHidden: false,
        position: {},
        parameterMappings: editableMappingsToParameterMappings(
          parameterMappings
        )
      },
      visualization: selectedVis,
      text: ''
    });

    const position = this.dashboard.calculateNewWidgetPosition(widget);
    widget.options.position.col = position.col;
    widget.options.position.row = position.row;

    const widgetsToSave = [
      widget,
      ...synchronizeWidgetTitles(
        widget.options.parameterMappings,
        this.dashboard.widgets
      )
    ];

    return Promise.all(widgetsToSave.map(w => w.save())).then(() => {
      this.dashboard.widgets.push(widget);
      this.onWidgetAdded();
    });
  };

  this.onWidgetAdded = () => {
    this.extractGlobalParameters();
    // Save position of newly added widget (but not entire layout)
    const widget = _.last(this.dashboard.widgets);
    if (_.isObject(widget)) {
      return widget.save();
    }
    $scope.$applyAsync();
  };

  this.removeWidget = widgetId => {
    this.dashboard.widgets = this.dashboard.widgets.filter(
      w => w.id !== undefined && w.id !== widgetId
    );
    this.extractGlobalParameters();
    $scope.$applyAsync();

    if (!this.layoutEditing) {
      // We need to wait a bit while `angular` updates widgets, and only then save new layout
      $timeout(() => this.saveDashboardLayout(), 50);
    }
  };

  this.toggleFullscreen = () => {
    this.isFullscreen = !this.isFullscreen;
    document.querySelector('body').classList.toggle('headless');

    if (this.isFullscreen) {
      $location.search('fullscreen', true);
    } else {
      $location.search('fullscreen', null);
    }
  };

  this.togglePublished = () => {
    Events.record('toggle_published', 'dashboard', this.dashboard.id);
    this.dashboard.is_draft = !this.dashboard.is_draft;
    this.saveInProgress = true;
    Dashboard.save(
      {
        slug: this.dashboard.id,
        name: this.dashboard.name,
        is_draft: this.dashboard.is_draft
      },
      dashboard => {
        this.saveInProgress = false;
        this.dashboard.version = dashboard.version;
      }
    );
  };

  if (_.has($location.search(), 'fullscreen')) {
    this.toggleFullscreen();
  }

  this.openShareForm = () => {
    // check if any of the wigets have query parameters
    const hasQueryParams = _.some(
      this.dashboard.widgets,
      w => !_.isEmpty(w.getQuery() && w.getQuery().getParametersDefs())
    );
  };
}

// eslint-disable-next-line import/prefer-default-export
export const DashboardsPreview = {
  template,
  bindings: {
    slugId: '<',
    widgetData: '<',
    dashboardBgImg: '<',
    editing:'<'
  },
  controller: DashboardPreviewCtrl
};

export default function init(ngModule) {
  ngModule.component('dashboardsPreview', DashboardsPreview);
}

init.init = true;
