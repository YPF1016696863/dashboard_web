import * as _ from 'lodash';
import $ from 'jquery';
import UUIDv4 from 'uuid/v4';
import echartsTemplate from './echarts.html';
import echartsEditorTemplate from './echarts-editor.html';

import { defaultBasicChartOptions, parseChartType, getChartType } from './echartsBasicChartOptionUtils';

function EchartsRenderer($timeout, $rootScope, $window) {
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

        if (!_.isUndefined($scope.queryResult) && $scope.queryResult.getData()) {
          const data = $scope.queryResult.getData();

          _.set($scope.options, "title.textStyle.color",_.get($rootScope,"theme.theme","light") === "light" ? "#333":"#fff");

          _.set($scope.options, "title.subtextStyle.color",_.get($rootScope,"theme.theme","light") === "light" ? "#333":"#fff");

          _.set($scope.options, "textStyle.color",_.get($rootScope,"theme.theme","light") === "light" ? "#333":"#fff");

          _.set($scope.options, "xAxis.data", _.map(_.get($scope.queryResult, "filteredData", []), (row) => {
            return row[_.get($scope.options, "form.xAxisColumn", "-")];
          }));

          _.set($scope.options, "series", []);
          _.set($scope.options, "yAxis", {
            name: "xxxxxxxxxxxx",
            type: 'value',
            axisLabel: {
                formatter: '{value}xxxxxxxxx'
            }
          });

          // setChartType($scope.options, selected);
          _.each(_.get($scope.options, "form.yAxisColumns", []), (yAxisColumn) => {
            $scope.options.series.push({
              name: yAxisColumn,
              type: parseChartType(_.get($scope.options,"form.chartType")),
              data:  _.map(_.get($scope.queryResult,"filteredData",[]),(row)=>{
                return row[yAxisColumn];
              }),
              areaStyle: _.get($scope.options,"form.chartType") === "area"?{}:undefined,
              /*
              markPoint: {
                data: [
                  { type: 'max', name: '最大值' },
                  { type: 'min', name: '最小值' }
                ]
              },
              markLine: {
                data: [
                  { type: 'average', name: '平均值' }
                ]
              },
              markArea: {
                silent: true,
                itemStyle: {
                  normal: {
                    color: 'transparent',
                    borderWidth: 1,
                    borderType: 'dashed'
                  }
                },
                data: [[{
                  name: '分布区间:'+yAxisColumn,
                  xAxis: 'max',
                  yAxis: 'min'
                }, {
                  xAxis: 'min',
                  yAxis: 'max'
                }]]
              },
              */
              itemStyle: { }
            });
          });

          let myChart = null;


          if(document.getElementById("main")) {
            document.getElementById("main").id = $scope.options.id;
            // eslint-disable-next-line
            myChart = echarts.init(document.getElementById($scope.options.id));
          } else {
            // eslint-disable-next-line
            myChart = echarts.init(document.getElementById($scope.options.id));
          }

          // use configuration item and data specified to show chart

          if(_.get($scope.options,"form.isCodeEnabled",false)) {
            myChart.setOption(JSON.parse(_.replace($scope.options.form.code,"'",'"')), true);
          } else {
            myChart.setOption($scope.options, true);
          }

          // Resize - Responsive
          if (_.get($scope.options, "size.responsive", false)) {

            // Find widget and resize
            let height = "100%";
            if ($($element[0]).closest('.widget-container').length === 0) {
              // Set a default height for widget.
              height = "400px";
            }

            _.set($scope.options, "size", {
              responsive: true,
              width: Math.floor($element.parent().width()) + "px",
              height
            });
          }

          myChart.resize($scope.options.size.width, $scope.options.size.height);
        }
      };

      $scope.$watch('options', refreshData, true);
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

      $scope.columns = $scope.queryResult.getColumns();
      $scope.columnNames = _.map($scope.columns, i => i.name);

      // Set default options for new vis
      if (_.isEmpty($scope.options)) {
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
  ngModule.directive('echartsEditor', EchartsEditor);
  ngModule.directive('echartsRenderer', EchartsRenderer);

  ngModule.config((VisualizationProvider) => {
    const renderTemplate =
      '<echarts-renderer options="visualization.options" query-result="queryResult"></echarts-renderer>';

    const editorTemplate = '<echarts-editor options="visualization.options" query-result="queryResult"></echarts-editor>';
    const defaultOptions = {};

    VisualizationProvider.registerVisualization({
      type: 'ECHARTS',
      name: 'Echarts基础图表',
      renderTemplate,
      editorTemplate,
      defaultOptions,
    });
  });
}

init.init = true;
