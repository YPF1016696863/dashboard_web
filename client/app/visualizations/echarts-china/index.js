/* eslint-disable func-names */
import * as _ from 'lodash';
import $ from 'jquery';
import UUIDv4 from 'uuid/v4';
import echartsTemplate from './echarts.html';
import echartsEditorTemplate from './echarts-editor.html';
import 'echarts-gl';
import './china';
import './world';

import { defaultChinaChartOptions, getChartType, setThemeColor } from './echartsChinaChartOptionUtils';
import color16to10 from '../colorChange';

function EchartsChinaRenderer($rootScope) {
    return {
        restrict: 'E',
        scope: {
            queryResult: '=',
            options: '=?',
        },
        template: echartsTemplate,
        link($scope, $element) {

            if (_.isEmpty($scope.options) || $scope.options.chartType !== "ChinaChart") {
                $scope.options = defaultChinaChartOptions();
            }
            let nameBarData = [];
            let barData = [];
            let barEchartsData = [];

            let nameScatterData = [];
            let scatterData = [];
            let scatterEchartsData = [];

            let nameLineData = [];
            let lineData = [];
            let lineEchartsData = [];

            const geoCoordMap = {
                "海门": [121.15, 31.89],
                "鄂尔多斯": [109.781327, 39.608266],
                "招远": [120.38, 37.35],
                "舟山": [122.207216, 29.985295],
                "齐齐哈尔": [123.97, 47.33],
                "盐城": [120.13, 33.38],
                "赤峰": [118.87, 42.28],
                "青岛": [120.33, 36.07],
                "乳山": [121.52, 36.89],
                "金昌": [102.188043, 38.520089],
                "泉州": [118.58, 24.93],
                "莱西": [120.53, 36.86],
                "日照": [119.46, 35.42],
                "胶南": [119.97, 35.88],
                "南通": [121.05, 32.08],
                "拉萨": [91.11, 29.97],
                "云浮": [112.02, 22.93],
                "梅州": [116.1, 24.55],
                "文登": [122.05, 37.2],
                "上海": [121.48, 31.22],
                "攀枝花": [101.718637, 26.582347],
                "威海": [122.1, 37.5],
                "承德": [117.93, 40.97],
                "厦门": [118.1, 24.46],
                "汕尾": [115.375279, 22.786211],
                "潮州": [116.63, 23.68],
                "丹东": [124.37, 40.13],
                "太仓": [121.1, 31.45],
                "曲靖": [103.79, 25.51],
                "烟台": [121.39, 37.52],
                "福州": [119.3, 26.08],
                "瓦房店": [121.979603, 39.627114],
                "即墨": [120.45, 36.38],
                "抚顺": [123.97, 41.97],
                "玉溪": [102.52, 24.35],
                "张家口": [114.87, 40.82],
                "阳泉": [113.57, 37.85],
                "莱州": [119.942327, 37.177017],
                "湖州": [120.1, 30.86],
                "汕头": [116.69, 23.39],
                "昆山": [120.95, 31.39],
                "宁波": [121.56, 29.86],
                "湛江": [110.359377, 21.270708],
                "揭阳": [116.35, 23.55],
                "荣成": [122.41, 37.16],
                "连云港": [119.16, 34.59],
                "葫芦岛": [120.836932, 40.711052],
                "常熟": [120.74, 31.64],
                "东莞": [113.75, 23.04],
                "河源": [114.68, 23.73],
                "淮安": [119.15, 33.5],
                "泰州": [119.9, 32.49],
                "南宁": [108.33, 22.84],
                "营口": [122.18, 40.65],
                "惠州": [114.4, 23.09],
                "江阴": [120.26, 31.91],
                "蓬莱": [120.75, 37.8],
                "韶关": [113.62, 24.84],
                "嘉峪关": [98.289152, 39.77313],
                "广州": [113.23, 23.16],
                "延安": [109.47, 36.6],
                "太原": [112.53, 37.87],
                "清远": [113.01, 23.7],
                "中山": [113.38, 22.52],
                "昆明": [102.73, 25.04],
                "寿光": [118.73, 36.86],
                "盘锦": [122.070714, 41.119997],
                "长治": [113.08, 36.18],
                "深圳": [114.07, 22.62],
                "珠海": [113.52, 22.3],
                "宿迁": [118.3, 33.96],
                "咸阳": [108.72, 34.36],
                "铜川": [109.11, 35.09],
                "平度": [119.97, 36.77],
                "佛山": [113.11, 23.05],
                "海口": [110.35, 20.02],
                "江门": [113.06, 22.61],
                "章丘": [117.53, 36.72],
                "肇庆": [112.44, 23.05],
                "大连": [121.62, 38.92],
                "临汾": [111.5, 36.08],
                "吴江": [120.63, 31.16],
                "石嘴山": [106.39, 39.04],
                "沈阳": [123.38, 41.8],
                "苏州": [120.62, 31.32],
                "茂名": [110.88, 21.68],
                "嘉兴": [120.76, 30.77],
                "长春": [125.35, 43.88],
                "胶州": [120.03336, 36.264622],
                "银川": [106.27, 38.47],
                "张家港": [120.555821, 31.875428],
                "三门峡": [111.19, 34.76],
                "锦州": [121.15, 41.13],
                "南昌": [115.89, 28.68],
                "柳州": [109.4, 24.33],
                "三亚": [109.511909, 18.252847],
                "自贡": [104.778442, 29.33903],
                "吉林": [126.57, 43.87],
                "阳江": [111.95, 21.85],
                "泸州": [105.39, 28.91],
                "西宁": [101.74, 36.56],
                "宜宾": [104.56, 29.77],
                "呼和浩特": [111.65, 40.82],
                "成都": [104.06, 30.67],
                "大同": [113.3, 40.12],
                "镇江": [119.44, 32.2],
                "桂林": [110.28, 25.29],
                "张家界": [110.479191, 29.117096],
                "宜兴": [119.82, 31.36],
                "北海": [109.12, 21.49],
                "西安": [108.95, 34.27],
                "金坛": [119.56, 31.74],
                "东营": [118.49, 37.46],
                "牡丹江": [129.58, 44.6],
                "遵义": [106.9, 27.7],
                "绍兴": [120.58, 30.01],
                "扬州": [119.42, 32.39],
                "常州": [119.95, 31.79],
                "潍坊": [119.1, 36.62],
                "重庆": [106.54, 29.59],
                "台州": [121.420757, 28.656386],
                "南京": [118.78, 32.04],
                "滨州": [118.03, 37.36],
                "贵阳": [106.71, 26.57],
                "无锡": [120.29, 31.59],
                "本溪": [123.73, 41.3],
                "克拉玛依": [84.77, 45.59],
                "渭南": [109.5, 34.52],
                "马鞍山": [118.48, 31.56],
                "宝鸡": [107.15, 34.38],
                "焦作": [113.21, 35.24],
                "句容": [119.16, 31.95],
                "北京": [116.46, 39.92],
                "徐州": [117.2, 34.26],
                "衡水": [115.72, 37.72],
                "包头": [110, 40.58],
                "绵阳": [104.73, 31.48],
                "乌鲁木齐": [87.68, 43.77],
                "枣庄": [117.57, 34.86],
                "杭州": [120.19, 30.26],
                "淄博": [118.05, 36.78],
                "鞍山": [122.85, 41.12],
                "溧阳": [119.48, 31.43],
                "库尔勒": [86.06, 41.68],
                "安阳": [114.35, 36.1],
                "开封": [114.35, 34.79],
                "济南": [117, 36.65],
                "德阳": [104.37, 31.13],
                "温州": [120.65, 28.01],
                "九江": [115.97, 29.71],
                "邯郸": [114.47, 36.6],
                "临安": [119.72, 30.23],
                "兰州": [103.73, 36.03],
                "沧州": [116.83, 38.33],
                "临沂": [118.35, 35.05],
                "南充": [106.110698, 30.837793],
                "天津": [117.2, 39.13],
                "富阳": [119.95, 30.07],
                "泰安": [117.13, 36.18],
                "诸暨": [120.23, 29.71],
                "郑州": [113.65, 34.76],
                "哈尔滨": [126.63, 45.75],
                "聊城": [115.97, 36.45],
                "芜湖": [118.38, 31.33],
                "唐山": [118.02, 39.63],
                "平顶山": [113.29, 33.75],
                "邢台": [114.48, 37.05],
                "德州": [116.29, 37.45],
                "济宁": [116.59, 35.38],
                "荆州": [112.239741, 30.335165],
                "宜昌": [111.3, 30.7],
                "义乌": [120.06, 29.32],
                "丽水": [119.92, 28.45],
                "洛阳": [112.44, 34.7],
                "秦皇岛": [119.57, 39.95],
                "株洲": [113.16, 27.83],
                "石家庄": [114.48, 38.03],
                "莱芜": [117.67, 36.19],
                "常德": [111.69, 29.05],
                "保定": [115.48, 38.85],
                "湘潭": [112.91, 27.87],
                "金华": [119.64, 29.12],
                "岳阳": [113.09, 29.37],
                "长沙": [113, 28.21],
                "衢州": [118.88, 28.97],
                "廊坊": [116.7, 39.53],
                "菏泽": [115.480656, 35.23375],
                "合肥": [117.27, 31.86],
                "武汉": [114.31, 30.52],
                "大庆": [125.03, 46.58]
            };

            // const alirl = [
            //     [
            //         [121.15, 31.89],
            //         [109.781327, 39.608266]
            //     ],
            //     [
            //         [120.38, 37.35],
            //         [122.207216, 29.985295]
            //     ],
            //     [
            //         [123.97, 47.33],
            //         [120.13, 33.38]
            //     ],
            //     [
            //         [118.87, 42.28],
            //         [120.33, 36.07]
            //     ],
            //     [
            //         [121.52, 36.89],
            //         [117.93, 40.97]
            //     ],
            //     [
            //         [102.188043, 38.520089],
            //         [122.1, 37.5]
            //     ],
            //     [
            //         [118.58, 24.93],
            //         [101.718637, 26.582347]
            //     ],
            //     [
            //         [120.53, 36.86],
            //         [121.48, 31.22]
            //     ],
            //     [
            //         [119.46, 35.42],
            //         [122.05, 37.2]
            //     ],
            //     [
            //         [119.97, 35.88],
            //         [116.1, 24.55]
            //     ],
            //     [
            //         [121.05, 32.08],
            //         [112.02, 22.93]
            //     ],
            //     [
            //         [91.11, 29.97],
            //         [118.1, 24.46]
            //     ]
            // ]
            const convertData = function (data) {
                const res = [];
                for (let i = 0; i < data.length; i += 1) {
                    const geoCoord = geoCoordMap[data[i].name];
                    if (geoCoord) {
                        res.push({
                            name: data[i].name,
                            value: geoCoord.concat(data[i].value)
                        });
                    }
                }
                // console.log(res)
                return res;
            };

            _.set($scope.options, "backgroundColor",
                color16to10(_.get($scope.options, "backgroundColorT", "#000"),
                    _.get($scope.options, "backgroundColorOpacity", 0)
                ));
            _.set($scope.options, "tooltip.backgroundColor",
                color16to10(_.get($scope.options, "tooltip.backgroundColorT", "#000"),
                    _.get($scope.options, "tooltip.backgroundColorOpacity", 0)
                ));

            const refreshData = () => {
                try {
                    if (!_.isUndefined($scope.queryResult) && $scope.queryResult.getData()) {
                        const data = $scope.queryResult.getData();
                        nameBarData = [];
                        barData = [];
                        barEchartsData = [];

                        nameScatterData = [];
                        scatterData = [];
                        scatterEchartsData = [];

                        nameLineData = [];
                        lineData = [];
                        lineEchartsData = [];

                        /* *********** 调色盘16位转10进制 加上 透明度 *********** */
                        _.set($scope.options, "backgroundColor",
                            color16to10(_.get($scope.options, "backgroundColorTemp", "#000"),
                                _.get($scope.options, "backgroundColorOpacity", 0)
                            ));


                        // 文字单独的自适应调整*($element.parent()[0].clientHeight/789)
                        const fontSize = _.get($scope.options, 'title.textStyle.fontSizeT', 40) * ($element.parent()[0].clientWidth / 1115);
                        _.set($scope.options, 'title.textStyle.fontSize', fontSize.toFixed(2));

                        _.forEach(data, function (value) { // [{0},{1}...] 筛选出每一个{0} {1} ...
                            // eslint-disable-next-line func-names
                            _.forEach(value, function (valueChildren, keyChildren) {
                                if (keyChildren === _.get($scope.options, "form.barNameAxisColumn", '')) {
                                    nameBarData.push(valueChildren.trim())
                                }
                                if (keyChildren === _.get($scope.options, "form.barAxisColumn", '')) {
                                    barData.push(valueChildren);
                                }
                                if (keyChildren === _.get($scope.options, "form.scatterNameAxisColumn", '')) {
                                    nameScatterData.push(valueChildren.trim());
                                }
                                if (keyChildren === _.get($scope.options, "form.scatterAxisColumn", '')) {
                                    scatterData.push(valueChildren);
                                }
                                if (keyChildren === _.get($scope.options, "form.lineNameAxisColumn", '')) {
                                    nameLineData.push(valueChildren.trim());
                                }
                                if (keyChildren === _.get($scope.options, "form.lineAxisColumn", '')) {
                                    lineData.push(valueChildren.trim());
                                }

                            });
                        });
                        for (let i = 0; i < nameBarData.length; i += 1) {
                            barEchartsData.push({
                                name: nameBarData[i].length === "哈尔滨" ? 0 : nameBarData[i],
                                value: barData[i].length === 0 ? 0 : parseFloat(barData[i])
                            })
                        };
                        for (let i = 0; i < nameScatterData.length; i += 1) {
                            scatterEchartsData.push({
                                name: nameScatterData[i].length === "哈尔滨" ? 0 : nameScatterData[i],
                                value: scatterData[i].length === 0 ? 0 : parseFloat(scatterData[i])
                            })
                        };

                        for (let i = 0; i < nameLineData.length; i += 1) {
                            lineEchartsData.push(
                                [
                                    geoCoordMap[nameLineData[i]],
                                    geoCoordMap[lineData[i]]
                                ]
                            )
                        };



                        // 切换主题颜色
                        setThemeColor($scope.options, _.get($rootScope, "theme.theme", "light"));

                        _.set($scope.options, "series", []); // 清空设置           
                        $scope.options.series.push(
                            // 柱状图
                            {
                                name: 'bar3D',
                                type: "bar3D",
                                coordinateSystem: 'geo3D',
                                barSize: _.get($scope.options, 'barWidth', 0.8) === '' ? 0.8 : _.get($scope.options, 'barWidth', 0.8), // 柱子粗细
                                shading: 'lambert',
                                opacity: 0.8,
                                bevelSize: 0.3,
                                itemStyle: {
                                    color: color16to10(_.get($scope.options, 'barColor', '#C99BE8'),
                                        _.get($scope.options, "barColorOpacity", 1)
                                    )
                                },
                                label: {
                                    show: true,
                                    formatter: '{b}'
                                },
                                data: convertData(barEchartsData)
                            },


                            {
                                name: 'scatter3D',
                                type: "scatter3D",
                                coordinateSystem: 'geo3D',
                                symbol: 'pin',
                                symbolSize: 30,
                                opacity: 1,
                                label: {
                                    show: false,
                                    formatter: '{b}'
                                },
                                itemStyle: {
                                    borderWidth: 0.5,
                                    borderColor: '#fff'
                                },
                                data: convertData(scatterEchartsData)
                            },


                            // // 画线

                            {
                                type: 'lines3D',

                                coordinateSystem: 'geo3D',

                                effect: {
                                    show: _.get($scope.options, 'lineEffect', true),
                                    trailWidth: _.get($scope.options, 'trailWidth', 5) === '' ? 5 : _.get($scope.options, 'trailWidth', 5),
                                    trailOpacity: _.get($scope.options, 'trailOpacity', 0.5) === '' ? 0.5 : _.get($scope.options, 'trailOpacity', 0.5),
                                    trailLength: _.get($scope.options, 'trailLength', 0.2) === '' ? 0.2 : _.get($scope.options, 'trailLength', 0.2),
                                    constantSpeed: _.get($scope.options, 'constantSpeed', 5) === '' ? 5 : _.get($scope.options, 'constantSpeed', 5),
                                },

                                blendMode: 'lighter',

                                lineStyle: {
                                    color: _.get($scope.options, 'lineColor', '#6DFD1F'),
                                    width: 0.2,
                                    opacity: 0.05
                                },


                                data: lineEchartsData
                                //  [
                                //   [[121.15, 31.89], [109.781327, 39.608266]],
                                //   [[120.38, 37.35], [122.207216, 29.985295]],

                                // ]
                                // lineEchartsData
                            }
                        );


                        let myChart = null;

                        if (document.getElementById("china-main")) {
                            document.getElementById("china-main").id = $scope.options.id;
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
                            // if ($("#dapingEditor").length !== 0) {
                            //   height = $("#dapingEditor")["0"].clientHeight;
                            //   width = $("#dapingEditor")["0"].clientWidth;
                            // }
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


function EchartsChinaEditor() {
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
            if (_.isEmpty($scope.options) || $scope.options.chartType !== "ChinaChart") {
                $scope.options = defaultChinaChartOptions();
            }


            // 组件背景
            $scope.getImageUrlCb = (a) => {
                _.set($scope.options, "images", a);
                $scope.$apply();
            }

            $scope.selectedChartType = getChartType($scope.options);

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
                { label: '蓝色', value: '#324B76' },
                { label: '宝蓝色', value: '#3B9EF5' },
                { label: '橘色', value: '#ee941b' },
                { label: '紫色', value: '#C917FD' },
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

            $scope.Quality = [
                { label: '低', value: 'low' },
                { label: '中', value: 'medium' },
                { label: '高', value: 'high' },
                { label: '超高', value: 'ultra' }
            ];
            $scope.$watch('options', () => { }, true);
        },
    };
}

export default function init(ngModule) {
    ngModule.directive('echartsChinaEditor', EchartsChinaEditor);
    ngModule.directive('echartsChinaRenderer', EchartsChinaRenderer);

    ngModule.config((VisualizationProvider) => {
        const renderTemplate =
            '<echarts-china-renderer options="visualization.options" query-result="queryResult"></echarts-china-renderer>';

        const editorTemplate = '<echarts-china-editor options="visualization.options" query-result="queryResult"></echarts-china-editor>';
        const defaultOptions = {

        };

        VisualizationProvider.registerVisualization({
            type: 'ECHARTS-CHINA',
            name: 'Echarts地图',
            renderTemplate,
            editorTemplate,
            defaultOptions,
        });
    });
}

init.init = true;

//   const geoCoordMap={
//     '北京':[116.4551,40.2539],
//     '天津':[117.4219,39.4189],
//     '河北':[114.5368,38.0431],
//     '山东':[117.0263,36.6773],
//     '山西':[112.5690,37.8798],
//     '黑龙江':[126.668,45.7479],
//     '吉林':[125.3322,43.9027],
//     '辽宁':[123.4379,41.8418],
//     '内蒙古':[111.7728,40.8231],
//     '新疆':[87.6341,43.7990],
//     '甘肃':[103.8329,36.0656],
//     '青海':[101.7867,36.6270],
//     '宁夏':[106.2657,38.4783],
//     '四川':[104.0823,30.6571],
//     '西藏':[91.12406,29.65343],
//     '陕西':[108.9607,34.27181],
//     '河南':[113.7597,34.77218],
//     '安徽':[117.3364,31.73980],
//     '江苏':[118.7693,32.06674],
//     '重庆':[106.5580,29.56914],
//     '湖北':[114.3481,30.55275],
//     '上海':[121.4801,31.23630],
//     '浙江':[120.1591,30.272553],
//     '云南':[102.7164,25.052068],
//     '贵州':[106.7119,26.60612],
//     '湖南':[112.9902,28.11841],
//     '江西':[115.8227,28.64288],
//     '福建':[119.3015,26.107029],
//     '广东':[113.2728,23.138577],
//     '广西':[108.3340,22.821439],
//     '海南':[110.3557,20.0230805],
//     '澳门':[113.5494,22.19295],
//     '香港':[114.17774,22.28315],
//     '台湾':[121.51561,25.050003],
//     '临沧市':[100.092612914,23.8878061038],
//     '丽江市':[100.229628399,26.8753510895],
//     '保山市':[99.1779956133,25.1204891962],
//     '大理白族自治州':[100.223674789,25.5968996394],
//     '德宏傣族景颇族自治州':[98.5894342874,24.441239663],
//     '怒江傈僳族自治州':[98.8599320425,25.8606769782],
//     '文山壮族苗族自治州':[104.246294318,23.3740868504],
//     '昆明市':[102.714601139,25.0491531005],
//     '昭通市':[103.725020656,27.3406329636],
//     '普洱市':[100.98005773,22.7887777801],
//     '曲靖市':[103.782538888,25.5207581429],
//     '楚雄彝族自治州':[101.529382239,25.0663556742],
//     '玉溪市':[102.545067892,24.3704471344],
//     '红河哈尼族彝族自治州':[103.384064757,23.3677175165],
//     '西双版纳傣族自治州':[100.803038275,22.0094330022],
//     '迪庆藏族自治州':[99.7136815989,27.8310294612],
//     '乌兰察布市':[113.112846391,41.0223629468],
//     '乌海市':[106.831999097,39.6831770068],
//     '兴安盟':[122.048166514,46.0837570652],
//     '包头市':[109.846238532,40.6471194257],
//     '呼伦贝尔市':[119.760821794,49.2016360546],
//     '呼和浩特市':[111.66035052,40.8283188731],
//     '巴彦淖尔市':[107.42380672,40.7691799024],
//     '赤峰市':[118.930761192,42.2971123203],
//     '通辽市':[122.260363263,43.633756073],
//     '鄂尔多斯市':[109.993706251,39.8164895606],
//     '锡林郭勒盟':[116.027339689,43.9397048423],
//     '阿拉善盟':[105.695682871,38.8430752644],
//     '台中市':[119.337634104,26.0911937119],
//     '台北市':[114.130474436,22.3748329286],
//     '台南市':[121.360525873,38.9658447898],
//     '嘉义市':[114.246701335,22.7288657203],
//     '高雄市':[111.590952812,21.9464822541],
//     '吉林市':[126.564543989,43.8719883344],
//     '四平市':[124.391382074,43.1755247011],
//     '延边朝鲜族自治州':[129.485901958,42.8964136037],
//     '松原市':[124.832994532,45.1360489701],
//     '白城市':[122.840776679,45.6210862752],
//     '白山市':[126.435797675,41.945859397],
//     '辽源市':[125.133686052,42.9233026191],
//     '通化市':[125.942650139,41.7363971299],
//     '长春市':[125.313642427,43.8983376071],
//     '乐山市':[103.760824239,29.6009576111],
//     '内江市':[105.073055992,29.5994615348],
//     '凉山彝族自治州':[102.259590803,27.8923929037],
//     '南充市':[106.105553984,30.8009651682],
//     '宜宾市':[104.633019062,28.7696747963],
//     '巴中市':[106.757915842,31.8691891592],
//     '广元市':[105.81968694,32.4410401584],
//     '广安市':[106.635720331,30.4639838879],
//     '德阳市':[104.402397818,31.1311396527],
//     '成都市':[104.067923463,30.6799428454],
//     '攀枝花市':[101.722423152,26.5875712571],
//     '泸州市':[105.443970289,28.8959298039],
//     '甘孜藏族自治州':[101.969232063,30.0551441144],
//     '眉山市':[103.841429563,30.0611150799],
//     '绵阳市':[104.705518975,31.5047012581],
//     '自贡市':[104.776071339,29.3591568895],
//     '资阳市':[104.635930302,30.132191434],
//     '达州市':[107.494973447,31.2141988589],
//     '遂宁市':[105.564887792,30.5574913504],
//     '阿坝藏族羌族自治州':[102.228564689,31.9057628583],
//     '雅安市':[103.009356466,29.9997163371],
//     '中卫市':[105.196754199,37.5211241916],
//     '吴忠市':[106.208254199,37.9935610029],
//     '固原市':[106.285267996,36.0215234807],
//     '石嘴山市':[106.379337202,39.0202232836],
//     '银川市':[106.206478608,38.5026210119],
//     '亳州市':[115.787928245,33.8712105653],
//     '六安市':[116.505252683,31.7555583552],
//     '合肥市':[117.282699092,31.8669422607],
//     '安庆市':[117.058738772,30.5378978174],
//     '宣城市':[118.752096311,30.9516423543],
//     '宿州市':[116.988692412,33.6367723858],
//     '池州市':[117.494476772,30.6600192482],
//     '淮北市':[116.791447429,33.9600233054],
//     '淮南市':[117.018638863,32.6428118237],
//     '滁州市':[118.324570351,32.3173505954],
//     '芜湖市':[118.384108423,31.3660197875],
//     '蚌埠市':[117.357079866,32.9294989067],
//     '铜陵市':[117.819428729,30.9409296947],
//     '阜阳市':[115.820932259,32.9012113306],
//     '马鞍山市':[118.515881847,31.6885281589],
//     '黄山市':[118.293569632,29.7344348562],
//     '东营市':[118.583926333,37.4871211553],
//     '临沂市':[118.340768237,35.0724090744],
//     '威海市':[122.093958366,37.5287870813],
//     '德州市':[116.328161364,37.4608259263],
//     '日照市':[119.507179943,35.4202251931],
//     '枣庄市':[117.279305383,34.8078830784],
//     '泰安市':[117.089414917,36.1880777589],
//     '济南市':[117.024967066,36.6827847272],
//     '济宁市':[116.600797625,35.4021216643],
//     '淄博市':[118.059134278,36.8046848542],
//     '滨州市':[117.968292415,37.4053139418],
//     '潍坊市':[119.142633823,36.7161148731],
//     '烟台市':[121.30955503,37.5365615629],
//     '聊城市':[115.986869139,36.4558285147],
//     '莱芜市':[117.684666912,36.2336541336],
//     '菏泽市':[115.463359775,35.2624404961],
//     '青岛市':[120.384428184,36.1052149013],
//     '临汾市':[111.538787596,36.0997454436],
//     '吕梁市':[111.143156602,37.527316097],
//     '大同市':[113.290508673,40.1137444997],
//     '太原市':[112.550863589,37.890277054],
//     '忻州市':[112.727938829,38.461030573],
//     '晋中市':[112.7385144,37.6933615268],
//     '晋城市':[112.867332758,35.4998344672],
//     '朔州市':[112.479927727,39.3376719662],
//     '运城市':[111.006853653,35.0388594798],
//     '长治市':[113.120292086,36.2016643857],
//     '阳泉市':[113.569237602,37.8695294932],
//     '东莞市':[113.763433991,23.0430238154],
//     '中山市':[113.422060021,22.5451775145],
//     '云浮市':[112.050945959,22.9379756855],
//     '佛山市':[113.134025635,23.0350948405],
//     '广州市':[113.307649675,23.1200491021],
//     '惠州市':[114.41065808,23.1135398524],
//     '揭阳市':[116.379500855,23.5479994669],
//     '梅州市':[116.126403098,24.304570606],
//     '汕头市':[116.728650288,23.3839084533],
//     '汕尾市':[115.372924289,22.7787305002],
//     '江门市':[113.078125341,22.5751167835],
//     '河源市':[114.713721476,23.7572508505],
//     '深圳市':[114.025973657,22.5460535462],
//     '清远市':[113.040773349,23.6984685504],
//     '湛江市':[110.365067263,21.2574631038],
//     '潮州市':[116.630075991,23.6618116765],
//     '珠海市':[113.562447026,22.2569146461],
//     '肇庆市':[112.47965337,23.0786632829],
//     '茂名市':[110.931245331,21.6682257188],
//     '阳江市':[111.977009756,21.8715173045],
//     '韶关市':[113.594461107,24.8029603119],
//     '北海市':[109.122627919,21.472718235],
//     '南宁市':[108.297233556,22.8064929356],
//     '崇左市':[107.357322038,22.4154552965],
//     '来宾市':[109.231816505,23.7411659265],
//     '柳州市':[109.42240181,24.3290533525],
//     '桂林市':[110.260920147,25.262901246],
//     '梧州市':[111.30547195,23.4853946367],
//     '河池市':[108.069947709,24.6995207829],
//     '玉林市':[110.151676316,22.6439736084],
//     '百色市':[106.631821404,23.9015123679],
//     '贵港市':[109.613707557,23.1033731644],
//     '贺州市':[111.552594179,24.4110535471],
//     '钦州市':[108.638798056,21.9733504653],
//     '防城港市':[108.351791153,21.6173984705],
//     '乌鲁木齐市':[87.5649877411,43.8403803472],
//     '伊犁哈萨克自治州':[81.2978535304,43.9222480963],
//     '克孜勒苏柯尔克孜自治州':[76.1375644775,39.7503455778],
//     '克拉玛依市':[84.8811801861,45.5943310667],
//     '博尔塔拉蒙古自治州':[82.0524362672,44.9136513743],
//     '吐鲁番地区':[89.1815948657,42.9604700169],
//     '和田地区':[79.9302386372,37.1167744927],
//     '哈密地区':[93.5283550928,42.8585963324],
//     '喀什地区':[75.9929732675,39.4706271887],
//     '塔城地区':[82.9748805837,46.7586836297],
//     '昌吉回族自治州':[87.2960381257,44.0070578985],
//     '自治区直辖':[85.6148993383,42.1270009576],
//     '阿克苏地区':[80.2698461793,41.1717309015],
//     '阿勒泰地区':[88.1379154871,47.8397444862],
//     '南京市':[118.778074408,32.0572355018],
//     '南通市':[120.873800951,32.0146645408],
//     '宿迁市':[118.296893379,33.9520497337],
//     '常州市':[119.981861013,31.7713967447],
//     '徐州市':[117.188106623,34.2715534311],
//     '扬州市':[119.427777551,32.4085052546],
//     '无锡市':[120.305455901,31.5700374519],
//     '泰州市':[119.919606016,32.4760532748],
//     '淮安市':[119.030186365,33.6065127393],
//     '盐城市':[120.148871818,33.3798618771],
//     '苏州市':[120.619907115,31.317987368],
//     '连云港市':[119.173872217,34.601548967],
//     '镇江市':[119.455835405,32.2044094436],
//     '上饶市':[117.955463877,28.4576225539],
//     '九江市':[115.999848022,29.7196395261],
//     '南昌市':[115.893527546,28.6895780001],
//     '吉安市':[114.992038711,27.1138476502],
//     '宜春市':[114.400038672,27.8111298958],
//     '抚州市':[116.360918867,27.9545451703],
//     '新余市':[114.947117417,27.8223215586],
//     '景德镇市':[117.186522625,29.3035627684],
//     '萍乡市':[113.859917033,27.639544223],
//     '赣州市':[114.935909079,25.8452955363],
//     '鹰潭市':[117.035450186,28.2413095972],
//     '保定市':[115.494810169,38.886564548],
//     '唐山市':[118.183450598,39.6505309225],
//     '廊坊市':[116.703602223,39.5186106251],
//     '张家口市':[114.89378153,40.8111884911],
//     '承德市':[117.933822456,40.9925210525],
//     '沧州市':[116.863806476,38.2976153503],
//     '石家庄市':[114.522081844,38.0489583146],
//     '秦皇岛市':[119.604367616,39.9454615659],
//     '衡水市':[115.686228653,37.7469290459],
//     '邢台市':[114.520486813,37.0695311969],
//     '邯郸市':[114.482693932,36.6093079285],
//     '三门峡市':[111.181262093,34.7833199411],
//     '信阳市':[114.085490993,32.1285823075],
//     '南阳市':[112.542841901,33.0114195691],
//     '周口市':[114.654101942,33.6237408181],
//     '商丘市':[115.641885688,34.4385886402],
//     '安阳市':[114.351806508,36.1102667222],
//     '平顶山市':[113.300848978,33.7453014565],
//     '开封市':[114.351642118,34.8018541758],
//     '新乡市':[113.912690161,35.3072575577],
//     '洛阳市':[112.447524769,34.6573678177],
//     '漯河市':[114.0460614,33.5762786885],
//     '濮阳市':[115.026627441,35.7532978882],
//     '焦作市':[113.211835885,35.234607555],
//     '省直辖':[113.486804058,34.157183768],
//     '许昌市':[113.83531246,34.0267395887],
//     '郑州市':[113.64964385,34.7566100641],
//     '驻马店市':[114.049153547,32.9831581541],
//     '鹤壁市':[114.297769838,35.7554258742],
//     '丽水市':[119.929575843,28.4562995521],
//     '台州市':[121.440612936,28.6682832857],
//     '嘉兴市':[120.760427699,30.7739922396],
//     '宁波市':[121.579005973,29.8852589659],
//     '杭州市':[120.219375416,30.2592444615],
//     '温州市':[120.690634734,28.002837594],
//     '湖州市':[120.137243163,30.8779251557],
//     '绍兴市':[120.592467386,30.0023645805],
//     '舟山市':[122.169872098,30.0360103026],
//     '衢州市':[118.875841652,28.9569104475],
//     '金华市':[119.652575704,29.1028991054],
//     '三亚市':[109.522771281,18.2577759149],
//     '三沙市':[112.350383075,16.840062894],
//     '海口市':[110.330801848,20.022071277],
//     '省直辖':[109.733755488,19.1805008013],
//     '十堰市':[110.801228917,32.6369943395],
//     '咸宁市':[114.300060592,29.8806567577],
//     '孝感市':[113.935734392,30.9279547842],
//     '宜昌市':[111.310981092,30.732757818],
//     '恩施土家族苗族自治州':[109.491923304,30.2858883166],
//     '武汉市':[114.316200103,30.5810841269], 
//     '荆州市':[112.241865807,30.332590523],
//     '荆门市':[112.217330299,31.0426112029],
//     '襄阳市':[112.250092848,32.2291685915],
//     '鄂州市':[114.895594041,30.3844393228],
//     '随州市':[113.379358364,31.7178576082],
//     '黄冈市':[114.906618047,30.4461089379],
//     '黄石市':[115.050683164,30.2161271277],
//     '娄底市':[111.996396357,27.7410733023],
//     '岳阳市':[113.146195519,29.3780070755],
//     '常德市':[111.653718137,29.0121488552],
//     '张家界市':[110.481620157,29.1248893532],
//     '怀化市':[109.986958796,27.5574829012],
//     '株洲市':[113.131695341,27.8274329277],
//     '永州市':[111.614647686,26.4359716468],
//     '湘潭市':[112.935555633,27.835095053],
//     '湘西土家族苗族自治州':[109.7457458,28.3179507937],
//     '益阳市':[112.366546645,28.5880877799],
//     '衡阳市':[112.583818811,26.8981644154],
//     '邵阳市':[111.461525404,27.2368112449],
//     '郴州市':[113.037704468,25.7822639757],
//     '长沙市':[112.979352788,28.2134782309],
//     '无堂区划分区域':[113.557519102,22.2041179884],
//     '澳门半岛':[113.566432335,22.1950041592],
//     '澳门离岛':[113.557519102,22.2041179884],
//     '临夏回族自治州':[103.215249178,35.5985143488],
//     '兰州市':[103.823305441,36.064225525],
//     '嘉峪关市':[98.2816345853,39.8023973267],
//     '天水市':[105.736931623,34.5843194189],
//     '定西市':[104.626637601,35.5860562418],
//     '平凉市':[106.688911157,35.55011019],
//     '庆阳市':[107.644227087,35.7268007545],
//     '张掖市':[100.459891869,38.939320297],
//     '武威市':[102.640147343,37.9331721429],
//     '甘南藏族自治州':[102.917442486,34.9922111784],
//     '白银市':[104.171240904,36.5466817062],
//     '酒泉市':[98.5084145062,39.7414737682],
//     '金昌市':[102.208126263,38.5160717995],
//     '陇南市':[104.934573406,33.3944799729],
//     '三明市':[117.642193934,26.2708352794],
//     '南平市':[118.181882949,26.6436264742],
//     '厦门市':[118.103886046,24.4892306125],
//     '宁德市':[119.54208215,26.6565274192],
//     '泉州市':[118.600362343,24.901652384],
//     '漳州市':[117.676204679,24.5170647798],
//     '福州市':[119.330221107,26.0471254966],
//     '莆田市':[119.077730964,25.4484501367],
//     '龙岩市':[117.017996739,25.0786854335],
//     '山南地区':[91.7506438744,29.2290269317],
//     '拉萨市':[91.111890896,29.6625570621],
//     '日喀则地区':[88.8914855677,29.2690232039],
//     '昌都地区':[97.18558158,31.1405756319],
//     '林芝地区':[94.3499854582,29.6669406258],
//     '那曲地区':[92.0670183689,31.4806798301],
//     '阿里地区':[81.1076686895,30.4045565883],
//     '六盘水市':[104.85208676,26.5918660603],
//     '安顺市':[105.928269966,26.2285945777],
//     '毕节市':[105.333323371,27.4085621313],
//     '贵阳市':[106.709177096,26.6299067414],
//     '遵义市':[106.931260316,27.6999613771],
//     '铜仁市':[109.168558028,27.6749026906],
//     '黔东南苗族侗族自治州':[107.985352573,26.5839917665],
//     '黔南布依族苗族自治州':[107.52320511,26.2645359974],
//     '黔西南布依族苗族自治州':[104.900557798,25.0951480559],
//     '丹东市':[124.338543115,40.1290228266],
//     '大连市':[121.593477781,38.9487099383],
//     '抚顺市':[123.929819767,41.8773038296],
//     '朝阳市':[120.446162703,41.5718276679],
//     '本溪市':[123.77806237,41.3258376266],
//     '沈阳市':[123.432790922,41.8086447835],
//     '盘锦市':[122.07322781,41.141248023],
//     '营口市':[122.233391371,40.6686510665],
//     '葫芦岛市':[120.860757645,40.7430298813],
//     '辽阳市':[123.172451205,41.2733392656],
//     '铁岭市':[123.854849615,42.2997570121],
//     '锦州市':[121.147748738,41.1308788759],
//     '阜新市':[121.660822129,42.0192501071],
//     '鞍山市':[123.007763329,41.1187436822],
//     '咸阳市':[108.707509278,34.345372996],
//     '商洛市':[109.934208154,33.8739073951],
//     '安康市':[109.038044563,32.70437045],
//     '宝鸡市':[107.170645452,34.3640808097],
//     '延安市':[109.500509757,36.6033203523],
//     '榆林市':[109.745925744,38.2794392401],
//     '汉中市':[107.045477629,33.0815689782],
//     '渭南市':[109.483932697,34.5023579758],
//     '西安市':[108.953098279,34.2777998978],
//     '铜川市':[108.968067013,34.9083676964],
//     '果洛藏族自治州':[100.223722769,34.4804845846],
//     '海东地区':[102.085206987,36.5176101677],
//     '海北藏族自治州':[100.879802174,36.9606541011],
//     '海南藏族自治州':[100.624066094,36.2843638038],
//     '海西蒙古族藏族自治州':[97.3426254153,37.3737990706],
//     '玉树藏族自治州':[97.0133161374,33.0062399097],
//     '西宁市':[101.76792099,36.640738612],
//     '黄南藏族自治州':[102.007600308,35.5228515517],
//     '九龙':[114.173291988,22.3072458588],
//     '新界':[114.146701965,22.4274312754],
//     '香港岛':[114.183870524,22.2721034276],
//     '七台河市':[131.019048047,45.7750053686],
//     '伊春市':[128.910765978,47.7346850751],
//     '佳木斯市':[130.284734586,46.8137796047],
//     '双鸭山市':[131.17140174,46.6551020625],
//     '哈尔滨市':[126.657716855,45.7732246332],
//     '大兴安岭地区':[124.19610419,51.991788968],
//     '大庆市':[125.02183973,46.59670902],
//     '牡丹江市':[129.608035396,44.5885211528],
//     '绥化市':[126.989094572,46.646063927],
//     '鸡西市':[130.941767273,45.3215398866],
//     '鹤岗市':[130.292472051,47.3386659037],
//     '黑河市':[127.500830295,50.2506900907],
//     '齐齐哈尔市':[123.987288942,47.3476998134]

// };