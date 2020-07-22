/* eslint-disable func-names */
import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import * as _ from 'lodash';
import {
  Form,
  Select,
  Checkbox,
  Input,
  Switch,
  Tree,
  Button,
  Layout,
  Drawer,
  Modal,
  Icon,
} from 'antd';
// import { appSettingsConfig } from '@/config/app-settings';
import './index.less';
import { Dashboard } from '@/services/dashboard';

const { TreeNode, DirectoryTree } = Tree;

class ListUsedWidgets extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      dashboard:null,
      isLoaded:true
    };

    let id = window.location.pathname;
    id = id.split("/")[2];
    // console.log(id);

    Dashboard.get(
      { slug: id },
      dashboard => {

        // console.log(dashboard);

        this.setState({
          dashboard,
          isLoaded:false
        });

      },
      rejection => {
        console.log("rejection");
        this.setState({
          dashboard: null,
          isLoaded:true
        });
      }
    );


  }

  // componentDidMount() {
    
  // }

  // getDashboard = slugId => {
  // };


  render() {
    const { dashboard,isLoaded } = this.state;
    console.log(dashboard);
    return (
      // !isLoaded && dashboard != null&&(<div>123</div>)
      !isLoaded && dashboard != null&&(
      <DirectoryTree className="TreeInDarkMode">
        <TreeNode
          title={dashboard.name}
          key={dashboard.name}
          selectable={false}
        >
          {_.map(dashboard.widgets, item => (
            // <TreeNode
            //   icon={(
            //     <Icon
            //       type="file-search"
            //       style={{ color: '#FAAA39' }}
            //     />
            //     )}
            //   title={'Widget:' + item.id}
            //   key={item.id}
            //   isLeaf={false}
            // >
            <TreeNode
              icon={(
                <Icon
                  type="pie-chart"
                  style={{ color: '#428bca' }}
                />
                )}
              title={
                      item.visualization.name +
                      ', id: [' +
                      item.visualization.id +
                      ']'
                }
              key={item.id + ':' + item.visualization.id}
              isLeaf
            />
            // </TreeNode>
          ))}
        </TreeNode>
      </DirectoryTree>
          )
        )
        
  }
}

ListUsedWidgets.propTypes = {
  
};
ListUsedWidgets.defaultProps = {
  
};

export default function init(ngModule) {
  ngModule.component(
    'listUsedWidgets',
    react2angular(
      Form.create()(ListUsedWidgets),
      Object.keys(ListUsedWidgets.propTypes),
      ['$rootScope', '$scope']
    )
  );
}

init.init = true;
