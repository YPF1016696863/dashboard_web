import React from 'react';
import {
    message,
    Button,
    Dropdown,
    Menu,
    Icon,
    Divider,
    Row,
    Col,
    Tree,
    Input,
    Modal,
    Alert, Avatar
} from 'antd';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import * as _ from 'lodash';

import LoadingState from '@/components/items-list/components/LoadingState';

import { Query } from '@/services/query';

import './queries-search.css';

import { policy } from '@/services/policy';
import { navigateToWithSearch } from '@/services/navigateTo';
import { CreateNewFolder } from '@/components/create-new-folder/CreateNewFolder';
import { MoveToFolder } from '@/components/move-to-folder/MoveToFolder';
import {DeleteFolder} from "@/components/delete-folder/DeleteFolder";
import {FolderRename} from "@/components/folder-rename/FolderRename";
import {appSettingsConfig} from "@/config/app-settings";
import {$http} from "@/services/ng";
import {IMG_ROOT} from "@/services/data-source";


const FOLDER_STRUCTURE_URL =
    appSettingsConfig.server.backendUrl + '/api/folder_structures';
const { TreeNode, DirectoryTree } = Tree;
const { Search } = Input;

class QueriesListSearch extends React.Component {
  state = {
    editMode: false,
    rename: null,
    selected: null,
    all: null,
    filtered: null,
    loading: true,
    visible: false,
    treelist: null,
    selectedtitle:null
  };

