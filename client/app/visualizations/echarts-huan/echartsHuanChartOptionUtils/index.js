import * as _ from 'lodash';
import UUIDv4 from 'uuid/v4';



const angle = 0;// 角度，用来做简单的动画效果的
const valueIn = 55.33;
export function defaultHuanChartOptions() {
    return {
        id: UUIDv4(),
        chartType: "HuanChart",
        backgroundColor: 'transparent',
        form: {
            xAxisColumn: "",
            maxAxisColumn: "",
            minAxisColumn: "",
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

        title: [{
            text: '{a|' + valueIn + '}{c|%}',
            x: 'center',
            y: 'center',
            textStyle: {
                rich: {
                    a: {
                        fontSize: 48,
                        color: '#29EEF3'
                    },

                    c: {
                        fontSize: 20,
                        color: '#ffffff',
                        // padding: [5,0]
                    }
                }
            }
        },
        {
            text: '环比图',
            left: 0,
            subtext: '',
            x: 'center',
            backgroundColor: 'transparent',
            textStyle: {
                color: '#fff',
                fontStyle: 'normal',
                fontFamily: 'serif',
                fontSize: 25,
            },
            subtextStyle: {
                color: '#fff',
                fontStyle: 'normal',
                fontFamily: 'serif',
                fontSize: 18,
            },
        }],
        tooltip: {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            },
        },

        series: [

            {
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
                    value: valueIn,
                    name: "",
                    itemStyle: {
                        normal: {
                            color: { // 完成的圆环的颜色
                                colorStops: [{
                                    offset: 0,
                                    color: '#4FADFD' // 0% 处的颜色
                                }, {
                                    offset: 1,
                                    color: '#28E8FA' // 100% 处的颜色
                                }]
                            },
                        }
                    }
                },
                {
                    value: 100 - valueIn,
                    name: "",
                    label: {
                        normal: {
                            show: false
                        }
                    },
                    itemStyle: {
                        normal: {
                            color: "#173164"
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
            },

        ],

        size: {
            responsive: true,
            width: "600px",
            height: "400px"
        },
    };


};


// 获取圆上面某点的坐标(x0,y0表示坐标，r半径，angle角度)
function getCirlPoint(x0, y0, r, angle1) {
    const x1 = x0 + r * Math.cos(angle1 * Math.PI / 180)
    const y1 = y0 + r * Math.sin(angle1 * Math.PI / 180)
    return {
        x: x1,
        y: y1
    }
}

// function draw(){
//     angle +=3
//     myChart.setOption(option, true)
//    // window.requestAnimationFrame(draw);
// }

// setInterval(function() {
//     // 用setInterval做动画感觉有问题
//     draw()
// }, 100);

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