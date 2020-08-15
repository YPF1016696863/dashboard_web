/* eslint-disable func-names */
import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import * as _ from 'lodash';
import {
  Form,
  Select,
  TreeNode,
  Checkbox,
  Input,
  Tree,
  Button,
  Layout,
  Drawer,
  Modal
} from 'antd';
import { Query } from '@/services/query';
// import { appSettingsConfig } from '@/config/app-settings';
import './index.less';

const treeData = [
  {
    title: '字段',
    key: '0-0',
    children: []
  }
];

class ZhiDuanList extends React.Component {
  state = {
    treeDataState: []
  };

  componentDidMount() {
    const queryId = this.props.queryId;
    const queryResTreeData = [];
    Query.query({ id: queryId })
      .$promise.then(query => {
        query
          .getQueryResultPromise()
          .then(queryRes => {
            const arr = _.map(queryRes.query_result.data.columns, 'friendly_name');
            for (let i = 0; i < arr.length; i += 1) {
              queryResTreeData.push(
                {
                  title: arr[i],
                  key: arr[i]
                }
              );
            }
            treeData[0].children = queryResTreeData;
            this.setState({
              treeDataState: treeData
            });
          })
          .catch(err => {
            query
              .getQueryResultByText(-1, query.query)
              .toPromise()
              .then(queryRes => {
                const arr = _.map(queryRes.query_result.data.columns, 'friendly_name');
                for (let i = 0; i < arr.length; i += 1) {
                  queryResTreeData.push(
                    {
                      title: arr[i],
                      key: arr[i]
                    }
                  );
                }
                treeData[0].children = queryResTreeData;
                this.setState({
                  treeDataState: treeData
                });
              })
              .catch(ex => {
                console.log(ex);
                this.setState({
                  treeDataState:treeData
                });
              });
          });
      })
      .catch(err => {
        this.setState({
          treeDataState:treeData
        });
      });
  }

  render() {

    return (
      <Tree
        checkable={false}
        // eslint-disable-next-line react/jsx-boolean-value
        defaultExpandParent={true}
        treeData={this.state.treeDataState}
      />
    );
  }
}

ZhiDuanList.propTypes = {
  queryId: PropTypes.any,
};
ZhiDuanList.defaultProps = {
  queryId: null,
};

export default function init(ngModule) {
  ngModule.component(
    'zhiDuanList',
    react2angular(
      Form.create()(ZhiDuanList),
      Object.keys(ZhiDuanList.propTypes),
      ['$rootScope', '$scope']
    )
  );
}

init.init = true;
