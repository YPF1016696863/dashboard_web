function cancelQueryButton() {
  return {
    restrict: 'E',
    scope: {
      queryId: '=',
      taskId: '=',
    },
    transclude: true,
    template:
      '<button class="btn btn-default" ng-disabled="inProgress" ng-click="cancelExecution()"><i class="zmdi zmdi-spinner zmdi-hc-spin" ng-if="inProgress"></i> Cancel</button>',
    replace: true,
    controller($scope, $http, currentUser, Events, appSettings) {
      $scope.inProgress = false;

      $scope.cancelExecution = () => {
        $http.delete(appSettings.server.backendUrl + `/api/jobs/${$scope.taskId}`).success(() => {});

        let queryId = $scope.queryId;
        if ($scope.queryId === 'adhoc') {
          queryId = null;
        }

        $scope.inProgress = true;
      };
    },
  };
}

export default function init(ngModule) {
  ngModule.directive('cancelQueryButton', cancelQueryButton);
}

init.init = true;
