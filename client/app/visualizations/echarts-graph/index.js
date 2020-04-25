/* eslint-disable func-names */
import * as _ from 'lodash';
import $ from 'jquery';
import UUIDv4 from 'uuid/v4';
import echartsTemplate from './echarts.html';
import echartsEditorTemplate from './echarts-editor.html';


import { defaultGraphChartOptions, getChartType, setThemeColor } from './echartsGraphChartOptionUtils';

function EchartsGraphRenderer($rootScope) {
  return {
    restrict: 'E',
    scope: {
      queryResult: '=',
      options: '=?',
    },
    template: echartsTemplate,
    link($scope, $element) {



      if (_.isEmpty($scope.options) || $scope.options.chartType !== "GraphChart") {
        $scope.options = defaultGraphChartOptions();
      }

      let seriesData = [];
      let linkData = [];
      let node = [];
      const refreshData = () => {
        try {
          if (!_.isUndefined($scope.queryResult) && $scope.queryResult.getData()) {
            const data = $scope.queryResult.getData();
            seriesData = [];
            linkData = [];
            node = [];
            _.forEach(data, function (value) {// [{0},{1}...] 筛选出每一个{0} {1} ...
              // eslint-disable-next-line func-names
              _.forEach(value, function (valueChildren, keyChildren) {
                if (keyChildren === _.get($scope.options, "form.xAxisColumn", '')) {
                  node.push(valueChildren);
                }

              });
            });
            _.set($scope.options, "node", node);

            // 找到选中serise的下标        
            _.set($scope.options, 'useNode_Index',
              _.findIndex(
                _.get($scope.options, "node", []),
                function (o) { return o === _.get($scope.options, 'useNode', ''); }
              ));
            let useIndex = 0;

            _.forEach(node, function (value) {// [{0},{1}...] 筛选出每一个{0} {1} ...
              // eslint-disable-next-line func-names 
              seriesData.push({
                name: value,
                x: _.get($scope.options, "nodeX", [])[useIndex] === undefined ?
                  0 : _.get($scope.options, "nodeX", [])[useIndex],
                y: _.get($scope.options, "nodeY", [])[useIndex] === undefined ?
                  0 : _.get($scope.options, "nodeY", [])[useIndex],
                symbolSize: _.get($scope.options, "nodeSize", [])[useIndex] === undefined ?
                  35 : _.get($scope.options, "nodeSize", [])[useIndex],
                symbol: _.get($scope.options, "nodeSymbol", [])[useIndex] === undefined ?
                  "circle" : _.get($scope.options, "nodeSymbol", [])[useIndex],
                itemStyle: {
                  color: _.get($scope.options, "nodeColor", [])[useIndex] === undefined ?
                    "#ed4d50" : _.get($scope.options, "nodeColor", [])[useIndex],

                },
                label: {
                  color: _.get($scope.options, "nodeLabColor", [])[useIndex] === undefined ?
                    "#fff" : _.get($scope.options, "nodeLabColor", [])[useIndex],
                }
              });
              linkData.push({
                source: value,
                target: _.get($scope.options, "targetNode", [])[useIndex] === undefined ?
                  "" : _.get($scope.options, "targetNode", [])[useIndex],
                // name:,

                lineStyle: {
                  color: _.get($scope.options, "linkColor", [])[useIndex] === undefined ?
                    "#ccc" : _.get($scope.options, "linkColor", [])[useIndex],
                  type: _.get($scope.options, "linkStyle", [])[useIndex] === undefined ?
                    "solid" : _.get($scope.options, "linkStyle", [])[useIndex],
                  width: _.get($scope.options, "linkSize", [])[useIndex] === undefined || _.get($scope.options, "linkSize", [])[useIndex] === '' ?
                    2 : _.get($scope.options, "linkSize", [])[useIndex],
                }
              });
              useIndex += 1;
            });

            // console.log(linkData);
            // 切换主题颜色
            setThemeColor($scope.options, _.get($rootScope, "theme.theme", "light"));

            _.set($scope.options, "series", []);// 清空设置           
            $scope.options.series.push({
              type: 'graph',
              layout: _.get($scope.options, "layout", 'none'),
              // symbolSize: 50,
              roam: true,
              label: {
                show: true
              },
              edgeSymbol: ['circle', 'arrow'],
              edgeSymbolSize: [4, 10],
              // edgeLabel: {
              //   fontSize: 20
              // },
              data: seriesData,
              links: linkData,
              tooltip: {
                formatter: "{b}",
                textStyle: {
                  color: '#fff',
                }
              },
            });

            let myChart = null;

            if (document.getElementById("graph-main")) {
              document.getElementById("graph-main").id = $scope.options.id;
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
            if (_.get($scope.options, "size.responsive", false)) {
              let height = $element.parent().parent()["0"].clientHeight ;// + 50
              let width = $element.parent().parent()["0"].clientWidth;

              if ($("#dapingEditor").length !== 0) {
                height = $("#dapingEditor")["0"].clientHeight;
                width = $("#dapingEditor")["0"].clientWidth;
              }
              if ($("#Preview").length !== 0) {
                height = $("#Preview")["0"].clientHeight;
                width = $("#Preview")["0"].clientWidth;
              }

              if ($("#editor").length !== 0) {
                height = $("#editor")["0"].clientHeight - 50;
                width = $("#editor")["0"].clientWidth - 50;
              }

              _.set($scope.options, "size", {
                responsive: true,
                width,
                height
              });
            }
            myChart.resize($scope.options.size.width, $scope.options.size.height);
          }
        } catch (e) {
          console.log(e);
        }
      };

      $scope.$watch('options', refreshData, true);
      $scope.$watch('queryResult && queryResult.getData()', refreshData);
      $rootScope.$watch('theme.theme', refreshData);
    },
  };
}


function EchartsGraphEditor() {
  return {
    restrict: 'E',
    template: echartsEditorTemplate,
    scope: {
      queryResult: '=',
      options: '=?',
    },
    link($scope) {
      try {
        $scope.columns = $scope.queryResult.getColumns();
        $scope.columnNames = _.map($scope.columns, i => i.name);
      } catch (e) {
        console.log("some error");
      }
      // Set default options for new vis// 20191203 bug fix 
      if (_.isEmpty($scope.options) || $scope.options.chartType !== "GraphChart") {
        $scope.options = defaultGraphChartOptions();
      }
      $scope.selectedChartType = getChartType($scope.options);

      $scope.currentTab = 'general';
      $scope.changeTab = (tab) => {
        $scope.currentTab = tab;
      };
      $scope.chartTypes = {
        graph: { name: 'Echarts拓扑图', icon: 'graph-chart' },
      };
      $scope.Layouts = [
        { label: '坐标布局', value: 'none' },
        { label: '环形布局', value: 'circular' }
      ];
      $scope.Symbols = [
        { label: '圆形', value: 'circle' },
        { label: '三角形', value: 'triangle' },
        { label: '菱形', value: 'diamond' },
        { label: '圆角方形', value: 'roundRect' },
        { label: '大头针', value: 'pin' },
        { label: '方形', value: 'rect' }
      ];

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
        { label: '虚线', value: 'dotted' }

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
  ngModule.directive('echartsGraphEditor', EchartsGraphEditor);
  ngModule.directive('echartsGraphRenderer', EchartsGraphRenderer);

  ngModule.config((VisualizationProvider) => {
    const renderTemplate =
      '<echarts-graph-renderer options="visualization.options" query-result="queryResult"></echarts-graph-renderer>';

    const editorTemplate = '<echarts-graph-editor options="visualization.options" query-result="queryResult"></echarts-graph-editor>';
    const defaultOptions = {

    };

    VisualizationProvider.registerVisualization({
      type: 'ECHARTS-GRAPH',
      name: 'Echarts拓扑图',
      renderTemplate,
      editorTemplate,
      defaultOptions,
    });
  });
}

init.init = true;
