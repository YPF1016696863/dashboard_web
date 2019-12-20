import * as _ from 'lodash';
import $ from 'jquery';
import UUIDv4 from 'uuid/v4';
import echartsTemplate from './echarts.html';
import echartsEditorTemplate from './echarts-editor.html';

import {
  defaultBasicChartOptions, parseChartType, getChartType, setxAxis, setyAxis,
  setScatter, setThemeColor
} from './echartsBasicChartOptionUtils';


function EchartsRenderer($timeout, $rootScope, $window) {
  return {
    restrict: 'E',
    scope: {
      queryResult: '=',// 数据集更改 导致刷新？
      options: '=?',
    },
    template: echartsTemplate,
    link($scope, $element, $route) {


      $scope.chartSeries = [];
      // 20191211 linaer bug fix 
      if (_.isEmpty($scope.options) || $scope.options.chartType !== "BasicChart") {
        // console.log("defaultSet");
        $scope.options = defaultBasicChartOptions();
      }
      // console.log($scope.options);

      const refreshData = () => {
        // 找到选中serise的下标        
        _.set($scope.options, 'useSerie_Index',
          _.findIndex(
            _.get($scope.options, "form.yAxisColumns", []),
            function (o) { return o === _.get($scope.options, 'useSerie', ''); }
          ));


        try {
          if (!_.isUndefined($scope.queryResult) && $scope.queryResult.getData()) {
            const data = $scope.queryResult.getData();

            // 切换主题颜色
            setThemeColor($scope.options, _.get($rootScope, "theme.theme", "light"));


            //  提示框文字格式
            const formatterString = `${_.get($scope.options, "Text_a", "")}
          {a}${_.get($scope.options, "a_Text", "")}
          <br/>${_.get($scope.options, "Text_b", "")}
          {b}${_.get($scope.options, "b_Text", "")}:
          ${_.get($scope.options, "Text_c", "")}
          {c}${_.get($scope.options, "c_Text", "")}`;
            _.set($scope.options, "tooltip.formatter", formatterString);

            _.set($scope.options, "dataZoom", []);// 清空设置
            $scope.options.dataZoom.push({
              type: 'inside',
              disabled: _.get($scope.options, "dataZoom_Disabled", true),
            });



            // 一旦选中了横向柱状图 x 为value y 为字符类型
            _.each(_.get($scope.options, "form.yAxisColumns", []), (yAxisColumn) => {
              if (_.get($scope.options.form.yAxisColumnTypes, yAxisColumn) === 'bar2') {// 横向柱状图
                _.set($scope.options, "bar2Flag", true);
                _.set($scope.options, "xAxis.type", 'value');
                _.set($scope.options, "yAxis.type", 'category');
                _.set($scope.options, "yAxis.data",
                  _.map(_.get($scope.queryResult, "filteredData", []), (row) => {
                    return row[_.get($scope.options, "form.xAxisColumn", "-")];
                  }));
                _.set($scope.options, "xAxis.data", undefined);
                return false;
              }
              _.set($scope.options, "bar2Flag", false);
              // _.set($scope.options, "xAxis.type", 'category');
              // _.set($scope.options, "yAxis.type", 'value');
              _.set($scope.options, "yAxis.data", undefined);
              _.set($scope.options, "xAxis.data",
                _.map(_.get($scope.queryResult, "filteredData", []), (row) => {
                  return row[_.get($scope.options, "form.xAxisColumn", "-")];
                }));
            });


            _.set($scope.options, "series", []);// 清空设置
            // series下的
            let seriesNameIndex = 0;
            // setChartType($scope.options, selected);
            _.each(_.get($scope.options, "form.yAxisColumns", []), (yAxisColumn) => {


              $scope.options.series.push({
                name: _.get($scope.options, "series_ReName", [])[seriesNameIndex] === undefined ?
                  yAxisColumn : _.get($scope.options, "series_ReName", [])[seriesNameIndex],
                type: parseChartType(
                  _.get($scope.options.form.yAxisColumnTypes, yAxisColumn,
                    _.get($scope.options, "defaultType"))
                ),// 将每个系列的类型传进去判断和转换  _.get($scope.options, "defaultType") 
                // type这里加了默认值的话容易出现预览界面都为左侧选择的图表类型
                smooth: _.get($scope.options, "series_Smooth", false),//   series_Smooth 折线与曲线切换
                data: _.map(_.get($scope.queryResult, "filteredData", []), (row) => {
                  return row[yAxisColumn];
                }),
                // 下标传入配置数组找到相应的配置
                areaStyle: _.get($scope.options.form.yAxisColumnTypes, yAxisColumn) === "area" ? {} : undefined,

                symbolSize: _.get($scope.options.form.yAxisColumnTypes, yAxisColumn) === "scatter2" ?
                  // eslint-disable-next-line no-shadow
                  function bubble(data) { return data / 2; } :// 气泡图的大小变化
                  setScatter(_.get($scope.options, "series_SymbolSize", [])[seriesNameIndex]),// 散点图大小设置



                symbol: _.get($scope.options, "series_Symbol", [])[seriesNameIndex] === undefined ?
                  'circle' : _.get($scope.options, "series_Symbol", [])[seriesNameIndex],
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

                      xAxis: setxAxis($scope.options, _.get($scope.options, "bar2Flag", false), seriesNameIndex),

                      yAxis: setyAxis($scope.options, _.get($scope.options, "bar2Flag", false), seriesNameIndex),

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
                      type: _.get($scope.options, "series_MarkPoint_Data_MaxType", [])[seriesNameIndex] === true ?
                        'max' : undefined,
                      symbol: _.get($scope.options, "series_MarkPoint_Data_MaxSymbol", [])[seriesNameIndex],
                      symbolSize: _.get($scope.options, "series_MarkPoint_Data_MaxSymbolSize", [])[seriesNameIndex]
                        === undefined ?
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
                      type: _.get($scope.options, "series_MarkPoint_Data_MinType", [])[seriesNameIndex] === true ?
                        'min' : undefined,
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
                      type: _.get($scope.options, "series_MarkPoint_Data_AverageType", [])[seriesNameIndex] === true ?
                        'average' : undefined,
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
              seriesNameIndex += 1;

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
        } catch (e) {
          console.log("some error");
        }
      };

      const refreshType = () => {// 单独对xy类型做刷新
        // 一旦选中了横向柱状图 x 为value y 为字符类型
        _.each(_.get($scope.options, "form.yAxisColumns", []), (yAxisColumn) => {
          // 有一个系列选了横向柱状图
          if (_.get($scope.options.form.yAxisColumnTypes, yAxisColumn) === 'bar2') {
            return false;
          }
          // 没有系列选了横向柱状图
          _.set($scope.options, "xAxis.type", 'category');
          _.set($scope.options, "yAxis.type", 'value');
        });
      };



      // 20191211 new feature 左侧图表选择修改整个系列的图表类型 *** 同时为默认图表类型(在 type处加get的默认值)
      const selectChartType = () => {
        // console.log("selectChartType刷新");

        if (_.get($rootScope, 'selectDECharts', 'n') === 'ECHARTS') {
          // 选到这一组才刷新有效，防止修改其他组图表类型的时候，这里也刷新，导致类型出错
          _.set($scope, 'selectChartTypeCharts', _.get($rootScope, 'selectChartType', undefined));
          // 转为一个本地的变量
          if (_.get($scope, 'selectChartTypeCharts', undefined) !== undefined
            || _.get($scope, 'selectChartTypeCharts', null) !== null) {
            // 当在组件预览界面时 该值为undefine 因此 这里做一个判断 为undefine不做处理
            let selectType;
            switch (_.get($scope, 'selectChartTypeCharts', 'new')) {// 为了处理第一次点击的问题 这里再做判断
              case 'line': selectType = 'line'; break;
              case 'bar': selectType = 'bar'; break;
              case 'area': selectType = 'area'; break;
              case 'scatter': selectType = 'scatter'; break;
              default: ;// _.set($scope.options, stringTemp, _.get($scope.options, stringTemp))
            };
            _.each(_.get($scope.options, "form.yAxisColumns", []), (yAxisColumn) => {
              // 第一次点击（没有xy数据的时候，这一步跳过）          
              const stringTemp = "form.yAxisColumnTypes[" + yAxisColumn + "]";
              switch (_.get($scope, 'selectChartTypeCharts', 'new')) {
                case 'line': selectType = 'line'; break;
                case 'bar': selectType = 'bar'; break;
                case 'area': selectType = 'area'; break;
                case 'scatter': selectType = 'scatter'; break;
                default: ;// _.set($scope.options, stringTemp, _.get($scope.options, stringTemp))
              };
              _.set($scope.options, stringTemp, selectType);// 对多系列的类型重置为选择的类型      
            });
            _.set($scope.options, "defaultType", selectType);
          }
          _.set($scope, 'selectChartTypeCharts', undefined);
        }

      };

      $rootScope.$watch('selectChartType', selectChartType);  // 当图表类型选择时（chart search），覆盖原先的每个系列的type值 
      // 改变了刷新 没有将上一次值设为默认 导致每次进入都刷新 导致传入的值为undefined 导致type设置为line

      $scope.$watch('options.form', refreshType, true);
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

      // 20191203 feature add 
      $scope.selectChartTypeCb = (serie, type) => {// 图表类型选择的转换
        const stringTemp = "form.yAxisColumnTypes[" + serie + "]";// 按照原先的输入格式进行配置 （现在的类型输入转换）
        _.set($scope.options, stringTemp, type);
        // console.log($scope.options.form.yAxisColumnTypes);
        $scope.$apply();
      };
      try {
        $scope.columns = $scope.queryResult.getColumns();
        $scope.columnNames = _.map($scope.columns, i => i.name);
      } catch (e) {
        console.log("some error");
      }


      // Set default options for new vis // 20191203 bug fix 
      if (_.isEmpty($scope.options) || $scope.options.chartType !== "BasicChart") {
        // console.log("defaultSet");
        $scope.options = defaultBasicChartOptions();
      }
      $scope.selectedChartType = getChartType($scope.options);

      $scope.currentTab = 'general';
      $scope.changeTab = (tab) => {
        $scope.currentTab = tab;
      };
      // 选项库
      $scope.chartTypes = {
        line: { name: 'Echarts线形图', icon: 'line-chart' },
        bar: { name: 'Echarts柱状图', icon: 'bar-chart' },
        bar2: { name: 'Echarts横向柱状图', icon: 'bar-chart' },
        area: { name: 'Echarts线形面积图', icon: 'area-chart' },
        scatter: { name: 'Echarts散点图', icon: 'area-chart' },
        scatter2: { name: 'Echarts气泡图', icon: 'area-chart' }

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
  ngModule.directive('echartsEditor', EchartsEditor);
  ngModule.directive('echartsRenderer', EchartsRenderer);

  ngModule.config((VisualizationProvider) => {
    const renderTemplate =
      '<echarts-renderer options="visualization.options" query-result="queryResult"  ></echarts-renderer>';

    const editorTemplate = '<echarts-editor options="visualization.options" query-result="queryResult"  ></echarts-editor>';
    const defaultOptions = {

    };// 此处的默认值先不配（在refashdata前加上判空似乎完成了默认配置的输入）

    VisualizationProvider.registerVisualization({
      type: 'ECHARTS',
      name: 'Echarts基础图表',
      renderTemplate,
      editorTemplate,
      defaultOptions,// 
    });
  });
}

init.init = true;
