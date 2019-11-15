import * as _ from 'lodash';
import { policy } from '@/services/policy';
import template from './content-layout.html';

function ContentLayoutCtrl(
  $scope,
  Events,
  $route,
  $routeParams,
  $location,
  $window,
  $q,
  clientConfig,
  $uibModal,
  currentUser,
  Query,
  DataSource,
  Visualization,
  appSettings
) {
  $scope.currentUser = currentUser;
  // currentUser.hasPermission('edit_query')
  $scope.dataSource = {};
  $scope.query = $route.current.locals.query;
  $scope.showPermissionsControl = clientConfig.showPermissionsControl;


/*
  $scope.showApiKey = () => {
    $uibModal.open({
      component: 'apiKeyDialog',
      resolve: {
        query: $scope.query
      }
    });
  };
  */
}

export default function init(ngModule) {
  ngModule.controller('ContentLayoutCtrl', ContentLayoutCtrl);

  return {
    '/contentlayout': {
      template,
      controller: 'ContentLayoutCtrl',
      resolve: {
      }
    }
  };
}

init.init = true;
