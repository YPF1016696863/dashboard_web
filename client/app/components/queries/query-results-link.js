import appSettings from '@/config/app-settings';

function queryResultLink() {
  return {
    restrict: 'A',
    link(scope, element, attrs) {
      const fileType = attrs.fileType ? attrs.fileType : 'csv';
      scope.$watch('queryResult && queryResult.getData() && query.name', (data) => {
        if (!data) {
          return;
        }

        if (scope.queryResult.getId() == null) {
          element.attr('href', '');
        } else {
          let url;
          if (scope.query.id) {
            url = appSettings.server.backendUrl + `/api/queries/${scope.query.id}/results/${scope.queryResult.getId()}.${fileType}${scope.embed
              ? `?api_key=${scope.apiKey}`
              : ''}`;
          } else {
            url = appSettings.server.backendUrl + `/api/query_results/${scope.queryResult.getId()}.${fileType}`;
          }
          element.attr('href', url);
        }
      });
    },
  };
}

export default function init(ngModule) {
  ngModule.directive('queryResultLink', queryResultLink);
}

init.init = true;
