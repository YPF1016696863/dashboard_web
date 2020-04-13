import * as _ from 'lodash';
import UUIDv4 from 'uuid/v4';

export function defaultPolarpieChartOptions() {
    return {
        id: UUIDv4(),
        chartType: "PolarpieChart",
        backgroundColor: 'transparent',
        form: {
            xAxisColumn: "",
            maxAxisColumn: "",
            minAxisColumn: "",
        },
        toolbox: {
            show: false,
            feature: {
                saveAsImage: {}
            }
        },
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',
        title: {
            text: '',
            subtext: '',
            x: 'center',
            backgroundColor: 'transparent',// 
            textStyle: {
                color: '#333',
                fontStyle: 'normal',
                fontFamily: 'serif',
                fontSize: 25,
            },
            subtextStyle: {
                color: '#333',
                fontStyle: 'normal',
                fontFamily: 'serif',
                fontSize: 18,
            },
        },
        tooltip: {
            show: true,
            trigger: 'item', // 触发类型,'item'数据项图形触发，
            axisPointer: {
                type: 'cross'
            }
        },
        grid: {
        },
        legend: {
            show: false
        }, 
        polar: {
            center: ['50%', '50%']
        },

        // 角度坐标系的角度轴
        angleAxis: {
            min: 0,
            max: 360,
            name: '角度(°)',
            interval: 90,// 角度间隔
            startAngle: 90,

            splitLine: {  // 分割线
                show: true,
                interval: 'auto',
            },

            splitArea: {  // 分割区域
                show: true,
            },

            // 坐标轴的设置--外围的轴
            axisLine: {
                show: true,
                lineStyle: {   // 坐标轴线的颜色
                    color: '#fff',
                },
            }


        },
        // 极坐标系的径向轴
        radiusAxis: {
            min: 0,
            max: 500,// 最大值
            name: '距离(km)',
            interval: 100, //  刻度

            splitLine: {  // 分割线
                show: true,
            },

            splitArea: {  // 分割区域
                show: true,
            },
            axisLine: {
                show: true,
                lineStyle: {   // 径向轴轴线的颜色
                    color: '#fff',
                },
            }
        },
        dataset: {
            source: [
                ['a', 20],// 宽度
                ['b', 60]
            ]
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