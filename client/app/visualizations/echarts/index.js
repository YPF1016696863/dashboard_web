/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable func-names */
import * as _ from 'lodash';
import $ from 'jquery';
import UUIDv4 from 'uuid/v4';
// import echarts2 from 'echarts2'; // 多版本 npm install echarts2@npm:echarts@2
import { appSettingsConfig } from '@/config/app-settings';


import echartsTemplate from './echarts.html';
import echartsEditorTemplate from './echarts-editor.html';
import './index.css';


import {
    defaultBasicChartOptions,
    parseChartType,
    getChartType,
    setxAxis,
    setyAxis,
    setxAxis2,
    setyAxis2,
    setScatter,
    getFullCanvasDataURL,
    setThemeColor,
} from './echartsBasicChartOptionUtils';
import color16to10 from '../colorChange';


function EchartsRenderer($timeout, $rootScope, $window) {
    return {
        restrict: 'E',
        scope: {
            queryResult: '=', // 数据集更改 导致刷新？
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

            function sortNumber(a, b) {
                return a - b
            }

            function deSortNumber(a, b) {
                return b - a
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
                /**
                 * 一些图标布局等参数的默认值
                 * 这部分暂时需要手动默认值     
                 */
                _.set($scope.options, "grid.left", _.get($scope.options, "grid.left", '').length === 0 ?
                    '10%' : _.get($scope.options, "grid.left"));
                _.set($scope.options, "grid.top", _.get($scope.options, "grid.top", '').length === 0 ?
                    '10%' : _.get($scope.options, "grid.top"));
                _.set($scope.options, "grid.right", _.get($scope.options, "grid.right", '').length === 0 ?
                    '10%' : _.get($scope.options, "grid.right"));
                _.set($scope.options, "grid.bottom", _.get($scope.options, "grid.bottom", '').length === 0 ?
                    '10%' : _.get($scope.options, "grid.bottom"));






                // 找到选中serise的下标        
                _.set($scope.options, 'useSerie_Index',
                    _.findIndex(
                        _.get($scope.options, "mapList", []),
                        function (o) { return o === _.get($scope.options, 'useSerie', ''); }
                    ));


                /* *********** 调色盘16位转10进制 加上 透明度 *********** */
                _.set($scope.options, "backgroundColor",
                    color16to10(_.get($scope.options, "backgroundColorTemp", "#000"),
                        _.get($scope.options, "backgroundColorOpacity", 0)
                    ));

                _.set($scope.options, "tooltip.backgroundColor",
                    color16to10(_.get($scope.options, "tooltip.backgroundColorT", "#000"),
                        _.get($scope.options, "tooltip.backgroundColorOpacity", 0)
                    ));

                _.set($scope.options, "yAxis.splitLine.lineStyle.color",
                    color16to10(_.get($scope.options, "yAxis.splitLine.lineStyle.colorT", "#fff"),
                        _.get($scope.options, "yAxis.splitLine.lineStyle.colorTOpacity", 1)
                    ));

                _.set($scope.options, "xAxis.splitLine.lineStyle.color",
                    color16to10(_.get($scope.options, "xAxis.splitLine.lineStyle.colorT", "#fff"),
                        _.get($scope.options, "xAxis.splitLine.lineStyle.colorTOpacity", 1)
                    ));



                // 修改筛选框的样式
                _.set($scope.options, "form.span1.style", {
                    'background-color': color16to10(_.get($scope.options, "form.filterColumnCol_1.backgroundColor", "#fff"),
                        _.get($scope.options, "form.filterColumnCol_1.backgroundColorOpacity", 0)),
                    'color': _.get($scope.options, "form.filterColumnCol_1.color", "black"),
                    'border-color': color16to10(
                        _.get($scope.options, "form.filterColumnCol_1.borderColor", "#fff"),
                        _.get($scope.options, "form.filterColumnCol_1.borderColorOpacity", 1)
                    ),
                    'font-size': _.get($scope.options, "form.filterColumnCol_1.fontSize", "14") + "px",
                    'margin-left': _.get($scope.options, "form.filterColumnCol_1.positionX", "0%"),
                    'margin-top': _.get($scope.options, "form.filterColumnCol_1.positionY", "0%"),
                });
                // 修改筛选框的样式
                _.set($scope.options, "form.span2.style", {
                    'background-color': color16to10(_.get($scope.options, "form.filterColumnCol_2.backgroundColor", "#fff"),
                        _.get($scope.options, "form.filterColumnCol_2.backgroundColorOpacity", 0)),
                    'color': _.get($scope.options, "form.filterColumnCol_2.color", "black"),
                    'border-color': color16to10(
                        _.get($scope.options, "form.filterColumnCol_2.borderColor", "#fff"),
                        _.get($scope.options, "form.filterColumnCol_2.borderColorOpacity", 1)
                    ),
                    'font-size': _.get($scope.options, "form.filterColumnCol_2.fontSize", "14") + "px",
                    'margin-left': _.get($scope.options, "form.filterColumnCol_2.positionX", "0%"),
                    'margin-top': _.get($scope.options, "form.filterColumnCol_2.positionY", "0%"),
                });

                // 修改筛选框的样式
                _.set($scope.options, "form.span3.style", {
                    'background-color': color16to10(_.get($scope.options, "form.filterColumnCol_3.backgroundColor", "#fff"),
                        _.get($scope.options, "form.filterColumnCol_3.backgroundColorOpacity", 0)),
                    'color': _.get($scope.options, "form.filterColumnCol_3.color", "black"),
                    'border-color': color16to10(
                        _.get($scope.options, "form.filterColumnCol_3.borderColor", "#fff"),
                        _.get($scope.options, "form.filterColumnCol_3.borderColorOpacity", 1)
                    ),
                    'font-size': _.get($scope.options, "form.filterColumnCol_3.fontSize", "14") + "px",
                    'margin-left': _.get($scope.options, "form.filterColumnCol_3.positionX", "0%"),
                    'margin-top': _.get($scope.options, "form.filterColumnCol_3.positionY", "0%"),
                });



                // _.set($scope.options, "size", {
                //     responsive: true,
                //     width,
                //     height,
                //     'background': "url(" + _.get($scope.options, "images", "url111") + ")",
                //     'background-size': _.get($scope.options, "bgW", "100%") + " "
                //         + _.get($scope.options, "bgH", " 100%"),
                //     'background-position': _.get($scope.options, "bgX", "0px") + " "
                //         + _.get($scope.options, "bgY", "0px"),

                // });


                // 文字单独的自适应调整*($element.parent()[0].clientHeight/789)
                const fontSize = _.get($scope.options, 'title.textStyle.fontSizeT', 40) * ($element.parent()[0].clientWidth / 1115);
                _.set($scope.options, 'title.textStyle.fontSize', fontSize.toFixed(2));


                try {
                    if (!_.isUndefined($scope.queryResult) && $scope.queryResult.getData()) {
                        let data = $scope.queryResult.getData();


                        // console.log(color16to10(_.get($scope.options, 'selectColor', ''),
                        //     _.get($scope.options, 'selectColorOpacity', 0)));
                        // console.log(data);
                        // 全局变量
                        const searchColumns = $scope.queryResult.getColumns(); // 获取包含新列名和旧列名的对象的数组
                        // console.log(searchColumns);
                        // 0: {friendly_name: "时间", type: "integer", name: "时间"
                        // debugger

                        // ****************************别名to原名 转换
                        // x筛选列名转换
                        const xAxisColumnName = _.filter(searchColumns,
                            { 'friendly_name': _.get($scope.options, "form.xAxisColumn", '') })[0] === undefined ?
                            "" :
                            _.filter(searchColumns,
                                { 'friendly_name': _.get($scope.options, "form.xAxisColumn", '') })[0].name;
                        // y筛选列名转换
                        const yAxisColumnsName = _.filter(searchColumns,
                            { 'friendly_name': _.get($scope.options, "form.yAxisColumns", '') })[0] === undefined ?
                            "" :
                            _.filter(searchColumns,
                                { 'friendly_name': _.get($scope.options, "form.yAxisColumns", '') })[0].name;


                        // console.log(data);
                        // 计算模块Demo
                        if (_.get($scope.options, "calculate", false)) {
                            const ajaxData = {};
                            ajaxData.or_data = data;
                            ajaxData.y_name = yAxisColumnsName;
                            const UPLOAD_URL = appSettingsConfig.server.backendUrl + "/api/calculate";
                            $.ajax({
                                url: UPLOAD_URL,
                                async: false,
                                type: "post",
                                contentType: "contentType:'application/json'",
                                data: JSON.stringify(ajaxData),
                                // eslint-disable-next-line object-shorthand
                                success: function (s) {
                                    data = s.after_data;
                                },
                                // eslint-disable-next-line object-shorthand
                                error: function () {
                                    console.log("error");
                                }
                            });
                        }




                        // 初始化为不筛选
                        if (_.get($scope.options, "form.zAxisColumn", []).length === 0) {
                            _.set($scope.options, "form.zAxisColumn", "无系列");
                        }
                        if (_.get($scope.options, "form.filterColumn", []).length === 0) {
                            _.set($scope.options, "form.filterColumn", "无系列");
                        }

                        // z筛选列名转换
                        const zAxisColumnName =
                            _.filter(searchColumns,
                                { 'friendly_name': _.get($scope.options, "form.zAxisColumn", []) })[0]
                                === undefined ?
                                "不筛选" :
                                _.filter(searchColumns,
                                    { 'friendly_name': _.get($scope.options, "form.zAxisColumn", '') })[0].name;
                        // ***************************别名to原名 转换 end


                        // ***************************筛选处理  
                        // 1、列不筛选 只有x,y  需要对x对于的多个y取累加或者平均   2、列筛选 数据不筛选   3、列筛选 数据筛选
                        let filterData = [];
                        let filterXData = [];
                        let seriesYData = [];// 情况2 二维数组，一个下标对于一个系列完整（补齐）的数据
                        let mapList = []; // 用作扫描系列的列表
                        let zData = [];
                        if (_.get($scope.options, "form.zAxisColumn", '') !== "无系列") {// 筛选处理
                            // **筛选下拉框处理
                            // **获取z列数据  
                            zData = _.map(_.get($scope.queryResult, "filteredData", []), (row) => {
                                return row[zAxisColumnName];
                            });
                            zData = _.without(_.uniq(zData), undefined, null); // z列数据，数组去重
                            _.set($scope.options, "filtersNames", zData); // 设置筛选的数据下拉框 
                            $scope.options.filtersNames.push("不筛选");
                            // **筛选下拉框处理 end

                            // 条件过滤函数
                            data = conditionFunction(data);
                            // console.log(data);
                            zData = _.uniq(_.map(data, _.get($scope.options, "form.zAxisColumn", [])));
                            const groupDataTemp = _.map(zData, (row) => {
                                return _.filter(data, [zAxisColumnName, row])
                            })


                            const groupData = [];
                            // 此处长度-1是为了去除不筛选这一列 有问题
                            for (let i = 0; i < groupDataTemp.length; i += 1) {
                                groupData[i] = groupDataTemp[i];
                            }

                            // 对于x列 需要合并一个并集
                            // 筛选后的X 数据数组 全集且有序的x数组 Sort desSort noSort                                
                            if (_.get($scope.options, 'sortRule', 'Sort') === 'Sort') {
                                filterXData = _.uniq(_.map(data, xAxisColumnName)).sort(sortNumber);
                            } else if (_.get($scope.options, 'sortRule', 'Sort') === 'desSort') {
                                filterXData = _.uniq(_.map(data, xAxisColumnName)).sort(deSortNumber);
                            } else {
                                filterXData = _.uniq(_.map(data, xAxisColumnName));
                            }


                            seriesYData = []; // y系列数组

                            for (let i = 0; i < groupData.length; i += 1) { // 遍历有多少组
                                // eslint-disable-next-line no-array-constructor
                                seriesYData.push([]);
                                // 用全集x去映射回组数组 找到对应的y 找不到就为 "" 
                                for (let j = 0; j < filterXData.length; j += 1) {
                                    // 需要加一步 字符化 json字段才可读
                                    const yTempUse = yAxisColumnsName + "";
                                    seriesYData[i].push(
                                        _.filter(groupData[i], [xAxisColumnName, filterXData[j]])[0] === undefined ?
                                            "" : _.filter(groupData[i], [xAxisColumnName, filterXData[j]])[0][yTempUse]);
                                }
                            }
                            mapList = _.uniq(_.map(data, _.get($scope.options, "form.zAxisColumn", [])));

                        } else {                                         // 不筛选处理 情况1 纯xy
                            filterData = data;

                            // 对于x列 需要合并一个并集
                            // 筛选后的X 数据数组 全集且有序的x数组
                            // const xList = _.map(data, xAxisColumnName);
                            if (_.get($scope.options, 'sortRule', 'Sort') === 'Sort') {
                                filterXData = _.uniq(_.map(data, xAxisColumnName)).sort(sortNumber);
                            } else if (_.get($scope.options, 'sortRule', 'Sort') === 'desSort') {
                                filterXData = _.uniq(_.map(data, xAxisColumnName)).sort(deSortNumber);
                            } else {
                                filterXData = _.uniq(_.map(data, xAxisColumnName));
                            }


                            filterData = conditionFunction(filterData);
                            // console.log(filterData);
                            // 求出 x对应的Y list 
                            let XY = [];
                            XY = [];
                            _.each(filterData, (row) => {
                                const x = row[xAxisColumnName];
                                const y = row[yAxisColumnsName];
                                if (XY[x] === undefined) {
                                    XY[x] = [];
                                }
                                XY[x].push(y);
                            })
                            XY = _.without(XY, undefined);

                            // x对应y list数据求平均
                            for (let i = 0; i < XY.length; i += 1) {
                                const len = XY[i].length;
                                let sum = 0;
                                for (let j = 0; j < len; j += 1) {
                                    sum += XY[i][j];
                                }
                                sum = sum * 1.0 / len;
                                XY[i] = sum.toFixed(2);
                            }

                            if (_.get($scope.options, 'sortRule', 'Sort') === 'desSort') {
                                XY = XY.reverse();
                            }

                            seriesYData = [];
                            seriesYData.push(XY);
                            // console.log(seriesYData); 
                            mapList.push(yAxisColumnsName);
                        }
                        // ***************************筛选处理end 

                        _.set($scope.options, "mapList", mapList);// 系列遍历变量



                        /**
                         * 前 N 后 N seriesYData
                        */
                        if (_.get($scope.options, "preOrTail", 'noPT') === 'pre') {
                            const N = _.get($scope.options, "preOrTailN", seriesYData.length);
                            for (let i = 0; i < seriesYData.length; i += 1) {
                                seriesYData[i] = _.slice(seriesYData[i], 0, N);
                            }
                            filterXData = _.slice(filterXData, 0, N);
                        } else if (_.get($scope.options, "preOrTail", 'noPT') === 'tail') {
                            let N = _.get($scope.options, "preOrTailN", filterXData.length) >= filterXData.length ?
                                filterXData.length : _.get($scope.options, "preOrTailN", 0);

                            if (_.get($scope.options, "preOrTailN", 0).length === 0) N = filterXData.length;

                            for (let i = 0; i < seriesYData.length; i += 1) {
                                seriesYData[i] =
                                    _.slice(seriesYData[i],
                                        seriesYData[i].length - N, seriesYData[i].length);
                            }
                            filterXData = _.slice(filterXData, filterXData.length - N, filterXData.length);
                        }





                        // 一旦选中了横向柱状图 x 为value y 为字符类型 下拉框的分组代替
                        _.each(mapList, (yAxisColumn) => {
                            if (_.get($scope.options.form.yAxisColumnTypes, yAxisColumn) === 'bar2') { // 横向柱状图
                                _.set($scope.options, "bar2Flag", true);
                                _.set($scope.options, "xAxis.type", 'value');
                                _.set($scope.options, "yAxis.type", 'category');
                                _.set($scope.options, "yAxis.data", filterXData);
                                _.set($scope.options, "xAxis.data", undefined);
                                return false;
                            }
                            _.set($scope.options, "bar2Flag", false);
                            // _.set($scope.options, "xAxis.type", 'category');
                            // _.set($scope.options, "yAxis.type", 'value');
                            _.set($scope.options, "yAxis.data", undefined);
                            _.set($scope.options, "xAxis.data", filterXData);
                        });


                        _.set($scope.options, "series", []); // 清空设置

                        // const chooseData = _.get($scope.options, "form.xAxisColumn", "::");
                        // if (chooseData) {
                        //     _.set($scope.options, "series", []);
                        // }



                        // series下的
                        let seriesNameIndex = 0;
                        // setChartType($scope.options, selected);

                        // 修改为不筛选时自动分组的组数   
                        _.each(mapList, (yAxisColumn) => { // yAxisColumn
                            // console.log(yAxisColumn);

                            if (yAxisColumn !== "无系列") {
                                // y列数据
                                const yData = seriesYData;
                                // y列 系列 数据最大值
                                const maxData = _.max(yData[seriesNameIndex], (row) => {
                                    return row[yAxisColumnsName];
                                })
                                // console.log(maxData);
                                // 传入参数
                                // yData y列数据 多系列为多个数组
                                // console.log(yData[0]);

                                $scope.options.series.push({
                                    name: yAxisColumn,
                                    type: parseChartType(
                                        _.get($scope.options.form.yAxisColumnTypes, yAxisColumn,
                                            _.get($scope.options, "defaultType"))
                                    ), // 将每个系列的类型传进去判断和转换  _.get($scope.options, "defaultType") 
                                    // type这里加了默认值的话容易出现预览界面都为左侧选择的图表类型
                                    smooth: _.get($scope.options, "series_Smooth", false), //   series_Smooth 折线与曲线切换
                                    step: _.get($scope.options, "series_step", false),
                                    data: yData[seriesNameIndex],
                                    // 下标传入配置数组找到相应的配置
                                    areaStyle: _.get($scope.options.form.yAxisColumnTypes, yAxisColumn, _.get($scope.options, "defaultType")) === "area" ? {} : undefined,

                                    symbolSize: _.get($scope.options.form.yAxisColumnTypes, yAxisColumn) === "scatter2" ?
                                        // eslint-disable-next-line no-shadow
                                        function bubble(data) {
                                            return (data / maxData) * 100;
                                        } : setScatter(_.get($scope.options, "series_SymbolSize", [])[seriesNameIndex]),
                                    barWidth:
                                        _.get($scope.options, 'series_BarWidth', 'auto') === '' ||
                                            _.get($scope.options, 'series_BarWidth', 'auto') === undefined
                                            ? 'auto' : _.get($scope.options, 'series_BarWidth', 25),
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
                                        },
                                        {
                                            name: _.get($scope.options, "series_MarkLine_Data_MarkName2", [])[seriesNameIndex] === undefined ?
                                                '' : _.get($scope.options, "series_MarkLine_Data_MarkName2", [])[seriesNameIndex],

                                            xAxis: setxAxis2($scope.options, _.get($scope.options, "bar2Flag", false), seriesNameIndex),

                                            yAxis: setyAxis2($scope.options, _.get($scope.options, "bar2Flag", false), seriesNameIndex),

                                            lineStyle: {
                                                color: _.get($scope.options, "series_MarkLine_Data_LineStyle_Color2", [])[seriesNameIndex] === undefined ?
                                                    '#ed4d50' : _.get($scope.options, "series_MarkLine_Data_LineStyle_Color2", [])[seriesNameIndex],

                                                width: _.get($scope.options, "series_MarkLine_Data_LineStyle_Width2", [])[seriesNameIndex] === undefined ?
                                                    5 : _.get($scope.options, "series_MarkLine_Data_LineStyle_Width2", [])[seriesNameIndex],

                                                type: _.get($scope.options, "series_MarkLine_Data_LineStyle_Type2", [])[seriesNameIndex] === undefined ?
                                                    'solid' : _.get($scope.options, "series_MarkLine_Data_LineStyle_Type2", [])[seriesNameIndex],
                                            },
                                        }
                                    ]
                                    },

                                    // 数据标记点
                                    markPoint: {
                                        data: [{
                                            name: '最大值',
                                            type: _.get($scope.options, "series_MarkPoint_Data_MaxType", [])[seriesNameIndex] === true ?
                                                'max' : undefined,
                                            symbol: _.get($scope.options, "series_MarkPoint_Data_MaxSymbol", [])[seriesNameIndex],
                                            symbolSize: _.get($scope.options, "series_MarkPoint_Data_MaxSymbolSize", [])[seriesNameIndex] ===
                                                undefined ?
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
                            }


                        });


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
                        // 清空设置 区域缩放
                        _.set($scope.options, "dataZoom", []);
                        $scope.options.dataZoom.push({
                            type: 'inside',
                            disabled: _.get($scope.options, "dataZoom_Disabled", true),
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

                        if (_.get($scope.options, "size.responsive", false)) {
                            // let height = $element.parent().parent()["0"].clientHeight; // + 50
                            // let width = $element.parent().parent()["0"].clientWidth;

                            let height = "90%";
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
                                height,
                                // 'background': "url(" + _.get($scope.options, "images", "url111") + ")",
                                // 'background-size': _.get($scope.options, "bgW", "100%")+" "
                                // +_.get($scope.options, "bgH", " 100%"),
                                // 'background-position':_.get($scope.options, "bgX", "0px")+" "
                                // +_.get($scope.options, "bgY", "0px"),

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
                                'border-color': color16to10(
                                    _.get($scope.options, "borderColor", "#fff"),
                                    _.get($scope.options, "borderColorOpacity", 1)
                                ),

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

            const refreshType = () => { // 单独对xy类型做刷新
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
                    if (_.get($scope, 'selectChartTypeCharts', undefined) !== undefined ||
                        _.get($scope, 'selectChartTypeCharts', null) !== null) {
                        // 当在组件预览界面时 该值为undefine 因此 这里做一个判断 为undefine不做处理
                        let selectType;
                        switch (_.get($scope, 'selectChartTypeCharts', 'new')) { // 为了处理第一次点击的问题 这里再做判断
                            case 'line':
                                selectType = 'line';
                                break;
                            case 'bar':
                                selectType = 'bar';
                                break;
                            case 'area':
                                selectType = 'area';
                                break;
                            case 'scatter':
                                selectType = 'scatter';
                                break;
                            default:
                                ; // _.set($scope.options, stringTemp, _.get($scope.options, stringTemp))
                        };
                        _.each(_.get($scope.options, "form.yAxisColumns", []), (yAxisColumn) => {
                            // 第一次点击（没有xy数据的时候，这一步跳过）          
                            const stringTemp = "form.yAxisColumnTypes[" + yAxisColumn + "]";
                            switch (_.get($scope, 'selectChartTypeCharts', 'new')) {
                                case 'line':
                                    selectType = 'line';
                                    break;
                                case 'bar':
                                    selectType = 'bar';
                                    break;
                                case 'area':
                                    selectType = 'area';
                                    break;
                                case 'scatter':
                                    selectType = 'scatter';
                                    break;
                                default:
                                    ; // _.set($scope.options, stringTemp, _.get($scope.options, stringTemp))
                            };
                            _.set($scope.options, stringTemp, selectType); // 对多系列的类型重置为选择的类型      
                        });
                        _.set($scope.options, "defaultType", selectType);
                    }
                    _.set($scope, 'selectChartTypeCharts', undefined);
                }

            };

            $rootScope.$watch('selectChartType', selectChartType); // 当图表类型选择时（chart search），覆盖原先的每个系列的type值 
            // 改变了刷新 没有将上一次值设为默认 导致每次进入都刷新 导致传入的值为undefined 导致type设置为line

            $scope.$watch('options.form', refreshType, true);
            $scope.$watch('options', refreshData, true);
            $scope.$watch('queryResult && queryResult.getData()', refreshData);
            $rootScope.$watch('theme.theme', refreshData);

            // restful发送图片
            $scope.imgSave = function () {
                const imageBase64 = getFullCanvasDataURL($scope.options.id);
                // console.log(imageBase64);
                $.ajax({
                    async: false,    // 表示请求是否异步处理 
                    type: "POST",    // 请求类型
                    url: _.get($scope.options, "restfulURL", "http://localhost:8081/doBase64"),
                    dataType: "text.css",// 返回的数据类型
                    data: {
                        image: imageBase64
                    },
                    contentType: "application/x-www-form-urlencoded", // post的方式请求必须配置这个
                    success(data) {
                        alert('RESTFul已发送');
                    },
                    error(data) {
                        alert('RESTFul发送失败');
                    }
                });
            }




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
            $scope.selectChartTypeCb = (serie, type) => { // 图表类型选择的转换
                const stringTemp = "form.yAxisColumnTypes[" + serie + "]"; // 按照原先的输入格式进行配置 （现在的类型输入转换）
                console.log(stringTemp);
                _.set($scope.options, stringTemp, type);
                // console.log($scope.options.form.yAxisColumnTypes);
                $scope.$apply();
            };
            try {
                $scope.columns = $scope.queryResult.getColumns();
                // $scope.columnNames = _.map($scope.columns, i => i.name);
                $scope.columnNames = _.map($scope.columns, i => i.friendly_name);
                $scope.columnNames.push("不筛选")

                $scope.conNames = _.map($scope.columns, i => i.friendly_name);
                $scope.conNames.push("无系列")
                // console.log($scope.columnNames);
            } catch (e) {
                console.log("some error");
                console.log(e);
            }

            $scope.downloadOption = function () {
                console.log(BrowseFolder());
            }


            // 组件背景
            $scope.getImageUrlCb = (a) => {
                _.set($scope.options, "images", a);
                $scope.$apply();
            }

            function BrowseFolder() {
                const jsonObj = $scope.options;
                // 创建a标签
                const elementA = document.createElement('a');

                // 文件的名称为时间戳加文件名后缀
                elementA.download = +new Date() + ".js";
                elementA.style.display = 'none';

                // 生成一个blob二进制数据，内容为json数据
                const blob = new Blob([JSON.stringify(jsonObj)]);

                // 生成一个指向blob的URL地址，并赋值给a标签的href属性
                elementA.href = URL.createObjectURL(blob);
                document.body.appendChild(elementA);
                elementA.click();
                document.body.removeChild(elementA);
            }


            // Set default options for new vis // 20191203 bug fix 
            if (_.isEmpty($scope.options) || $scope.options.chartType !== "BasicChart") {
                // console.log("defaultSet");
                $scope.options = defaultBasicChartOptions();
            }
            $scope.selectedChartType = getChartType($scope.options);
            // 大的一级标签
            $scope.currentTab = 'general';
            $scope.changeTab = (tab) => {
                $scope.currentTab = tab;
            };
            // 样式设置二级标签
            $scope.currentTab2 = 'title';
            $scope.changeTab2 = (tab2) => {
                $scope.currentTab2 = tab2;
            };
            // 系列设置二级标签
            $scope.currentTab3 = 'series';
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
            // 纬度轴
            $scope.isCollapsedXAxisOption = true;

            // 指标轴
            $scope.isCollapsedYAxisOption = true;

            // 横向网格线
            $scope.isCollapsedXlineOption = true;
            // 纵向网格线
            $scope.isCollapsedYlineOption = true;

            // 标记点
            $scope.isCollapsedMarkePoint = true;
            // 最大标记点
            $scope.isCollapsedMarkePointMax = true;

            // 最小标记点
            $scope.isCollapsedMarkePointMin = true;
            // 平均标记点
            $scope.isCollapsedMarkePointAve = true;

            $scope.chartTypes = {
                line: { name: 'Echarts线形图', icon: 'line-chart' },
                bar: { name: 'Echarts柱状图', icon: 'bar-chart' },
                bar2: { name: 'Echarts横向柱状图', icon: 'bar-chart' },
                area: { name: 'Echarts线形面积图', icon: 'area-chart' },
                scatter: { name: 'Echarts散点图', icon: 'area-chart' },
                scatter2: { name: 'Echarts气泡图', icon: 'area-chart' }

            };

            $scope.preOrTails = [
                { label: '无', value: 'noPT' },
                { label: '前N', value: 'pre' },
                { label: '后N', value: 'tail' },
            ];

            $scope.xAxisScales = [
                { label: '类目轴(类目轴，适用于离散的类目数据)', value: 'category' },
                { label: '连续数据轴(适用于连续数据)', value: 'value' },
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
                { label: '灰色', value: 'rgba(125,125,125,0.3)' },
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
                { label: '顺序', value: 'Sort' },
                { label: '逆序', value: 'desSort' },
                { label: '保持', value: 'noSort' }
            ];

            $scope.$watch('options', () => { }, true);
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

        }; // 此处的默认值先不配（在refashdata前加上判空似乎完成了默认配置的输入）

        VisualizationProvider.registerVisualization({
            type: 'ECHARTS',
            name: 'Echarts基础图表',
            renderTemplate,
            editorTemplate,
            defaultOptions, // 
        });
    });
}

init.init = true;