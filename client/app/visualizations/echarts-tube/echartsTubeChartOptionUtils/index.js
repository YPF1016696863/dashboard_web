import * as _ from 'lodash';
import UUIDv4 from 'uuid/v4';


export function defaultTubeChartOptions() {
    return {
        id: UUIDv4(),
        chartType: "TubeChart",
        backgroundColor: 'transparent',
        form: {
            xAxisColumn: "",
            yAxisColumn: ""
        },
        tooltip: {
            show: true,
            // eslint-disable-next-line object-shorthand
            formatter: function (c) {
                return  c.value-30;
            },
            textStyle: {
                color: '#fff',
            }
        },
        toolbox: {
            show: false,
            feature: {
                saveAsImage: {}
            }
        },
        title: {
            text: '温度计', 
            show: true,
            textStyle:{
                color:'#fff'
            }
        },
        yAxis: [{
            show: false,
            min: 0,
            max: 160,// 越大越小
        }, {
            show: false,
            data: [],
            min: 0,
            max: 160,// 越大越小
        }],
        xAxis: [{
            show: false,
            data: []
        }, {
            show: false,
            data: []
        }, {
            show: false,
            data: []
        }, {
            show: false,
            min: -110,
            max: 100,
    
        }],
        series: [],
        
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',

        
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
            return "Tube";
        }

        default: {
            return type;
        }
    }
};


export function getChartTypeForSeries(options, name) {
    // console.log(_.find(options.series, {name}));
    if (undefined !== _.find(options.series, { name })) {
        return _.get(_.find(options.series, { name }), "type", "Tube");
    }
    return parseChartType(name, _.get(options, "form.chartType", "Tube"));
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