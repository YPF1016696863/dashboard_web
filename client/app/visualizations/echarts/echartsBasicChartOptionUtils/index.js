import * as _ from 'lodash';
import UUIDv4 from 'uuid/v4';
import $ from 'jquery'

export function defaultBasicChartOptions() {
    return {
        id: UUIDv4(),
        chartType: "BasicChart",

        yAxisOptionsShow: false,
        backgroundColor: 'transparent',
        useSerie: '',           // 选中的系列名称
        useSerie_Index: -1,     // 选中的系列下标
        bar2Flag: false,

        form: {
            xAxisColumn: "",
            yAxisColumns: []
        },
        size: {
            responsive: true,
            width: "600px",
            height: "400px"
        },
        title: {
            text: '',
            left:0,
            subtext: '',
            x: 'center',
            backgroundColor: 'transparent',
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
            axisPointer: {
                show: true,
                type: 'cross',
                lineStyle: {
                    type: 'dashed',
                    width: 1
                }
            }
        },
        grid: {
        },
        legend: {
            show: true,
            // x: 'left'
            textStyle: {
                color: '#333',
            }
        },
        toolbox: {
            show: false,
            right: '10%',
            feature: {
                // dataView:{
                //     show:true
                // },
                dataZoom: {
                    yAxisIndex: 'none'
                },
                // magicType: { type: ['line', 'bar'] },
                restore: {},
                saveAsImage: {},
                // myTool1: {
                //     show: true,
                //     title: 'RESTFul发送',
                //     icon: `path://M1009.19461 5.118447a32.054274 
                //     32.054274 0 0 0-35.125341 0.255922l-959.708789 
                //     639.805859a31.830341 31.830341 0 0 0-14.043738 
                //     29.942914 31.830341 31.830341 0 0 0 19.929952 
                //     26.360002l250.292052 100.161607 117.692288 
                //     205.953506a31.990293 31.990293 0 0 0 27.415681 
                //     16.123108H415.998608c11.228593 0 21.657428-5.950194 
                //     27.415681-15.547283l66.443839-110.782384 310.14589 
                //     124.026365a31.734371 31.734371 0 0 0 
                //     27.543642-1.855437c8.445437-4.734563 
                //     14.23568-13.05204 15.867185-22.617137l159.951465-959.708788A32.054274 
                //     32.054274 0 0 0 1009.19461 5.118447zM100.446359 664.662317L841.821398 
                //     170.3803 302.784962 
                //     747.389214c-2.847136-1.695486-5.374369-3.934806-8.509418-5.182427l-193.829185-77.54447z 
                //     m225.627536 105.216073l-0.223932-0.319903L931.842082 120.955298 
                //     415.230841 925.895049l-89.156946-156.016659z 
                //     m480.750122 177.322194l-273.229092-109.278841a63.564712 
                //     63.564712 0 0 0-19.929952-3.806845L934.401305 
                //     181.896806l-127.577288 765.303778z`,
                //     // eslint-disable-next-line object-shorthand
                //     onclick: function () {
                //         alert('RESTFul发送2')
                //     }
                // }
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ["-"],
            nameLocation: "end",
            axisLine: {
                show: true,
                lineStyle: {
                    color: '#333',
                }
            },
            axisTick: {
                show: true
            },
            axisLabel: {
                show: true
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: 'rgba(125,125,125,0.3)',
                    width: 1,
                    type: 'dashed'
                }
            }
        },

        yAxis: {
            name: '',
            type: 'value',
            nameLocation: "end",
            axisLabel: {
                formatter: '{value}',
                show: true
            },
            axisLine: {
                show: true,
                lineStyle: {
                    color: '#333',
                }
            },
            axisTick: {
                show: true
            },
            splitLine: {
                show: true,
                lineStyle: {
                    color: 'rgba(125,125,125,0.3)',
                    width: 1,
                    type: 'dashed'
                }
            },
        },

        dataZoom: [{
            type: 'inside',
            disabled: true,
        }],
        color: ['#63b2ee', '#76da91 ', '#f8cb7f ', '#f89588', '#7cd6cf ', '#9192ab ', '#7898e1  ', '#efa666', '#eddd86 ', '#9987ce '],
        series: [
        ]
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
    // console.log(type);
    switch (type) {
        case undefined: {
            return "line";
        }
        case "area": {
            return "line";
        }
        case "bar2": {
            return "bar";
        }
        case "scatter2": {
            return "scatter";
        }
        default: {
            return type;
        }
    }
};


export function setxAxis(options, flag, seriesNameIndex) {// 获取类型 下标  bar2? 是：返回 设置相应的值  否：返回undefined 去禁用xy轴标记线
    if (flag) {// 是横向柱状图 开启x
        if (_.get(options, "series_MarkLine_Data_MarkValue", [])[seriesNameIndex] === '') {// 数据线填了之后清空的判断，让数据线放到最下边隐藏
            return -10000;
        }
        return _.get(options, "series_MarkLine_Data_MarkValue", [])[seriesNameIndex] === undefined ?
            -10000 : _.get(options, "series_MarkLine_Data_MarkValue", [])[seriesNameIndex];
    }
    return undefined;
};
export function setyAxis(options, flag, seriesNameIndex) {
    if (flag) {// 不是横向柱状图 关闭x
        return undefined;
    }
    if (_.get(options, "series_MarkLine_Data_MarkValue", [])[seriesNameIndex] === '') {// 数据线填了之后清空的判断，让数据线放到最下边隐藏
        return -10000;
    }
    return _.get(options, "series_MarkLine_Data_MarkValue", [])[seriesNameIndex] === undefined ?
        -10000 : _.get(options, "series_MarkLine_Data_MarkValue", [])[seriesNameIndex];
};


export function setScatter(symbolSize) {
    if (symbolSize === undefined)
        return 9;
    return symbolSize;
}



export function getChartTypeForSeries(options, name) {
    // console.log(_.find(options.series, {name}));
    if (undefined !== _.find(options.series, { name })) {
        return _.get(_.find(options.series, { name }), "type", "line");
    }
    return parseChartType(name, _.get(options, "form.chartType", "line"));
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

export function getFullCanvasDataURL(divId) {// 延迟一秒执行
    // 将第一个画布作为基准。
    const baseCanvas = $("#" + divId).find("canvas").first()[0];
    if (!baseCanvas) {
        return false;
    };
    const width = baseCanvas.width;
    const height = baseCanvas.height;
    const ctx = baseCanvas.getContext("2d");
    // 遍历，将后续的画布添加到在第一个上
    $("#" + divId).find("canvas").each(function (i, canvasObj) {
        if (i > 0) {
            const canvasTmp = $(canvasObj)[0];
            ctx.drawImage(canvasTmp, 0, 0, width, height);
        }
    });
    // 获取base64位的url
    return baseCanvas.toDataURL();
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
        if (_.get(options, "xAxis.axisLine.lineStyle.color", "") === "#ccc") {
            _.set(options, "xAxis.axisLine.lineStyle.color", "#333");
        }
        if (_.get(options, "yAxis.axisLine.lineStyle.color", "") === "#ccc") {
            _.set(options, "yAxis.axisLine.lineStyle.color", "#333");
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
        if (_.get(options, "xAxis.axisLine.lineStyle.color", "") === "#333") {
            _.set(options, "xAxis.axisLine.lineStyle.color", "#ccc");
        }
        if (_.get(options, "yAxis.axisLine.lineStyle.color", "") === "#333") {
            _.set(options, "yAxis.axisLine.lineStyle.color", "#ccc");
        }
        if (_.get(options, "legend.textStyle.color", "") === "#333") {
            _.set(options, "legend.textStyle.color", "#ccc");
        }

    }
}