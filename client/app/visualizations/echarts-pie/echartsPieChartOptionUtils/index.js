import * as _ from 'lodash';
import UUIDv4 from 'uuid/v4';

export function defaultPieChartOptions() {
    return {
        backgroundColor: '#2c343c',
        form:{
            xAxisColumn: "",
            yAxisColumns:[]
        },
        title: {
            text: '饼图测试案例',
            left: 'center',
            top: 20,
            textStyle: {
                color: '#ccc'
            }
        },

        tooltip : {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },

        visualMap: {
            show: false,
            min: 80,
            max: 600,
            inRange: {
                colorLightness: [0, 1]
            }
        },
        series : [
            // {
            //     name:'访问来源',
            //     type:'pie',
            //     radius : '55%',
            //     center: ['50%', '50%'],
            //     data:[
            //         {value:335, name:'直接访问'},
            //         {value:310, name:'邮件营销'},
            //         {value:274, name:'联盟广告'},
            //         {value:235, name:'视频广告'},
            //         {value:400, name:'搜索引擎'}
            //     ].sort(function (a, b) { return a.value - b.value; }),
            //     roseType: 'radius',
            //     label: {
            //         normal: {
            //             textStyle: {
            //                 color: 'rgba(255, 255, 255, 0.3)'
            //             }
            //         }
            //     },
            //     labelLine: {
            //         normal: {
            //             lineStyle: {
            //                 color: 'rgba(255, 255, 255, 0.3)'
            //             },
            //             smooth: 0.2,
            //             length: 10,
            //             length2: 20
            //         }
            //     },
            //     itemStyle: {
            //         normal: {
            //             color: '#c23531',
            //             shadowBlur: 200,
            //             shadowColor: 'rgba(0, 0, 0, 0.5)'
            //         }
            //     },

            //     animationType: 'scale',
            //     animationEasing: 'elasticOut'
            // }
        ]
    };
};

// export function setChartType(options, type) {
//     switch (type) {
//         case "area": {
//             _.each(options.series, (series) => {
//                 _.set(series, 'type', 'line');
//                 _.set(series, 'areaStyle', {});
//             });
//             break;
//         }
//         default: {
//             _.each(options.series, (series) => {
//                 _.set(series, 'type', type);
//                 delete series.areaStyle;
//             });
//         }
//     }
// };

export function parseChartType(type) {
    switch (type) {
        case undefined:{
            return "pie";
        }
        case "rose": {
            return "pie";
        }
        default: {
            return type;
        }
    }
};

export function getChartTypeForSeries(options, name) {
    // console.log(_.find(options.series, {name}));
    if(undefined !== _.find(options.series, {name})) {
        return _.get(_.find(options.series, {name}),"type","pie");
    }
    return parseChartType(name, _.get(options,"form.chartType","pie"));
}

export function getChartType(options) {
    return _.get(options, ['series', '0', 'type'], null);
}

export function returnDataVisColors() {
    return {
        "DataVis-红色":"#ed4d50",
        "DataVis-绿色":"#6eb37a",
        "DataVis-蓝色":"#5290e9",
        "DataVis-橘色":"#ee941b",
        "DataVis-紫色":"#985896",
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