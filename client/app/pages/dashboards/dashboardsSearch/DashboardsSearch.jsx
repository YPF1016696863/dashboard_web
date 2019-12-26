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
  Input,
  Tree,
  message,
  Carousel,
  Collapse,
  Modal
} from 'antd';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import * as _ from 'lodash';
import { QueryTagsControl } from '@/components/tags-control/TagsControl';
import { SchedulePhrase } from '@/components/queries/SchedulePhrase';

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

import { Dashboard } from '@/services/dashboard';
import { currentUser } from '@/services/auth';
import { routesToAngularRoutes } from '@/lib/utils';

import { policy } from '@/services/policy';
import './DashboardSearch.less';

const { Panel } = Collapse;
const { TreeNode, DirectoryTree } = Tree;
const emptyChartImg = '/static/images/emptyChart.png';
let imageId =0;

class DashboardsSearch extends React.Component {
  state = {
    visible: false,
    isLoaded: false,
    dashboard: null,
    backgroundImages: [
      {
        id: 0,
        meta: '无背景图片',
        image: '',
        overview: '/static/images/themeBackgroundImages/empty-overview.png',
        name: 'empty'
      },
      {
        id: 1,
        meta: 'DataVis背景1',
        image: '/static/images/themeBackgroundImages/theme1.png',
        overview: '/static/images/themeBackgroundImages/theme1-overview.png',
        name: 'theme1Bg'
      },
      {
        id: 2,
        meta: 'DataVis背景2',
        image: '/static/images/themeBackgroundImages/theme2.png',
        overview: '/static/images/themeBackgroundImages/theme2-overview.png',
        name: 'theme2Bg'
      },
      {
        id: 3,
        meta: 'DataVis背景3',
        image: '/static/images/themeBackgroundImages/theme3.png',
        overview: '/static/images/themeBackgroundImages/theme3-overview.png',
        name: 'theme3Bg'
      },
      {
        id: 4,
        meta: 'DataVis背景4',
        image: '/static/images/themeBackgroundImages/theme4.gif',
        overview: '/static/images/themeBackgroundImages/theme4-overview.png',
        name: 'theme4Bg'
      },
      {
        id: 5,
        meta: 'DataVis背景5',
        image: '/static/images/themeBackgroundImages/theme5.gif',
        overview: '/static/images/themeBackgroundImages/theme5-overview.png',
        name: 'theme5Bg'
      },
      {
        id: 6,
        meta: 'DataVis背景6',
        image: '/static/images/themeBackgroundImages/theme6.gif',
        overview: '/static/images/themeBackgroundImages/theme6-overview.png',
        name: 'theme6Bg'
      },
      {
        id: 7,
        meta: 'DataVis背景7',
        image: '/static/images/themeBackgroundImages/theme7.jpg',
        overview: '/static/images/themeBackgroundImages/theme7-overview.jpg',
        name: 'theme7Bg'
      },
      // {
      //   id: 8,
      //   meta: 'DataVis背景8',
      //   image: '/static/images/themeBackgroundImages/theme8.jpg',
      //   overview: '/static/images/themeBackgroundImages/theme8-overview.jpg',
      //   name: 'theme8Bg'
      // },
      // {
      //   id: 9,
      //   meta: 'DataVis背景9',
      //   image: '/static/images/themeBackgroundImages/theme9.jpg',
      //   overview: '/static/images/themeBackgroundImages/theme9-overview.jpg',
      //   name: 'theme9Bg'
      // },    
    ]
  };

  constructor(props) {
    super(props);
    this.crousel = React.createRef();
  }

  componentDidMount() {
    const { slugId } = this.props;
    if (slugId) {
      this.getDashboard(slugId);
    }
    message.destroy();
    message.success('点击预览查看完整数据可视化面板演示', 1);
  }

  showModal = () => {
    this.setState({
      visible: true
      // imagesId：
    });
  };

  handleOk = e => {
    this.setState({
      visible: false
    }); 
  };

  handleCancel = e => {
    this.setState({
      visible: false
    });
    this.props.updateDashboardBgImgCb(
      _.find(this.state.backgroundImages, item => item.id === 0).image
    );
  };

  onChange = (a, b, c) => {
    this.props.updateDashboardBgImgCb(
      _.find(this.state.backgroundImages, item => item.id === a).image
    );
  };

  getDashboard = slugId => {
    this.setState({
      isLoaded: false,
      dashboard: null,
      isDashboardOwner: false
    });
    Dashboard.get(
      { slug: slugId },
      dashboard => {
        this.setState({
          isLoaded: true,
          dashboard,
          isDashboardOwner:
            currentUser.id === dashboard.user.id ||
            currentUser.hasPermission('admin')
        });

        // This is a really bad workaround, need to be changed after the dwmo
        // try to find image url and set ID
        if (_.isEmpty(dashboard.background_image)) {
          this.crousel.goTo(0, true);
        } else {
          const selectedBgImg = _.find(
            this.state.backgroundImages,
            item => item.image === dashboard.background_image
          );
          this.crousel.goTo(selectedBgImg.id, true);
          imageId = selectedBgImg.id;
        }
      },
      rejection => {
        this.setState({
          isLoaded: true,
          dashboard: null,
          isDashboardOwner: false
        });
      }
    );
  };

