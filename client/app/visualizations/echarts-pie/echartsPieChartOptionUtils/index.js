import * as _ from 'lodash';
import UUIDv4 from 'uuid/v4';

export function defaultPieChartOptions() {
    return {
        id: UUIDv4(),
        chartType: "PieChart",
        useSerie: '',           // 选中的系列名称
        useSerie_Index: -1,     // 选中的系列下标

        backgroundColor: 'transparent',
        form: {
            xAxisColumn: "",
            yAxisColumns: []
        },
        title: {
            text: '饼图',
            left: '50%',
            top: 20,
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
            backgroundColor: 'transparent',
            borderWidth: 0,
        },
        size: {
            responsive: true,
            width: "600px",
            height: "400px"
        },
        legend: {
            show: true,
            type: 'scroll',
            orient: 'horizontal',
            // x: 'left'
            textStyle: {
                color: '#333',
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        grid: {
        },
        toolbox: {
            show: false,
            feature: {               
                saveAsImage: {}
            }
        },
        // visualMap: {
        //     show: false,
        //     min: 80,
        //     max: 600,
        //     inRange: {
        //         colorLightness: [0, 1]
        //     }
        // },
        // 默认饼图主题颜色配置
        color : [ '#63b2ee', '#76da91 ','#f8cb7f ','#f89588', '#7cd6cf ','#9192ab ','#7898e1  ', '#efa666','#eddd86 ','#9987ce '],
        series: [
        ]
    };
};



export function parseChartType(type) {
    switch (type) {
        case undefined: {
            return "pie";
        }
        case "rose": {
            return "pie";
        }
        case "doughnut": {
            return "pie";
        }
        default: {
            return type;
        }
    }
};

export function getChartTypeForSeries(options, name) {
    // console.log(_.find(options.series, {name}));
    if (undefined !== _.find(options.series, { name })) {
        return _.get(_.find(options.series, { name }), "type", "pie");
    }
    return parseChartType(name, _.get(options, "form.chartType", "pie"));
}

export function getChartType(options) {
    return _.get(options, ['series', '0', 'type'], null);
}

// Radius默认值及对应修改
export function getRadius(options, type, index) {
    // console.log(type);

    switch (type) {
        case undefined: {

            return [_.get(options, "series_RadiusMin", [])[index] === undefined ?
                0 : _.get(options, "series_RadiusMin", [])[index],
            _.get(options, "series_RadiusMax", [])[index] === undefined ?
                '70%' : _.get(options, "series_RadiusMax", [])[index]
            ];
        }
        case "rose": {
            return [_.get(options, "series_RadiusMin", [])[index] === undefined ?
                0 : _.get(options, "series_RadiusMin", [])[index],
            _.get(options, "series_RadiusMax", [])[index] === undefined ?
                '70%' : _.get(options, "series_RadiusMax", [])[index]
            ];
        }
        case "pie": {
            return [_.get(options, "series_RadiusMin", [])[index] === undefined ?
                0 : _.get(options, "series_RadiusMin", [])[index],
            _.get(options, "series_RadiusMax", [])[index] === undefined ?
                '70%' : _.get(options, "series_RadiusMax", [])[index]
            ];
        }
        case "doughnut": {
            return [_.get(options, "series_RadiusMin", [])[index] === undefined ?
                '40%' : _.get(options, "series_RadiusMin", [])[index],
            _.get(options, "series_RadiusMax", [])[index] === undefined ?
                '70%' : _.get(options, "series_RadiusMax", [])[index]
            ];
        }
        default: {
            return [_.get(options, "series_RadiusMin", [])[index] === undefined ?
                0 : _.get(options, "series_RadiusMin", [])[index],
            _.get(options, "series_RadiusMax", [])[index] === undefined ?
                '70%' : _.get(options, "series_RadiusMax", [])[index]
            ];
        }
    }
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
        if (_.get(options, "series_LabelLine_LineStyle_Color", "") === "#ccc") {
            _.set(options, "series_LabelLine_LineStyle_Color", "#333");
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
        if (_.get(options, "series_LabelLine_LineStyle_Color", "") === "#333") {
            _.set(options, "series_LabelLine_LineStyle_Color", "#ccc");
        }

    }
}
