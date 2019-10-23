import * as _ from 'lodash';
import $ from 'jquery';
import UUIDv4 from 'uuid/v4';
import echartsTemplate from './echarts.html';
import echartsEditorTemplate from './echarts-editor.html';

import { defaultPieChartOptions, parseChartType, getChartType } from './echartsPieChartOptionUtils';

function EchartsPieRenderer($timeout, $rootScope, $window) {
  return {
    restrict: 'E',
    scope: {
      queryResult: '=',
      options: '=?',
    },
    template: echartsTemplate,
    link($scope, $element) {
      $scope.chartSeries = [];

      const refreshData = () => {

        // eslint-disable-next-line
        let myChart = echarts.init(document.getElementById("pie-main"));
        myChart.setOption(defaultPieChartOptions(), true);
      };

      $scope.$watch('options', refreshData, true);
      $scope.$watch('queryResult && queryResult.getData()', refreshData);
      $rootScope.$watch('theme.theme', refreshData);
    },
  };
}

function EchartsPieEditor() {
  return {
    restrict: 'E',
    template: echartsEditorTemplate,
    scope: {
      queryResult: '=',
      options: '=?',
    },
    link($scope) {

      $scope.columns = $scope.queryResult.getColumns();
      $scope.columnNames = _.map($scope.columns, i => i.name);

      // Set default options for new vis
      if (_.isEmpty($scope.options)) {
        $scope.options = defaultPieChartOptions();
      }
      $scope.selectedChartType = getChartType($scope.options);

      $scope.currentTab = 'general';
      $scope.changeTab = (tab) => {
        $scope.currentTab = tab;
      };
      $scope.chartTypes = {
        line: { name: 'Echarts饼图', icon: 'pie-chart' },
        bar: { name: 'Echarts雷达图', icon: 'pie-chart' }
      };

      $scope.xAxisScales = [
        { label: '类目轴(类目轴，适用于离散的类目数据)', value: 'category' },
        { label: ' 数值轴(适用于连续数据)', value: 'value' },
        { label: '时间轴(适用于连续的时序数据，与数值轴相比时间轴带有时间的格式化)', value: 'time' },
        { label: '对数轴(适用于对数数据)', value: 'log' }
      ];

      $scope.xAxisLocations = [
        { label: '数据轴起始位置', value: 'start' },
        { label: '数据轴居中位置', value: 'center' },
        { label: '数据轴末端位置', value: 'end' }
      ];

      $scope.$watch('options', () => {
      }, true);
    },
  };
}

export default function init(ngModule) {
  ngModule.directive('echartsPieEditor', EchartsPieEditor);
  ngModule.directive('echartsPieRenderer', EchartsPieRenderer);

  ngModule.config((VisualizationProvider) => {
    const renderTemplate =
      '<echarts-pie-renderer options="visualization.options" query-result="queryResult"></echarts-pie-renderer>';

    const editorTemplate = '<echarts-pie-editor options="visualization.options" query-result="queryResult"></echarts-pie-editor>';
    const defaultOptions = {};

    VisualizationProvider.registerVisualization({
      type: 'ECHARTS-PIE-AND-RADAR',
      name: 'Echarts饼图和雷达图',
      renderTemplate,
      editorTemplate,
      defaultOptions,
    });
  });
}

init.init = false;
