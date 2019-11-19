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

function DataSourcesViewCtrl(
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
  $scope.showPermissionsControl = clientConfig.showPermissionsControl;

  $scope.sourceSearchCb = (id) => {
    $scope.sourceId = id&&id.length?id[0]:null;
    $scope.$apply();
  };
  // currentUser.hasPermission('admin');

}

export default function init(ngModule) {
  ngModule.controller('DataSourcesViewCtrl', DataSourcesViewCtrl);

  return {
    '/data_sources': {
      template,
      layout: 'fixed',
      controller: 'DataSourcesViewCtrl',
      reloadOnSearch: false
    }
  };
}

init.init = true;
