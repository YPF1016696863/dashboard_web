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
  Tabs,
  Avatar
} from 'antd';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import * as _ from 'lodash';
import { DataSource, IMG_ROOT } from '@/services/data-source';
import LoadingState from '@/components/items-list/components/LoadingState';

import { currentUser } from '@/services/auth';
import { routesToAngularRoutes } from '@/lib/utils';

import { policy } from '@/services/policy';
import { $http } from '@/services/ng';
import { navigateTo } from '@/services/navigateTo';
import CreateSourceDialog from '@/components/CreateSourceDialog';
import helper from '@/components/dynamic-form/dynamicFormHelper';
import { CreateNewFolder } from '@/components/create-new-folder/CreateNewFolder';
import {MoveToFolder} from "@/components/move-to-folder/MoveToFolder";
import {DeleteFolder} from "@/components/delete-folder/DeleteFolder";
import {FolderRename} from "@/components/folder-rename/FolderRename";
import {appSettingsConfig} from "@/config/app-settings";

const FOLDER_STRUCTURE_URL =
    appSettingsConfig.server.backendUrl + '/api/folder_structures';
const { TreeNode, DirectoryTree } = Tree;
const { Search } = Input;

/* eslint class-methods-use-this: ["error", { "exceptMethods": ["createDataSource"] }] */
class DataSourceSearch extends React.Component {
  state = {
    all: null,
    filtered: null,
    loading: true,
    dataSourceTypes: null,
    runtime: {
      selected: null,
      editing: false
    },
    treelist: null
  /*
     structure:{
       current: null,
       parent: null
     }
  */
  };

  componentDidMount() {
    Promise.all([
      DataSource.query().$promise,
      DataSource.types().$promise
    ]).then(values => {
      this.setState({
        all: values[0],
        filtered: values[0],
        loading: false,
        dataSourceTypes: values[1]
      });
    });
    if(FOLDER_STRUCTURE_URL){
        $http
            .get(FOLDER_STRUCTURE_URL)
            .success(data => this.setState(
                {
                    treelist:this.convertToTreeData(data.filter(item => item.catalog === "datasource"),null)
                })
            )
    }
  }

  showCreateSourceDialog = () => {
    CreateSourceDialog.showModal({
      $translate: this.props.$translate.instant,
      types: this.state.dataSourceTypes,
      sourceType: 'Data Source',
      imageFolder: IMG_ROOT,
      helpTriggerPrefix: 'DS_',
      onCreate: this.createDataSource
    }).result.then((result = {}) => {
      if (result.success) {
        this.reload();
      }
    });
  };

  createFolder = (name, key) =>{
      const parentId = (key===null || key==="root") ? null:key.substring(1);
      const data={
          "parent_id":parentId,
          "name":name,
          "catalog":"datasource"
      };
      $http
          .post(FOLDER_STRUCTURE_URL,data)
          .success(() => {this.reload(); console.log("folder-created")})
          .error(() => alert("创建失败"))
  }

  moveTofolder = (selected, targetfolder) => {
      const data={
          folder_id:targetfolder.substring(1)
      }
      if (selected === null || selected.eventKey.substr(0,1)==="s"){
          alert("请选择一个数据源")
      } else {
          $http
              .post(appSettingsConfig.server.backendUrl+'/api/data_sources/'+selected.eventKey+'/folder',data)
              .success(() => {this.reload(); console.log("move done")})
              .error(() => alert("移动失败"))
      }
}

deleteFolder = (selected) => {
    if (selected && selected.eventKey.substr(0,1)==="s"){
        $http
            .delete(appSettingsConfig.server.backendUrl+'/api/folder_structures/'+selected.eventKey.substring(1))
            .success(() => {this.reload();console.log("delete complete")})
            .error(() => alert("删除失败"))

    } else {
        // eslint-disable-next-line no-alert
        alert("请选择一个文件夹")
    }
}

foldernameUpdate = (data) => {
      if(this.state.runtime.selected && this.state.runtime.selected.eventKey.substr(0,1)==="s")
    $http
        .post(appSettingsConfig.server.backendUrl+'/api/folder_structures/'+this.state.runtime.selected.eventKey.substring(1),data)
        .success(()=>{this.reload();console.log('rename complete')})
        .error(() => alert("改名失败"))
}

