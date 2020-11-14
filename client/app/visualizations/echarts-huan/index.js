/* eslint-disable no-restricted-syntax */
/* eslint-disable func-names */
import * as _ from 'lodash';
import $ from 'jquery';
import UUIDv4 from 'uuid/v4';
import echartsTemplate from './echarts.html';
import echartsEditorTemplate from './echarts-editor.html';
import color16to10 from '../colorChange';

import { defaultHuanChartOptions, getChartType, setThemeColor } from './echartsHuanChartOptionUtils';

function EchartsHuanRenderer($rootScope) {
    return {
        restrict: 'E',
        scope: {
            queryResult: '=',
            options: '=?',
        },
        template: echartsTemplate,
        link($scope, $element) {

            if (_.isEmpty($scope.options) || $scope.options.chartType !== "HuanChart") {
                $scope.options = defaultHuanChartOptions();
            }


            const conditionFunction = (data) => {
                const parameter1 = {};
                const parameter2 = {};
                const parameter3 = {};

                // 条件1
                if (_.get($scope.options, 'condition1.col', "") !== "") {
                    // 条件1下 该列所有字段
                    const colList = _.uniq(_.map(data, _.get($scope.options, 'condition1.col', "")));
                    // console.log(colList);
                    _.set($scope.options, 'conditionColList1', colList);
                    // 选择到的 筛选的列名1
                    const col = _.get($scope.options, 'condition1.col', "");
                    parameter1[col] = _.get($scope.options, 'condition1.where', "");
                }

                // 条件2
                if (_.get($scope.options, 'condition2.col', "") !== "") {
                    // 条件2下 该列所有字段
                    const colList = _.uniq(_.map(data, _.get($scope.options, 'condition2.col', "")));
                    _.set($scope.options, 'conditionColList2', colList);
                    // 选择到的 筛选的列名2
                    const col = _.get($scope.options, 'condition2.col', "");
                    parameter2[col] = _.get($scope.options, 'condition2.where', "");
                }

                // 条件3
                if (_.get($scope.options, 'condition3.col', "") !== "") {
                    // 条件3下 该列所有字段
                    const colList = _.uniq(_.map(data, _.get($scope.options, 'condition3.col', "")));
                    _.set($scope.options, 'conditionColList3', colList);
                    // 选择到的 筛选的列名3
                    const col = _.get($scope.options, 'condition3.col', "");
                    parameter3[col] = _.get($scope.options, 'condition3.where', "");
                }


                let data1 = data;
                let data2 = data;
                let data3 = data;
                for (const key in parameter1) {
                    if (key !== '不筛选') {
                        data1 = _.filter(data, parameter1);
                    }
                }

                for (const key in parameter2) {
                    if (key !== '不筛选') {
                        data2 = _.filter(data, parameter2);
                    }
                }

                for (const key in parameter3) {
                    if (key !== '不筛选') {
                        data3 = _.filter(data, parameter3);
                    }
                }


                data = _.intersection(data1, data2, data3);
                return data;
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

                        const dataFitler = conditionFunction(data);

                        let xData = _.map(dataFitler, _.get($scope.options, "form.xAxisColumn"));
                        xData = xData.length !== 0 ? xData[xData.length - 1] : 0;
                        xData = xData === undefined ? 0 : xData;

                        // 实际数字的占比
                        // console.log(xData);
                        // // 用于转换成百分比呈现 的数字
                        // console.log((xData / _.get($scope.options, "maxData", 100)) * 100);
                        // // 另一半的占比
                        // console.log( _.get($scope.options, "maxData", 100) - xData);

                        // 单位
                        const danwei = '{a|' + (xData / _.get($scope.options, "maxData", 100)) * 100 +
                            '}{c|' + _.get($scope.options, "titleText", "%") + '}';
                        // _.set($scope.options.title[0], "text", danwei);


                        // 文字比例因子
                        const sizeFactor = ($element.parent()[0].clientWidth / 1115);

                        let fontSize = _.get($scope.options, 'fontSizeA', 25) * sizeFactor;
                        _.set($scope.options, 'title.textStyle.rich.a.fontSize', fontSize.toFixed(2));

                        fontSize = _.get($scope.options, 'fontSizeC', 20) * sizeFactor;
                        _.set($scope.options, 'title.textStyle.rich.c.fontSize', fontSize.toFixed(2));


                        _.set($scope.options, "title", []); // 清空设置      
                        $scope.options.title.push(
                            {
                                text: danwei,
                                x: 'center',
                                y: 'center',
                                textStyle: {
                                    rich: {
                                        a: {
                                            fontSize: (_.get($scope.options, 'fontSizeA', 25) * sizeFactor).toFixed(2),
                                            color: '#29EEF3'
                                        },

                                        c: {
                                            fontSize: (_.get($scope.options, 'fontSizeC', 20) * sizeFactor).toFixed(2),
                                            color: '#ffffff',
                                            // padding: [5,0]
                                        }
                                    }
                                }
                            },
                            {
                                text: _.get($scope.options.title1, "text.css", '环比图'),
                                left: _.get($scope.options.title1, "left", 0),
                                top: _.get($scope.options.title1, "top", 0),
                                subtext: '',
                                x: 'center',
                                backgroundColor: 'transparent',
                                textStyle: {
                                    color: _.get($scope.options.title1, "textStyle.color", '#fff'),
                                    fontStyle: _.get($scope.options.title1, "textStyle.fontStyle", 'normal'),
                                    fontFamily: _.get($scope.options.title1, "textStyle.fontFamily", 'serif'),
                                    fontSize: (_.get($scope.options.title1, "textStyle.fontSize", 25) * sizeFactor).toFixed(2),
                                }
                            }
                        );

                        // 切换主题颜色
                        setThemeColor($scope.options, _.get($rootScope, "theme.theme", "light"));

                        _.set($scope.options, "series", []); // 清空设置           
                        $scope.options.series.push({
                            name: '',
                            type: 'pie',
                            splitLine: {
                                show: false
                            },
                            radius: ['58%', '45%'],
                            silent: true,
                            clockwise: true,
                            startAngle: 90,
                            z: 0,
                            zlevel: 0,
                            label: {
                                normal: {
                                    position: "center",

                                }
                            },
                            data: [{
                                value: xData,
                                name: "",
                                itemStyle: {
                                    normal: {
                                        color: { // 完成的圆环的颜色
                                            colorStops: [{
                                                offset: 0,
                                                color: _.get($scope.options, "startCcolor", '#4FADFD')// 0% 处的颜色
                                            }, {
                                                offset: 1,
                                                color: _.get($scope.options, "endCcolor", '#28E8FA') // 100% 处的颜色
                                            }]
                                        },
                                    }
                                }
                            },
                            {
                                value: _.get($scope.options, "maxData", 100) - xData,
                                name: "",
                                label: {
                                    normal: {
                                        show: false
                                    }
                                },
                                itemStyle: {
                                    normal: {
                                        color: _.get($scope.options, "huanCcolor", '#173164')
                                    }
                                }
                            }
                            ]
                        },

                            {
                                name: "",
                                type: "gauge",
                                radius: "58%",
                                center: ['50%', '50%'],
                                startAngle: 0,
                                endAngle: 359.9,
                                splitNumber: 8,
                                hoverAnimation: true,
                                axisTick: {
                                    show: false
                                },
                                splitLine: {
                                    show: false,
                                },
                                axisLabel: {
                                    show: false
                                },
                                pointer: {
                                    show: false
                                },
                                axisLine: {
                                    lineStyle: {
                                        opacity: 0
                                    }
                                },
                                detail: {
                                    show: false
                                },
                                data: [{
                                    value: 0,
                                    name: ""
                                }]
                            }
                        );


                        let myChart = null;

                        if (document.getElementById("huan-main")) {
                            document.getElementById("huan-main").id = $scope.options.id;
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


function EchartsHuanEditor() {
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
            if (_.isEmpty($scope.options) || $scope.options.chartType !== "HuanChart") {
                $scope.options = defaultHuanChartOptions();
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
                { label: '浅蓝', value: '#4FADFD' },
                { label: '瑠璃色', value: '#2a5caa' },
                { label: '青蓝', value: '#102b6a' },
                { label: '铁绀', value: '#173164' },
                { label: '宝蓝', value: '#28E8FA' },
                { label: '橘色', value: '#ee941b' },
                { label: '蔷薇色', value: '#f05b72' },
                { label: '赤丹', value: '#d64f44' },
                { label: '紫色', value: '#985896' },
                { label: '黄緑', value: '#b2d235' },
                { label: '萌黄', value: '#a3cf62' },

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
    ngModule.directive('echartsHuanEditor', EchartsHuanEditor);
    ngModule.directive('echartsHuanRenderer', EchartsHuanRenderer);

    ngModule.config((VisualizationProvider) => {
        const renderTemplate =
            '<echarts-huan-renderer options="visualization.options" query-result="queryResult"></echarts-huan-renderer>';

        const editorTemplate = '<echarts-huan-editor options="visualization.options" query-result="queryResult"></echarts-huan-editor>';
        const defaultOptions = {

        };

        VisualizationProvider.registerVisualization({
            type: 'ECHARTS-HUAN',
            name: 'Echarts环比图',
            renderTemplate,
            editorTemplate,
            defaultOptions,
        });
    });
}

init.init = true;