  render() {
    const { appSettings } = this.props;
    const { dashboard } = this.state;
    console.log(this.state.isDashboardOwner);
    return (
      <>
        {!this.state.isLoaded && (
          <div className="align-center-div" style={{ paddingTop: '15%' }}>
            <LoadingState />
          </div>
        )}
        {this.state.isLoaded && this.state.dashboard == null && (
          <div className="align-center-div" style={{ paddingTop: '15%' }}>
            <img src={emptyChartImg} alt="" style={{ width: 100 }} />
            <br />
            <p>选择可视化面板</p>
          </div>
        )}
        {this.state.isLoaded && this.state.dashboard != null && (
          <>
            <Row visible={this.state.visible}>
              <Col>
                <Collapse
                  bordered={false}
                  defaultActiveKey={['2']}
                  style={{ backgroundColor: '#20263B' }}
                >
                  <Panel header="基础设置" key="1" className="panel-border">
                    <p style={{ color: '#fff' }}>可视化仪表盘名称:</p>
                    <p className="board-name-input">
                      {this.state.dashboard.name}
                    </p>
                  </Panel>
                  <Panel header="主题设置" key="2" className="panel-border">
                    <Button style={{ color: '#fff' , backgroundColor: '#20263B' }} onClick={this.showModal} block>点击设置背景图片</Button>
                    <Modal
                      destroyOnClose
                      title="添加可视化组件"
                      visible={this.state.visible}
                      onOk={this.handleOk}
                      onCancel={this.handleCancel}
                      width="60vw"
                      okText="添加"
                      cancelText="取消设置"
                    >  
                      <Carousel
                        afterChange={this.onChange}
                        ref={node => {
                          this.crousel = node;
                        }}
                      >
                        <div>
                          <img
                            src={this.state.backgroundImages[0].overview}
                            alt={this.state.backgroundImages[0].meta}
                            width="100%"
                          />
                        </div>
                        <div>
                          <img
                            src={this.state.backgroundImages[1].overview}
                            alt={this.state.backgroundImages[1].meta}
                            width="100%"
                          />
                        </div>
                        <div>
                          <img
                            src={this.state.backgroundImages[2].overview}
                            alt={this.state.backgroundImages[2].meta}
                            width="100%"
                          />
                        </div>
                        <div>
                          <img
                            src={this.state.backgroundImages[3].overview}
                            alt={this.state.backgroundImages[3].meta}
                            width="100%"
                          />
                        </div>
                        <div>
                          <img
                            src={this.state.backgroundImages[4].overview}
                            alt={this.state.backgroundImages[4].meta}
                            width="100%"
                          />
                        </div>
                        <div>
                          <img
                            src={this.state.backgroundImages[5].overview}
                            alt={this.state.backgroundImages[5].meta}
                            width="100%"
                          />
                        </div>
                        <div>
                          <img
                            src={this.state.backgroundImages[6].overview}
                            alt={this.state.backgroundImages[6].meta}
                            width="100%"
                          />
                        </div>
                        <div>
                          <img
                            src={this.state.backgroundImages[7].overview}
                            alt={this.state.backgroundImages[7].meta}
                            width="100%"
                          />
                        </div>
                        {/* <div>
                          <img
                            src={this.state.backgroundImages[8].overview}
                            alt={this.state.backgroundImages[8].meta}
                            width="100%"
                          />
                        </div>
                        <div>
                          <img
                            src={this.state.backgroundImages[9].overview}
                            alt={this.state.backgroundImages[9].meta}
                            width="100%"
                          />
                        </div> */}
                      </Carousel> 
                    </Modal>
                  </Panel>  
                  <p style={{ color: '#fff',paddingTop: '10%'}}>选择添加项目:</p>                                             
                  {/*
                  <Panel
                    header="已添加可视化组件列表:"
                    key="3"
                    className="panel-border"
                  >
                    <DirectoryTree defaultExpandedKeys={[dashboard.name]} className="TreeInDarkMode">
                      <TreeNode
                        title={dashboard.name}
                        key={dashboard.name}
                        selectable={false}
                      >
                        {_.map(this.state.dashboard.widgets, item => (
                          <TreeNode
                            icon={
                              <Icon
                                type="file-search"
                                style={{ color: '#FAAA39' }}
                              />
                            }
                            title={'Widget:' + item.id}
                            key={item.id}
                            isLeaf={false}
                          >
                            <TreeNode
                              icon={
                                <Icon
                                  type="pie-chart"
                                  style={{ color: '#428bca' }}
                                />
                              }
                              title={
                                item.visualization.name +
                                ', id: [' +
                                item.visualization.id +
                                ']'
                              }
                              key={item.id + ':' + item.visualization.id}
                              isLeaf
                            />
                          </TreeNode>
                        ))}
                      </TreeNode>
                    </DirectoryTree>
                  </Panel>
                  */}
                </Collapse>
              </Col>
            </Row>
          </>
        )}
      </>
    );
  }
}

DashboardsSearch.propTypes = {
  slugId: PropTypes.string,
  updateDashboardBgImgCb: PropTypes.func
};

DashboardsSearch.defaultProps = {
  slugId: null,
  updateDashboardBgImgCb: a => {}
};

export default function init(ngModule) {
  ngModule.component(
    'dashboardsSearch',
    react2angular(DashboardsSearch, Object.keys(DashboardsSearch.propTypes), [
      'appSettings'
    ])
  );
}

init.init = true;
