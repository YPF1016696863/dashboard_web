import * as _ from 'lodash';
import UUIDv4 from 'uuid/v4';

export function defaultPieChartOptions() {
    return {

        // 多系列时需要转为数组
        // series_ItemStyle_Color: '',
        // series_LabelLine_LineStyle_Color: '',
        // series_Label_Color: '',
        // series_Label_Position: '',
        // series_RadiusMax: '',
        // series_RadiusMin: '',
        // series_Label_Normal_Show: '',
        // series_Label_Emphasis_Show: '',
        // series_Label_Normal_FontSize: '',
        // series_Label_Normal_FontWeights: '',
        // series_Label_FontSize: '',
        useSerie: '',           // 选中的系列名称
        useSerie_Index: -1,     // 选中的系列下标



        backgroundColor: '#fff',
        form: {
            xAxisColumn: "",
            yAxisColumns: []
        },
        title: {
            text: '饼图',
            left: 'center',
            top: 20,
            textStyle: {
                color: '#ccc'
            },
            backgroundColor: 'transparent',
            borderWidth: 0,
        },
        size: {
            responsive: true,
            width: "600px",
            height: "400px"
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },

        // visualMap: {
        //     show: false,
        //     min: 80,
        //     max: 600,
        //     inRange: {
        //         colorLightness: [0, 1]
        //     }
        // },
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
    switch (type) {
        case undefined: {

            return [_.get(options, "series_RadiusMin", [])[index] === undefined ?
                0 : _.get(options, "series_RadiusMin", [])[index],
            _.get(options, "series_RadiusMax", [])[index] === undefined ?
                200 : _.get(options, "series_RadiusMax", [])[index]
            ];
        }
        case "rose": {
            return [_.get(options, "series_RadiusMin", [])[index] === undefined ?
                0 : _.get(options, "series_RadiusMin", [])[index],
            _.get(options, "series_RadiusMax", [])[index] === undefined ?
                200 : _.get(options, "series_RadiusMax", [])[index]
            ];
        }
        case "pie": {
            return [_.get(options, "series_RadiusMin", [])[index] === undefined ?
                0 : _.get(options, "series_RadiusMin", [])[index],
            _.get(options, "series_RadiusMax", [])[index] === undefined ?
                200 : _.get(options, "series_RadiusMax", [])[index]
            ];
        }
        case "doughnut": {
            return [_.get(options, "series_RadiusMin", [])[index] === undefined ?
                100 : _.get(options, "series_RadiusMin", [])[index],
            _.get(options, "series_RadiusMax", [])[index] === undefined ?
                200 : _.get(options, "series_RadiusMax", [])[index]
            ];
        }
        default: {
            return [_.get(options, "series_RadiusMin", [])[index] === undefined ?
                0 : _.get(options, "series_RadiusMin", [])[index],
            _.get(options, "series_RadiusMax", [])[index] === undefined ?
                200 : _.get(options, "series_RadiusMax", [])[index]
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