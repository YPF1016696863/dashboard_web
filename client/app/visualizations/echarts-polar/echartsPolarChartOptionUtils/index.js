import * as _ from 'lodash';
import UUIDv4 from 'uuid/v4';

export function defaultPolarChartOptions() {
    return {
        useSerie: '',           // 选中的系列名称
        // series_ItemStyle_Color: [],
        // series_SymbolSize: [],
        // series_Symbol: [],
        // series_SymbolRotate: [],
        size:{
            responsive: true,
            width:"600px",
            height:"400px"
        },
        title: {
            text: '极坐标测试案例',
            subtext: '',
            x: 'center',
            backgroundColor:  '', // 
            // borderColor:"#ccc",                         // 边框颜色
            // borderWidth:0,                               // 边框线宽
        },
        tooltip : {
            show:true,      
            trigger: 'item', // 触发类型,'item'数据项图形触发，
            // formatter:" 系列名称：{a} <br/>距离:{b} <br/>角度：{c}", // 提示框浮层内容格式器,{a}, {b}，{c}，{d}，{e}，分别表示系列名，数据名，数据值等
            axisPointer: {
            type: 'cross'
            }
        },
        grid:{
        },
        legend: {
            show:true,   
            x: 'left',
            text: '极坐标图例',
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
        polar: {
            center: ['50%', '54%']
        },
        
        // 角度坐标系的角度轴
        angleAxis: {
            min: 0,
            max: 360,
            interval: 90,// 角度间隔
            startAngle: 90,

            splitLine: {  // 分割线
                show: true,
                interval: 'auto',        
           },
           
            splitArea: {  // 分割区域
                show: true,
                 // 三个扇形分割区域的间隔颜色--会覆盖分割线的颜色
                // areaStyle: {
                //     // 使用深浅的间隔色
                //    color: ['#84AF9B', '#5290e9'],              
                // }
            },

            // 坐标轴的设置--外围的轴
            axisLine: {  
                show: true,
                // lineStyle: {   // 坐标轴线的颜色
                //     // color: ['#84AF9B'],
                //     color: [''],
                //     width: 3,
                //     type: 'solid',                 
                // },
            }
           

        },
        // 极坐标系的径向轴
        radiusAxis: {
            min: 0,
            max: 500,// 最大值
            name:'距离',
            interval: 100, //  刻度
    
            splitLine: {  // 分割线
                show: true,
                // interval: 'auto',
                // // 环形分割线的间隔颜色
                // lineStyle: {
                //      // 使用深浅的间隔色
                //     color: ['#aaa', '#ed4d50'],
                //     width: 1,
                //     type: 'solid',                 
                // },
           },
           
            splitArea: {  // 分割区域
                show: true,
                 // 环形分割区域的间隔颜色--会覆盖分割线的颜色
                // areaStyle: {
                //     // 使用深浅的间隔色
                //    color: ['#ccc', '#5290e9'],              
                // }
            },

            // 坐标轴的设置--垂直的轴
            axisLine: {  
                show: true,
                // lineStyle: {   // 坐标轴线的颜色
                //     color: [''],
                //     width: 1,
                //     type: 'solid',                 
                // },
            }


        },

        series: [
            {
            // coordinateSystem: 'polar',
            // name: 'line',
            // type: 'scatter',
            // data: [[100,0],[100,90],[200,90]]// 距离，角度
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
        case undefined:{
            return "line";
        }
        case "polar": {
            return "line";
        }
        default: {
            return type;
        }
    }
};

export function getChartTypeForSeries(options, name) {
    // console.log(_.find(options.series, {name}));
    if(undefined !== _.find(options.series, {name})) {
        return _.get(_.find(options.series, {name}),"type","line");
    }
    return parseChartType(name, _.get(options,"form.chartType","line"));
}

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