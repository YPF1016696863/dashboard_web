import * as _ from 'lodash';
import $ from 'jquery';
import UUIDv4 from 'uuid/v4';
import echartsTemplate from './echarts.html';
import echartsEditorTemplate from './echarts-editor.html';


import { defaultGaugeChartOptions, getChartType, setData, setThemeColor } from './echartsGaugeChartOptionUtils';

function EchartsGaugeRenderer($rootScope) {
  return {
    restrict: 'E',
    scope: {
      queryResult: '=',
      options: '=?',
    },
    template: echartsTemplate,
    link($scope, $element) {


      console.log($scope.options);
      const refreshData = () => {
        if (!_.isUndefined($scope.queryResult) && $scope.queryResult.getData()) {
          const data = $scope.queryResult.getData();
          let dataGauge = 0;
          // eslint-disable-next-line func-names
          _.forEach(data, function (value) {// [{0},{1}...] 筛选出每一个{0} {1} ...
            // eslint-disable-next-line func-names
            _.forEach(value, function (valueChildren, keyChildren) {
              if (keyChildren === _.get($scope.options, "form.xAxisColumn", '')) {
                dataGauge = valueChildren;
              }

            });
          });

          // 切换主题颜色
          setThemeColor($scope.options, _.get($rootScope, "theme.theme", "light"));

          _.set($scope.options, "series", []);// 清空设置           
          $scope.options.series.push({
            name: _.get($scope.options, "series_Name", ''),
            type: 'gauge',
            min: _.get($scope.options, "minValue", 0),
            max: _.get($scope.options, "maxValue", 100),
            detail: {
              color: _.get($scope.options, "zbColor", 'auto'),
              formatter: _.get($scope.options, "defValue", true) ? '{value}' : '{value}%',
            },
            splitNumber: _.get($scope.options, "splitNumber", 10),// 仪表盘刻度的分割段数。
            itemStyle: {
              color: _.get($scope.options, "zColor", 'auto'),// 指针颜色
            },
            axisLine: {
              lineStyle: {
                color: [
                  [_.get($scope.options, "duan1", 0.3), _.get($scope.options, "duan1Color", '#01c7ae')],
                  [_.get($scope.options, "duan2", 0.5), _.get($scope.options, "duan2Color", '#03869e')],
                  [_.get($scope.options, "duan3", 0.8), _.get($scope.options, "duan3Color", '#d09931')],
                  [_.get($scope.options, "duan4", 1), _.get($scope.options, "duan4Color", '#c23531')]
                ],
              }
            },

            data: [{
              value: setData($scope.options, _.get($scope.options, "defValue", true), dataGauge),
              // dataGauge / (_.get($scope.options, "maxValue", 100) - _.get($scope.options, "minValue", 0))
              name: _.get($scope.options, "series_Name", '') === '' || undefined ?
                _.get($scope.options, "form.xAxisColumn", '') :
                _.get($scope.options, "series_Name", true)
            }],
          });

          let myChart = null;

          if (document.getElementById("gauge-main")) {
            document.getElementById("gauge-main").id = $scope.options.id;
            // eslint-disable-next-line
            myChart = echarts.init(document.getElementById($scope.options.id));
          } else {
            // eslint-disable-next-line
            myChart = echarts.init(document.getElementById($scope.options.id));
          }

          if (_.get($scope.options, "form.isCodeEnabled", false)) {
            myChart.setOption(JSON.parse(_.replace($scope.options.form.code, "'", '"')), true);
          } else {
            myChart.setOption($scope.options, true);
          }
          // Resize - Responsive
          if (_.get($scope.options, "size.responsive", true)) {

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


function EchartsGaugeEditor() {
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

      // Set default options for new vis// 20191203 bug fix 
      if (_.isEmpty($scope.options) || $scope.options.chartType !== "GaugeChart") {
        $scope.options = defaultGaugeChartOptions();
      }
      $scope.selectedChartType = getChartType($scope.options);

      $scope.currentTab = 'general';
      $scope.changeTab = (tab) => {
        $scope.currentTab = tab;
      };
      $scope.chartTypes = {
        gauge: { name: 'Echarts仪表盘图', icon: 'gauge-chart' },
      };


      $scope.LablePositions = [
        { label: '标注点上', value: 'top' },
        { label: '标注点左', value: 'left' },
        { label: '标注点右', value: 'right' },
        { label: '标注点下', value: 'bottom' },
        { label: '标注点内', value: 'inside' },
        { label: '标注点内左', value: 'insideLeft' },
        { label: '标注点内右', value: 'insideRight' },
        { label: '标注点内上', value: 'insideTop' },
        { label: '标注点内上', value: 'insideBottom' },
        { label: '标注点内左上', value: 'insideTopLeft' },
        { label: '标注点内左下', value: 'insideBottomLeft' },
        { label: '标注点内右上', value: 'insideTopRight' },
        { label: '标注点内右下', value: 'insideBottomRight' }

      ];
      $scope.LabelFontWeights = [
        { label: 'normal', value: 'normal' },
        { label: 'bold', value: 'bold' },
        { label: 'bolder', value: 'bolder' },
        { label: 'lighter', value: 'lighter' },
        { label: '100 ', value: '100 ' },
        { label: '200 ', value: '200 ' },
        { label: '300 ', value: '300 ' },
        { label: '400 ', value: '400 ' },
        { label: '600 ', value: '600 ' },
        { label: '800 ', value: '800 ' },
        { label: '1000 ', value: '1000 ' }
      ];
      $scope.LabelFontFamilys = [
        { label: 'serif', value: 'serif' },
        { label: 'monospace', value: 'monospace' },
        { label: 'Arial', value: 'Arial' },
        { label: 'Courier New', value: 'Courier New' },
        { label: 'Microsoft YaHei', value: 'Microsoft YaHei' }
      ];
      $scope.FontStyles = [
        { label: 'normal', value: 'normal' },
        { label: 'italic', value: 'italic' },
        { label: 'oblique', value: 'oblique' }
      ];
      $scope.Colors = [
        { label: '默认', value: 'auto' },
        { label: '透明', value: 'transparent' },
        { label: '白色', value: '#fff' },
        { label: '红色', value: '#ed4d50' },
        { label: '绿色', value: '#6eb37a' },
        { label: '蓝色', value: '#5290e9' },
        { label: '橘色', value: '#ee941b' },
        { label: '紫色', value: '#985896' },
        { label: '瑠璃色', value: '#2a5caa' },
        { label: '青蓝', value: '#102b6a' },
        { label: '铁绀', value: '#181d4b' },
        { label: '蔷薇色', value: '#f05b72' },
        { label: '黄緑', value: '#b2d235' },
        { label: '萌黄', value: '#a3cf62' },
        { label: '赤丹', value: '#d64f44' }
      ];
      $scope.BackgroundColors = [
        { label: '默认', value: 'auto' },
        { label: '透明', value: 'transparent' },
        { label: '暗绿色', value: '#84AF9B' },
        { label: '白色', value: '#ffffff' },
        { label: '黑色', value: '#2C3E50' },
        { label: '白色', value: '#fff' },
        { label: '红色', value: '#ed4d50' },
        { label: '绿色', value: '#6eb37a' },
        { label: '蓝色', value: '#5290e9' },
        { label: '橘色', value: '#ee941b' },
        { label: '紫色', value: '#985896' },
        { label: '瑠璃色', value: '#2a5caa' },
        { label: '青蓝', value: '#102b6a' },
        { label: '铁绀', value: '#181d4b' },
        { label: '蔷薇色', value: '#f05b72' },
        { label: '黄緑', value: '#b2d235' },
        { label: '萌黄', value: '#a3cf62' },
        { label: '赤丹', value: '#d64f44' }
      ];
      $scope.TextAligns = [
        { label: '自动', value: 'auto' },
        { label: '左对齐', value: 'left' },
        { label: '右对齐', value: 'right' },
        { label: '居中', value: 'center' }
      ];
      $scope.LegendAliNumbs = [
        { label: '左对齐', value: '5%' },
        { label: '居中', value: '35%' },
        { label: '右对齐', value: '60%' }
      ];
      $scope.LineStyles = [
        { label: '实线', value: 'solid' },
        { label: '虚线', value: 'dashed' },
        { label: '点线', value: 'dotted' }

      ];
      $scope.TextVerticalAligns = [
        { label: '自动', value: 'auto' },
        { label: '顶部', value: 'top' },
        { label: '底部', value: 'bottom' },
        { label: '居中', value: 'middle' }
      ];


      $scope.$watch('options', () => {
      }, true);
    },
  };
}

export default function init(ngModule) {
  ngModule.directive('echartsGaugeEditor', EchartsGaugeEditor);
  ngModule.directive('echartsGaugeRenderer', EchartsGaugeRenderer);

  ngModule.config((VisualizationProvider) => {
    const renderTemplate =
      '<echarts-gauge-renderer options="visualization.options" query-result="queryResult"></echarts-gauge-renderer>';

    const editorTemplate = '<echarts-gauge-editor options="visualization.options" query-result="queryResult"></echarts-gauge-editor>';
    const defaultOptions = {
      id: UUIDv4(),
      backgroundColor: 'transparent',
      series_Name: '',
      tooltip: {
        formatter: "{a} <br/>{b} : {c}%",
        textStyle: {
          color: '#333',
        }
      },
      toolbox: {
        feature: {
          restore: {},
          saveAsImage: {}
        }
      },
      legend: {
        show: true,
        // x: 'left'
        textStyle: {
          color: '#333',
        }
      },
      title: {
        text: '',
        subtext: '',
        x: 'center',
        backgroundColor: 'transparent',
        textStyle: {
          color: '#333',
          fontStyle: 'normal',
          fontFamily: 'serif',
          fontSize: 25,
        },
        subtextStyle: {
          color: '#333',
          fontStyle: 'normal',
          fontFamily: 'serif',
          fontSize: 18,
        },
      },
      series: []

    };

    VisualizationProvider.registerVisualization({
      type: 'ECHARTS-GAUGE',
      name: 'Echarts仪表盘图',
      renderTemplate,
      editorTemplate,
      defaultOptions,
    });
  });
}

init.init = true;
