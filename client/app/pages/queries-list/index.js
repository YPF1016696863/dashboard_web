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

function QueriesListViewCtrl(
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
  $scope.queryId = $routeParams.queryid;
  $scope.reload = 1;
  $scope.queries = $route.current.locals.queries;
  $scope.query = $route.current.locals.query;
  $scope.showPermissionsControl = clientConfig.showPermissionsControl;

  $scope.querySearchCb = (id) => {
    $scope.queryId = id&&id.length?id[0]:null;
    $location.search({queryid: $scope.queryId});
    $scope.$applyAsync();
  };

  $scope.queriesTabCb = (id) => {
    $scope.queryId = id&&id.length?id[0]:null;
    $scope.$applyAsync();
  };

  // currentUser.hasPermission('admin');

}

export default function init(ngModule) {
  ngModule.controller('QueriesListViewCtrl', QueriesListViewCtrl);

  return {
    '/queries': {
      template,
      layout: 'fixed',
      controller: 'QueriesListViewCtrl',
      reloadOnSearch: false,
      resolve: {
        queries: (Query, $route) => {
          'ngInject';

          return Query.allQueries().$promise;
        },
        query: (Query, $route) => {
          'ngInject';

          return Query.get().$promise;
        }
      }
    }
  };
}

init.init = true;
