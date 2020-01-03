/* eslint-disable func-names */
import * as _ from 'lodash';
import $ from 'jquery';
import UUIDv4 from 'uuid/v4';
import echartsTemplate from './echarts.html';
import echartsEditorTemplate from './echarts-editor.html';

import { defaultPieChartOptions, parseChartType, getChartType, setThemeColor, getRadius, } from './echartsPieChartOptionUtils';

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

      if (_.isEmpty($scope.options) || $scope.options.chartType !== "PieChart") {
        $scope.options = defaultPieChartOptions();
      }




      const refreshData = () => {
        try {
          if (!_.isUndefined($scope.queryResult) && $scope.queryResult.getData()) {


            // 切换主题颜色
            setThemeColor($scope.options, _.get($rootScope, "theme.theme", "light"));


            // 找到选中serise的下标        
            _.set($scope.options, 'useSerie_Index',
              _.findIndex(
                _.get($scope.options, "form.yAxisColumns", []),
                function (o) { return o === _.get($scope.options, 'useSerie', ''); }
              ));

            // 当xy数据有修改才刷新
            const data = $scope.queryResult.getData();
            // 输入的数据格式转换 
            const seriesData = [];
            let pieData = [];
            let xDataValue = [];
            const yData = _.get($scope.options, "form.yAxisColumns", ":::");
            // COMMISSION11 value 这一列  ["COMMISSION2", "COMMISSION11"]
            const xData = _.get($scope.options, "form.xAxisColumn", "::");
            // name string 这一列  AGENT_NAME
            _.each(_.get($scope.options, "form.yAxisColumns", []), (yAxisColumn) => {
              pieData = [];
              xDataValue = [];
              _.forEach(data, function (value, key) {
                // [{0},{1}...] 筛选出每一个{0} {1} ...
                const onesValue = value;
                _.forEach(onesValue, function (oneXvalue, oneXkey) {
                  // {0}=>{n:v,n:v...} 筛选出每一个 name和对应的value
                  if (oneXkey === xData) { // x
                    const xValue = oneXvalue;
                    xDataValue.push(xValue);
                    _.forEach(onesValue, function (oneYvalue, oneYkey) {
                      // {0}=>{n:v,n:v...} 筛选出每一个 name和对应的value
                      if (oneYkey === yAxisColumn) {// 这里每次刷新都初始化颜色 导致扇瓣设置不成功***
                        // 饼图的系列名选择 目前只选一个的话 找到x 的实际value yData[0]
                        pieData.push({
                          name: xValue,
                          value: oneYvalue,
                          itemStyle: { color: '' }
                        });
                      }
                    });

                  }
                });
              });
              seriesData.push(pieData);
              // _.set($scope.options, 'fanFlag', false);
            });


            // console.log(seriesData);
            // console.log(xDataValue);

            // 每个扇瓣的颜色设置 (选择扇瓣)  选中系列再选扇瓣（未完成）
            _.set($scope.options, "Fans", xDataValue);
            // 遍历x轴选中列 对应的所有值
            const selectFan = _.get($scope.options, "useFan", []);
            // 保存选中的扇瓣
            _.forEach(pieData, function (value, key) {
              // [{name:yy,value:15,item..}},{1}...] 筛选出每一个{0} {1} ...分离
              const onesValue = value;
              // name: "王小斌", value: 50}
              _.forEach(onesValue, function (oneXvalue, oneXkey) {
                // {0}=>{n:v,n:v...} 筛选出每一个 name和对应的value
                if (oneXvalue === selectFan) {
                  // 找到选中的x的数据 王小斌===选择的王小斌
                  _.set(onesValue, "itemStyle.color", _.get($scope.options, "series_ItemStyle_Color", ''));
                  // onesValue.itemStyle.color =
                  //   _.get($scope.options, "series_ItemStyle_Color", '');// 把颜色值添加到对应的扇瓣
                }
              });
            });

            let seriesIndex = 0;
            _.set($scope.options, "series", []);// 清空设置
            _.each(_.get($scope.options, "form.yAxisColumns", []), (yAxisColumn) => {

              $scope.options.series.push({
                name: _.get($scope.options, "series_Name", ''),
                type: 'pie',
                radius: getRadius($scope.options,
                  _.get($scope.options.form.yAxisColumnTypes, yAxisColumn,
                    _.get($rootScope, 'selectChartType', 'pie')),
                  seriesIndex),// 内外半径修改 多系列需动态
                center: [_.get($scope.options, "series_CenterX", "50%"),
                _.get($scope.options, "series_CenterY", "50%")],

                data: seriesData[seriesIndex].sort(function (a, b) { return a.value - b.value; }),// 多系列需动态
                // 判断是玫瑰图
                roseType: _.get($scope.options.form.yAxisColumnTypes, yAxisColumn,
                  _.get($rootScope, 'selectChartType', 'radius')) === "rose" ? 'radius' : undefined,
                label: {
                  normal: {
                    show: _.get($scope.options, "series_Label_Position", '')[seriesIndex] !== 'center',
                    position: _.get($scope.options, "series_Label_Position", '')[seriesIndex],
                    fontSize: _.get($scope.options, "series_Label_FontSize", 25)[seriesIndex],
                    formatter: `{b}${_.get($scope.options, "show_Persant", false) ? `{d}%` : ``} `,
                    // formatter (params){ 
                    //   console.log(params);
                    //   let str =  params.name      
                    //   if(str.length>= 4 && text.length <= 8)
                    //   {
                    //     str = `${str.slice(0,4)}\n${str.slice(4)}`
                    //   } else if(str.length > 8 && str.length <= 16){
                    //     str = `${str.slice(0,8)}\n${str.slice(16)}\n`
                    //   }else if(str.length > 16 && str.length <= 24){
                    //     str = `${str.slice(0,8)}\n${str.slice(8,16)}\n${str.slice(16)}`
                    //   }
                    //   return str
                    // },


                    },
                  emphasis: {
                    show: true,
                    textStyle: {
                      fontSize: _.get($scope.options, "series_Label_Normal_FontSize", 25)[seriesIndex],
                      fontWeight: _.get($scope.options, "series_Label_Normal_FontWeights", '')[seriesIndex],
                    }
                  },
                  color: _.get($scope.options, "series_Label_Color", ''),// 引导线名称颜色
                },
                labelLine: {
                  normal: {
                    lineStyle: {
                      color: _.get($scope.options, "series_LabelLine_LineStyle_Color", '#ccc'),// 引导线的颜色
                    },
                    smooth: 0.2,
                    length: 10,
                    length2: 20
                  }
                },
                // itemStyle: {
                //   // normal: {
                //   color: _.get($scope.options, "series_ItemStyle_Color", ''),
                //   // }
                // },
                animationType: 'scale',
                animationEasing: 'elasticOut'

              });
              seriesIndex += 1;
            });

          



            let myChart = null;

            if (document.getElementById("pie-main")) {
              document.getElementById("pie-main").id = $scope.options.id;
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
              let height = $element.parent().parent()["0"].clientHeight + 50;
              let width = $element.parent().parent()["0"].clientWidth;


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
            //  myChart.setOption(defaultPieChartOptions(), true);
            myChart.resize($scope.options.size.width, $scope.options.size.height);

          }
        } catch (e) {
          console.log("some error");
        }
      };


      // 20191211 new feature 左侧图表选择修改整个系列的图表类型 *** 同时为默认图表类型(在 type处加get的默认值)
      const selectChartType = () => {
        if (_.get($rootScope, 'selectDECharts', 'n') === 'ECHARTS-PIE-AND-RADAR') {
          // 选到这一组才刷新有效，防止修改其他组图表类型的时候，这里也刷新，导致类型出错
          // console.log("watch");
          _.set($scope, 'selectChartTypeCharts', _.get($rootScope, 'selectChartType', undefined));
          // 转为一个本地的变量
          if (_.get($scope, 'selectChartTypeCharts', undefined) !== undefined
            || _.get($scope, 'selectChartTypeCharts', null) !== null) {
            let selectType;
            switch (_.get($rootScope, 'selectChartType', 'pie')) {// 因为可能会有选到line的情况 所以这里用了case 做一个其他类型的判断
              case 'pie': selectType = 'pie'; break;
              case 'doughnut': selectType = 'doughnut'; break;
              case 'rose': selectType = 'rose'; break;
              default: selectType = 'pie';
            };
            _.each(_.get($scope.options, "form.yAxisColumns", []), (yAxisColumn) => {
              const stringTemp = "form.yAxisColumnTypes[" + yAxisColumn + "]";
              _.set($scope.options, stringTemp, selectType);
            });
          }
          _.set($scope, 'selectChartTypeCharts', undefined);
        }
      };

      // 更改扇瓣后，扇瓣相应的设置清空
      const refreshFanOption = () => {
        _.set($scope.options, "series_ItemStyle_Color", undefined);
        // _.set($scope.options,"series_LabelLine_LineStyle_Color",'');
        // _.set($scope.options,"series_Label_Color",'');
      };

      const refreshSerise = () => {
        _.set($scope.options, 'fanFlag', true);
      };


      $scope.$watch('options.form.yAxisColumns || options.form.xAxisColumn', refreshSerise);

      $scope.$watch('options.useFan', refreshFanOption, true);
      $rootScope.$watch('selectChartType', selectChartType);  // 当图表类型选择时（chart search），覆盖原先的每个系列的type值   

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

      // 20191203 feature add 
      $scope.selectChartTypeCb = (serie, type) => {// 图表类型选择的转换
        const stringTemp = "form.yAxisColumnTypes[" + serie + "]";// 按照原先的输入格式进行配置 （现在的类型输入转换）
        _.set($scope.options, stringTemp, type);
        // console.log($scope.options.form.yAxisColumnTypes);
        // $scope.options.form.yAxisColumnTypes[serie] = type;
        $scope.$apply();
      };

      try {
        $scope.columns = $scope.queryResult.getColumns();
        $scope.columnNames = _.map($scope.columns, i => i.name);
      } catch (e) {
        console.log("some error");
      }
      // Set default options for new vis// 20191203 bug fix 
      if (_.isEmpty($scope.options) || $scope.options.chartType !== "PieChart") {
        $scope.options = defaultPieChartOptions();
      }
      $scope.selectedChartType = getChartType($scope.options);

      $scope.currentTab = 'general';
      $scope.changeTab = (tab) => {
        $scope.currentTab = tab;
      };
      $scope.chartTypes = {
        pie: { name: 'Echarts饼图', icon: 'pie-chart' },
        rose: { name: 'Echarts玫瑰图', icon: 'pie-chart' },
        doughnut: { name: 'Echarts环形图', icon: 'pie-chart' }
      };


      $scope.LablePositions = [
        { label: '饼图扇区外侧', value: 'outside' },
        { label: '饼图扇区内部', value: 'inside' },
        { label: '饼图中心位置', value: 'center' }
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

      $scope.ThemeColor = [
        { label: '基础色', value: [ '#3b6291', '#943c39','#779043','#624c7c', '#388498','#bf7334','#3f6899', '#9c403d','#7d9847 ','#675083 '] },
        { label: '小清新', value: [ '#63b2ee', '#76da91','#f8cb7f','#f89588', '#7cd6cf','#9192ab','#7898e1', '#efa666','#eddd86','#9987ce'] },
        { label: '复古色', value: [ '#71ae46', '#c4cc38','#ebe12a','#eab026', '#e3852b','#d85d2a','#ce2626', '#ac2026','#96b744','#c4cc38'] },
        { label: '蓝色调渐变', value: ['#CCEBFF', '#AADDFF', '#88CFFF', '#66C2FF', '#44B4FF', '#22A7FF', '#0099FF', '#007ACC', '#0066AA', '#005288' ] },
        { label: '绿色调渐变', value: ['#d6f29b', '#b4d66b', '#a2d97e', '#9ebb1d', '#7acb14', '#7bc75a', '#33c563', '#008800', '#006600', '#344d00' ] },
        { label: '紫色调渐变', value: ['#F1DDFF', '#E4BBFF', '#D699FF', '#D699FF', '#C977FF', '#A722FF', '#9900FF', '#9900FF', '#8500DD', '#8500DD' ] },
        { label: '黄色调渐变', value: ['#FFFFDD','#FFFFBB','#FFFF99','#FFFF77', '#FFFF55', '#FFFF55', '#FFFF00', '#DDDD00', '#CCCC00', '##AAAA00', ] },
        { label: '红色调渐变', value: ['#FFDDEB', '#FFCCD6', '#FF99AD', '#FF7792','#FF6685', '#FF4469', '#FF224E', '#EE0030', '#CC0029','#99001F'] },
  
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
        { label: '默认', value: '' },
        { label: '自动', value: 'auto' },
        { label: '左对齐', value: 'left' },
        { label: '右对齐', value: 'right' },
        { label: '居中', value: 'center' }
      ];
      $scope.LegendAliNumbs = [
        { label: '默认', value: '' },
        { label: '左对齐', value: '5%' },
        { label: '居中', value: '35%' },
        { label: '右对齐', value: '65%' }
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
