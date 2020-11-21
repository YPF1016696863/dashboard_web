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
  Upload,
  Modal,
  Radio
} from 'antd';
import { PlusOutlined, InboxOutlined } from '@ant-design/icons';
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

import { appSettingsConfig } from '@/config/app-settings';
import { Dashboard } from '@/services/dashboard';
import { currentUser } from '@/services/auth';
import { routesToAngularRoutes } from '@/lib/utils';

import { policy } from '@/services/policy';
import './DashboardSearch.less';

const { Panel } = Collapse;
const { Dragger } = Upload;
const { TreeNode, DirectoryTree } = Tree;
const emptyChartImg = '/static/images/emptyChart.png';


const UPLOAD_URL = appSettingsConfig.server.backendUrl + "/api/image_upload";




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
        image: '/static/images/themeBackgroundImages/mode1.png',
        overview: '/static/images/themeBackgroundImages/mode1.png',
        name: 'theme7Bg'
      },
      {
        id: 8,
        meta: 'DataVis背景8',
        image: '/static/images/themeBackgroundImages/mode4.png',
        overview: '/static/images/themeBackgroundImages/mode4.png',
        name: 'theme8Bg'
      }
    ],

    imgTypeState: "tianchong",
    dashboardColor: "#ffffff !important",

    // 上传背景
    previewVisible: false,
    previewImage: '',
    previewTitle: '',
    fileList: [
    ],
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
    // console.log(this.state.backgroundImages);
    // debugger 
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
        // console.log(dashboard.background_image);
        let arr = [[], [], [], [], ["/static/images/themeBackgroundImages/empty-overview.png"]];
        if (dashboard.background_image !== null) {
          // console.log("1");
          arr = dashboard.background_image.slice(1, -1).split(",");
        }


        // /static/images/themeBackgroundImages/empty-overview.png

        this.setState({
          isLoaded: true,
          dashboard,
          isDashboardOwner:
            currentUser.id === dashboard.user.id ||
            currentUser.hasPermission('admin'),
          imgTypeState: arr[4],
          dashboardColor: arr[6],
        });

        // This is a really bad workaround, need to be changed after the dwmo
        // try to find image url and set ID
        if (_.isEmpty(dashboard.background_image)) {
          if (this.crousel.goTo) {
            this.crousel.goTo(0, true);
          }
        } else {
          const selectedBgImg = _.find(
            this.state.backgroundImages,
            item => item.image === dashboard.background_image
          );
          if (this.crousel.goTo) {
            this.crousel.goTo(selectedBgImg.id, true);
          }
        }
      },
      rejection => {
        this.setState({
          isLoaded: true,
          dashboard: null,
          isDashboardOwner: false,
          imgTypeState: "tianchong"
        });
      }
    );
  };


  onChangeImgType = (e) => {
    // console.log('radio checked', e.target.value);
    // this.setState({
    //   value: e.target.value,
    // });
    this.props.typeDashboardBgImgCb(e.target.value);
  }

  onChangeColor = (e) => {
    console.log('e', e.target.value);// 大屏背景颜色设置
    // this.setState({
    //   value: e.target.value,
    // });
    this.props.typeDashboardColorCb(e.target.value);
  }


  // 上传图片
  getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  handleCancelPic = () => this.setState({ previewVisible: false });

  handlePreviewPic = async file => {
    if (!file.url && !file.preview) {
      file.preview = await this.getBase64(file.originFileObj);
    }

    this.setState({
      previewImage: file.url || file.preview,
      previewVisible: true,
      previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
    });
  };



  // 上传验证格式及大小
  beforeUpload = (file) => {
    // console.log(file);
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("只能上传JPG或PNG...文件!");
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("图片大小需小于2MB!");
      return false;
    }
    return isJpgOrPng && isLt2M;
  }

  handleChangePic = ({ fileList }) => {
    // const { dispatch } = this.props;
    // 【重要】将 图片的base64替换为图片的url。 这一行一定不会能少。
    // 图片上传成功后，fileList数组中的 thumbUrl 中保存的是图片的base64字符串，这种情况，导致的问题是：图片上传成功后，点击图片缩略图，浏览器会会卡死。而下面这行代码，可以解决该bug。
    // fileList.forEach(imgItem => {
    //   if (imgItem && imgItem.status === 'done' && imgItem.response && imgItem.response.imgUrl) {
    //     imgItem.thumbUrl = imgItem.response.imgUrl;
    //   }
    // });
    // console.log(fileList);

    let len = 0;
    this.state.backgroundImages.map((item) => {
      len += 1;
      return null;
    })

    const tmp = this.state.backgroundImages;
    // 查找背景列表的id有没有包含现在上传的 有就不添加 找不到返回undefine 添加
    // 同时判断 item.thumbUrl 这个值是不是 undefine 是就不添加
    fileList.map((item) => {
      // console.log(item);
      if (
        _.find(tmp, function (o) { return o.meta === item.uid; }) === undefined &&
        item.thumbUrl !== undefined
      ) {
        tmp.push({
          // id 值需要获取最后一个元素的id+1
          id: parseInt(this.state.backgroundImages[len - 1].id, 10) + 1,
          meta: item.uid,
          image: appSettingsConfig.server.backendUrl + '/static/' + item.response.url,
          overview: item.thumbUrl,
          name: item.uid
        });
      }
      return null;
    })

    // console.log(tmp);
    this.setState({
      fileList,
      backgroundImages: tmp
    });
  }



  render() {
    const { appSettings } = this.props;
    const { dashboard, isDashboardOwner } = this.state;
    // 上传背景
    const { previewVisible, previewImage, fileList, previewTitle } = this.state;

    const uploadButton = (
      <div>
        <PlusOutlined />
        <div className="ant-upload-text">上传</div>
      </div>
    );
    // console.log(this.state.imgTypeState);
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
                  // defaultActiveKey={['2']}
                  style={{ backgroundColor: '#20263B' }}
                >
                  <Panel header="基础信息" key="1" className="panel-border">
                    <p style={{ color: '#fff' }}>可视化仪表盘名称:</p>
                    <p className="board-name-input">
                      {this.state.dashboard.name}
                    </p>
                  </Panel>


                  <Panel header="主题设置" key="2" className="panel-border">
                    <Button style={{ color: '#fff', backgroundColor: '#20263B' }} onClick={this.showModal} block>点击设置背景图片</Button>
                    <Modal
                      destroyOnClose
                      title="设置背景图片"
                      visible={this.state.visible}
                      onOk={this.handleOk}
                      onCancel={this.handleCancel}
                      width="40vw"
                      okText="添加"
                      cancelText="取消设置"
                    >
                      <Radio.Group
                        onChange={this.onChangeImgType}
                        defaultValue={this.state.imgTypeState.indexOf('/') ||
                          this.state.imgTypeState === "" ||
                          this.state.imgTypeState === null
                          ? "tianchong" : this.state.imgTypeState}
                      >
                        <Radio value="tianchong">填充</Radio>
                        <Radio value="pingpu">平铺</Radio>
                        <Radio value="lasheng">拉伸</Radio>
                      </Radio.Group>
                      <input
                        type="color"
                        style={{ width: "100%" }}
                        defaultValue={this.state.dashboardColor}
                        onChange={this.onChangeColor}
                      />
                      {/* <input
                        type="number"
                        style={{ width:"100%" }}
                        defaultValue={this.state.dashboardColor} 
                        onChange={this.onChangeColor}
                      /> */}
                      <Carousel
                        afterChange={this.onChange}
                        ref={node => {
                          this.crousel = node;
                        }}
                      >
                        {
                          this.state.backgroundImages.map((item) => {
                            return (
                              <div>
                                <img
                                  src={item.overview}
                                  alt={item.meta}
                                  // max-width="500px"
                                  // max-height="200px"
                                  width="100%"
                                  height="90%"
                                />
                              </div>
                            )
                          })
                        }
                        {/* {
                        this.state.fileList.map((item)=>{
                          // console.log(item.thumbUrl);
                          return (
                            <img
                              src={item.thumbUrl}
                              alt={item.uid}
                              width="100%"
                            />
                          )
                        }) 
                        } */}

                        {/* <div>
                          <img
                            src={this.state.backgroundImages[0].overview}
                            alt={this.state.backgroundImages[0].meta}
                            width="100%"
                          />
                        </div>
                        */}
                      </Carousel>

                      {/* 上传背景 */}
                      <div className="clearfix">
                        <Upload
                          action={UPLOAD_URL}
                          name="file"
                          // action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                          accept=".jpg,.jpeg,.png,.tif,.gif,.svg"
                          listType="picture-card"
                          method="POST"
                          fileList={fileList}
                          onPreview={this.handlePreviewPic}
                          onChange={this.handleChangePic}
                          beforeUpload={this.beforeUpload}
                        >
                          {fileList.length >= 8 ? null : uploadButton}
                        </Upload>
                        <Modal
                          visible={previewVisible}
                          title={previewTitle}
                          footer={null}
                          onCancel={this.handleCancelPic}
                        >
                          <img alt="example" style={{ width: '100%' }} src={previewImage} />
                        </Modal>
                      </div>
                    </Modal>
                  </Panel>

                  {/* <p style={{ color: '#fff', paddingTop: '10%' }}>选择添加项目:</p> */}

                  {/* <Panel
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
                  </Panel> */}

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
  updateDashboardBgImgCb: PropTypes.func,
  typeDashboardBgImgCb: PropTypes.func,
  typeDashboardColorCb: PropTypes.func,
};

DashboardsSearch.defaultProps = {
  slugId: null,
  updateDashboardBgImgCb: a => { },
  typeDashboardBgImgCb: a => { },
  typeDashboardColorCb: a => { },
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