  createDataSource= (selectedType, values)=> {
    const target = { options: {},
        type: selectedType.type,
        folder_id: ((this.state.runtime && this.state.runtime.selected &&
        this.state.runtime.selected.eventKey.substr(0,1) === 's') ?
            this.state.runtime.selected.eventKey.substring(1):null)}
    helper.updateTargetWithValues(target, values);
    console.log("createDataSourceinformation",target);
    return DataSource.save(target)
      .$promise.then(dataSource => {
        return dataSource;
      })
      .catch(error => {
        if (!(error instanceof Error)) {
          error = new Error(_.get(error, 'data.message', '保存失败.'));
        }
        return Promise.reject(error);
      });
  }

  reload() {
    // this.props.sourceSearchCb(null);
    this.setState({
      all: null,
      filtered: null,
      loading: true
    });
    Promise.all([DataSource.query().$promise]).then(values => {
      this.setState({
        all: values[0],
        filtered: values[0],
        loading: false
      });
    });
      $http
        .get(FOLDER_STRUCTURE_URL)
        .success(data => this.setState(
            {
                treelist:this.convertToTreeData(data.filter(item => item.catalog === "datasource"),null)
            }
        ));
  }

  searchBy(value) {
    const allItems = _.cloneDeep(this.state.all);
    // this.props.sourceSearchCb(null);
    if (value === '' || value === null) {
      this.setState({
        filtered: allItems
      });
    } else {
      this.setState({
        filtered: _.filter(allItems, item => item.name.includes(value))
      });
    }
  }

  orderBy(value) {
    // this.props.sourceSearchCb(null);
    this.setState({
      filtered: _.orderBy(this.state.filtered, item => item[value])
    });
  }


   renderTree = (treelist,idx) => {
      console.log("treelist",treelist);
      const allItems = _.cloneDeep(this.state.all);
      const folderItem = _.filter(allItems, item3 => item3.folder_id != null)
      return treelist.map(item => {
          if (!item.children){
              return (
                <TreeNode
                  title={item.title}
                  key={item.key}
                >
                  {_.map(_.filter(folderItem, item1 => item1.folder_id.toString() === item.key.substring(1)), item2 => (
                    <TreeNode
                      icon={(
                        <Avatar
                          shape="square"
                          size={30}
                          src={`${IMG_ROOT}/${item2.type}.png`}
                          style={{ paddingRight: '15px' }}
                        />
                            )}
                      title={
                                item2.name +
                                ', [' +
                                (item2.view_only ? '只读权限' : '读写权限') +
                                ']'
                            }
                      key={item2.id}
                      isLeaf
                    />
                    ))}
                </TreeNode>
              )}
          return(
            <TreeNode
              title={item.title}
              key={item.key}
            >
              {_.map(_.filter(folderItem, item1 => item1.folder_id.toString() === item.key.substring(1)), item2 => (
                <TreeNode
                  icon={(
                    <Avatar
                      shape="square"
                      size={30}
                      src={`${IMG_ROOT}/${item2.type}.png`}
                      style={{ paddingRight: '15px' }}
                    />
                )}
                  title={
                    item2.name +
                    ', [' +
                    (item2.view_only ? '只读权限' : '读写权限') +
                    ']'
                }
                  key={item2.id}
                  isLeaf
                />
            ))}
              {this.renderTree(item.children)}
            </TreeNode>
          )
      })
  };


  convertToTreeData(data, pid){
      const result = []
      let temp = []
      for (let i = 0; i < data.length; i+=1) {
          if (data[i].parent_id === pid) {
              const obj = { 'title': data[i].name, 'key': "s"+data[i].id }
              temp = this.convertToTreeData(data, data[i].id)
              if (temp.length > 0) {
                  obj.children = temp
              }
          result.push(obj)
          }
      }
      return result
  }


