import React from 'react';
import {
  PageHeader,
  Button,
  Descriptions,
  Breadcrumb,
  Dropdown,
  Menu,
  Icon,
  Divider,
  Row,
  Col,
  Tree,
  Input,
  Alert,
  Collapse,
  Radio,
  BackTop,
  Tabs,
  Badge,
  Avatar,
  Empty
} from 'antd';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import { angular2react } from 'angular2react';
import * as _ from 'lodash';
import { QueryTagsControl } from '@/components/tags-control/TagsControl';
import { SchedulePhrase } from '@/components/queries/SchedulePhrase';
// import QueriesList  from '@/components/queries-list/Querieslist';
import { ChartsListSelectView } from '@/pages/dashboards/charts-list-select';


import {
  wrap as itemsList,
  ControllerType
} from '@/components/items-list/ItemsList';
import { ResourceItemsSource } from '@/components/items-list/classes/ItemsSource';
import { UrlStateStorage } from '@/components/items-list/classes/StateStorage';

import LoadingState from '@/components/items-list/components/LoadingState';
import * as Sidebar from '@/components/items-list/components/Sidebar';
import ItemsTable, {
  Columns
} from '@/components/items-list/components/ItemsTable';

import { Query } from '@/services/query';
import { currentUser } from '@/services/auth';
import { routesToAngularRoutes } from '@/lib/utils';

import { policy } from '@/services/policy';
import './ChartSearch.css'

const { TreeNode, DirectoryTree } = Tree;
const { Search } = Input;
const CHART_IMG_ROOT = '/static/images/';

const emptyChart = '/static/images/emptyChart.png';
const { Panel } = Collapse;
let ChartsListSelectViewDOM;
let QueriesListViewDOM;

class ChartsSearch extends React.Component {
  state = {
  };

  componentDidMount() {
    this.setState({
      isLoaded: true,
      visualization: null
    });
    // this.props.chartSearchCb('new');
    this.getQuery(this.props.queryId + ':' + this.props.chartId);
    ChartsListSelectViewDOM = angular2react(
      'chartsListSelectView',
      ChartsListSelectView,
      window.$injector
    );
    // QueriesListViewDOM = angular2react(
    //   'queriesListView',
    //   QueriesListView,
    //   window.$injector
    // );
  }

  getQuery(id) {
    const queryId = _.split(id, ':')[0];
    const visualizationId = _.split(id, ':')[1];
    this.setState({
      isLoaded: false,
      visualization: null
    });

    if (visualizationId === 'new') {
      this.setState({
        isLoaded: true,
        visualization: { type: this.props.chartType ? this.props.chartType : 'new' }
      });
    } else {
      Query.query({ id: queryId })
        .$promise.then(query => {

          query
            .getQueryResultPromise()
            .then(queryRes => {
              if (visualizationId) {
                const visTemp=_.find(
                  query.visualizations,
                  // eslint-disable-next-line eqeqeq
                  visualization => visualization.id == visualizationId
                )
                
                let typeChange= "ECHARTS_line";
                switch (visTemp.type) {
                  case 'ECHARTS': typeChange = 'ECHARTS_line'; break;
                  case 'ECHARTS-PIE-AND-RADAR': typeChange = 'ECHARTS_pie'; break;
                  case 'CHART': typeChange = 'CHART_line'; break;
                  default: typeChange = this.props.chartType; 
                }
                if(typeChange!==null&&typeChange.length!==0){
                  visTemp.type=typeChange;
                }
                
                this.setState({
                  isLoaded: true,
                  visualization: visTemp
                });
                
              } else {
                let typeChange= "ECHARTS_line";
                switch (this.props.chartType) {
                  case 'ECHARTS': typeChange = 'ECHARTS_line'; break;
                  case 'ECHARTS-PIE-AND-RADAR': typeChange = 'ECHARTS_pie'; break;
                  case 'CHART': typeChange = 'CHART_line'; break;
                  default: typeChange = this.props.chartType; 
                }
                this.setState({
                  isLoaded: true,
                  visualization: { type: this.props.chartType ? typeChange : 'new' }
                });
              }
              this.props.chartSearchCb(this.state.visualization.type);

            })
            .catch(err => {
              query
                .getQueryResultByText(-1, query.query)
                .toPromise()
                .then(queryRes => {
                  if (visualizationId) {
                    const visTemp=_.find(
                      query.visualizations,
                      // eslint-disable-next-line eqeqeq
                      visualization => visualization.id == visualizationId
                    )
                    
                    let typeChange= "ECHARTS_line";
                    switch (visTemp.type) {
                      case 'ECHARTS': typeChange = 'ECHARTS_line'; break;
                      case 'ECHARTS-PIE-AND-RADAR': typeChange = 'ECHARTS_pie'; break;
                      case 'CHART': typeChange = 'CHART_line'; break;
                      default: typeChange = this.props.chartType; 
                    }
                    if(typeChange!==null&&typeChange.length!==0){
                      visTemp.type=typeChange;
                    }
                    this.setState({
                      isLoaded: true,
                      visualization: visTemp
                    });
                  } else {
                    let typeChange= "ECHARTS_line";
                    switch (this.props.chartType) {
                      case 'ECHARTS': typeChange = 'ECHARTS_line'; break;
                      case 'ECHARTS-PIE-AND-RADAR': typeChange = 'ECHARTS_pie'; break;
                      case 'CHART': typeChange = 'CHART_line'; break;
                      default: typeChange = this.props.chartType; 
                    }
                    this.setState({
                      isLoaded: true,
                      visualization: { type: this.props.chartType ? typeChange : 'new' }
                    });
                  }
                  this.props.chartSearchCb(this.state.visualization.type);
                })
                .catch(ex => {
                  console.log(ex);
                  this.setState({
                    isLoaded: true,
                    visualization: { type: 'new' }
                  });
                });
            });



        })
        .catch(err => {
          this.setState({
            isLoaded: true,
            visualization: { type: 'new' }
          });
        });
    }
  }

