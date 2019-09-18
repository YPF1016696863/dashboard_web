import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import { Switch, Icon, Modal, Form, Row, Col, List, Card, Button, Badge } from 'antd';
import _ from 'lodash';


class DashboardBackgroundSwitch extends React.Component {

  constructor(props) {
    super(props);
    const { $rootScope } = props;
    // Get theme flag from rootScope first, if not exist, set to false, which means use light theme.
    this.state = { 
      visible: false,
      backgroundImages:[
        {
          meta: 'DataVis背景1，建议主题：暗色系主题',
          image: '/static/images/themeBackgroundImages/theme1.png',
          name: "theme1Bg",
          selected: false
        },
        {
          meta: 'DataVis背景2，建议主题：暗色系主题',
          image: '/static/images/themeBackgroundImages/theme2.png',
          name: "theme2Bg",
          selected: false
        },
        {
          meta: 'DataVis背景3，建议主题：浅色系主题',
          image: '/static/images/themeBackgroundImages/theme3.png',
          name: "theme3Bg",
          selected: false
        },
        {
          meta: '用户自定义背景图片, 上传并使用',
          image: '/static/images/themeBackgroundImages/addNewBg.png',
          name: "addNewBg",
          selected: false
        }
      ]
      /* , currentTheme : $rootScope.theme.theme */ 
    
    };// false: light theme, true: dark theme.
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = e => {
    const { $rootScope } = this.props;

    const selectedBackground = _.findLast(this.state.backgroundImages,(item)=>{
      return item.selected;
    });

    if ($rootScope && selectedBackground) {
      _.set($rootScope,"theme.bodyBackgroundImage","dashboard-dark-theme-"+selectedBackground.name);
      _.set($rootScope,"theme.widgetBackgroundColor","widget-dark-theme-bg2");
      _.set($rootScope,"theme.dashboardHeaderBackgroundColor","widget-dark-theme-bg2");
      $rootScope.$applyAsync();
    }

    this.setState({
      visible: false,
    });
  };

  handleCancel = e => {
    this.setState({
      visible: false,
    });
  };

  onSwitchBackground = (item) => {
    this.setState(state => {
      const backgroundImages = state.backgroundImages.map(backgroundImage => {
        if(backgroundImage.name === item.name && item.name !== "addNewBg.png") {
          backgroundImage.selected = !backgroundImage.selected;
        }else {
          backgroundImage.selected = false;
        }
        return backgroundImage;
      });
      return {
        backgroundImages,
      };
    });
  };

  render() {
    const { $translate, $rootScope } = this.props;
    return (
      <>
        <button
          type="button"
          className="btn btn-sm hidden-xs btn-default"
          tooltip="为数据可视化面板选择背景图片"
          onClick={this.showModal}
        >
          <span className="zmdi zmdi-image" />
        </button>
        <Modal
          title={
            <React.Fragment>
              背景图片
              <div className="modal-header-desc">
                为数据可视化面板选择背景图片
              </div>
            </React.Fragment>
          }
          visible={this.state.visible}
          onCancel={this.handleCancel}
          onOk={this.handleOk}
          okText="确认"
          cancelText="取消"
          width={850}
        >

          <Row type="flex" justify="center" align="middle">
            <Col span={24}>
              <List
                grid={{ gutter: 16, column: 4 }}
                dataSource={this.state.backgroundImages}
                renderItem={item => (
                  <List.Item>
                    <Card
                      hoverable
                      style={{ width: 200 }}
                      cover={<img alt="bg" src={item.image} />}
                      className={item.selected?"selected-background-card":""}
                      onClick={()=>this.onSwitchBackground(item)}
                    >
                      <Card.Meta description={item.meta} />
                    </Card>
                  </List.Item>
                )}
              />
            </Col>
          </Row>
        </Modal>
      </>
    );
  }
}

DashboardBackgroundSwitch.propTypes = {
};

DashboardBackgroundSwitch.defaultProps = {
};

export default function init(ngModule) {
  ngModule.component('dashboardBackgroundSwitch', react2angular(DashboardBackgroundSwitch,
    Object.keys(DashboardBackgroundSwitch.propTypes),
    ['$translate', '$rootScope', '$scope']));
}

init.init = true;
