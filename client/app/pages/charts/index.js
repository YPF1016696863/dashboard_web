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
  $rootScope,
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

  $rootScope.selectChartType = null;
  $scope.chartSearchCb = (type,shouldUpdate,select) => {
    $scope.chartType = type;// type
    $rootScope.selectChartType =select;      // 默认值没有（上一次的值没有） 导致undefined-》line
    // console.log("select::::"+select+"     tpye:::"+type);   
    if(shouldUpdate){
      $scope.$apply();
      $rootScope.$apply();
    }
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
