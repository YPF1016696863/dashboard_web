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

function ChartsListViewCtrl(
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
  $scope.showPermissionsControl = clientConfig.showPermissionsControl;

  $scope.querySearchCb = (type, id) => {
    $scope.displayType = type;
    $scope.displayId = id;
    $scope.$applyAsync();
  };
  $scope.chartsTabCb = (type, id) => {
    $scope.displayType = type;
    $scope.displayId = id;
    $scope.$applyAsync();
  };

  // currentUser.hasPermission('admin');

}

export default function init(ngModule) {
  ngModule.controller('ChartsListViewCtrl', ChartsListViewCtrl);

  return {
    '/charts': {
      template,
      layout: 'fixed',
      controller: 'ChartsListViewCtrl',
      reloadOnSearch: false
    }
  };
}

init.init = true;
