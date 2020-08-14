import * as _ from 'lodash';
import UUIDv4 from 'uuid/v4';

export function defaultGaugeStageChartOptions() {
    return {
        id: UUIDv4(),
        chartType: "GaugeStageChart",
        backgroundColor: 'transparent',
        series_Name: '',
        tooltip: {
            formatter: "{a} <br/>{b} : {c}%",
            textStyle: {
                color: '#fff',
            }
        },
        toolbox: {
            show: false,
            feature: {  
                restore: {},             
                saveAsImage: {}
            }
        },
        grid: {
        },
        size: {
            responsive: true,
            width: "600px",
            height: "400px"
        },
        legend: {
            show: true,
            // x: 'left'
            textStyle: {
                color: '#333',
            }
        },
        title: {
            text: '',
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
        series:   [
            {
                name: '打击阶段',
                type: 'gauge',
                min:0,
                max:12,
                startAngle: 45,
                endAngle: -314.999999,
                splitNumber:12,
                detail: {formatter: '{value}%'},
                data: [{value: 12, name: '完成率'}],// 0 3 6 9  . 12
                 
                splitLine:{
                    show:false
                },
                axisTick:{
                    splitNumber:2
                } ,
                axisLine:{
                    lineStyle:{
                        // 03869e d09931 c23531
                        color:[
                            [0.125, '#01c7ae'], 
                            [0.375, '#03869e'], 
                            [0.625, '#d09931'], 
                            [0.88, '#c23531'], 
                            [1, '#01c7ae']
                            ]
                    }
                },
                axisLabel:{
                    
                    formatter(e) {
                    switch (e + "") {
                        case "0":
                            return "阶段1";
                        case "3":
                            return "阶段2";
                        case "6":
                            return "阶段3";
                        case "9":
                            return "阶段4";
                        default:
                            return '';
                    }
                        
                    }
                }
            }
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
    switch (type) {
        case undefined: {
            return "gauge";
        }

        default: {
            return type;
        }
    }
};


export function setData(options, type, data) {// true为绝对数值
    if (type) {
        return data;
    }
    return ((data / (_.get(options, "maxValue", 100) - _.get(options, "minValue", 0))) * 100).toFixed(2);
};

export function getChartTypeForSeries(options, name) {
    // console.log(_.find(options.series, {name}));
    if (undefined !== _.find(options.series, { name })) {
        return _.get(_.find(options.series, { name }), "type", "gauge");
    }
    return parseChartType(name, _.get(options, "form.chartType", "gauge"));
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