  render() {
    const { appSettings } = this.props;
    return (
      <>
        {!this.state.isLoaded && (
          <div style={{ paddingTop: '2vh' }}>
            <LoadingState />
          </div>
        )}
        {this.state.isLoaded && !this.state.visualization && (
          <Empty description={<span>无法加载图表类型</span>}>
            <Button
              type="primary"
              onClick={() => {
                this.props.$route.reload();
              }}
            >
              刷新
            </Button>
          </Empty>
        )}
        {this.state.isLoaded &&
          this.state.visualization &&
          this.state.visualization.type && (
            <>
              <Row>
                <Col>
                  <Row>
                    <Radio.Group
                      // disabled={this.state.visualization.type !== 'new'}// 开放随意变换图表类型
                      defaultValue={this.state.visualization.type}
                      // value={this.state.value}
                      onChange={e => {
                        this.setState({
                          // eslint-disable-next-line react/no-unused-state
                          value: e.target.value,
                          visualization: { type: e.target.value }// 
                        });
                        let type;
                        let chart;
                        switch (e.target.value) {
                          case 'ECHARTS_line': type = 'ECHARTS'; chart = 'line'; break;
                          case 'ECHARTS_bar': type = 'ECHARTS'; chart = 'bar'; break;
                          case 'ECHARTS_area': type = 'ECHARTS'; chart = 'area'; break;
                          case 'ECHARTS_scatter': type = 'ECHARTS'; chart = 'scatter'; break;
                          case 'ECHARTS_pie': type = 'ECHARTS-PIE-AND-RADAR'; chart = 'pie'; break;
                          case 'ECHARTS_donut': type = 'ECHARTS-PIE-AND-RADAR'; chart = 'doughnut'; break;
                          case 'ECHARTS_rose': type = 'ECHARTS-PIE-AND-RADAR'; chart = 'rose'; break;
                          case 'ECHARTS-GAUGE': type = 'ECHARTS-GAUGE'; break;
                          case 'ECHARTS-POLAR': type = 'ECHARTS-POLAR'; break;
                          case 'ECHARTS-GRAPH': type = 'ECHARTS-GRAPH'; break;// 拓扑图
                          case 'ECHARTS-TRAJECTORY': type = 'ECHARTS-TRAJECTORY'; break;// 轨迹图
                          case 'ECHARTS-THREEDBAR': type = 'ECHARTS-THREEDBAR'; break;// 3d 柱状图
                          case 'ECHARTS-LIQUID': type = 'ECHARTS-LIQUID'; break;// 指标球
                          case 'ECHARTS-TUBE': type = 'ECHARTS-TUBE'; break;// 试管温度计
                          case 'ECHARTS-GANTE': type = 'ECHARTS-GANTE'; break;// 甘特图
                          case 'ECHARTS-PIC': type = 'ECHARTS-PIC'; break;// 图片
                          case 'ECHARTS-ICONS': type = 'ECHARTS-ICONS'; break;// icon
                          case 'ECHARTS-ZONE': type = 'ECHARTS-ZONE'; break;// 区间图
                          // case 'ECHARTS-TXT': type = 'ECHARTS-TXT'; break;// TXT
                          case 'ECHARTS-CHINA': type = 'ECHARTS-CHINA'; break;// 3D地图
                          case 'ECHARTS-POLARPIE': type = 'ECHARTS-POLARPIE'; break;// 扇形
                          case 'ECHARTS-CONTRAST': type = 'ECHARTS-CONTRAST'; break;// 双数值对比图
                          // 散点图重构(颜色)图
                          case 'ECHARTS-SCATTER': type = 'ECHARTS-SCATTER'; chart = 'scatter'; break;
                          // 散点图重构(二维坐标-手动调节散点大小)
                          case 'ECHARTS-SCATTER-COORDINATES': type = 'ECHARTS-SCATTER-COORDINATES'; break;
                          // 散点图重构(二维坐标-根据数值自动调节散点，大小不可手动)
                          case 'ECHARTS-SCATTER-NUMBER': type = 'ECHARTS-SCATTER-NUMBER'; break;
                          case 'PIVOT': type = 'PIVOT'; break; // 透视表
                          case 'CHART_line': type = 'CHART'; chart = 'line'; break;
                          case 'CHART_bar': type = 'CHART'; chart = 'bar'; break;
                          case 'CHART_area': type = 'CHART'; chart = 'area'; break;
                          case 'CHART_pie': type = 'CHART'; chart = 'pie'; break;
                          case 'CHART_scatter': type = 'CHART'; chart = 'scatter'; break;
                          case 'CHART_bubble': type = 'CHART'; chart = 'bubble'; break;
                          case 'CHART_heatmap': type = 'CHART'; chart = 'heatmap'; break;
                          case 'CHART_box': type = 'CHART'; chart = 'box'; break;
                          case 'TABLE': type = 'TABLE'; break;
                          case 'SUNBURST_SEQUENCE': type = 'SUNBURST_SEQUENCE'; break;
                          case 'SANKEY': type = 'SANKEY'; break;
                          case 'COUNTER': type = 'COUNTER'; break;
                          case 'WORD_CLOUD': type = 'WORD_CLOUD'; break;
                          case 'ECHARTS-GAUGE-STAGE': type = 'ECHARTS-GAUGE-STAGE'; break;
                          case 'ECHARTS-TEXT':type = 'ECHARTS-TEXT'; break;
                          default: type = 'ECHARTS'; console.log("default(error)");
                        }
                        // console.log("改变了");

                        this.props.chartSearchCb(type, true, chart);
                      }}
                    >
                      <Collapse bordered={false} style={{ position: "absolute", left: '0%', width: '100%' }}>

                        {/* *** *****Radio value="ECHARTS" Echarts基础图  key 1 */}
                        <Panel header="Echarts基础图组" id="p1" key="1">
                          <Row gutter={[8, 8]}>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS_line" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-line.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>线性图</p>
                              </Radio>
                            </Col>

                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS_bar" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-bar1.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>柱状图</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS_area" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-area.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>面积图</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS_scatter" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-scatter.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>散点图</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS-TRAJECTORY" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-trajectory.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>轨迹图</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS-ZONE" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-zone.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>区间图</p>
                              </Radio>
                            </Col>


                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS_pie" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-pie.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>饼图</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS_donut" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-donut.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>环形图</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS_rose" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-rose.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>玫瑰图</p>
                              </Radio>
                            </Col>
                          </Row>

                          <Divider style={{ margin: ' 0' }} />
                        </Panel>
                        <Panel header="E-charts仪表" id="p2" key="2">
                          <Row gutter={[8, 8]}>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS-GAUGE" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-gauge.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>仪表</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS-LIQUID" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-liquidfill.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>指标球</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS-TUBE" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-tube.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>试管图</p>
                              </Radio>
                            </Col>


                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS-GAUGE-STAGE" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-gauge.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>阶段仪表</p>
                              </Radio>
                            </Col>

                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS-POLAR" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-polar.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>极坐标图</p>
                              </Radio>
                            </Col>

                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS-POLARPIE" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-polarpie.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>扇形图</p>
                              </Radio>
                            </Col>

                          </Row>
                          <Divider style={{ margin: ' 0' }} />
                        </Panel>
                        <Panel header="DataVis基础图组" id="p3" key="3">

                          <Row gutter={[8, 8]}>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="CHART_line" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-line.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>折线图</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="CHART_bar" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-bar.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>柱状图</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="CHART_area" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-area.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>面积图</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="CHART_pie" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-pie.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>饼图</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="CHART_scatter" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-scatter.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>散点图</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="CHART_bubble" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-bubble.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>气泡图</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="CHART_heatmap" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-heatmap.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>热度图</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="CHART_box" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-box.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>箱型图</p>
                              </Radio>
                            </Col>


                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="TABLE" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-table.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>交叉表</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="PIVOT" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-pivot.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>透视表</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="SUNBURST_SEQUENCE" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-sunburst.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>旭日图</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="SANKEY" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-sankey.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>桑基图</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="COUNTER" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-counter.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>计数器</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="WORD_CLOUD" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-worldcloud.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>字云图</p>
                              </Radio>
                            </Col>
                          </Row>
                          <Divider style={{ margin: ' 0' }} />
                        </Panel>

                        <Panel header="E-charts拓展图" id="p4" key="4">
                          <Row gutter={[8, 8]}>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS-GRAPH" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-graph.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>拓扑图</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS-GANTE" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-gante.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>甘特图</p>
                              </Radio>
                            </Col>

                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS-PIC" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/picture.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>图片</p>
                              </Radio>
                            </Col>


                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS-THREEDBAR" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-threebar.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>3D柱状图</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS-CHINA" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-china.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>3D地图</p>
                              </Radio>
                            </Col>


                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS-SCATTER" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-scatter-color.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>散点图(颜色)</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS-SCATTER-COORDINATES" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-scatter-coordinates.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>散点图(坐标)</p>
                              </Radio>
                            </Col>
                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS-SCATTER-NUMBER" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-scatter-number.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>散点图(数值)</p>
                              </Radio>
                            </Col>


                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS-CONTRAST" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-threebar1.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>柱状图</p>
                              </Radio>
                            </Col>


                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS-ICONS" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-icons/datavis-icons.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>Icon</p>
                              </Radio>
                            </Col>

                            <Col
                              style={{ paddingBottom: '6px' }}
                              span={8}
                              align="center"
                            >
                              <Radio value="ECHARTS-TEXT" style={{ width: '95%' }}>
                                <Avatar
                                  shape="square"
                                  size="large"
                                  src={`${CHART_IMG_ROOT}/datavis-charts/datavis-charts-text.png`}
                                />
                                <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>文本</p>
                              </Radio>
                            </Col>

                          </Row>
                          <Divider style={{ margin: ' 0' }} />
                        </Panel>

                      </Collapse>
                    </Radio.Group>
                   
                  </Row>
                </Col>
              </Row>
            </>
          )}
      </>
    );
  }
}

ChartsSearch.propTypes = {
  chartSearchCb: PropTypes.func,
  queryId: PropTypes.string,
  chartId: PropTypes.string,
  chartType: PropTypes.string
};

ChartsSearch.defaultProps = {
  chartSearchCb: (a, b, c) => { },
  queryId: null,
  chartId: null,
  chartType: null
};

export default function init(ngModule) {
  ngModule.component(
    'chartsSearch',
    react2angular(ChartsSearch, Object.keys(ChartsSearch.propTypes), [
      'appSettings',
      '$route'
    ])
  );
}

init.init = true;
