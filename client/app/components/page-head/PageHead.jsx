import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import { PageHeader, Breadcrumb, Button, Descriptions, Icon, Divider } from 'antd';
import { appSettingsConfig } from '@/config/app-settings';

class PageHead extends React.Component {
  constructor(props) {
    super(props);
    // const {$rootScope} = props;
    // Get theme flag from rootScope first, if not exist, set to false, which means use light theme.
    this.state = { collapsed: false };
  }

  componentDidMount() {}

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  };

  render() {
    return (
      <>
        <Breadcrumb className="content-layout-Breadcrumb">
          <Breadcrumb.Item>
            <Icon type="home" />
          </Breadcrumb.Item>
        </Breadcrumb>
        <PageHeader
          className="content-layout-header"
          title={<span style={{ fontSize: '18px' }}>首页</span>}
          subTitle={
            <>
              <span style={{ fontSize: '13px' }}>DataVis BI数据可视化系统</span>
            </>
          }
        >
          <Descriptions size="small" column={3}>
            <Descriptions.Item label="">
              欢迎使用中科蜂巢DataVis BI数据可视化系统
            </Descriptions.Item>
          </Descriptions>
        </PageHeader>
        <Divider className="header-divider" />
      </>
    );
  }
}

PageHead.propTypes = {};
PageHead.defaultProps = {};

export default function init(ngModule) {
  ngModule.component(
    'pageHead',
    react2angular(PageHead, Object.keys(PageHead.propTypes), [
      '$rootScope',
      '$scope'
    ])
  );
}

init.init = true;
