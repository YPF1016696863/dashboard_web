import * as _ from 'lodash';
import $ from 'jquery';
import UUIDv4 from 'uuid/v1';
import echartsTemplate from './echarts.html';
import echartsEditorTemplate from './echarts-editor.html';

import { defaultPolarChartOptions, parseChartType, getChartType, setThemeColor } from './echartsPolarChartOptionUtils';

function EchartsPolarRenderer($timeout, $rootScope, $window) {
  return {
    restrict: 'E',
    scope: {
      queryResult: '=',
      options: '=?',
    },
    template: echartsTemplate,
    link($scope, $element) {

      $scope.chartSeries = [];
      if (_.isEmpty($scope.options) || $scope.options.chartType !== "PolarChart") {
        $scope.options = defaultPolarChartOptions();
      }
      const refreshData = () => {
        try {
          if (!_.isUndefined($scope.queryResult) && $scope.queryResult.getData()) {
            // 切换主题颜色
            setThemeColor($scope.options, _.get($rootScope, "theme.theme", "light"));

            const data = $scope.queryResult.getData();
            // 输入的数据格式转换  系列1
            const seriesData = [];
            _.set($scope.options, "series", []);// 清空设置

            const polarData = [];
            const xDataValue = [];
            const xData = _.get($scope.options, "form.xAxisColumn", "::");// name string 这一列  AGENT_NAME
            _.forEach(data, function (value, key) {// [{0},{1}...] 筛选出每一个{0} {1} ...
              const onesValue = value;
              _.forEach(onesValue, function (oneXvalue, oneXkey) { // {0}=>{n:v,n:v...} 筛选出每一个 name和对应的value
                if (oneXkey === xData) { // x
                  const xValue = oneXvalue;
                  xDataValue.push(xValue);
                  _.forEach(onesValue, function (oneYvalue, oneYkey) { // {0}=>{n:v,n:v...} 筛选出每一个 name和对应的value
                    if (oneYkey === _.get($scope.options, "form.yAxisColumn", "")) {
                      // 饼图的系列名选择 目前只选一个的话 找到x 的实际value yData[0]
                      polarData.push(
                        [xValue, oneYvalue]
                      );
                    }
                  });
                }
              });
            });


            // 自定义输入系列名称、样式等
            $scope.options.series.push({

              coordinateSystem: 'polar',
              name: _.get($scope.options, "series_Name", ''),  // 设置系列/图例的名称
              type: 'scatter',
              data: polarData,

              // 设置标记点大小--默认设置为何现实很小
              symbolSize: _.get($scope.options, "series_SymbolSize", 16),

              // 设置标记点形状
              symbol: _.get($scope.options, "series_Symbol", 'circle'),

              // // 设置标记点旋转角度
              symbolRotate: _.get($scope.options, "series_SymbolRotate", ''),

              markPoint: {

              },
              // 设置系列颜色
              itemStyle: {
                color: _.get($scope.options, "series_ItemStyle_Color", '') === undefined ?
                  '' : _.get($scope.options, "series_ItemStyle_Color", ''),
              }

            });

            // 设置环形分割区域的间隔颜色
            _.set($scope.options, "radiusAxis.splitArea.areaStyle.color",
              [_.get($scope.options, "radiusAxis.splitArea.areaStyle.color1", 'transparent'),
              _.get($scope.options, "radiusAxis.splitArea.areaStyle.color2", 'transparent')]);

            // 设置扇形分割区域的间隔颜色
            _.set($scope.options, "angleAxis.splitArea.areaStyle.color",
              [_.get($scope.options, "angleAxis.splitArea.areaStyle.color1", 'transparent'),
              _.get($scope.options, "angleAxis.splitArea.areaStyle.color2", 'transparent')]);

            //  提示框文字格式
            const formatterString = `${_.get($scope.options, "Text_a", "")}
           {a}&nbsp${_.get($scope.options, "a_Text", "")}

           <br/>${_.get($scope.options, "Text_b", "")},
           ${_.get($scope.options, "Text_c", "")}：

           {b}{c}&nbsp${_.get($scope.options, "b_Text", "")} 
           ${_.get($scope.options, "c_Text", "")}`;

            _.set($scope.options, "tooltip.formatter", formatterString);

            // 系列名称：极坐标图 1
            // 距离，角度值：180，200 km，°



            let myChart = null;

            if (document.getElementById("polar-main")) {
              document.getElementById("polar-main").id = $scope.options.id;
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
        } catch (e) {
          console.log("先选组件类型 则该方法不存在因此用trycatch来解决:$scope.queryResult.getData is not a function");
        }
      };

      $scope.$watch('options', refreshData, true);
      $scope.$watch('queryResult && queryResult.getData()', refreshData);
      $rootScope.$watch('theme.theme', refreshData);
    },
  };
}

function EchartsPolarEditor() {
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
        console.log("先选组件类型 则该方法不存在因此用trycatch来解决:$scope.queryResult.getData is not a function");
      }
      // Set default options for new vis // 20191203 bug fix 
      if (_.isEmpty($scope.options) || $scope.options.chartType !== "PolarChart") {
        $scope.options = defaultPolarChartOptions();
      }
      $scope.selectedChartType = getChartType($scope.options);

      $scope.currentTab = 'general';
      $scope.changeTab = (tab) => {
        $scope.currentTab = tab;
      };
      $scope.chartTypes = {
        polar: { name: 'Echarts极坐标图', icon: 'line-chart' }
      };

      $scope.xAxisScales = [
        { label: '类目轴(类目轴，适用于离散的类目数据)', value: 'category' },
        { label: '数值轴(适用于连续数据)', value: 'value' },
        { label: '时间轴(适用于连续的时序数据，与数值轴相比时间轴带有时间的格式化)', value: 'time' },
        { label: '对数轴(适用于对数数据)', value: 'log' }
      ];

      $scope.xAxisLocations = [
        { label: '数据轴起始位置', value: 'start' },
        { label: '数据轴居中位置', value: 'center' },
        { label: '数据轴末端位置', value: 'end' }
      ];
      $scope.TextAligns = [
        { label: '默认', value: '' },
        { label: '自动', value: 'auto' },
        { label: '左对齐', value: 'left' },
        { label: '右对齐', value: 'right' },
        { label: '居中', value: 'center' }
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
      $scope.FontStyles = [
        { label: 'normal', value: 'normal' },
        { label: 'italic', value: 'italic' },
        { label: 'oblique', value: 'oblique' }
      ];
      $scope.LabelFontFamilys = [
        { label: 'serif', value: 'serif' },
        { label: 'monospace', value: 'monospace' },
        { label: 'Arial', value: 'Arial' },
        { label: 'Courier New', value: 'Courier New' },
        { label: 'Microsoft YaHei', value: 'Microsoft YaHei' }
      ];
      $scope.LegendAliNumbs = [
        { label: '默认', value: '' },
        { label: '左对齐', value: 'left' },
        { label: '居中', value: 'center' },
        { label: '右对齐', value: 'right' }
      ];

      // 散点的形状、大小、方向
      $scope.Symbols = [
        { label: '圆形', value: 'circle' },
        { label: '空心圆', value: 'emptyCircle' },
        { label: '圆角矩形', value: 'roundRect' },
        { label: '三角形', value: 'triangle' },
        { label: '菱形', value: 'diamond' },
        { label: '水滴', value: 'pin' },
        { label: '箭头', value: 'arrow' }
      ];


      $scope.$watch('options', () => {
      }, true);
    },
  };
}

