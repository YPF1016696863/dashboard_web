import * as _ from 'lodash';
import UUIDv4 from 'uuid/v4';
import { setAsPrimitive } from 'echarts-gl';

export function defaultChinaChartOptions() {
    return {
        id: UUIDv4(),
        chartType: "ChinaChart",
        backgroundColor: '#324B76',
        form: {
            barNameAxisColumn: "",
            barAxisColumn: "",
            scatterNameAxisColumn: "",
            scatterAxisColumn:"",
            lineNameAxisColumn:"",// source
            lineAxisColumn:"",// target
        },
        toolbox: {
            show: false,
            feature: {
                restore: {},
                saveAsImage: {}
            }
        },
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',

        title: {
            text: '',
            x: 'left',
            top: "10",
            textStyle: {
                color: '#fff',
                fontSize: 14
            }
        },
        tooltip: {
            show: true,
            // formatter:(params)=>{
            //   let data = "测试1:"+params.name + "<br/>"+"值:"+ 
            // params.value[2]+"<br/>"+"地理坐标:[" + params.value[0]+","
            // +params.value[1] +"]";
            //   return data;
            // },
        },
        visualMap: [
        //     {
        //     type: 'continuous',
        //     seriesIndex: 0,
        //     text: ['bar3D'],
        //     calculable: true,
        //     max: 300,
        //     inRange: {
        //         color: ['#87aa66', '#eba438', '#d94d4c']
        //     }
        // }, {
        //     type: 'continuous',
        //     seriesIndex: 1,
        //     text: ['scatter3D'],
        //     left: 'right',
        //     max: 100,
        //     calculable: true,
        //     inRange: {
        //         color: ['#000', 'blue', 'purple']
        //     }
        // }
    ],
        geo3D: {
            map: 'china',
            roam: true, 
            itemStyle: {
                color: '#3B9EF5',// #1d5e98
                opacity: 1,
                borderWidth: 0.4,
                // 图形描边的宽度。加上描边后可以更清晰的区分每个区域
                borderColor: '#fff' 

            },
            label: {
                show: true,
                distance:2,
                textStyle: {
                    color: '#fff', // 地图初始化区域字体颜色
                    fontSize: 10,
                    opacity: 1,
                    backgroundColor: 'rgba(0,23,11,0)'
                },
            },
            emphasis: { // 当鼠标放上去  地区区域是否显示名称
                label: {
                    show: true,
                    textStyle: {
                        color: '#fff',
                        fontSize: 8,
                        backgroundColor: 'rgba(0,23,11,0)'
                    }
                }
            },
            // regions: {// 所对应的地图区域的名称，例如 '广东'，'浙江'。
            //     name: '广东',
            //     regionHeight: 123,// 区域的高度
            // },
            
            shading: 'lambert',// lambert
            light: { // 光照阴影
                main: {
                    color: '#fff', // 光照颜色
                    intensity: 1.2, // 光照强度
                    // shadowQuality: 'high', //阴影亮度
                    shadow: true, // 是否显示阴影
                    alpha: 55,
                    beta: 10

                },
                ambient: {
                    intensity: 0.3
                }
            },
            postEffect: {
                enable: true,// 是否开启后处理特效。默认关闭。
                bloom: {
                    enable: true// 是否开启光晕特效。
                },
                depthOfField:{
                    enable: false// 是否开启景深。
                },
                SSAO:{
                    enable:false,
                    quality:'medium',
                    radius:2,
                    intensity:1,
                }
            }
        },
        series: [],
        size: {
            responsive: true,
            width: "600px",
            height: "400px"
        },
    };


};

export function setChartType(options, type) {
    switch (type) {
        case "area": {
            _.each(options.series, (series) => {
                _.set(series, 'type', 'line');
                _.set(series, 'areaStyle', {});
            });
            break;
        }
        default: {
            _.each(options.series, (series) => {
                _.set(series, 'type', type);
                delete series.areaStyle;
            });
        }
    }
};

export function parseChartType(type) {
    switch (type) {
        case undefined: {
            return "trajectory";
        }

        default: {
            return type;
        }
    }
};


export function getChartTypeForSeries(options, name) {
    // console.log(_.find(options.series, {name}));
    if (undefined !== _.find(options.series, { name })) {
        return _.get(_.find(options.series, { name }), "type", "graph");
    }
    return parseChartType(name, _.get(options, "form.chartType", "graph"));
}

export function getChartType(options) {
    return _.get(options, ['series', '0', 'type'], null);
}

export function returnDataVisColors() {
    return {
        "DataVis-红色": "#ed4d50",
        "DataVis-绿色": "#6eb37a",
        "DataVis-蓝色": "#5290e9",
        "DataVis-橘色": "#ee941b",
        "DataVis-紫色": "#985896",
        "深蓝色": '#003f5c',
        "灰蓝色": '#2f4b7c',
        "深紫色": '#665191',
        "紫红色": '#a05195',
        "玫红色": '#d45087',
        "桃红色": '#f95d6a',
        "橙色": '#ff7c43',
        "橘黄色": '#ffa600',
        "绿色": '#53aa46'
    };
}

export function setThemeColor(options, theme) {
    if (theme === "light") {

        //  亮色背景下如果是白色文字。则切换成黑色
        if (_.get(options, "title.textStyle.color", "") === "#ccc") {
            _.set(options, "title.textStyle.color", "#333");
        }
        if (_.get(options, "title.subtextStyle.color", "") === "#ccc") {
            _.set(options, "title.subtextStyle.color", "#333");
        }
        if (_.get(options, "legend.textStyle.color", "") === "#ccc") {
            _.set(options, "legend.textStyle.color", "#333");
        }


    }

    else if (theme !== "light") {
        // 暗色背景下如果是黑色文字。则切换成白色    
        if (_.get(options, "title.textStyle.color", "") === "#333") {
            _.set(options, "title.textStyle.color", "#ccc");
        }
        if (_.get(options, "title.subtextStyle.color", "") === "#333") {
            _.set(options, "title.subtextStyle.color", "#ccc");
        }
        if (_.get(options, "legend.textStyle.color", "") === "#333") {
            _.set(options, "legend.textStyle.color", "#ccc");
        }
    }
}