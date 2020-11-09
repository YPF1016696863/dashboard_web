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
  // console.log("$scope.chartId:" + $scope.chartId);
  $scope.queryId = $route.current.params.queryId;
  // console.log("$scope.queryId:" + $scope.queryId);
  $scope.chartType = $route.current.params.type;
  $scope.showPermissionsControl = clientConfig.showPermissionsControl;
  $rootScope.selectChartType = null;
  $rootScope.selectDECharts = null;

  $scope.chartSearchCb = (type, shouldUpdate, select) => {// 似乎有id的时候才会进入这
     console.log($route);
    $scope.chartType = type;// type
    $route.current.params.type = type;
    $rootScope.selectDECharts = type;
    $rootScope.selectChartType = select;      // 默认值没有（上一次的值没有） 导致undefined-》line 
    // 有时候预览页面页面不关闭 编辑页面选了之后？，没有清除 导致预览的时候全部系列重置为上一次选的图表类型2019/12/13
     console.log("select::::"+select+"     chartType:::"+$scope.chartType);

    if (shouldUpdate) {
      $scope.$apply();
      $rootScope.$apply();
    }
  };
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
