/* eslint-disable func-names */
import * as _ from 'lodash';
import $ from 'jquery';
import UUIDv4 from 'uuid/v4';
import echartsTemplate from './echarts.html';
import echartsEditorTemplate from './echarts-editor.html';


import { defaultScatterCoordinatesChartOptions, getChartType, setScatter, setThemeColor } from './echartsScatterCoordinatesChartOptionUtils';

function EchartsScatterCoordinatesRenderer($rootScope) {
    return {
        restrict: 'E',
        scope: {
            queryResult: '=',
            options: '=?',
        },
        template: echartsTemplate,
        link($scope, $element) {

            if (_.isEmpty($scope.options) || $scope.options.chartType !== "ScatterCoordinatesChart") {
                $scope.options = defaultScatterCoordinatesChartOptions();
            }
            let echartsData = [];
            let dataX = [];
            let dataY = [];
           
            const refreshData = () => {
                try {
                    if (!_.isUndefined($scope.queryResult) && $scope.queryResult.getData()) {
                        const data = $scope.queryResult.getData();
                        echartsData = [];
                        dataX = [];
                        dataY = [];
                     
                        _.forEach(data, function(value) { // [{0},{1}...] 筛选出每一个{0} {1} ...
                            // eslint-disable-next-line func-names
                            _.forEach(value, function(valueChildren, keyChildren) {
                                if (keyChildren === _.get($scope.options, "form.xAxisColumn", '')) {
                                    dataX.push(valueChildren);
                                }
                                if (keyChildren === _.get($scope.options, "form.yAxisColumn", '')) {
                                    dataY.push(valueChildren);
                                }
                               

                            });
                        });

                        for (let i = 0; i < Math.max(dataX.length, dataY.length); i += 1) {
                            echartsData.push([
                                dataX[i] === null || dataX[i] === undefined ? 0 : dataX[i],
                                dataY[i] === null || dataY[i] === undefined ? 0 : dataY[i],
                              
                            ], );
                        }


                        // 切换主题颜色
                        setThemeColor($scope.options, _.get($rootScope, "theme.theme", "light"));

                        

                        _.set($scope.options, "series", []); // 清空设置  

                        $scope.options.series.push({
                            data: echartsData,
                            type: 'line',
                            symbol: _.get($scope.options, 'pointSymbols', 'circle'),

                            // 选择数值后，不可自定义散点大小，散点大小自动根据数值大小变化
                            symbolSize: _.get($scope.options, "visualMap.show", false) ?
                                // eslint-disable-next-line no-shadow
                                15 : setScatter(_.get($scope.options, 'pointSize', 15)),

                            itemStyle: {
                                color: _.get($scope.options, 'pointColor', '#ed4d50'),
                            },
                            lineStyle: {
                                color: _.get($scope.options, 'lineColor', '#ed4d50'),
                                type: 'none',
                            },

                        });


                        let myChart = null;

                        if (document.getElementById("scatter-coordinates-main")) {
                            document.getElementById("scatter-coordinates-main").id = $scope.options.id;
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
                            
                            
                            let height ='100%';
                            let width ='100%';
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

            $scope.handleResize = _.debounce(() => {
                refreshData(); 
            }, 50);

            $scope.$watch('options', refreshData, true);
            $scope.$watch('queryResult && queryResult.getData()', refreshData);
            $rootScope.$watch('theme.theme', refreshData);
        },
    };
}


function EchartsScatterCoordinatesEditor() {
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
            if (_.isEmpty($scope.options) || $scope.options.chartType !== "ScatterCoordinatesChart") {
                $scope.options = defaultScatterCoordinatesChartOptions();
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
                { label: '黄色调渐变', value: ['#FFFFDD', '#FFFFBB', '#FFFF99', '#FFFF77', '#FFFF55', '#FFFF55', '#FFFF00', '#DDDD00', '#CCCC00', '##AAAA00', ] },
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


            $scope.$watch('options', () => {}, true);
        },
    };
}

export default function init(ngModule) {
    ngModule.directive('echartsScatterCoordinatesEditor', EchartsScatterCoordinatesEditor);
    ngModule.directive('echartsScatterCoordinatesRenderer', EchartsScatterCoordinatesRenderer);

    ngModule.config((VisualizationProvider) => {
        const renderTemplate =
            '<echarts-scatter-coordinates-renderer options="visualization.options" query-result="queryResult"></echarts-scatter-coordinates-renderer>';

        const editorTemplate = '<echarts-scatter-coordinates-editor options="visualization.options" query-result="queryResult"></echarts-scatter-coordinates-editor>';
        const defaultOptions = {

        };

        VisualizationProvider.registerVisualization({
            type: 'ECHARTS-SCATTER-COORDINATES',
            name: 'Echarts散点坐标图',
            renderTemplate,
            editorTemplate,
            defaultOptions,
        });
    });
}

init.init = true;