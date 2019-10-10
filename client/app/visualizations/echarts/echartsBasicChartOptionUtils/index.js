import * as _ from 'lodash';
import UUIDv4 from 'uuid/v4';

export function defaultBasicChartOptions() {
    return {
        id: UUIDv4(),
        form:{
            xAxisColumn: "",
            yAxisColumns:[]
        },
        size:{
            responsive: true,
            width:"600px",
            height:"400px"
        },
        title: {
            text: '',
            subtext: '',
            x: 'center'
        },
        tooltip: {
            show: true,
            axisPointer:{
                show: true,
                type : 'cross',
                lineStyle: {
                    type : 'dashed',
                    width : 1
                }
            }
        },
        grid:{
        },
        legend: {
            show: true,
            x: 'left',
            data: []
        },
        toolbox: {
            show: true,
            feature: {
                dataZoom: {
                    yAxisIndex: 'none'
                },
                magicType: { type: ['line', 'bar'] },
                restore: {},
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ["-"],
            nameLocation:"end",
            axisLine:{
                show: true
            },
            axisTick: {
                show:true
            },
            axisLabel: {
                show:true
            }
        },
        yAxis: {
            name: '',
            type: 'value',
            axisLabel: {
                formatter: ''
            }
        },
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
    switch (type) {
        case undefined:{
            return "line";
        }
        case "area": {
            return "line";
        }
        default: {
            return type;
        }
    }
};

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