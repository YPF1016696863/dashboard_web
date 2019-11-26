import * as _ from 'lodash';
import UUIDv4 from 'uuid/v4';

export function defaultGaugeChartOptions() {
    return {
        series_Name: '',
        tooltip: {
            formatter: "{a} <br/>{b} : {c}%"
        },
        toolbox: {
            feature: {
                restore: {},
                saveAsImage: {}
            }
        },
        series: [
            // {
            //     name: '业务指标',
            //     type: 'gauge',
            //     detail: { formatter: '{value}%' },
            //     data: [{ value: 50, name: '完成率' }]
            // }
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