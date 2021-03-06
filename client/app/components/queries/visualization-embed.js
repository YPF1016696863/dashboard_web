import { find } from 'lodash';
import queryStringParameters from '@/services/query-string';
import logoUrl from '@/assets/images/redash_icon_small.png';
import template from './visualization-embed.html';

const VisualizationEmbed = {
  template,
  bindings: {
    data: '<',
  },
  controller($routeParams, Query, QueryResult) {
    'ngInject';

    document.querySelector('body').classList.add('headless');
    const visualizationId = parseInt($routeParams.visualizationId, 10);
    this.showQueryDescription = $routeParams.showDescription;
    this.apiKey = $routeParams.api_key;
    this.logoUrl = logoUrl;
    this.query = new Query(this.data[0]);
    this.queryResult = new QueryResult(this.data[1]);
    this.visualization =
      find(this.query.visualizations, visualization => visualization.id === visualizationId);
  },
};

export default function init(ngModule) {
  ngModule.component('visualizationEmbed', VisualizationEmbed);

  function session($http, $route, Auth) {
    'ngInject';

    const apiKey = $route.current.params.api_key;
    Auth.setApiKey(apiKey);
    return Auth.loadConfig();
  }

  function loadData($http, $route, $q, Auth, appSettings) {
    return session($http, $route, Auth).then(() => {
      const queryId = $route.current.params.queryId;
      const query = $http.get(appSettings.server.backendUrl + `/api/queries/${queryId}`).then(response => response.data);
      const queryResult = $http.post(appSettings.server.backendUrl + `/api/queries/${queryId}/results`, { parameters: queryStringParameters() }).then(response => response.data);
      return $q.all([query, queryResult]);
    });
  }

  ngModule.config(($routeProvider) => {
    $routeProvider.when('/embed/query/:queryId/visualization/:visualizationId', {
      template: '<visualization-embed data="$resolve.data"></visualization-embed>',
      resolve: {
        data: loadData,
      },
    });
  });
}

init.init = true;
