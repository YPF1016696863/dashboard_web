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

        // 找到选中serise的下标        
        _.set($scope.options, 'useSerie_Index',
          _.findIndex(
            _.get($scope.options, "form.yAxisColumns", []),
            function (o) { return o === _.get($scope.options, 'useSerie', ''); }
          ));

        if (!_.isUndefined($scope.queryResult) && $scope.queryResult.getData()) {
          const data = $scope.queryResult.getData();
          //  主题整体修改 样式全变 如何在切换主题时更换颜色 但在默认主题或人为修改颜色时修改颜色？
          // _.set($scope.options, "title.textStyle.color",
          // _.get($rootScope, "theme.theme", "light") === "light" ? "#333" : "#fff");

          // _.set($scope.options, "title.subtextStyle.color", 
          // _.get($rootScope, "theme.theme", "light") === "light" ? "#333" : "#fff");

          // _.set($scope.options, "textStyle.color", 
          // _.get($rootScope, "theme.theme", "light") === "light" ? "#333" : "#fff");

          _.set($scope.options, "xAxis.data", _.map(_.get($scope.queryResult, "filteredData", []), (row) => {
            return row[_.get($scope.options, "form.xAxisColumn", "-")];
          }));

          //  提示框文字格式
          const formatterString = `${_.get($scope.options, "Text_a", "")}
          {a}${_.get($scope.options, "a_Text", "")}
          <br/>${_.get($scope.options, "Text_b", "")}
          {b}${_.get($scope.options, "b_Text", "")}:
          ${_.get($scope.options, "Text_c", "")}
          {c}${_.get($scope.options, "c_Text", "")}`;
          _.set($scope.options, "tooltip.formatter", formatterString);




          _.set($scope.options, "series", []);// 清空设置

          // 遍历时的初始化下标 下标命名方式 根据echarts文档 忽略series . 驼峰形式
          // series下的
          // let seriesItemStyleColor = 0;
          let seriesNameIndex = 0;
          // let symbolSizeIndex = 0;
          // let symbolIndex = 0;
          // let symbolRotateIndex = 0;
          // let labelShowIndex = 0;
          // let labelPositionIndex = 0;
          // let labelColor = 0;
          // let labelFontWeight = 0;
          // let labelFontSize = 0;
          // let labelFontFamily = 0;
          // markLine 下的
          // max
          // let markLineDataMaxType = 0;
          // let markLineDataMaxLineStyleColor = 0;
          // let markLineDataMaxLineStyleWidth = 0;
          // let markLineDataMaxLineStyleType = 0;

          // markPoint 下的
          // max
          // let markPointDataMaxType = 0;
          // let markPointMaxSymbolIndex = 0;
          // let markPointMaxSymbolSizeIndex = 0;
          // let markPointMaxLabelShowIndex = 0;
          // let markPointMaxLabelPositionIndex = 0;
          // let markPointMaxLabelColor = 0;
          // let markPointMaxLabelFontWeight = 0;
          // let markPointMaxLabelFontSize = 0;
          // let markPointMaxLabelFontFamily = 0;
          // min
          // let markPointDataMinType = 0;
          // let markPointMinSymbolIndex = 0;
          // let markPointMinSymbolSizeIndex = 0;
          // let markPointMinLabelShowIndex = 0;
          // let markPointMinLabelPositionIndex = 0;
          // let markPointMinLabelColor = 0;
          // let markPointMinLabelFontWeight = 0;
          // let markPointMinLabelFontSize = 0;
          // let markPointMinLabelFontFamily = 0;
          // min
          // let markPointDataAverageType = 0;
          // let markPointAverageSymbolIndex = 0;
          // let markPointAverageSymbolSizeIndex = 0;
          // let markPointAverageLabelShowIndex = 0;
          // let markPointAverageLabelPositionIndex = 0;
          // let markPointAverageLabelColor = 0;
          // let markPointAverageLabelFontWeight = 0;
          // let markPointAverageLabelFontSize = 0;
          // let markPointAverageLabelFontFamily = 0;



          // setChartType($scope.options, selected);
          _.each(_.get($scope.options, "form.yAxisColumns", []), (yAxisColumn) => {

            $scope.options.series.push({
              name: _.get($scope.options, "series_ReName", [])[seriesNameIndex] === undefined ?
                yAxisColumn : _.get($scope.options, "series_ReName", [])[seriesNameIndex],
              type: parseChartType(_.get($scope.options.form.yAxisColumnTypes, yAxisColumn)),
              smooth: _.get($scope.options, "series_Smooth", false),//   series_Smooth 折线与曲线切换
              data: _.map(_.get($scope.queryResult, "filteredData", []), (row) => {
                return row[yAxisColumn];
              }),
              areaStyle: _.get($scope.options.form.yAxisColumnTypes, yAxisColumn) === "area" ? {} : undefined,
              symbolSize: _.get($scope.options, "series_SymbolSize", [])[seriesNameIndex],// 下标传入配置数组找到相应的配置
              symbol: _.get($scope.options, "series_Symbol", [])[seriesNameIndex],
              symbolRotate: _.get($scope.options, "series_SymbolRotate", [])[seriesNameIndex],
              label: {
                show: _.get($scope.options, "series_Show", [])[seriesNameIndex],
                position: _.get($scope.options, "series_Label_Position", [])[seriesNameIndex],
                color: _.get($scope.options, "series_Label_Color", [])[seriesNameIndex],
                fontWeight: _.get($scope.options, "series_Label_FontWeight", [])[seriesNameIndex],
                fontSize: _.get($scope.options, "series_Label_FontSize", [])[seriesNameIndex],
                fontFamily: _.get($scope.options, "series_Label_FontFamily", [])[seriesNameIndex],
              },
              // 数据标记线

              markLine: {
                data: [
                  {
                    name: _.get($scope.options, "series_MarkLine_Data_MarkName", [])[seriesNameIndex] === undefined ?
                      '' : _.get($scope.options, "series_MarkLine_Data_MarkName", [])[seriesNameIndex],

                    yAxis: _.get($scope.options, "series_MarkLine_Data_MarkValue", [])[seriesNameIndex] === undefined ?
                      -10000 : _.get($scope.options, "series_MarkLine_Data_MarkValue", [])[seriesNameIndex],

                    lineStyle: {
                      color: _.get($scope.options, "series_MarkLine_Data_LineStyle_Color", [])[seriesNameIndex] === undefined ?
                        '#ed4d50' : _.get($scope.options, "series_MarkLine_Data_LineStyle_Color", [])[seriesNameIndex],

                      width: _.get($scope.options, "series_MarkLine_Data_LineStyle_Width", [])[seriesNameIndex] === undefined ?
                        5 : _.get($scope.options, "series_MarkLine_Data_LineStyle_Width", [])[seriesNameIndex],

                      type: _.get($scope.options, "series_MarkLine_Data_LineStyle_Type", [])[seriesNameIndex] === undefined ?
                        'solid' : _.get($scope.options, "series_MarkLine_Data_LineStyle_Type", [])[seriesNameIndex],

                    },
                  }
                ]
              },

              // 数据标记点
              markPoint: {
                data: [
                  {
                    name: '最大值',
                    type: _.get($scope.options, "series_MarkPoint_Data_MaxType", [])[seriesNameIndex] === true ? 'max' : undefined,
                    symbol: _.get($scope.options, "series_MarkPoint_Data_MaxSymbol", [])[seriesNameIndex],
                    symbolSize: _.get($scope.options, "series_MarkPoint_Data_MaxSymbolSize", [])[seriesNameIndex] === undefined ?
                      9 : _.get($scope.options, "series_MarkPoint_Data_MaxSymbolSize", [])[seriesNameIndex],
                    label: {
                      show: _.get($scope.options, "series_MarkPoint_Data_Label_MaxShow", [])[seriesNameIndex],
                      position: _.get($scope.options, "series_MarkPoint_Data_Label_MaxPosition", [])[seriesNameIndex],
                      color: _.get($scope.options, "series_MarkPoint_Data_Label_MaxColor", [])[seriesNameIndex],
                      fontWeight: _.get($scope.options, "series_MarkPoint_Data_Label_MaxFontWeight", [])[seriesNameIndex],
                      fontSize: _.get($scope.options, "series_MarkPoint_Data_Label_MaxFontSize", [])[seriesNameIndex],
                      fontFamily: _.get($scope.options, "series_MarkPoint_Data_Label_MaxFontFamily", [])[seriesNameIndex],
                    },
                  },
                  {
                    name: '最小值',
                    type: _.get($scope.options, "series_MarkPoint_Data_MinType", [])[seriesNameIndex] === true ? 'min' : undefined,
                    symbol: _.get($scope.options, "series_MarkPoint_Data_MinSymbol", [])[seriesNameIndex],
                    symbolSize: _.get($scope.options, "series_MarkPoint_Data_MinSymbolSize", [])[seriesNameIndex],
                    label: {
                      show: _.get($scope.options, "series_MarkPoint_Data_Label_MinShow", [])[seriesNameIndex],
                      position: _.get($scope.options, "series_MarkPoint_Data_Label_MinPosition", [])[seriesNameIndex],
                      color: _.get($scope.options, "series_MarkPoint_Data_Label_MinColor", [])[seriesNameIndex],
                      fontWeight: _.get($scope.options, "series_MarkPoint_Data_Label_MinFontWeight", [])[seriesNameIndex],
                      fontSize: _.get($scope.options, "series_MarkPoint_Data_Label_MinFontSize", [])[seriesNameIndex],
                      fontFamily: _.get($scope.options, "series_MarkPoint_Data_Label_MinFontFamily", [])[seriesNameIndex],
                    },
                  },
                  {
                    name: '平均值',
                    type: _.get($scope.options, "series_MarkPoint_Data_AverageType", [])[seriesNameIndex] === true ? 'average' : undefined,
                    symbol: _.get($scope.options, "series_MarkPoint_Data_AverageSymbol", [])[seriesNameIndex],
                    symbolSize: _.get($scope.options, "series_MarkPoint_Data_AverageSymbolSize", [])[seriesNameIndex],
                    label: {
                      show: _.get($scope.options, "series_MarkPoint_Data_Label_AverageShow", [])[seriesNameIndex],
                      position: _.get($scope.options, "series_MarkPoint_Data_Label_AveragePosition", [])[seriesNameIndex],
                      color: _.get($scope.options, "series_MarkPoint_Data_Label_AverageColor", [])[seriesNameIndex],
                      fontWeight: _.get($scope.options, "series_MarkPoint_Data_Label_AverageFontWeight", [])[seriesNameIndex],
                      fontSize: _.get($scope.options, "series_MarkPoint_Data_Label_AverageFontSize", [])[seriesNameIndex],
                      fontFamily: _.get($scope.options, "series_MarkPoint_Data_Label_AverageFontFamily", [])[seriesNameIndex],
                    },
                  },
                ]
              },


              itemStyle: {
                color: _.get($scope.options, "series_ItemStyle_Color", [])[seriesNameIndex] === undefined ?
                  '' : _.get($scope.options, "series_ItemStyle_Color", [])[seriesNameIndex],
              }
            });

            // 遍历时的下标++ 选到下一条系列
            // seriesItemStyleColor += 1;
            seriesNameIndex += 1;
            // symbolSizeIndex += 1;
            // symbolIndex += 1;
            // symbolRotateIndex += 1;
            // labelShowIndex += 1;
            // labelPositionIndex += 1;
            // labelColor += 1;
            // labelFontWeight += 1;
            // labelFontSize += 1;
            // labelFontFamily += 1;
            // markPoint max
            // markPointDataMaxType += 1;
            // markPointMaxSymbolIndex += 1;
            // markPointMaxSymbolSizeIndex += 1;
            // markPointMaxLabelShowIndex += 1;
            // markPointMaxLabelPositionIndex += 1;
            // markPointMaxLabelColor += 1;
            // markPointMaxLabelFontWeight += 1;
            // markPointMaxLabelFontSize += 1;
            // markPointMaxLabelFontFamily += 1;
            // markPoint min
            // markPointDataMinType += 1;
            // markPointMinSymbolIndex += 1;
            // markPointMinSymbolSizeIndex += 1;
            // markPointMinLabelShowIndex += 1;
            // markPointMinLabelPositionIndex += 1;
            // markPointMinLabelColor += 1;
            // markPointMinLabelFontWeight += 1;
            // markPointMinLabelFontSize += 1;
            // markPointMinLabelFontFamily += 1;
            // markPoint average
            // markPointDataAverageType += 1;
            // markPointAverageSymbolIndex += 1;
            // markPointAverageSymbolSizeIndex += 1;
            // markPointAverageLabelShowIndex += 1;
            // markPointAverageLabelPositionIndex += 1;
            // markPointAverageLabelColor += 1;
            // markPointAverageLabelFontWeight += 1;
            // markPointAverageLabelFontSize += 1;
            // markPointAverageLabelFontFamily += 1;


            // markLineDataMaxType += 1;
            // markLineDataMaxLineStyleColor += 1;
            // markLineDataMaxLineStyleWidth += 1;
            // markLineDataMaxLineStyleType += 1;
          });

          let myChart = null;

          if (document.getElementById("main")) {
            document.getElementById("main").id = $scope.options.id;
            // eslint-disable-next-line
            myChart = echarts.init(document.getElementById($scope.options.id));
          } else {
            // eslint-disable-next-line
            myChart = echarts.init(document.getElementById($scope.options.id));
          }

          // use configuration item and data specified to show chart

          if (_.get($scope.options, "form.isCodeEnabled", false)) {
            myChart.setOption(JSON.parse(_.replace($scope.options.form.code, "'", '"')), true);
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
        area: { name: 'Echarts线形面积图', icon: 'area-chart' },
        scatter: { name: 'Echarts散点图', icon: 'area-chart' }
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
        { label: 'triangle', value: 'triangle' },
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
        { label: 'DataVis-红色', value: '#ed4d50' },
        { label: 'DataVis-绿色', value: '#6eb37a' },
        { label: 'DataVis-蓝色', value: '#5290e9' },
        { label: 'DataVis-橘色', value: '#ee941b' },
        { label: 'DataVis-紫色', value: '#985896' }
      ];
      $scope.BackgroundColors = [
        { label: '暗绿色', value: '#84AF9B' },
        { label: '白色', value: '#ffffff' },
        { label: '黑色', value: '#2C3E50' }
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
