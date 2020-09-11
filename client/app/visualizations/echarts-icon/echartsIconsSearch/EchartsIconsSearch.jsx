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

const { Panel } = Collapse;
const { TreeNode, DirectoryTree } = Tree;
const { Search } = Input;
const CHART_IMG_ROOT = '/static/images/';

class EchartsIconsSearch extends React.Component{
    state = {
    };
    
    componentDidMount() {
        this.setState(
            {
                icon: null
            });
    }

    render() {
      return (
        <>
          <Row>
            <Col>
              <Row>
                <Radio.Group
                  defaultValue={this.state.icon}
                  onChange={(e)=>{
                            let iconname;
                            this.setState({
                                icon: e.target.value
                            })
                            switch (e.target.value){
                                case 'check-circle' : iconname = 'check-circle';break;
                                case 'clear' : iconname = 'clear';break;
                                case 'QQ-square-fill' : iconname = 'QQ-square-fill';break;
                                case 'linkedin-fill' : iconname = 'linkedin-fill';break;
                                case 'gift' : iconname = 'gift';break;
                                case 'arrowdown' : iconname = 'arrowdown';break;
                                case 'arrowleft' : iconname = 'arrowleft';break;
                                case 'arrowup' : iconname = 'arrowup';break;
                                case 'arrowright' : iconname = 'arrowright';break;
                                case 'left' : iconname = 'left';break;
                                case 'up' : iconname = 'up';break;
                                case 'down' : iconname = 'down';break;
                                case 'vertical right' : iconname = 'vertical right';break;
                                case 'vertical left' : iconname = 'vertical left';break;
                                case 'block' : iconname = 'block';break;
                                case 'cloud-upload' : iconname = 'cloud-upload';break;
                                case 'read' : iconname = 'read';break;
                                case 'shop' : iconname = 'shop';break;
                                case 'home' : iconname = 'home';break;
                                case 'meh' : iconname = 'meh';break;
                                case 'frown' : iconname = 'frown';break;
                                case 'gongju' : iconname = 'gongju';break;
                                case 'qiche': iconname = 'qiche'; break;
                                case 'yongquan':iconname = 'yongquan';break;
                                case 'feidie':iconname = 'feidie';break;
                                case 'huojian':iconname = 'huojian';break;
                                case 'chuan':iconname = 'chuan';break;
                                case 'huoche':iconname = 'huoche';break;
                                case 'lanqiu':iconname = 'lanqiu';break;
                                default: this.setState({icon:null}); console.log("default error");
                            }
                            this.props.iconSearchCb(iconname);
                        }}
                >
                  <Collapse
                    bordered={false}
                    style={{position: "absolute", left: '0%', width: '100%'}}
                  >
                    <Panel
                      header="Ant Design 官方图标库"
                      id="p1"
                      key="1"
                    >
                      <Row gutter={[8,8]}>
                        <Col
                          style={{paddingBottom:'6px'}}
                          span={6}
                          align="center"
                        >
                          <Radio value="check-circle" style={{width:'95%'}}>
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-icons/check-circle.png`}
                            >
                              <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>check-circle</p>
                            </Avatar>
                          </Radio>
                        </Col>
                        <Col
                          style={{paddingBottom:'6px'}}
                          span={6}
                          align="center"
                        >
                          <Radio value="clear" style={{width:'95%'}}>
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-icons/clear.png`}
                            >
                              <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>clear</p>
                            </Avatar>
                          </Radio>
                        </Col>
                        <Col
                          style={{paddingBottom:'6px'}}
                          span={6}
                          align="center"
                        >
                          <Radio value="QQ-square-fill" style={{width:'95%'}}>
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-icons/QQ-square-fill.png`}
                            >
                              <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>QQ-square-fill</p>
                            </Avatar>
                          </Radio>
                        </Col>
                        <Col
                          style={{paddingBottom:'6px'}}
                          span={6}
                          align="center"
                        >
                          <Radio value="linkedin-fill" style={{width:'95%'}}>
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-icons/linkedin-fill.png`}
                            >
                              <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>linkedin-fill</p>
                            </Avatar>
                          </Radio>
                        </Col>
                        <Col
                          style={{paddingBottom:'6px'}}
                          span={6}
                          align="center"
                        >
                          <Radio value="gift" style={{width:'95%'}}>
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-icons/gift.png`}
                            >
                              <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>gift</p>
                            </Avatar>
                          </Radio>
                        </Col>
                        <Col
                          style={{paddingBottom:'6px'}}
                          span={6}
                          align="center"
                        >
                          <Radio value="arrowdown" style={{width:'95%'}}>
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-icons/arrowdown.png`}
                            >
                              <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>arrowdown</p>
                            </Avatar>
                          </Radio>
                        </Col>
                        <Col
                          style={{paddingBottom:'6px'}}
                          span={6}
                          align="center"
                        >
                          <Radio value="arrowleft" style={{width:'95%'}}>
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-icons/arrowleft.png`}
                            >
                              <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>arrowleft</p>
                            </Avatar>
                          </Radio>
                        </Col>
                        <Col
                          style={{paddingBottom:'6px'}}
                          span={6}
                          align="center"
                        >
                          <Radio value="arrowright" style={{width:'95%'}}>
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-icons/arrowright.png`}
                            >
                              <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>arrowright</p>
                            </Avatar>
                          </Radio>
                        </Col>
                        <Col
                          style={{paddingBottom:'6px'}}
                          span={6}
                          align="center"
                        >
                          <Radio value="arrowup" style={{width:'95%'}}>
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-icons/arrowup.png`}
                            >
                              <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>arrowup</p>
                            </Avatar>
                          </Radio>
                        </Col>
                        <Col
                          style={{paddingBottom:'6px'}}
                          span={6}
                          align="center"
                        >
                          <Radio value="left" style={{width:'95%'}}>
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-icons/left.png`}
                            >
                              <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>left</p>
                            </Avatar>
                          </Radio>
                        </Col>
                        <Col
                          style={{paddingBottom:'6px'}}
                          span={6}
                          align="center"
                        >
                          <Radio value="up" style={{width:'95%'}}>
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-icons/up.png`}
                            >
                              <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>up</p>
                            </Avatar>
                          </Radio>
                        </Col>
                        <Col
                          style={{paddingBottom:'6px'}}
                          span={6}
                          align="center"
                        >
                          <Radio value="down" style={{width:'95%'}}>
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-icons/down.png`}
                            >
                              <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>down</p>
                            </Avatar>
                          </Radio>
                        </Col>
                        <Col
                          style={{paddingBottom:'6px'}}
                          span={6}
                          align="center"
                        >
                          <Radio value="vertical right" style={{width:'95%'}}>
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-icons/vertical right.png`}
                            >
                              <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>vertical right</p>
                            </Avatar>
                          </Radio>
                        </Col>
                        <Col
                          style={{paddingBottom:'6px'}}
                          span={6}
                          align="center"
                        >
                          <Radio value="vertical left" style={{width:'95%'}}>
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-icons/vertical left.png`}
                            >
                              <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>vertical left</p>
                            </Avatar>
                          </Radio>
                        </Col>
                        <Col
                          style={{paddingBottom:'6px'}}
                          span={6}
                          align="center"
                        >
                          <Radio value="block" style={{width:'95%'}}>
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-icons/block.png`}
                            >
                              <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>block</p>
                            </Avatar>
                          </Radio>
                        </Col>
                        <Col
                          style={{paddingBottom:'6px'}}
                          span={6}
                          align="center"
                        >
                          <Radio value="cloud-upload" style={{width:'95%'}}>
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-icons/cloud-upload.png`}
                            >
                              <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>cloud-upload</p>
                            </Avatar>
                          </Radio>
                        </Col>
                        <Col
                          style={{paddingBottom:'6px'}}
                          span={6}
                          align="center"
                        >
                          <Radio value="read" style={{width:'95%'}}>
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-icons/read.png`}
                            >
                              <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>read</p>
                            </Avatar>
                          </Radio>
                        </Col>
                        <Col
                          style={{paddingBottom:'6px'}}
                          span={6}
                          align="center"
                        >
                          <Radio value="shop" style={{width:'95%'}}>
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-icons/shop.png`}
                            >
                              <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>shop</p>
                            </Avatar>
                          </Radio>
                        </Col>
                        <Col
                          style={{paddingBottom:'6px'}}
                          span={6}
                          align="center"
                        >
                          <Radio value="home" style={{width:'95%'}}>
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-icons/home.png`}
                            >
                              <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>home</p>
                            </Avatar>
                          </Radio>
                        </Col>
                        <Col
                          style={{paddingBottom:'6px'}}
                          span={6}
                          align="center"
                        >
                          <Radio value="meh" style={{width:'95%'}}>
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-icons/meh.png`}
                            >
                              <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>meh</p>
                            </Avatar>
                          </Radio>
                        </Col>
                        <Col
                          style={{paddingBottom:'6px'}}
                          span={6}
                          align="center"
                        >
                          <Radio value="frown" style={{width:'95%'}}>
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-icons/frown.png`}
                            >
                              <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>frown</p>
                            </Avatar>
                          </Radio>
                        </Col>
                      </Row>
                      <Divider style={{ margin: ' 0' }} />   
                    </Panel>
                    <Panel
                      header="彩色图标"
                      id="p2"
                      key="2"
                    >
                      <Row gutter={[8,8]}>
                        <Col
                          style={{paddingBottom:'6px'}}
                          span={6}
                          align="center"
                        >
                          <Radio value="qiche" style={{width:'95%'}}>
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-icons/qiche.png`}
                            >
                              <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>汽车</p>
                            </Avatar>
                          </Radio>
                        </Col>
                        <Col
                          style={{paddingBottom:'6px'}}
                          span={6}
                          align="center"
                        >
                          <Radio value="yongquan" style={{width:'95%'}}>
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-icons/yongquan.png`}
                            >
                              <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>泳圈</p>
                            </Avatar>
                          </Radio>
                        </Col>
                        <Col
                          style={{paddingBottom:'6px'}}
                          span={6}
                          align="center"
                        >
                          <Radio value="gongju" style={{width:'95%'}}>
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-icons/gongju.png`}
                            >
                              <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>工具</p>
                            </Avatar>
                          </Radio>
                        </Col>
                        <Col
                          style={{paddingBottom:'6px'}}
                          span={6}
                          align="center"
                        >
                          <Radio value="lanqiu" style={{width:'95%'}}>
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-icons/lanqiu.png`}
                            >
                              <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>篮球</p>
                            </Avatar>
                          </Radio>
                        </Col>
                        <Col
                          style={{paddingBottom:'6px'}}
                          span={6}
                          align="center"
                        >
                          <Radio value="huoche" style={{width:'95%'}}>
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-icons/huoche.png`}
                            >
                              <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>货车</p>
                            </Avatar>
                          </Radio>
                        </Col>
                        <Col
                          style={{paddingBottom:'6px'}}
                          span={6}
                          align="center"
                        >
                          <Radio value="chuan" style={{width:'95%'}}>
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-icons/chuan.png`}
                            >
                              <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>船</p>
                            </Avatar>
                          </Radio>
                        </Col>
                        <Col
                          style={{paddingBottom:'6px'}}
                          span={6}
                          align="center"
                        >
                          <Radio value="huojian" style={{width:'95%'}}>
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-icons/huojian.png`}
                            >
                              <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>火箭</p>
                            </Avatar>
                          </Radio>
                        </Col>
                        <Col
                          style={{paddingBottom:'6px'}}
                          span={6}
                          align="center"
                        >
                          <Radio value="feidie" style={{width:'95%'}}>
                            <Avatar
                              shape="square"
                              size="large"
                              src={`${CHART_IMG_ROOT}/datavis-charts/datavis-icons/feidie.png`}
                            >
                              <p style={{ fontSize: '12px', position: 'relative', left: '10px' }}>飞碟</p>
                            </Avatar>
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

      );
    }
}

EchartsIconsSearch.propTypes = {
    iconSearchCb:PropTypes.func
};

EchartsIconsSearch.defaultProps = {
    iconSearchCb:(a)=>{ }
};

export default function init(ngModule) {
    ngModule.component(
        'echartsIconsSearch',
        react2angular(EchartsIconsSearch, Object.keys(EchartsIconsSearch.propTypes), [
            'appSettings',
            '$route'
        ])
    );
}

init.init = true;

