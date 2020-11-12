import * as _ from 'lodash';
import $ from 'jquery';
import UUIDv4 from 'uuid/v4';
import echartsTemplate from './echarts.html';
import echartsEditorTemplate from './echarts-editor.html';

import { defaultGaugeStageChartOptions, getChartType, setData, setThemeColor } from './echartsGaugeStageChartOptionUtils';
import color16to10 from '../colorChange';

function EchartsGaugeStageRenderer($rootScope) {
    return {
        restrict: 'E',
        scope: {
            queryResult: '=',
            options: '=?',
        },
        template: echartsTemplate,
        link($scope, $element) {



            if (_.isEmpty($scope.options) || $scope.options.chartType !== "GaugeStageChart") {
                $scope.options = defaultGaugeStageChartOptions();
            }

            const refreshData = () => {
                try {
                    if (!_.isUndefined($scope.queryResult) && $scope.queryResult.getData()) {


                        /* *********** 调色盘16位转10进制 加上 透明度 *********** */
                        _.set($scope.options, "backgroundColor",
                            color16to10(_.get($scope.options, "backgroundColorTemp", "#000"),
                                _.get($scope.options, "backgroundColorOpacity", 0)
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
                        const xDate = _.map(data, _.get($scope.options, "form.xAxisColumn", ""))[0];
                        // console.log(xDate);

                        const valueDuan = [
                            _.get($scope.options, "duan1value", "0"),
                            _.get($scope.options, "duan2value", "3"),
                            _.get($scope.options, "duan3value", "6"),
                            _.get($scope.options, "duan4value", "9")
                        ];
                        const dataIndex = _.indexOf(valueDuan, xDate + "") * 3;

                        // 切换主题颜色
                        setThemeColor($scope.options, _.get($rootScope, "theme.theme", "light"));

                        _.set($scope.options, "series", []); // 清空设置           
                        $scope.options.series.push({

                            name: '业务指标',
                            type: 'gauge',
                            min: 0,
                            max: 12,
                            startAngle: 45,
                            endAngle: -314.999999,
                            splitNumber: 12,
                            detail: {
                                formatter(e) {
                                    const i = _.indexOf(valueDuan, e + "") * 3;
                                    switch (i + "") {
                                        case "0":
                                            return _.get($scope.options, 'duan1', "阶段1");
                                        case "3":
                                            return _.get($scope.options, 'duan2', "阶段2");
                                        case "6":
                                            return _.get($scope.options, 'duan3', "阶段3");
                                        case "9":
                                            return _.get($scope.options, 'duan4', "阶段4");
                                        default:
                                            return '';
                                    }
                                }
                            },
                            data: [{ value: dataIndex, name: '阶段' }],// 0 3 6 9  . 12

                            splitLine: {
                                show: false
                            },
                            axisTick: {
                                show: false,
                                splitNumber: 2
                            },
                            axisLine: {
                                lineStyle: {
                                    color: [
                                        [0.125, _.get($scope.options, 'duan1Color', '#01c7ae')],
                                        [0.375, _.get($scope.options, 'duan2Color', '#03869e')],
                                        [0.625, _.get($scope.options, 'duan3Color', '#d09931')],
                                        [0.88, _.get($scope.options, 'duan4Color', '#c23531')],
                                        [1, _.get($scope.options, 'duan1Color', '#01c7ae')]
                                    ]
                                }
                            },
                            axisLabel: {
                                fontSize: _.get($scope.options, 'axisLabel.fontSize', 12) *
                                    ($element.parent()[0].clientWidth / 1115),
                                formatter(e) {
                                    switch (e + "") {
                                        case "0":
                                            return _.get($scope.options, 'duan1', "阶段1");
                                        case "3":
                                            return _.get($scope.options, 'duan2', "阶段2");
                                        case "6":
                                            return _.get($scope.options, 'duan3', "阶段3");
                                        case "9":
                                            return _.get($scope.options, 'duan4', "阶段4");
                                        default:
                                            return '';
                                    }
                                }
                            }

                        });

                        let myChart = null;

                        if (document.getElementById("gauge-stage-main")) {
                            document.getElementById("gauge-stage-main").id = $scope.options.id;
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


function EchartsGaugeStageEditor() {
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
            if (_.isEmpty($scope.options) || $scope.options.chartType !== "GaugeStageChart") {
                $scope.options = defaultGaugeStageChartOptions();
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

            $scope.isCollapsedScale = true;
            $scope.chartTypes = {
                gauge: { name: 'Echarts仪表盘图', icon: 'gauge-chart' },
            };


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
    ngModule.directive('echartsGaugeStageEditor', EchartsGaugeStageEditor);
    ngModule.directive('echartsGaugeStageRenderer', EchartsGaugeStageRenderer);

    ngModule.config((VisualizationProvider) => {
        const renderTemplate =
            '<echarts-gauge-stage-renderer options="visualization.options" query-result="queryResult"></echarts-gauge-stage-renderer>';

        const editorTemplate = '<echarts-gauge-stage-editor options="visualization.options" query-result="queryResult"></echarts-gauge-stage-editor>';
        const defaultOptions = {
        };

        VisualizationProvider.registerVisualization({
            type: 'ECHARTS-GAUGE-STAGE',
            name: 'Echarts阶段仪表',
            renderTemplate,
            editorTemplate,
            defaultOptions,
        });
    });
}

init.init = true;