  render() {
    const { appSettings } = this.props;
    console.log("selected",this.state.runtime.selected ? this.state.runtime.selected: "null")
    console.log("editing",this.state.runtime.editing)
    return (
      <>
        {this.state.loading && <LoadingState />}
        {!this.state.loading && (
          <>
            <Row>
              <Col>
                <Row>
                  <Col span={12}>
                    <div style={{ fontWeight: 'bold', paddingBottom: '10px' }}>
                      数据源列表:
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col span={18}>
                    <Search
                      placeholder="搜索查询..."
                      size="small"
                      onChange={e => {
                        this.searchBy(e.target.value);
                      }}
                    />
                  </Col>
                  <Col span={2} offset={1}>
                    <Dropdown
                      overlay={(
                        <Menu>
                          <Menu.Item
                            key="1"
                            onClick={() => this.orderBy('name')}
                          >
                            <Icon type="sort-ascending" />
                            按名称排序
                          </Menu.Item>
                        </Menu>
                      )}
                    >
                      <Button icon="menu-fold" size="small" />
                    </Dropdown>
                  </Col>
                  <Col span={2}>
                    <Button
                      icon="reload"
                      size="small"
                      onClick={() => {
                        this.reload();
                      }}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <Button
                  size="small"
                  type="link"
                  style={{ color: '#3d4d66' }}
                  onClick={
                    policy.isCreateDataSourceEnabled()
                      ? this.showCreateSourceDialog
                      : null
                  }
                  disabled={!policy.isCreateDataSourceEnabled()}
                >
                  <Icon type="plus-square" style={{ color: '#13cd66' }} />
                  新建数据源
                </Button>
              </Col>
              <Col span={12}>
                <CreateNewFolder 
                  onSuccess={(name) => {
                  return this.state.runtime.selected===null ? 
                  this.createFolder(name, null):
                  this.createFolder(name,this.state.runtime.selected.eventKey);}} 
                />
              </Col>
              <Col span={6}>
                <MoveToFolder 
                  structure={this.state.treelist} 
                  onSuccess={(targetfolder) =>
                  this.moveTofolder(this.state.runtime.selected,targetfolder)} 
                />
              </Col>
              <Col span={8}>
                <DeleteFolder
                  onSuccess={()=>this.deleteFolder(this.state.runtime.selected)}
                />
              </Col>
              <Col span={8}>
                <FolderRename
                  defaultName={this.state.runtime.selected ? this.state.runtime.selected.title : null}
                  onSuccess={(name)=>{this.foldernameUpdate({"name":name})}}
                />
              </Col>
              <Col span={24}>
                <Divider style={{ marginTop: '5px', marginBottom: '0' }} />
              </Col>
            </Row>
            <Row>
              <Col style={{ paddingRight: '10px' }}>
                <DirectoryTree
                  onSelect={(value, node, extra) => {
                    localStorage.setItem(
                      'lastSelectedDataSourceId',
                      value && value.length ? value[0] : null
                    );
                    this.setState({
                      runtime: {
                        selected: node.node.props,
                        editing:
                          value[0] ===
                          _.get(this.state.runtime, 'selected.eventKey', null)
                      }
                    });

                    this.props.sourceSearchCb(value);
                  }}
                >
                  <TreeNode
                    title="数据源（无分组）"
                    key="root"
                  >
                    {_.map(this.state.filtered, item => (
                      <TreeNode
                        icon={(
                          <Avatar
                            shape="square"
                            size={30}
                            src={`${IMG_ROOT}/${item.type}.png`}
                            style={{ paddingRight: '15px' }}
                          />
                        )}
                        title={
                          item.name +
                          ', [' +
                          (item.view_only ? '只读权限' : '读写权限') +
                          ']'
                        }
                        key={item.id}
                        isLeaf
                      />
                    ))}
                  </TreeNode>
                  {this.state.treelist? this.renderTree(this.state.treelist):<></>}
                </DirectoryTree>
              </Col>
            </Row>
          </>
        )}
      </>
    );
  }
}

DataSourceSearch.propTypes = {
  sourceSearchCb: PropTypes.func.isRequired
};

DataSourceSearch.defaultProps = {};

export default function init(ngModule) {
  ngModule.component(
    'sourceListSearch',
    react2angular(DataSourceSearch, Object.keys(DataSourceSearch.propTypes), [
      'appSettings',
      '$translate'
    ])
  );
}

init.init = true;