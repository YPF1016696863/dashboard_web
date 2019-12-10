import {
  pick,
  some,
  find,
  minBy,
  map,
  intersection,
  isArray,
  isObject,
  debounce
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

function ChartsViewCtrl(
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
  $scope.chartId = $route.current.params.chartId;
  $scope.queryId = $route.current.params.queryId;
  $scope.showPermissionsControl = clientConfig.showPermissionsControl;
  $scope.chartType = $route.current.params.type?$route.current.params.type:null;

  $scope.chartSearchCb = (type,shouldUpdate) => {
    $scope.chartType = type;
    if(shouldUpdate)$scope.$apply();
  };

  // currentUser.hasPermission('admin');
}

export default function init(ngModule) {
  ngModule.controller('ChartsViewCtrl', ChartsViewCtrl);

  return {
    '/query/:queryId/charts/:chartId': {
      template,
      layout: 'fixed',
      controller: 'ChartsViewCtrl',
      reloadOnSearch: false
    }
  };
}

init.init = true;
