/* eslint-disable func-names */
import * as _ from 'lodash';
import $ from 'jquery';
import UUIDv4 from 'uuid/v4';
import echartsTemplate from './echarts.html';
import echartsEditorTemplate from './echarts-editor.html';


import { defaultProcessChartOptions, getChartType, setThemeColor } from './echartsProcessChartOptionUtils';
import color16to10 from '../colorChange';

function EchartsProcessRenderer($rootScope) {
    return {
        restrict: 'E',
        scope: {
            queryResult: '=',
            options: '=?',
        },
        template: echartsTemplate,
        link($scope, $element) {

            if (_.isEmpty($scope.options) || $scope.options.chartType !== "ProcessChart") {
                $scope.options = defaultProcessChartOptions();
            }



            const refreshData = () => {
                try {
                    if (!_.isUndefined($scope.queryResult) && $scope.queryResult.getData()) {

                        /* *********** 调色盘16位转10进制 加上 透明度 *********** */
                        _.set($scope.options, "backgroundColor",
                            color16to10(_.get($scope.options, "backgroundColorT", "#000"),
                                _.get($scope.options, "backgroundColorTOpacity", 0)
                            ));

                        _.set($scope.options, "tooltip.backgroundColor",
                            color16to10(_.get($scope.options, "tooltip.backgroundColorT", "#000"),
                                _.get($scope.options, "tooltip.backgroundColorOpacity", 0)
                            ));

                        //  提示框文字格式
                        const formatterString = `${_.get($scope.options, "Text_a", "")}
                                {a}${_.get($scope.options, "a_Text", "")}
                                <br/>${_.get($scope.options, "Text_b", "")}
                                {b}${_.get($scope.options, "b_Text", "")}:
                                ${_.get($scope.options, "Text_c", "")}
                                {c}${_.get($scope.options, "c_Text", "")}`;
                        _.set($scope.options, "tooltip.formatter", formatterString);

                        const data = $scope.queryResult.getData();

                        let time = _.map(data, _.get($scope.options, "form.xAxisColumn", ""));
                        time = _.sortBy(_.union(time));

                        const dataX = [];
                        const timeAndEven = [];
                        for (let i = 0; i < time.length; i += 1) {

                            dataX[i] = [time[i], 0];
                            // 每一个时刻的类型和事件取出
                            const tempData = _.filter(data, [_.get($scope.options, "form.xAxisColumn", ""), time[i]]);

                            let res = "";
                            // 这一时刻 其中一行的数据
                            for (let j = 0; j < tempData.length; j += 1) {
                                const typeName = tempData[j][_.get($scope.options, "form.typeAxisColumn", "")];
                                const evenName = tempData[j][_.get($scope.options, "form.evenAxisColumn", "")];
                                res = res + typeName + ":" + evenName + "<br />";
                            }
                            timeAndEven[time[i]] = res;
                        }



                        // console.log(dataX);
                        // console.log(timeAndEven);

                        // 切换主题颜色
                        setThemeColor($scope.options, _.get($rootScope, "theme.theme", "light"));

                        const chooseData = _.get($scope.options, "form.xAxisColumn", "::");// 无数据选择

                        if (chooseData) {

                            _.set($scope.options, "tooltip.formatter",
                                function (params) {
                                    return timeAndEven[params.data[0]];
                                }
                            );

                            _.set($scope.options, "series", []); // 清空设置           
                            $scope.options.series.push({
                                symbolSize: 20,
                                data: dataX,
                                type: 'scatter'
                            });
                        } else {
                            // eslint-disable-next-line no-sparse-arrays
                            const initData = [, "中国:成都<br />美国:as市<br />"
                                , "中国:成都<br />美国:as市<br />"
                                , "中国:成都<br />"
                                , "中国:成都<br />中国:绵阳<br />美国:bc市<br />"
                                , "中国:成都<br />中国:绵阳<br />美国:bc市<br />"
                                , "中国:成都<br />中国:绵阳<br />"
                                , "中国:成都<br />中国:绵阳<br />中国:深圳<br />"
                                , "中国:成都<br />中国:绵阳<br />中国:深圳<br />"
                                , "中国:成都<br />中国:深圳<br />"
                                , "中国:成都<br />中国:深圳<br />"
                                , "中国:成都<br />中国:深圳<br />"
                                , "中国:深圳<br />中国:xx<br />中国:xx<br />"];
                            _.set($scope.options, "tooltip.formatter",
                                function (params) {
                                    return initData[params.data[0]];
                                }
                            );
                        }



                        let myChart = null;

                        if (document.getElementById("process-main")) {
                            document.getElementById("process-main").id = $scope.options.id;
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
                            // let height = $element.parent().parent()["0"].clientHeight; // + 50
                            // let width = $element.parent().parent()["0"].clientWidth;

                            // let height =  $element.closest('.t-body').outerHeight(true);
                            // let width = $element.closest('.t-body').outerWidth(true);

                            let height = '100%';
                            let width = '100%';

                            if ($("#Preview").length !== 0) {
                                height = $("#Preview")["0"].clientHeight;
                                width = $("#Preview")["0"].clientWidth;
                            }

                            if ($("#editor").length !== 0) {
                                height = $("#editor")["0"].clientHeight - 50;
                                width = $("#editor")["0"].clientWidth - 50;
                            }
                            // console.log(height+"::"+width);
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


function EchartsProcessEditor() {
    return {
        restrict: 'E',
        template: echartsEditorTemplate,
        scope: {
            queryResult: '=',
            options: '=?',
        },
        link($scope, $element) {
            try {
                $scope.columns = $scope.queryResult.getColumns();
                $scope.columnNames = _.map($scope.columns, i => i.name);
            } catch (e) {
                console.log("some error");
            }
            // Set default options for new vis// 20191203 bug fix 
            if (_.isEmpty($scope.options) || $scope.options.chartType !== "ProcessChart") {
                $scope.options = defaultProcessChartOptions();
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
                { label: '灰色', value: 'rgba(96,96,96,0.5)' },
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
    ngModule.directive('echartsProcessEditor', EchartsProcessEditor);
    ngModule.directive('echartsProcessRenderer', EchartsProcessRenderer);

    ngModule.config((VisualizationProvider) => {
        const renderTemplate =
            '<echarts-process-renderer options="visualization.options" query-result="queryResult"></echarts-process-renderer>';

        const editorTemplate = '<echarts-process-editor options="visualization.options" query-result="queryResult"></echarts-process-editor>';
        const defaultOptions = {

        };

        VisualizationProvider.registerVisualization({
            type: 'ECHARTS-PROCESS',
            name: 'Echarts区域图',
            renderTemplate,
            editorTemplate,
            defaultOptions,
        });
    });
}

init.init = true;