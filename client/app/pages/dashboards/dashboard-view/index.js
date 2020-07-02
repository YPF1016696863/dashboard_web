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

function DashboardViewCtrl(
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
  $scope.widgetData = null;
  $scope.dashboardBgImg="";
  $scope.rateData=30;
  $scope.currentUser = currentUser;
  $scope.slugId = $route.current.params.slugId;
  $scope.showPermissionsControl = clientConfig.showPermissionsControl;

  // currentUser.hasPermission('admin');

}

export default function init(ngModule) {
  ngModule.controller('DashboardViewCtrl', DashboardViewCtrl);

  return {
    '/view/:slugId': {
      template,
      layout: 'dashboardView',
      controller: 'DashboardViewCtrl',
      reloadOnSearch: false
    }
  };
}

init.init = true;
