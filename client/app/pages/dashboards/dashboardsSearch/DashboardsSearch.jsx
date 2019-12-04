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
  Empty,
  BackTop,
  Tabs
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

const { TreeNode, DirectoryTree } = Tree;
const { Search } = Input;

class DashboardsSearch extends React.Component {
  state = {
    loading: true
  };

  componentDidMount() {
    Dashboard.allDashboards().$promise.then(res => {
      this.setState({
        loading: false
      });
    });
  }

  render() {
    const { appSettings,dashboardSearchCb } = this.props;
console.log(dashboardSearchCb);
    return (
      <>
        {this.state.loading && <LoadingState />}
        {!this.state.loading && (
          <>
            <Row>
              <Col>
                <p style={{color:'#fff'}}>正在开发</p>
              </Col>
            </Row>
          </>
        )}
      </>
    );
  }
}

DashboardsSearch.propTypes = {
  dashboardSearchCb: PropTypes.func.isRequired
};

DashboardsSearch.defaultProps = {};

export default function init(ngModule) {
  ngModule.component(
    'dashboardsSearch',
    react2angular(
        DashboardsSearch,
      Object.keys(DashboardsSearch.propTypes),
      ['appSettings']
    )
  );
}

init.init = true;