  componentDidMount() {
    if (this.props.queryId !== null) {
      this.setState({
        selected: this.props.queryId
      });
      this.props.querySearchCb([this.props.queryId]);
    }
    localStorage.setItem('lastSelectedDataSourceId', null);
    Query.allQueries().$promise.then(res => {
      this.setState({
        all: res,
        filtered: res,
        loading: false
      },()=>{const temp=this.state.all;});
    });
      if(FOLDER_STRUCTURE_URL){
          $http
              .get(FOLDER_STRUCTURE_URL)
              .success(data => this.setState(
                  {
                      treelist:this.convertToTreeData(
                        data.filter(item => item.catalog === "query"),null)
                  })
              )
      }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.queryId === null) {
      this.reload();
    }
  }

  showModal = () => {
    this.setState({
      visible: true
    });
  };

  hideModal = () => {
    this.setState({
      visible: false
    });
  };

    createFolder = (name, key) =>{
        const parentId = (key===null || key==="datavis-group#ungrouped") ? null:key.substring(1);
        const data={
            "parent_id":parentId,
            "name":name,
            "catalog":"query"
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
        if (selected === null || selected.substr(0,1)==="s" || selected === "datavis-group#ungrouped"){
            alert("请选择一个数据集")
        } else {
            $http
                .post(appSettingsConfig.server.backendUrl+'/api/queries/'+selected+'/folder',data)
                .success(() => {this.reload(); console.log("move done")})
                .error(() => alert("移动失败"))
        }
    }

    deleteFolder = (selected) => {
        if (selected && selected.substr(0,1)==="s"){
            $http
                .delete(appSettingsConfig.server.backendUrl+'/api/folder_structures/'+selected.substring(1))
                .success(() => {this.reload();console.log("delete complete")})
                .error(() => alert("删除失败"))
        } else {
            alert("请选择一个文件夹")
        }
    }

    foldernameUpdate = (data) => {
        if(this.state.selected && this.state.selected.substr(0,1)==="s")
            $http
                .post(appSettingsConfig.server.backendUrl+'/api/folder_structures/'+this.state.selected.substring(1),data)
                .success(()=>{this.reload();console.log('rename complete')})
                .error(() => alert("改名失败"))
    }

  reload(holdTab) {
    let queryid = null;
    if (holdTab) {
      queryid = this.state.selected;
    } else {
      this.props.querySearchCb(null);
    }
    localStorage.setItem('lastSelectedDataSourceId', queryid);

    this.setState({
      selected: queryid,
      all: null,
      filtered: null,
      loading: true
    });
    Query.allQueries().$promise.then(res => {
      this.setState({
        all: res,
        filtered: res,
        loading: false
      });
    });
      if(FOLDER_STRUCTURE_URL){
          $http
              .get(FOLDER_STRUCTURE_URL)
              .success(data => this.setState(
                  {
                      treelist:this.convertToTreeData(
                        data.filter(item => item.catalog === "query"),null)
                  })
              )
      }
  }

  searchBy(value) {
    const allItems = _.cloneDeep(this.state.all);
    this.props.querySearchCb(null);
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
    this.props.querySearchCb(null);
    this.setState({
      filtered: _.reverse(_.orderBy(this.state.filtered, item => item[value]))
    });
  }

  // eslint-disable-next-line class-methods-use-this
  saveQuery(query, customOptions, data) {
    return new Promise((resolve, reject) => {
      let request = data;

      if (request) {
        // Don't save new query with partial data
        if (query.isNew()) {
          return reject();
        }
        request.id = query.id;
        request.version = query.version;
      } else {
        request = _.pick(query, [
          'schedule',
          'query',
          'id',
          'description',
          'name',
          'data_source_id',
          'options',
          'latest_query_data_id',
          'version',
          'is_draft'
        ]);
      }

      const options = Object.assign(
        {},
        {
          successMessage: '数据集信息更新成功',
          errorMessage: '无法保存'
        },
        customOptions
      );

      if (options.force) {
        delete request.version;
      }

      Query.save(
        request,
        updatedQuery => {
          message.success(options.successMessage);
          query.version = updatedQuery.version;
          resolve();
        },
        error => {
          reject(error);
        }
      );
    });
  }

  renderTree = (treelist,idx) => {
        const allItems = _.cloneDeep(this.state.all);
        const folderItem = _.filter(allItems, item3 => item3.folder_id != null)
        return treelist.map(item => {
            if (!item.children){
                return (
                  <TreeNode title={item.title} key={item.key}>
                    {_.map(
                      _.filter(
                        folderItem, item1 => 
                        item1.folder_id.toString() === item.key.substring(1)), 
                        item2 => (
                          <TreeNode
                            icon={(
                              <Icon
                                type="file-search"
                                style={{ color: '#FAAA39' }}
                              />
                                )}
                            title={(
                              <span
                                onDoubleClick={() => {
                                            this.setState({ editMode: true });
                                        }}
                              >
                                {this.state.editMode &&
                              this.state.selected &&
                              _.parseInt(this.state.selected) === item2.id &&
                              !item2.readOnly() ? (
                                <Input
                                  autoFocus
                                  size="small"
                                  value={this.state.rename}
                                  onFocus={() => {
                                          this.setState({ rename: item2.name });
                                      }}
                                  onChange={event => {
                                          this.setState(
                                              {
                                                  rename: event.target.value
                                              },
                                              () => {}
                                          );
                                      }}
                                  onBlur={() => {
                                          this.setState({ editMode: false });
                                          if (this.state.rename === item2.name) {
                                              console.log('NO CHANGE');
                                          } else {
                                              this.setState({ loading: true });
                                              this.saveQuery(item2, undefined, {
                                                  name: this.state.rename
                                              }).then(() => {
                                                  this.reload(true);
                                              });
                                          }
                                      }}
                                  onPressEnter={() => {
                                          this.setState({ editMode: false });
                                          if (this.state.rename === item2.name) {
                                              console.log('NO CHANGE');
                                          } else {
                                              this.setState({ loading: true });
                                              this.saveQuery(item2, undefined, {
                                                  name: this.state.rename
                                              }).then(() => {
                                                  this.reload(true);
                                              });
                                          }
                                      }}
                                />
                              ) : (
                                  item2.name
                              )}
                              </span>
                                )}
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
                      <Icon
                        type="file-search"
                        style={{ color: '#FAAA39' }}
                      />
                            )}
                    title={(
                      <span
                        onDoubleClick={() => {
                                        this.setState({ editMode: true });
                                    }}
                      >
                        {this.state.editMode &&
                              this.state.selected &&
                              _.parseInt(this.state.selected) === item2.id &&
                              !item2.readOnly() ? (
                                <Input
                                  autoFocus
                                  size="small"
                                  value={this.state.rename}
                                  onFocus={() => {
                                          this.setState({ rename: item2.name });
                                      }}
                                  onChange={event => {
                                          this.setState(
                                              {
                                                  rename: event.target.value
                                              },
                                              () => {}
                                          );
                                      }}
                                  onBlur={() => {
                                          this.setState({ editMode: false });
                                          if (this.state.rename === item2.name) {
                                              console.log('NO CHANGE');
                                          } else {
                                              this.setState({ loading: true });
                                              this.saveQuery(item2, undefined, {
                                                  name: this.state.rename
                                              }).then(() => {
                                                  this.reload(true);
                                              });
                                          }
                                      }}
                                  onPressEnter={() => {
                                          this.setState({ editMode: false });
                                          if (this.state.rename === item2.name) {
                                              console.log('NO CHANGE');
                                          } else {
                                              this.setState({ loading: true });
                                              this.saveQuery(item2, undefined, {
                                                  name: this.state.rename
                                              }).then(() => {
                                                  this.reload(true);
                                              });
                                          }
                                      }}
                                />
                              ) : (
                                  item2.name
                              )}
                      </span>
                            )}
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
                      数据列表:
                    </div>
                  </Col>
                  <Col span={11} align="right">
                    <Modal
                      destroyOnClose
                      title="新建数据集"
                      visible={this.state.visible}
                      onOk={this.hideModal}
                      onCancel={this.hideModal}
                      okText="确认"
                      cancelText="取消"
                    >
                      <Alert
                        message="错误"
                        description="无法创建数据集，原因：权限受限"
                        type="warning"
                        showIcon
                      />
                    </Modal>
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
                          <Menu.Item
                            key="2"
                            onClick={() => this.orderBy('created_at')}
                          >
                            <Icon type="clock-circle" />
                            按创建时间排序
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
                  onClick={() => {
                    if (policy.isCreateQueryEnabled()) {
                      navigateToWithSearch('/queries/new',"folder_id="+this.state.selected,true);
                    } else {
                      this.showModal();
                    }
                  }}
                >
                  <Icon type="plus-square" style={{ color: '#13cd66' }} />
                  新建数据集
                </Button>
              </Col>
              <Col span={12}>
                <CreateNewFolder onSuccess={
                  name => { return this.state.selected===null ? 
                  this.createFolder(name, null):
                  this.createFolder(name,this.state.selected);}} 
                />
              </Col>
              <Col span={6}>
                <MoveToFolder 
                  structure={this.state.treelist} 
                  onSuccess={
                  (targetfolder) => this.moveTofolder(this.state.selected,targetfolder)}
                />
              </Col>
              <Col span={8}>
                <DeleteFolder
                  onSuccess={()=>this.deleteFolder(this.state.selected)}
                />
              </Col>
              <Col span={8}>
                <FolderRename
                  defaultName={this.state.selected ? this.state.selectedtitle : null}
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
                  defaultExpandAll
                  onSelect={(value,node) => {
                    const stillEdit = value[0] === this.state.selected;
                    this.setState({ selected: value[0], editMode: stillEdit, selectedtitle: node.node.props.title});
                    this.props.querySearchCb(value);
                  }}
                  selectedKeys={[this.state.selected]}
                >
                  <TreeNode
                    icon={(
                      <Icon
                        type="container"
                        style={{ color: 'darkmagenta' }}
                      />
                        )}
                    title="数据查询总集合(无分组)"
                    key="datavis-group#ungrouped"
                  >
                    {_.map(this.state.filtered, item => {
                      return (
                        <TreeNode
                          icon={(
                            <Icon
                              type="file-search"
                              style={{ color: '#FAAA39' }}
                            />
                          )}
                          title={(
                            <span
                              onDoubleClick={() => {
                                this.setState({ editMode: true });
                              }}
                            >
                              {this.state.editMode &&
                              this.state.selected &&
                              _.parseInt(this.state.selected) === item.id &&
                              !item.readOnly() ? (
                                <Input
                                  autoFocus
                                  size="small"
                                  value={this.state.rename}
                                  onFocus={() => {
                                    this.setState({ rename: item.name });
                                  }}
                                  onChange={event => {
                                    this.setState(
                                      {
                                        rename: event.target.value
                                      },
                                      () => {}
                                    );
                                  }}
                                  onBlur={() => {
                                    this.setState({ editMode: false });
                                    if (this.state.rename === item.name) {
                                      console.log('NO CHANGE');
                                    } else {
                                      this.setState({ loading: true });
                                      this.saveQuery(item, undefined, {
                                        name: this.state.rename
                                      }).then(() => {
                                        this.reload(true);
                                      });
                                    }
                                  }}
                                  onPressEnter={() => {
                                    this.setState({ editMode: false });
                                    if (this.state.rename === item.name) {
                                      console.log('NO CHANGE');
                                    } else {
                                      this.setState({ loading: true });
                                      this.saveQuery(item, undefined, {
                                        name: this.state.rename
                                      }).then(() => {
                                        this.reload(true);
                                      });
                                    }
                                  }}
                                />
                              ) : (
                                item.name
                              )}
                            </span>
                          )}
                          key={item.id}
                          isLeaf
                        />
                      );
                    })}
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

QueriesListSearch.propTypes = {
  querySearchCb: PropTypes.func.isRequired,
  queryId: PropTypes.string
};

QueriesListSearch.defaultProps = {
  queryId: null
};

export default function init(ngModule) {
  ngModule.component(
    'queriesListSearch',
    react2angular(QueriesListSearch, Object.keys(QueriesListSearch.propTypes), [
      'appSettings',
      '$location'
    ])
  );
}

init.init = true;
