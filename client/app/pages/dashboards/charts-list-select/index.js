import {
  pick,
  some,
  find,
  minBy,
  map,
  intersection,
  isArray,
  isObject
} from 'lodash';
import {
  SCHEMA_NOT_SUPPORTED,
  SCHEMA_LOAD_ERROR
} from '@/services/data-source';
import getTags from '@/services/getTags';
import { policy } from '@/services/policy';
import Notifications from '@/services/notifications';
import ScheduleDialog from '@/components/queries/ScheduleDialog';
import notification from '@/services/notification';

import {DashboardsPreview} from "@/components/dashboards-preview/dashboards-preview";
import template from './content-layout.html';

function ChartsListSelectViewCtrl(
  $scope,
  Events,
  $route,
  $routeParams,
  $location,
  $window,
  $q,
  KeyboardShortcuts,
  Title,
  AlertDialog,
  clientConfig,
  $uibModal,
  currentUser,
  Query,
  DataSource,
  Visualization,
  appSettings
) {
  $scope.currentUser = currentUser;
  $scope.displayType = null;
  $scope.displayId = null;
  $scope.dashboard = this.dashboard;
  $scope.showPermissionsControl = clientConfig.showPermissionsControl;

  $scope.querySearchCb = (type, id) => {
    $scope.displayType = type;
    $scope.displayId = id;
    $scope.$apply();
  };

  $scope.getVisCb = (vis,params) => {
    this.selectWidgetCb(vis,params);
  };

  // currentUser.hasPermission('admin');
}

// eslint-disable-next-line import/prefer-default-export
export const ChartsListSelectView = {
  template,
  bindings: {
    selectWidgetCb:'<',
    dashboard:'<'
  },
  controller: ChartsListSelectViewCtrl
};

export default function init(ngModule) {
  ngModule.component('chartsListSelectView', ChartsListSelectView);
}

init.init = true;
