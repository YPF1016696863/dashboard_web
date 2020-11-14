/* eslint-disable func-names */
import * as _ from 'lodash';
import $ from 'jquery';
import UUIDv4 from 'uuid/v4';
import echartsTemplate from './echarts.html';
import echartsEditorTemplate from './echarts-editor.html';


import { defaultGraphChartOptions, getChartType, setThemeColor } from './echartsGraphChartOptionUtils';
import color16to10 from '../colorChange';

function EchartsGraphRenderer($rootScope) {
    return {
        restrict: 'E',
        scope: {
            queryResult: '=',
            options: '=?',
        },
        template: echartsTemplate,
        link($scope, $element) {



            if (_.isEmpty($scope.options) || $scope.options.chartType !== "GraphChart") {
                $scope.options = defaultGraphChartOptions();
            }

            let nameData = [];
            let linkData = [];
            let nodeName = [];

            let startID = [];// AxisColumn
            let startName = [];
            let startValue = [];
            let startProperty = [];

            let endID = [];
            let endName = [];
            let endValue = [];
            let endProperty = [];

            let relaValue = [];
            let relaName = [];

            let uniqID = [];
            let iDName = [];// id 作为索引的数组 映射名称
            let iDValue = [];// id -value
            let iDProperty = [];
            let maxNodeValue = [];
            let maxrelaValue = [];
            const refreshData = () => {
                try {
                    if (!_.isUndefined($scope.queryResult) && $scope.queryResult.getData()) {

                        /* *********** 调色盘16位转10进制 加上 透明度 *********** */
                        _.set($scope.options, "backgroundColor",
                            color16to10(_.get($scope.options, "backgroundColorTemp", "#000"),
                                _.get($scope.options, "backgroundColorOpacity", 0)
                            ));

                        _.set($scope.options, "tooltip.axisPointer.label.backgroundColor",
                            color16to10(_.get($scope.options, "tooltip.axisPointer.label.backgroundColorT", "#000"),
                                _.get($scope.options, "tooltip.axisPointer.label.backgroundColorTOpacity", 1)
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
                        // console.log(data);
                        nameData = [];
                        nodeName = [];

                        startID = [];// AxisColumn
                        startName = [];
                        startValue = [];
                        startProperty = [];

                        endID = [];
                        endName = [];
                        endValue = [];
                        endProperty = [];

                        relaValue = [];
                        relaName = [];

                        uniqID = [];
                        maxNodeValue = [];
                        maxrelaValue = [];

                        startID = _.map(data, _.get($scope.options, 'form.startIDAxisColumn', ''));
                        startName = _.map(data, _.get($scope.options, 'form.startNameAxisColumn', ''));
                        startValue = _.map(data, _.get($scope.options, 'form.startValueAxisColumn', ''));
                        startProperty = _.map(data, _.get($scope.options, 'form.startPropertyAxisColumn', ''));

                        endID = _.map(data, _.get($scope.options, 'form.endIDAxisColumn', ''));
                        endName = _.map(data, _.get($scope.options, 'form.endNameAxisColumn', ''));
                        endValue = _.map(data, _.get($scope.options, 'form.endValueAxisColumn', ''));
                        endProperty = _.map(data, _.get($scope.options, 'form.endPropertyAxisColumn', ''));

                        relaValue = _.map(data, _.get($scope.options, 'form.relaValueAxisColumn', ''));
                        relaName = _.map(data, _.get($scope.options, 'form.relaNameAxisColumn', ''));
                        uniqID = _.uniq(_.concat(startID, endID));// ID总集合 
                        maxNodeValue = _.max(_.concat(startValue, endValue));// node size 最大值
                        maxrelaValue = _.max(relaValue);// rela size 最大值 


                        _.set($scope.options, 'nodeId', uniqID);

                        // id-name
                        iDName = [];
                        iDValue = [];
                        iDProperty = [];
                        for (let i = 0; i < startID.length; i += 1) {
                            iDName[startID[i]] = startName[i] === '' ? '' : startName[i];
                            iDValue[startID[i]] = startValue[i] === '' ? 10 : startValue[i];
                            iDProperty[startID[i]] = startProperty[i] === '' ? 'red' : startProperty[i];
                        };
                        for (let i = 0; i < endID.length; i += 1) {
                            iDName[endID[i]] = endName[i] === '' ? '' : endName[i];
                            iDValue[endID[i]] = endValue[i] === '' ? 10 : endValue[i];
                            iDProperty[startID[i]] = endProperty[i] === '' ? 'red' : endProperty[i];
                        };

                        _.set($scope.options, 'useNode_Index', _.get($scope.options, "useNode", 0));

                        _.forEach(uniqID, function (value) {

                            // eslint-disable-next-line func-names  
                            nameData.push({
                                name: iDName[value],
                                id: value,
                                // 列表中的名称改为id
                                x: _.get($scope.options, "nodeX", [0])[value] === undefined ?
                                    0 : _.get($scope.options, "nodeX", [])[value],
                                y: _.get($scope.options, "nodeY", [0])[value] === undefined ?
                                    0 : _.get($scope.options, "nodeY", [])[value],
                                symbolSize:
                                    _.get($scope.options, "nodeSize", [35])[value] === undefined ||
                                        _.get($scope.options, "nodeSize", [35])[value] === '' ?
                                        (iDValue[value] / maxNodeValue) * 100 : _.get($scope.options, "nodeSize", [35])[value],
                                // 不填则是默认给定值， 注意 要改成相对大小

                                symbol: _.get($scope.options, "nodeSymbol", [])[value] === undefined ?
                                    "circle" : _.get($scope.options, "nodeSymbol", [])[value],
                                itemStyle: {
                                    color:
                                        _.get($scope.options, "nodeColor", [])[value] === undefined ||
                                            _.get($scope.options, "nodeColor", [])[value] === '' ?
                                            iDProperty[value] : _.get($scope.options, "nodeColor", [])[value],
                                },
                                label: {
                                    color: _.get($scope.options, "nodeLabColor", [])[value] === undefined ?
                                        "#fff" : _.get($scope.options, "nodeLabColor", [])[value],
                                }
                            });
                        });
                        // console.log(nameData);

                        // 连接关系 
                        linkData = [];
                        for (let i = 0; i < Math.max(startID.length, endID.length); i += 1) {

                            const widthValue = (
                                (relaValue[i] === '' || relaValue[i] === null) ?
                                    (maxNodeValue / 10) :
                                    (parseFloat(relaValue[i]) / maxNodeValue)
                            ) * 10;
                            let jiantouWidth = widthValue;
                            if (widthValue <= 5) {
                                jiantouWidth = 5;
                            }
                            linkData.push({
                                source: startID[i] + "",
                                target: endID[i] + "",
                                label: {
                                    show: true,
                                    formatter: relaName[i]
                                },
                                symbolSize: [jiantouWidth, jiantouWidth * 2],
                                lineStyle: {
                                    color: "#ccc",
                                    width: widthValue,
                                    // color: _.get($scope.options, "linkColor", [])[useIndex] === undefined ?
                                    //     "#ccc" : _.get($scope.options, "linkColor", [])[useIndex],
                                    // type: _.get($scope.options, "linkStyle", [])[useIndex] === undefined ?
                                    //     "solid" : _.get($scope.options, "linkStyle", [])[useIndex],
                                }
                            });
                        }

                        // console.log(nameData);
                        // console.log(linkData);
                        // 切换主题颜色
                        setThemeColor($scope.options, _.get($rootScope, "theme.theme", "light"));

                        _.set($scope.options, "series", []); // 清空设置           
                        $scope.options.series.push({
                            type: 'graph',
                            layout: _.get($scope.options, "layout", 'none'),
                            // symbolSize: 50,
                            roam: true,
                            label: {
                                show: true
                            },
                            edgeSymbol: ['circle', 'arrow'],
                            edgeSymbolSize: [4, 10],
                            // edgeLabel: {
                            //   fontSize: 20
                            // },
                            data: nameData,
                            links: linkData,
                            tooltip: {
                                formatter: "{b}",
                                textStyle: {
                                    color: '#fff',
                                }
                            },
                        });

                        let myChart = null;

                        if (document.getElementById("graph-main")) {
                            document.getElementById("graph-main").id = $scope.options.id;
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
                            // let height = '100%';
                            // let width = '100%';
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


function EchartsGraphEditor() {
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
            if (_.isEmpty($scope.options) || $scope.options.chartType !== "GraphChart") {
                $scope.options = defaultGraphChartOptions();
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
            $scope.currentTab2 = 'start';
            $scope.changeTab2 = (tab2) => {
                $scope.currentTab2 = tab2;
            };
            // 系列设置二级标签
            $scope.currentTab3 = 'title';
            $scope.changeTab3 = (tab3) => {
                $scope.currentTab3 = tab3;
            };

            // 主标题折叠
            $scope.isCollapsedMain = true;
            // 副标题
            $scope.isCollapsedSub = true;
            // 颜色设置
            $scope.isCollapsedColor = true;
            // 容器的距离
            $scope.isCollapsedDistance = true;

            $scope.chartTypes = {
                graph: { name: 'Echarts拓扑图', icon: 'graph-chart' },
            };
            $scope.Layouts = [
                { label: '坐标布局', value: 'none' },
                { label: '环形布局', value: 'circular' }
            ];
            $scope.Symbols = [
                { label: '圆形', value: 'circle' },
                { label: '三角形', value: 'triangle' },
                { label: '菱形', value: 'diamond' },
                { label: '圆角方形', value: 'roundRect' },
                { label: '大头针', value: 'pin' },
                { label: '方形', value: 'rect' }
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
                { label: '虚线', value: 'dotted' }

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
    ngModule.directive('echartsGraphEditor', EchartsGraphEditor);
    ngModule.directive('echartsGraphRenderer', EchartsGraphRenderer);

    ngModule.config((VisualizationProvider) => {
        const renderTemplate =
            '<echarts-graph-renderer options="visualization.options" query-result="queryResult"></echarts-graph-renderer>';

        const editorTemplate = '<echarts-graph-editor options="visualization.options" query-result="queryResult"></echarts-graph-editor>';
        const defaultOptions = {

        };

        VisualizationProvider.registerVisualization({
            type: 'ECHARTS-GRAPH',
            name: 'Echarts拓扑图',
            renderTemplate,
            editorTemplate,
            defaultOptions,
        });
    });
}

init.init = true;