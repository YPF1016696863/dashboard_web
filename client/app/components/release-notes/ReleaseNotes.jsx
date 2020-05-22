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
