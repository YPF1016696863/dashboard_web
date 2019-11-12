import * as _ from 'lodash';
import UUIDv4 from 'uuid/v4';

export function defaultBasicChartOptions() {
    return {
        id: UUIDv4(),
        yAxisOptionsShow: false,
        // 保存每个serie配置的数组 数组命名方式 echarts文档路径 . 用 _ 代替
        series_ReName: [],
        series_ItemStyle_Color: [],
        series_SymbolSize: [],
        series_Symbol: [],
        series_SymbolRotate: [],
        series_Show: [],
        series_Label_Position: [],
        series_Label_Color: [],
        series_Label_FontWeight: [],
        series_Label_FontSize: [],
        series_Label_FontFamily: [],
        // 标记点配置
        // 标记max点配置
        series_MarkPoint_Data_MaxType: [],
        series_MarkPoint_Data_MaxSymbol: [],
        series_MarkPoint_Data_MaxSymbolSize: [],
        series_MarkPoint_Data_Label_MaxShow: [],
        series_MarkPoint_Data_Label_MaxPosition: [],
        series_MarkPoint_Data_Label_MaxColor: [],
        series_MarkPoint_Data_Label_MaxFontWeight: [],
        series_MarkPoint_Data_Label_MaxFontSize: [],
        series_MarkPoint_Data_Label_MaxFontFamily: [],
        // 标记min点配置
        series_MarkPoint_Data_MinType: [],
        series_MarkPoint_Data_MinSymbol: [],
        series_MarkPoint_Data_MinSymbolSize: [],
        series_MarkPoint_Data_Label_MinShow: [],
        series_MarkPoint_Data_Label_MinPosition: [],
        series_MarkPoint_Data_Label_MinColor: [],
        series_MarkPoint_Data_Label_MinFontWeight: [],
        series_MarkPoint_Data_Label_MinFontSize: [],
        series_MarkPoint_Data_Label_MinFontFamily: [],
        // 标记average点配置
        series_MarkPoint_Data_AverageType: [],
        series_MarkPoint_Data_AverageSymbol: [],
        series_MarkPoint_Data_AverageSymbolSize: [],
        series_MarkPoint_Data_Label_AverageShow: [],
        series_MarkPoint_Data_Label_AveragePosition: [],
        series_MarkPoint_Data_Label_AverageColor: [],
        series_MarkPoint_Data_Label_AverageFontWeight: [],
        series_MarkPoint_Data_Label_AverageFontSize: [],
        series_MarkPoint_Data_Label_AverageFontFamily: [],

        // MarkLine 配置
        // max
        series_MarkLine_Data_MarkValue: [],
        series_MarkLine_Data_MarkName: [],
        series_MarkLine_Data_Mark: [],
        series_MarkLine_Data_LineStyle_Color: [],
        series_MarkLine_Data_LineStyle_Width: [],
        series_MarkLine_Data_LineStyle_Type: [],




        useSerie: '',           // 选中的系列名称
        useSerie_Index: -1,     // 选中的系列下标
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
            subtext: '',
            x: 'center',
            backgroundColor: '#ff0',
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
            nameLocation: "end",
            axisLine: {
                show: true
            },
            axisTick: {
                show: true
            },
            axisLabel: {
                show: true
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
                show: true
            },
            axisTick: {
                show: true
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
        case undefined: {
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