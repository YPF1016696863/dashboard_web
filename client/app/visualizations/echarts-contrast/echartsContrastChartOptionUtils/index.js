import * as _ from 'lodash';
import UUIDv4 from 'uuid/v4';

export function defaultContrastChartOptions() {
    return {
        id: UUIDv4(),
        chartType: "ContrastChart",
        yAxisOptionsShow: false,
        backgroundColor: 'transparent',
        series_Name: '',
        useSerie: '',           // 选中的系列名称
        useSerie_Index: -1,     // 选中的系列下标
        bar2Flag: false,

        form: {
            xAxisColumn: "",
            yAxisColumns: []
        },
        title: {
            text: '简单示例',
            subtext: '',
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
        legend: {           
            show: true,
            // x: 'left'
            textStyle: {
                color: '#333',
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        yAxis: 
            {
                type: 'value',
                // nameLocation: "end",
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
                }
            },
        xAxis: 
            {
                type: 'category',
                boundaryGap: true,
                data: ["-"],
                nameLocation: "end",
                axisTick: {
                    show: false
                },
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: '#333',
                    }
                },
                axisLabel: {
                    show: true
                }
            }
        ,
        tooltip: { 
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
              type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            },
            // formatter:"{b}",
            textStyle: {
                color: '#333',
            }
        },
        toolbox: {
            show: false,
            feature: {
                dataZoom: {
                    yAxisIndex: 'none'
                },
                magicType: { type: ['line', 'bar'] },
                restore: {},
                saveAsImage: {}
            }
        },
        dataZoom: [{
            type: 'inside',
            disabled: true,
        }],

        series: [
            
        ],
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
            return "bar";
        }
        case "bar2": {
            return "bar";
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
        if (_.get(options, "tooltip.textStyle.color", "") === "#ccc") {
            _.set(options, "tooltip.textStyle.color", "#333");
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
        if (_.get(options, "tooltip.textStyle.color", "") === "#333") {
            _.set(options, "tooltip.textStyle.color", "#ccc");
        }

    }
}