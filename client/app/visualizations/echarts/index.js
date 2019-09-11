import * as _ from 'lodash';
import echartsTemplate from './echarts.html';
import echartsEditorTemplate from './echarts-editor.html';

import { defaultBasicChartOptions,setChartType,getChartType } from './echartsBasicChartOptionUtils';

function EchartsRenderer($timeout, $rootScope) {
  return {
    restrict: 'E',
    template: echartsTemplate,
    link($scope, $element) {
        $scope.chartSeries = [];

      const refreshData = () => {
        if (!_.isUndefined($scope.queryResult) && $scope.queryResult.getData()) {
            const data = $scope.queryResult.getData();
            // eslint-disable-next-line
            const myChart = echarts.init(document.getElementById('main'));
            // use configuration item and data specified to show chart
            myChart.setOption(defaultBasicChartOptions());
        }
      };

      $scope.$watch('visualization.options', refreshData, true);
      $scope.$watch('queryResult && queryResult.getData()', refreshData);
      $rootScope.$watch('theme.theme', refreshData);
    },
  };
}

function EchartsEditor() {
  return {
    restrict: 'E',
    template: echartsEditorTemplate,
    scope: {
      queryResult: '=',
      options: '=?',
    },
    link($scope) {

      // Set default options for new vis
      if(_.isEmpty($scope.options)) {
        $scope.options = defaultBasicChartOptions();
      } 
      $scope.selectedChartType = getChartType($scope.options);

      $scope.currentTab = 'general';
      $scope.changeTab = (tab) => {
        $scope.currentTab = tab;
      };
      $scope.chartTypes = {
        line: { name: 'Echarts线形图', icon: 'line-chart' },
        bar: { name: 'Echarts柱状图', icon: 'bar-chart' },
        area: { name: 'Echarts线形面积图', icon: 'area-chart' }
      };

      $scope.chartTypeChanged = (selected) => {
        setChartType($scope.options,selected);
      };

      $scope.$watch('options', ()=>{
        console.log($scope.options);
      },true);
    },
  };
}

export default function init(ngModule) {
  ngModule.directive('echartsEditor', EchartsEditor);
  ngModule.directive('echartsRenderer', EchartsRenderer);

  ngModule.config((VisualizationProvider) => {
    const renderTemplate =
      '<echarts-renderer options="visualization.options" query-result="queryResult"></echarts-renderer>';

    const editorTemplate = '<echarts-editor options="visualization.options" query-result="queryResult"></echarts-editor>';
    const defaultOptions = {};

    VisualizationProvider.registerVisualization({
      type: 'ECHARTS',
      name: 'Echarts图表',
      renderTemplate,
      editorTemplate,
      defaultOptions,
    });
  });
}

init.init = true;