export default function init(ngModule) {
  ngModule.directive('echartsPolarEditor', EchartsPolarEditor);
  ngModule.directive('echartsPolarRenderer', EchartsPolarRenderer);

  ngModule.config((VisualizationProvider) => {
    const renderTemplate =
      '<echarts-polar-renderer options="visualization.options" query-result="queryResult"></echarts-polar-renderer>';

    const editorTemplate = '<echarts-polar-editor options="visualization.options" query-result="queryResult"></echarts-polar-editor>';
    const defaultOptions = {
      id: UUIDv4(),
      backgroundColor: 'transparent',
      useSerie: '',           // 选中的系列名称
      size: {
        responsive: true,
        width: "600px",
        height: "400px"
      },
      title: {
        text: '',
        subtext: '',
        x: 'center',
        backgroundColor: 'transparent',// 
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
      tooltip: {
        show: true,
        trigger: 'item', // 触发类型,'item'数据项图形触发，
        axisPointer: {
          type: 'cross'
        }
      },
      grid: {
      },
      legend: {
        show: true,
        // x: 'left',
        text: '极坐标图例',
        textStyle: {
          color: '#333',
        }
      },
      toolbox: {
        show: true,
        feature: {
          dataZoom: {
            yAxisIndex: 'none'
          },
          magicType: { type: ['line', 'bar'] },
          restore: {},
          saveAsImage: {}
        }
      },
      polar: {
        center: ['50%', '54%']
      },

      // 角度坐标系的角度轴
      angleAxis: {
        min: 0,
        max: 360,
        interval: 90,// 角度间隔
        startAngle: 90,

        splitLine: {  // 分割线
          show: true,
          interval: 'auto',
        },

        splitArea: {  // 分割区域
          show: true,
        },

        // 坐标轴的设置--外围的轴
        axisLine: {
          show: true,
          lineStyle: {   // 坐标轴线的颜色
            color: '#333',
          },
        }


      },
      // 极坐标系的径向轴
      radiusAxis: {
        min: 0,
        max: 500,// 最大值
        name: '距离',
        interval: 100, //  刻度

        splitLine: {  // 分割线
          show: true,
        },

        splitArea: {  // 分割区域
          show: true,
        },
        axisLine: {
          show: true,
        }
      },
      series: []
    };

    VisualizationProvider.registerVisualization({
      type: 'ECHARTS-POLAR',
      name: 'Echarts极坐标图',
      renderTemplate,
      editorTemplate,
      defaultOptions,
    });
  });
}

init.init = true;
