/* eslint-disable object-shorthand */
/* eslint-disable func-names */
import * as _ from 'lodash';
import $ from 'jquery';
import UUIDv4 from 'uuid/v4';
import echartsTemplate from './echarts.html';
import echartsEditorTemplate from './echarts-editor.html';


import { defaultPolarpieChartOptions, getChartType, setThemeColor } from './echartsPolarpieChartOptionUtils';

function EchartsPolarpieRenderer($rootScope) {
  return {
    restrict: 'E',
    scope: {
      queryResult: '=',
      options: '=?',
    },
    template: echartsTemplate,
    link($scope, $element) {

      if (_.isEmpty($scope.options) || $scope.options.chartType !== "PolarpieChart") {
        $scope.options = defaultPolarpieChartOptions();
      }

      const refreshData = () => {
        try {
          if (!_.isUndefined($scope.queryResult) && $scope.queryResult.getData()) {
            const data = $scope.queryResult.getData();


            // 切换主题颜色
            setThemeColor($scope.options, _.get($rootScope, "theme.theme", "light"));


            const fangwei = (parseFloat(90) - parseFloat(_.get($scope.options, 'fangwei', 0) === '' ? 0 :
              _.get($scope.options, 'fangwei', 0)));
            const huduD = (parseFloat(_.get($scope.options, 'hudu', 0)) / 360);

            _.set($scope.options, 'dataset.source[0][1]', 120 * huduD);
            _.set($scope.options, 'dataset.source[1][1]', 120 * (1 - huduD));
            // dataset: {  弧度
            //   source: [
            //       ['a', 20],// 宽度
            //       ['b', 60]
            //   ]
            // },
            let juliD = (0.008 * parseFloat(_.get($scope.options, 'juli', 0))*100*100 / 500.0).toFixed(2);
            juliD+='%';
            // console.log(juliD);
             // 0.08=0.8/100份 
            _.set($scope.options, "series", []);// 清空设置           
            $scope.options.series.push(
              {
                type: 'pie',
                // id: 'pie',
                radius: juliD, // 距离
                label: {
                  show: false
                },
                startAngle: fangwei,// 90开始 顺时针减(方位)
                itemStyle: {
                  normal: {
                    color: function (params) {
                      const colorList = [
                        _.get($scope.options, 'series_ItemStyle_Color', 'rgba(255,0,0,0.5)'), 'rgba(0,0,0,0)'
                      ];
                      return colorList[params.dataIndex]
                    }
                  }
                },
                center: ['50%', '50%'],  // 和极坐标绑定
              }
            );
            // 设置环形分割区域的间隔颜色
            _.set($scope.options, "radiusAxis.splitArea.areaStyle.color",
              [_.get($scope.options, "radiusAxis.splitArea.areaStyle.color1", 'transparent'),
              _.get($scope.options, "radiusAxis.splitArea.areaStyle.color2", 'transparent')]);

            // 设置扇形分割区域的间隔颜色
            _.set($scope.options, "angleAxis.splitArea.areaStyle.color",
              [_.get($scope.options, "angleAxis.splitArea.areaStyle.color1", 'transparent'),
              _.get($scope.options, "angleAxis.splitArea.areaStyle.color2", 'transparent')]);
            // //  提示框文字格式
            // const formatterString = `${_.get($scope.options, "Text_a", "")}
            // {a}&nbsp${_.get($scope.options, "a_Text", "")}

            // <br/>${_.get($scope.options, "Text_b", "")},
            // ${_.get($scope.options, "Text_c", "")}：

            // {b}{c}&nbsp${_.get($scope.options, "b_Text", "")} 
            // ${_.get($scope.options, "c_Text", "")}`;

            // _.set($scope.options, "tooltip.formatter", formatterString);
            let myChart = null;

            if (document.getElementById("polarpie-main")) {
              document.getElementById("polarpie-main").id = $scope.options.id;
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
              let height = $element.parent().parent()["0"].clientHeight;// + 50
              let width = $element.parent().parent()["0"].clientWidth;
              // if ($("#dapingEditor").length !== 0) {
              //   height = $("#dapingEditor")["0"].clientHeight;
              //   width = $("#dapingEditor")["0"].clientWidth;
              // }

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


function EchartsPolarpieEditor() {
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
      if (_.isEmpty($scope.options) || $scope.options.chartType !== "PolarpieChart") {
        $scope.options = defaultPolarpieChartOptions();
      }
      $scope.selectedChartType = getChartType($scope.options);

      $scope.currentTab = 'general';
      $scope.changeTab = (tab) => {
        $scope.currentTab = tab;
      };
      $scope.xAxisLocations = [
        { label: '数据轴起始位置', value: 'start' },
        { label: '数据轴居中位置', value: 'center' },
        { label: '数据轴末端位置', value: 'end' }
      ];

      $scope.Symbols = [
        { label: '圆形', value: 'circle' },
        { label: '空心圆', value: 'emptyCircle' },
        { label: '圆角矩形', value: 'roundRect' },
        { label: '三角形', value: 'triangle' },
        { label: '菱形', value: 'diamond' },
        { label: '水滴', value: 'pin' },
        { label: '箭头', value: 'arrow' }
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
        { label: '默认', value: '' },
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

      $scope.ThemeColor = [
        { label: '基础色', value: ['#3b6291', '#943c39', '#779043', '#624c7c', '#388498', '#bf7334', '#3f6899', '#9c403d', '#7d9847 ', '#675083 '] },
        { label: '小清新', value: ['#63b2ee', '#76da91', '#f8cb7f', '#f89588', '#7cd6cf', '#9192ab', '#7898e1', '#efa666', '#eddd86', '#9987ce'] },
        { label: '复古色', value: ['#71ae46', '#c4cc38', '#ebe12a', '#eab026', '#e3852b', '#d85d2a', '#ce2626', '#ac2026', '#96b744', '#c4cc38'] },
        { label: '蓝色调渐变', value: ['#CCEBFF', '#AADDFF', '#88CFFF', '#66C2FF', '#44B4FF', '#22A7FF', '#0099FF', '#007ACC', '#0066AA', '#005288'] },
        { label: '绿色调渐变', value: ['#d6f29b', '#b4d66b', '#a2d97e', '#9ebb1d', '#7acb14', '#7bc75a', '#33c563', '#008800', '#006600', '#344d00'] },
        { label: '紫色调渐变', value: ['#F1DDFF', '#E4BBFF', '#D699FF', '#D699FF', '#C977FF', '#A722FF', '#9900FF', '#9900FF', '#8500DD', '#8500DD'] },
        { label: '黄色调渐变', value: ['#FFFFDD', '#FFFFBB', '#FFFF99', '#FFFF77', '#FFFF55', '#FFFF55', '#FFFF00', '#DDDD00', '#CCCC00', '##AAAA00',] },
        { label: '红色调渐变', value: ['#FFDDEB', '#FFCCD6', '#FF99AD', '#FF7792', '#FF6685', '#FF4469', '#FF224E', '#EE0030', '#CC0029', '#99001F'] },

      ];
      $scope.BackgroundColors = [
        { label: '默认', value: '' },
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
  ngModule.directive('echartsPolarpieEditor', EchartsPolarpieEditor);
  ngModule.directive('echartsPolarpieRenderer', EchartsPolarpieRenderer);

  ngModule.config((VisualizationProvider) => {
    const renderTemplate =
      '<echarts-polarpie-renderer options="visualization.options" query-result="queryResult"></echarts-polarpie-renderer>';

    const editorTemplate = '<echarts-polarpie-editor options="visualization.options" query-result="queryResult"></echarts-polarpie-editor>';
    const defaultOptions = {

    };

    VisualizationProvider.registerVisualization({
      type: 'ECHARTS-POLARPIE',
      name: 'Echarts扇形图',
      renderTemplate,
      editorTemplate,
      defaultOptions,
    });
  });
}

init.init = true;
