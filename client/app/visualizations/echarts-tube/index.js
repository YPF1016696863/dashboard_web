/* eslint-disable no-else-return */
/* eslint-disable object-shorthand */
/* eslint-disable func-names */
import * as _ from 'lodash';
import $ from 'jquery';
import UUIDv4 from 'uuid/v4';
import echartsTemplate from './echarts.html';
import echartsEditorTemplate from './echarts-editor.html';


import { defaultTubeChartOptions, getChartType, setThemeColor } from './echartsTubeChartOptionUtils';

function EchartsTubeRenderer($rootScope) {
    return {
        restrict: 'E',
        scope: {
            queryResult: '=',
            options: '=?',
        },
        template: echartsTemplate,
        link($scope, $element) {

            if (_.isEmpty($scope.options) || $scope.options.chartType !== "TubeChart") {
                $scope.options = defaultTubeChartOptions();
            }

            let mercuryColor = '#fd4d49';
            let borderColor = '#fd4d49';




            // 因为柱状初始化为0，温度存在负值，所以，原本的0-100，改为0-130，0-30用于表示负值

            let echartsData = [];

            const refreshData = () => {
                try {
                    if (!_.isUndefined($scope.queryResult) && $scope.queryResult.getData()) {

                        // 刻度使用柱状图模拟，短设置3，长的设置5；构造一个数据
                        const kd = [];
                        for (let i = 0, len = 160; i <= len; i += 1) {
                            if (i > _.get($scope.options, "preLen", 130) || i < _.get($scope.options, "tailLen", 30)) {
                                kd.push('0')
                            } else {
                                if (i % 5 === 0) {
                                    kd.push('5');
                                } else {
                                    kd.push('3');
                                }
                            }
                        }

                        const data = $scope.queryResult.getData();
                        echartsData = [];

                        // 此处把选择的（新）列名转换成原列名格式
                        const searchColumns = $scope.queryResult.getColumns(); // 获取包含新列名和旧列名的对象的数组

                        // 对x轴选择的列名进行处理，转化为原列名查找
                        const newXData = _.get($scope.options, "form.xAxisColumn", '') // 前端页面选择的x轴新列名
                        let oldXData = newXData;
                        _.forEach(searchColumns, function (rowXValue, rowXKey) {
                            const everyXColumn = rowXValue;
                            if (newXData === everyXColumn.friendly_name) {
                                oldXData = everyXColumn.name;   // oldXData为原来的横轴X列名
                            }
                        });

                        // eslint-disable-next-line func-names
                        _.forEach(data, function (value) { // [{0},{1}...] 筛选出每一个{0} {1} ...
                            // eslint-disable-next-line func-names
                            _.forEach(value, function (valueChildren, keyChildren) {
                                if (keyChildren === oldXData) {
                                    echartsData.push(valueChildren);
                                }

                            });
                        });
                        mercuryColor = _.get($scope.options, "inColor", '#fd4d49');
                        borderColor = _.get($scope.options, "outColor", '#fd4d49');

                        console.log(echartsData[echartsData.length - 1]);
                        // 切换主题颜色
                        setThemeColor($scope.options, _.get($rootScope, "theme.theme", "light"));

                        _.set($scope.options, "series", []); // 清空设置           
                        $scope.options.series.push({

                            name: '条',
                            type: 'bar',
                            // 对应上面XAxis的第一个对象配置
                            xAxisIndex: 0,
                            data: [echartsData[echartsData.length - 1]],
                            barWidth: 18,
                            itemStyle: {
                                normal: {
                                    color: mercuryColor,
                                    barBorderRadius: 0,
                                }
                            },
                            label: {
                                normal: {
                                    show: true,
                                    position: 'top',
                                    formatter: function (param) {
                                        // 因为柱状初始化为0，温度存在负值，所以，原本的0-100，改为0-130，0-30用于表示负值
                                        return param.value - 30 + _.get($scope.options, "tail", '°C');
                                    },
                                    textStyle: {
                                        color: _.get($scope.options, "textColor", '#000'),
                                        fontSize: '10',
                                    }
                                }
                            },
                            z: 2
                        }, {
                            name: '白框',
                            type: 'bar',
                            xAxisIndex: 1,
                            barGap: '-100%',
                            data: [_.get($scope.options, "preKuangLen", 140) - 1],
                            barWidth: 28,
                            itemStyle: {
                                normal: {
                                    color: '#ffffff',
                                    barBorderRadius: 50,
                                }
                            },
                            z: 1
                        }, {
                            name: '外框',
                            type: 'bar',
                            xAxisIndex: 2,
                            barGap: '-100%',
                            data: [_.get($scope.options, "preKuangLen", 140)],
                            barWidth: 38,
                            itemStyle: {
                                normal: {
                                    color: borderColor,
                                    barBorderRadius: 50,
                                }
                            },
                            z: 0
                        }, {
                            name: '圆',
                            type: 'scatter',
                            hoverAnimation: false,
                            data: [0],
                            xAxisIndex: 0,
                            symbolSize: 48,
                            itemStyle: {
                                normal: {
                                    color: mercuryColor,
                                    opacity: 1,
                                }
                            },
                            z: 2
                        }, {
                            name: '白圆',
                            type: 'scatter',
                            hoverAnimation: false,
                            data: [0],
                            xAxisIndex: 1,
                            symbolSize: 60,
                            itemStyle: {
                                normal: {
                                    color: '#ffffff',
                                    opacity: 1,
                                }
                            },
                            z: 1
                        }, {
                            name: '外圆',
                            type: 'scatter',
                            hoverAnimation: false,
                            data: [0],
                            xAxisIndex: 2,
                            symbolSize: 70,
                            itemStyle: {
                                normal: {
                                    color: borderColor,
                                    opacity: 1,
                                }
                            },
                            z: 0
                        }, {
                            name: '刻度',
                            type: 'bar',
                            yAxisIndex: 1,
                            xAxisIndex: 3,
                            label: {
                                normal: {
                                    show: true,
                                    position: 'right',
                                    distance: 5,
                                    color: _.get($scope.options, "kdColor", '#525252'),
                                    fontSize: 10,
                                    formatter: function (params) {
                                        // 因为柱状初始化为0，温度存在负值，所以，原本的0-100，改为0-130，0-30用于表示负值
                                        if (params.dataIndex > _.get($scope.options, "preLen", 130)
                                            || params.dataIndex < _.get($scope.options, "tailLen", 30)) {
                                            return '';
                                        } else {
                                            if (params.dataIndex % 5 === 0) {
                                                return params.dataIndex - 30;
                                            } else {
                                                return '';
                                            }
                                        }
                                    }
                                }
                            },
                            barGap: '-100%',
                            data: kd,
                            barWidth: 1,
                            itemStyle: {
                                normal: {
                                    color: borderColor,
                                    barBorderRadius: 10,
                                }
                            },
                            z: 0



                        });


                        let myChart = null;

                        if (document.getElementById("tube-main")) {
                            document.getElementById("tube-main").id = $scope.options.id;
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

                            // let height ='100%';
                            // let width ='100%';
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


function EchartsTubeEditor() {
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
                // $scope.columnNames = _.map($scope.columns, i => i.name);
                $scope.columnNames = _.map($scope.columns, i => i.friendly_name);
            } catch (e) {
                console.log("some error");
            }
            // Set default options for new vis// 20191203 bug fix 
            if (_.isEmpty($scope.options) || $scope.options.chartType !== "TubeChart") {
                $scope.options = defaultTubeChartOptions();
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


            $scope.$watch('options', () => { }, true);
        },
    };
}

export default function init(ngModule) {
    ngModule.directive('echartsTubeEditor', EchartsTubeEditor);
    ngModule.directive('echartsTubeRenderer', EchartsTubeRenderer);

    ngModule.config((VisualizationProvider) => {
        const renderTemplate =
            '<echarts-tube-renderer options="visualization.options" query-result="queryResult"></echarts-tube-renderer>';

        const editorTemplate = '<echarts-tube-editor options="visualization.options" query-result="queryResult"></echarts-tube-editor>';
        const defaultOptions = {

        };

        VisualizationProvider.registerVisualization({
            type: 'ECHARTS-TUBE',
            name: 'Echarts试管图',
            renderTemplate,
            editorTemplate,
            defaultOptions,
        });
    });
}

init.init = true;