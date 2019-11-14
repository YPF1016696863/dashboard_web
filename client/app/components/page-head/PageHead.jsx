import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import { PageHeader, Button, Descriptions } from 'antd';
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
      <div>
        <PageHeader
          ghost="true"
          title="首页"
          subTitle="数据可视化平台"
          extra={[]}
        />
      </div>
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
