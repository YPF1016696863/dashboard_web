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

import template from './content-layout.html';

function DashboardsListViewCtrl(
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
  Dashboard,
  Visualization,
  appSettings
) {
  $scope.currentUser = currentUser;
  $scope.slugId = null;
  $scope.showPermissionsControl = clientConfig.showPermissionsControl;

  $scope.dashboardSearchCb = (slug) => {
    $scope.slugId = slug&&slug.length?slug[0]:null;
    $scope.$apply();
  };

  // currentUser.hasPermission('admin');

}

export default function init(ngModule) {
  ngModule.controller('DashboardsListViewCtrl', DashboardsListViewCtrl);

  return {
    '/dashboards': {
      template,
      layout: 'fixed',
      controller: 'DashboardsListViewCtrl',
      reloadOnSearch: false
    }
  };
}

init.init = true;
