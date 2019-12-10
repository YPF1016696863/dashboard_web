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
  Avatar,
  Alert,
  Empty,
  BackTop,
  Tabs
} from 'antd';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import * as _ from 'lodash';
import Modal from 'antd/lib/modal';

import { Paginator } from '@/components/Paginator';
import { QueryTagsControl } from '@/components/tags-control/TagsControl';
import { SchedulePhrase } from '@/components/queries/SchedulePhrase';
import Layout from '@/components/layouts/ContentWithSidebar';

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
import { DataSource, IMG_ROOT } from '@/services/data-source';
import { $route } from '@/services/ng';

import helper from '@/components/dynamic-form/dynamicFormHelper';
import {
  HelpTrigger,
  TYPES as HELP_TRIGGER_TYPES
} from '@/components/HelpTrigger';
import DynamicForm from '@/components/dynamic-form/DynamicForm';

import notification from '@/services/notification';
import navigateTo from '@/services/navigateTo';

const { TreeNode, DirectoryTree } = Tree;
const { SubMenu } = Menu;
const { TabPane } = Tabs;

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["normalizedTableData"] }] */
class DataSourceTabs extends React.Component {
  state = { dataSource: null, type: null, isLoaded: true };

  componentDidMount() {
    this.setState({
      dataSource: null,
      type: null,
      isLoaded: true
    });
  }

  componentDidUpdate(prevProps) {
    if (
      !_.isEqual(this.props.sourceId, prevProps.sourceId) &&
      this.props.sourceId > 0
    ) {
      this.getDataSource(this.props.sourceId);
    }

    if (
      !_.isEqual(this.props.sourceId, prevProps.sourceId) &&
      this.props.sourceId == null
    ) {
      // eslint-disable-next-line
      this.setState({
        dataSource: null
      });
    }
  }

  getDataSource(id) {
    this.setState({
      isLoaded: false,
      dataSource: null
    });
    DataSource.get({ id: this.props.sourceId })
      .$promise.then(dataSource => {
        const { type } = dataSource;
        this.setState({ dataSource });
        DataSource.types(types => {
          this.setState({ type: _.find(types, { type }), isLoaded: true });
        });
      })
      .catch(error => {
        this.setState({
          isLoaded: true,
          dataSource: 'empty'
        });
      });
  }

  saveDataSource = (values, successCallback, errorCallback) => {
    const { dataSource } = this.state;
    helper.updateTargetWithValues(dataSource, values);
    dataSource.$save(
      () => successCallback('保存成功.'),
      error => {
        const message = _.get(error, 'data.message', '保存失败');
        errorCallback(message);
      }
    );
  };

  deleteDataSource = callback => {
    const { dataSource } = this.state;

    const doDelete = () => {
      dataSource.$delete(
        () => {
          notification.success('数据源已成功删除.');
          this.setState({
            isLoaded: false
          });
          this.props.$window.location.reload();
        },
        () => {
          callback();
        }
      );
    };

    Modal.confirm({
      title: '删除数据源',
      content: '您确定要删除此数据源吗？',
      okText: '删除',
      okType: 'danger',
      onOk: doDelete,
      cancelText: '取消',
      maskClosable: true,
      autoFocusButton: null
    });
  };

  testConnection = callback => {
    const { dataSource } = this.state;
    DataSource.test(
      { id: dataSource.id },
      httpResponse => {
        if (httpResponse.ok) {
          notification.success('成功');
        } else {
          notification.error('连接测试失败：', httpResponse.message, {
            duration: 10
          });
        }
        callback();
      },
      () => {
        notification.error(
          '连接测试失败：',
          '执行连接测试时发生未知错误。 请稍后再试。',
          { duration: 10 }
        );
        callback();
      }
    );
  };

  renderForm() {
    const { dataSource, type } = this.state;
    const fields = helper.getFields(type, dataSource);
    const formProps = {
      fields,
      type,
      onSubmit: this.saveDataSource,
      feedbackIcons: true
    };
    return (
      <>
        <Row>
          <Col span={4}>
            <Row>
              <Avatar
                shape="square"
                size={100}
                src={`${IMG_ROOT}/${type.type}.png`}
              />
            </Row>
            <Row>
              <Col span={12}>
                {' '}
                <Button type="primary" onClick={this.testConnection}>
                  <Icon type="link" />
                  连接测试
                </Button>
              </Col>
              <Col span={12}>
                {' '}
                <Button type="primary" href="/queries/new" target="_blank">
                  <Icon type="filter" />
                  新建数据集
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
        <Divider className="p-l-10 p-r-10">数据源设置</Divider>
        <div>
          <div className="col-md-8 col-md-offset-2 m-t-10 m-b-10">
            <DynamicForm {...formProps} />
          </div>
        </div>
      </>
    );
  }

  render() {
    return (
      <>
        {!this.state.isLoaded && <LoadingState />}
        {this.state.isLoaded && this.state.dataSource == null && (
          <Empty
            description="请从左侧点击选择数据源"
            style={{ paddingTop: '10%' }}
          />
        )}
        {this.state.isLoaded &&
          this.state.dataSource != null &&
          this.state.dataSource !== 'empty' && (
            <>
              {this.renderForm()}
              <div className="col-md-8 col-md-offset-2 m-t-10 m-b-10">
                <Button type="danger" onClick={this.deleteDataSource} block>
                  <Icon type="delete" />
                  删除
                </Button>
              </div>
            </>
          )}
      </>
    );
  }
}

DataSourceTabs.propTypes = {
  sourceId: PropTypes.string
};

DataSourceTabs.defaultProps = {
  sourceId: null
};

export default function init(ngModule) {
  ngModule.component(
    'sourceTabs',
    react2angular(DataSourceTabs, Object.keys(DataSourceTabs.propTypes), [
      '$scope',
      'appSettings',
      '$window'
    ])
  );
}

init.init = true;
