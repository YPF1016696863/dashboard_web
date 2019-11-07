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
        if (!_.isUndefined($scope.queryResult) && $scope.queryResult.getData()) {
          const data = $scope.queryResult.getData();
           // 设置图表数据
          _.set($scope.options, "series", [
            {
              name:'访问来源',
              type:'pie',
              radius : '55%', 
              center: ['50%', '50%'],
              data:[
                  {value:335, name:'直接访问'},
                  {value:310, name:'邮件营销'},
                  {value:274, name:'联盟广告'},
                  {value:235, name:'视频广告'},
                  {value:400, name:'搜索引擎'}
              ].sort(function (a, b) { return a.value - b.value; }),
              // 判断是玫瑰图
              roseType: _.get($scope.options.form.yAxisColumnTypes) === "rose"? 'radius':undefined,
              label: {
                  normal: {
                      textStyle: {
                          color: 'rgba(255, 255, 255, 0.3)'
                      }
                  }
              },
              labelLine: {
                  normal: {
                      lineStyle: {
                          color: 'rgba(255, 255, 255, 0.3)'
                      },
                      smooth: 0.2,
                      length: 10,
                      length2: 20
                  }
              },
              itemStyle: {
                  normal: {
                      color: '#c23531',
                      shadowBlur: 200,
                      shadowColor: 'rgba(0, 0, 0, 0.5)'
                  }
              },
              animationType: 'scale',
              animationEasing: 'elasticOut'
          }
           ]);

          let myChart = null;

          if(document.getElementById("pie-main")) {
               document.getElementById("pie-main").id = $scope.options.id;
               // eslint-disable-next-line
               myChart = echarts.init(document.getElementById($scope.options.id));
          } else {
              // eslint-disable-next-line
               myChart = echarts.init(document.getElementById($scope.options.id));
          }
         
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
          //  myChart.setOption(defaultPieChartOptions(), true);
          myChart.resize($scope.options.size.width, $scope.options.size.height);

        }
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
        pie: { name: 'Echarts饼图', icon: 'pie-chart' },
        rose: { name: 'Echarts玫瑰图', icon: 'pie-chart' }
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

init.init = true;
