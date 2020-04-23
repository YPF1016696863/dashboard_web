/* eslint-disable func-names */
import React from 'react';
import {
  PageHeader,
  Button,
  Descriptions,
  Breadcrumb,
  Dropdown,
  Menu,
  Icon,
  Modal,
  Row,
  Col,
  Tree,
  Input,
  Alert,
  Empty,
  message,
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
import { navigateTo } from '@/services/navigateTo';
import LoadingState from '@/components/items-list/components/LoadingState';
import * as Sidebar from '@/components/items-list/components/Sidebar';
import ItemsTable, {
  Columns
} from '@/components/items-list/components/ItemsTable';

import { Query } from '@/services/query';
import { currentUser } from '@/services/auth';
import { routesToAngularRoutes } from '@/lib/utils';

import { policy } from '@/services/policy';
import Global from '@/visualizations/Global';

const { TreeNode, DirectoryTree } = Tree;
const { Search } = Input;

class ZhiDuanList extends React.Component {
// 选择数据集页面跳转调整
// 每个组件加一个global参数写入
  state = {
    treeData: [
      {
        title: '字段',
        key: '0-0',
        children: [
          {
            title: 'null',
            key: '0-0-0',
          }, 
        ],
      }
    ],
  };

  // onSelect = (selectedKeys, info) => {
  //   console.log('selected', selectedKeys, info);
  //   console.log(Global.res);
  // };

  // onCheck = (checkedKeys, info) => {
  //   console.log('onCheck', checkedKeys, info);

  //   console.log(Global.res);
  // };


  onDrop = info => {
    console.log(info.dragNodesKeys);
  }

  onDragStart = info => {
    console.log(info.dragNodesKeys);
  }

  onDragEnter = info => {
    console.log(info); 
  };

  onExpand = (expandedKeys) => {
    // console.log('onExpand-->', expandedKeys);
    const dataChil = [];
    const dataHead = {
      title: '字段',
      key: '0-0',
      children:[]
    };
    // console.log(Global.res);
    _.forEach(Global.res, function (value, key) {
      if (key === "columns") {
        _.forEach(value, function (chilValue, chilKey) {
          dataChil.push({
            title: chilValue.name,
            key: chilValue.name,
          });
        });
        return false;
      }
    });
    dataHead.children=dataChil;
    this.setState({
      treeData: [dataHead]
    });
    // console.log(this.state.treeData);
  }

  render() {

    return (
      <Tree
        // showLine
        // eslint-disable-next-line react/jsx-boolean-value
        draggable={true}
        autoExpandParent={false}
        defaultExpandAll={false}
        onDrop={this.onDrop}
        onDragStart={this.onDragStart}
        onDragEnter={this.onDragEnter}
        onExpand={this.onExpand}
        loadData={this.onLoadData}
        treeData={this.state.treeData}
      /> 

    );
  }
}



ZhiDuanList.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  queryResultCb: PropTypes.func
};
// query-result="$ctrl.queryResult"
ZhiDuanList.defaultProps = {
  queryResultCb: a => { }
};

export default function init(ngModule) {
  ngModule.component(
    'zhiDuanList',
    react2angular(ZhiDuanList, Object.keys(ZhiDuanList.propTypes), [
      'appSettings',
      '$location'
    ])
  );
}

init.init = true;
