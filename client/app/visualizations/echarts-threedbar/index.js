/* eslint-disable func-names */
import * as _ from 'lodash';
import $ from 'jquery';
import UUIDv4 from 'uuid/v4';
import echartsTemplate from './echarts.html';
import echartsEditorTemplate from './echarts-editor.html';
import 'echarts-gl';

import { defaultThreedbarChartOptions, getChartType, setThemeColor } from './echartsThreedbarChartOptionUtils';

function EchartsThreedbarRenderer($rootScope) {
    return {
        restrict: 'E',
        scope: {
            queryResult: '=',
            options: '=?',
        },
        template: echartsTemplate,
        link($scope, $element) {

            if (_.isEmpty($scope.options) || $scope.options.chartType !== "ThreedbarChart") {
                $scope.options = defaultThreedbarChartOptions();
            }

            function sortNumber(a, b) {
                return a - b
            }

            function deSortNumber(a, b) {
                return b - a
            }

            let echartsData = [];
            let dataX = [];
            let dataY = [];
            let dataXname = [];
            let dataYname = [];
            let dataZ = [];
            const refreshData = () => {
                try {
                    if (!_.isUndefined($scope.queryResult) && $scope.queryResult.getData()) {
                        const data = $scope.queryResult.getData();
                        echartsData = [];
                        dataXname = [];
                        dataYname = [];
                        dataX = [];
                        dataY = [];
                        dataZ = [];

                        _.forEach(data, function (value) { // [{0},{1}...] 筛选出每一个{0} {1} ...
                            // console.log(value);
                            // eslint-disable-next-line func-names
                            _.forEach(value, function (valueChildren, keyChildren) {
                                if (keyChildren === _.get($scope.options, "form.xAxisColumn", '')) {
                                    dataX.push(valueChildren);
                                }
                                if (keyChildren === _.get($scope.options, "form.yAxisColumn", '')) {
                                    dataY.push(valueChildren);
                                }
                                if (keyChildren === _.get($scope.options, "form.zAxisColumn", '')) {
                                    dataZ.push(valueChildren);
                                }

                                if (keyChildren === _.get($scope.options, "form.xName", '')) {
                                    if (valueChildren.length !== 0 && valueChildren !== null &&
                                        valueChildren !== undefined) {
                                        dataXname.push(valueChildren);
                                    }
                                }
                                if (keyChildren === _.get($scope.options, "form.yName", '')) {
                                    if (valueChildren.length !== 0 && valueChildren !== null &&
                                        valueChildren !== undefined) {
                                        dataYname.push(valueChildren);
                                    }
                                }
                            });
                        });
                        // console.log("dataXname,dataYname", dataXname, dataYname);
                        // console.log("dataX,dataY", dataX, dataY);

                        /**
                         * xy排序方法
                         * 
                         *  */
                        // 原始 nameX nameY 赋予一个序号 
                        // 用于定位 z数组的行列用于交换 dataXNameX dataYNameY
                        let dataXNameX = []
                        let dataYNameY = []
                        for (let i = 0; i < dataX.length; i += 1) {
                            dataXNameX.push({
                                num: dataX[i],
                                name: dataXname[i]
                            })
                        }
                        dataXNameX = _.uniqBy(dataXNameX, "num")// 去重
                        for (let i = 0; i < dataY.length; i += 1) {
                            dataYNameY.push({
                                num: dataY[i],
                                name: dataYname[i]
                            })
                        }
                        dataYNameY = _.uniqBy(dataYNameY, "num");// 去重
                        // console.log("dataXNameX, dataYNameY", dataXNameX, dataYNameY);
                        // end

                        dataXname = [];
                        for (let i = 0; i < dataXNameX.length; i += 1) {
                            dataXname.push(dataXNameX[i].name)
                        }
                        dataYname = [];
                        for (let i = 0; i < dataYNameY.length; i += 1) {
                            dataYname.push(dataYNameY[i].name)
                        }

                        let Xmax = 0;
                        let Ymax = 0;
                        for (let i = 0; i < Math.max(dataX.length, dataY.length); i += 1) {
                            Xmax = Xmax > dataX[i] ? Xmax : dataX[i];
                            Ymax = Ymax > dataX[i] ? Ymax : dataY[i];
                            echartsData.push([
                                dataX[i] === null || dataX[i] === undefined ? 0 : dataX[i],
                                dataY[i] === null || dataY[i] === undefined ? 0 : dataY[i],
                                dataZ[i] === null || dataZ[i] === undefined ? 0 : dataZ[i]
                            ]);
                        }
                        // console.log(Xmax,Ymax);
                        // arrayZ原始二维数组映射关系（关于x的）生成
                        // console.log(echartsData);
                        const arrayZ = [];
                        for (let i = 0; i <= Xmax; i += 1) {
                            arrayZ.push([]);
                            for (let j = 0; j <= Ymax; j += 1) {
                                arrayZ[i].push(0);
                            }
                        }
                        for (let i = 0; i < echartsData.length; i += 1) {
                            const x = echartsData[i][0];
                            const y = echartsData[i][1];
                            arrayZ[x][y] = echartsData[i][2]
                        }
                        // console.log("159", arrayZ);

                        let dataXNameXChange = dataXNameX
                        let dataYNameYChange = dataYNameY
                        // 用nameX 排序 反推得到对应的行列进行交换
                        // x排序
                        if (_.get($scope.options, "sortRuleX", 'noSort') !== 'noSort') {
                            dataXNameXChange = _.orderBy(dataXNameX, "name",
                                _.get($scope.options, "sortRuleX", 'noSort')
                            );
                        }
                        if (_.get($scope.options, "sortRuleY", 'noSort') !== 'noSort') {
                            dataYNameYChange = _.orderBy(dataYNameY, "name",
                                _.get($scope.options, "sortRuleY", 'noSort')
                            );
                        }
                        // console.log(dataXNameXChange, dataYNameYChange);

                        // 用 arrayZ 原始二维数组映射关系生成 新的一个关于z的二维数组 arrayZChange
                        // 方式是用dataXNameXChange, dataYNameYChange num将层次进行交换
                        const arrayZChange = [];
                        for (let i = 0; i < dataXNameXChange.length; i += 1) {
                            arrayZChange.push(arrayZ[dataXNameXChange[i].num])
                        }
                        // 生成一个关于y为索引的数组 arrayZChange 的顺时针
                        const arrayZChangeY = [];
                        for (let i = 0; i < arrayZChange[0].length; i += 1) {
                            arrayZChangeY.push([]);
                            for (let j = 0; j < arrayZChange.length; j += 1) {
                                arrayZChangeY[i].push(0);
                            }
                        }
                        // 初始化
                        for (let j = 0; j < arrayZChange[0].length; j += 1) {// 列                            
                            for (let i = 0; i < arrayZChange.length; i += 1) {// 行
                                arrayZChangeY[j][i] = arrayZChange[i][j]
                            }
                        }
                        // console.log("arrayZChangeY",arrayZChangeY);
                        // todo Y的变化
                        const arrayZChangeYTemp = [];
                        for (let i = 0; i < dataYNameYChange.length; i += 1) {
                            arrayZChangeYTemp.push(arrayZChangeY[dataYNameYChange[i].num])
                        }
                        // console.log("arrayZChangeYTemp",arrayZChangeYTemp);

                        // 逆时针90度恢复数组 写回原数组
                        for (let i = 0; i < arrayZChangeYTemp.length; i += 1) {
                            for (let j = 0; j < arrayZChangeYTemp[0].length; j += 1) {
                                arrayZChange[j][i] = arrayZChangeYTemp[i][j]
                            }
                        }

                        // console.log("****arrayZChange", arrayZChange);

                        // 更新dataXname dataYname       echartsData                  
                        for (let i = 0; i < dataXNameXChange.length; i += 1) {
                            dataXname[i] = dataXNameXChange[i].name;
                        }
                        for (let i = 0; i < dataYNameYChange.length; i += 1) {
                            dataYname[i] = dataYNameYChange[i].name;
                        }
                        echartsData = []
                        for (let i = 0; i < arrayZChange.length; i += 1) {

                            for (let j = 0; j < arrayZChange[i].length; j += 1) {
                                echartsData.push([
                                    i,
                                    j,
                                    arrayZChange[i][j] === null ||
                                        arrayZChange[i][j] === undefined ?
                                        0 : arrayZChange[i][j]
                                ]);
                            }
                        }
                        /**
                         * xy排序方法 end
                         * 
                         *  */
                        // console.log(echartsData);

                        // 切换主题颜色
                        setThemeColor($scope.options, _.get($rootScope, "theme.theme", "light"));

                        _.set($scope.options, "xAxis3D.data", dataXname);
                        _.set($scope.options, "yAxis3D.data", dataYname);


                        _.set($scope.options, "series", []); // 清空设置           
                        $scope.options.series.push({
                            type: 'bar3D', // echarts-gl 1.1.1
                            data: echartsData.map(function (item) {
                                return {
                                    value: [item[0], item[1], item[2]],
                                }
                            }),
                            shading: 'lambert',

                            label: {
                                textStyle: {
                                    fontSize: 16,
                                    borderWidth: 1
                                }
                            },

                            emphasis: {
                                label: {
                                    textStyle: {
                                        fontSize: 20,
                                        color: '#900'
                                    }
                                },
                                itemStyle: {
                                    color: '#900'
                                }
                            }

                        });


                        let myChart = null;

                        if (document.getElementById("threedbar-main")) {
                            document.getElementById("threedbar-main").id = $scope.options.id;
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
                            let height = "100%";
                            let width = "100%";

                            if ($("#preview").length !== 0) {
                                height = $element.parent().parent()["0"].clientHeight;
                                width = $element.parent().parent()["0"].clientWidth;
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

                            _.set($scope.options, "sizeBg", {
                                // responsive: true,
                                'width': '100%',
                                'height': '100%',
                                'background-image': "url(" + _.get($scope.options, "images", "url111") + ")",
                                'background-size': "100% 100%",
                                'background-repeat': "no-repeat",
                                'background-position': _.get($scope.options, "bgX", "0px") + " "
                                    + _.get($scope.options, "bgY", "0px"),
                                'border-style': _.get($scope.options, "borderStyle", "solid"),
                                'border-width': _.get($scope.options, "borderWidth", "0px"),
                                'border-color': _.get($scope.options, "borderColor", "blue"),

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


function EchartsThreedbarEditor() {
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
            if (_.isEmpty($scope.options) || $scope.options.chartType !== "ThreedbarChart") {
                $scope.options = defaultThreedbarChartOptions();
            }
            $scope.selectedChartType = getChartType($scope.options);


            // 组件背景
            $scope.getImageUrlCb = (a) => {
                _.set($scope.options, "images", a);
                $scope.$apply();
            }

            $scope.currentTab = 'general';
            $scope.changeTab = (tab) => {
                $scope.currentTab = tab;
            };
            // 样式设置二级标签
            $scope.currentTab2 = 'title';
            $scope.changeTab2 = (tab2) => {
                $scope.currentTab2 = tab2;
            };

            // 主标题折叠
            $scope.isCollapsedMain = true;
            // 副标题
            $scope.isCollapsedSub = true;
            // 颜色设置
            $scope.isCollapsedColor = true;
            // 容器的距离
            $scope.isCollapsedDistance = true;
            // 纬度轴
            $scope.isCollapsedXAxisOption = true;

            // 指标轴
            $scope.isCollapsedYAxisOption = true;

            // 横向网格线
            $scope.isCollapsedXlineOption = true;
            // 纵向网格线
            $scope.isCollapsedYlineOption = true;
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

            $scope.SortRule = [
                { label: '顺序', value: 'asc' },
                { label: '逆序', value: 'desc' },
                { label: '保持', value: 'noSort' }
            ];


            $scope.$watch('options', () => { }, true);
        },
    };
}

export default function init(ngModule) {
    ngModule.directive('echartsThreedbarEditor', EchartsThreedbarEditor);
    ngModule.directive('echartsThreedbarRenderer', EchartsThreedbarRenderer);

    ngModule.config((VisualizationProvider) => {
        const renderTemplate =
            '<echarts-threedbar-renderer options="visualization.options" query-result="queryResult"></echarts-threedbar-renderer>';

        const editorTemplate = '<echarts-threedbar-editor options="visualization.options" query-result="queryResult"></echarts-threedbar-editor>';
        const defaultOptions = {

        };

        VisualizationProvider.registerVisualization({
            type: 'ECHARTS-THREEDBAR',
            name: 'Echarts3D柱状图',
            renderTemplate,
            editorTemplate,
            defaultOptions,
        });
    });
}

init.init = true;