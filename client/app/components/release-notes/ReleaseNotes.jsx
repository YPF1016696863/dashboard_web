import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import { Badge, Modal, List, Avatar } from 'antd';
import { appSettingsConfig } from '@/config/app-settings';
import { policy } from '@/services/policy';

import './ReleaseNotes.less';

class ReleaseNotes extends React.Component {
  /*
  constructor(props) {
    super(props);
  }
  */
  state = {
    show: true,
    visible: false,
    release: [
      {
        title: '可视化大屏共享URL',
        desc: '暂无详细描述',
        src:'/static/images/task.png'
      },
      {
        title:
          '只保留面板设置页面，新增大屏描述信息介绍，即页面的合并，加一个预览按钮',
          desc: '暂无详细描述',
          src:'/static/images/task.png'
      },
      {
        title: '数据预览与数据集设置合在一个页面',
        desc: '暂无详细描述',
        src:'/static/images/task.png'
      },
      {
        title: '删除组件、删除仪表盘',
        desc: '暂无详细描述',
        src:'/static/images/task.png'
      },
      {
        title: '编辑页面：新建组件，放到该大屏（弹出组件编辑页面即可）',
        desc: '暂无详细描述',
        src:'/static/images/task.png'
      },
      {
        title: '跳转页面方式： 弹窗/页面 ',
        desc: '暂无详细描述',
        src:'/static/images/task.png'
      },
      {
        title: '修改名称（直接表面上修改）',
        desc: '暂无详细描述',
        src:'/static/images/task.png'
      },
      {
        title: '预览组件bug',
        desc: '暂无详细描述',
        src:'/static/images/bug.png'
      },
      {
        title:
          '可视化组件预览与编辑可视化合并，显示来源于那个数据集，显示权限，显示ID',
          desc: '暂无详细描述',
          src:'/static/images/task.png'
      },
      {
        title: '编辑可视化组件页面（编辑时），组件接口分组初步优化',
        desc: '暂无详细描述',
        src:'/static/images/task.png'
      }
    ]
  };

  componentDidMount() {}

  popupReleaseModal = () => {
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
  };

  render() {
    return (
      <div className="bell">
        <a onClick={this.popupReleaseModal}>
          <Badge dot={this.state.show}>
            <i className="fa fa-bell" style={{ color: '#fff' }} />
          </Badge>
        </a>
        <Modal
          title="发行公告/系统消息"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          okText="确认"
          cancelText="取消"
          bodyStyle={{height:'450px'}}
        >
          <p>
            <List
              pagination={{
                pageSize: 3
              }}
              itemLayout="vertical"
              dataSource={this.state.release}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar shape="square" src={item.src} size="small" />
                    }
                    title={item.title}
                    description={item.desc}
                  />
                </List.Item>
              )}
            />
          </p>
        </Modal>
      </div>
    );
  }
}

ReleaseNotes.propTypes = {};
ReleaseNotes.defaultProps = {};

export default function init(ngModule) {
  ngModule.component(
    'releaseNotes',
    react2angular(ReleaseNotes, Object.keys(ReleaseNotes.propTypes), [
      '$rootScope',
      '$scope'
    ])
  );
}

init.init = true;
