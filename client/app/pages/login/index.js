import * as _ from 'lodash';

import frontendVersion from '@/version.json';
import { policy } from '@/services/policy';
import { $http } from '@/services/ng';

import template from './content-layout.html';

function LoginViewCtrl(
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
  appSettings
) {
  $scope.password = '';
  $scope.username = '';
  $scope.errorMessage = '';
  $scope.loading = false;
  $scope.currentUser = currentUser;

  $scope.showPermissionsControl = clientConfig.showPermissionsControl;

  this.frontendVersion = frontendVersion;
  // currentUser.hasPermission('admin');

  $scope.login = (username, password) => {
    $scope.loading = true;
    $scope.errorMessage = '';
    $http
      .post(
        appSettings.server.backendUrl + '/api/login',
        { email: username, password },
        {
          withCredentials: true
        }
      )
      .then(
        response => {
          window.location.href = window.location.origin;
        },
        err => {
          $scope.errorMessage =
            '登录失败,请检查用户名和密码并重试,如有问题,请联系系统管理员.';
        }
      )
      .finally(() => {
        $scope.loading = false;
      });
  };
}

export default function init(ngModule) {
  ngModule.controller('LoginViewCtrl', LoginViewCtrl);

  return {
    '/login': {
      template,
      layout: 'login',
      controller: 'LoginViewCtrl',
      reloadOnSearch: false,
      pageID: 'login',
      resolve: {}
    }
  };
}

init.init = true;
