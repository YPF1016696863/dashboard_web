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

import LoadingState from '@/components/items-list/components/LoadingState';
import * as Sidebar from '@/components/items-list/components/Sidebar';
import ItemsTable, {
  Columns
} from '@/components/items-list/components/ItemsTable';

import { Query } from '@/services/query';
import { currentUser } from '@/services/auth';
import { routesToAngularRoutes } from '@/lib/utils';

import './charts-search.css';

import { policy } from '@/services/policy';
import notification from '@/services/notification';
import { navigateToWithSearch } from '@/services/navigateTo';
import {CreateNewFolder} from "@/components/create-new-folder/CreateNewFolder";
import {MoveToFolder} from "@/components/move-to-folder/MoveToFolder";
import {DeleteFolder} from "@/components/delete-folder/DeleteFolder";
import {FolderRename} from "@/components/folder-rename/FolderRename";
import {appSettingsConfig} from "@/config/app-settings";
import {$http} from "@/services/ng";

const FOLDER_STRUCTURE_URL =
    appSettingsConfig.server.backendUrl + '/api/folder_structures';
const { TreeNode, DirectoryTree } = Tree;
const { Search } = Input;

class ChartsListSearch extends React.Component {
  state = {
    visualization: null,
    editMode: false,
    rename: null,
    selected: null,
    all: null,
    filtered: null,
    loading: true,
    treelist: null,
    selectedtitle:null
  };

  componentDidMount() {
    Query.allQueries().$promise.then(res => {
      const selectedVis = _.find(res, query =>
        _.find(
          query.visualizations,
          visualization => visualization.id === _.parseInt(this.props.displayId)
        )
      );

      this.setState({
        selected:
          this.props.displayId && selectedVis
            ? selectedVis.id + ':' + this.props.displayId
            : null,
        all: res,
        filtered: res,
        loading: false
      });

      if (this.state.selected) {
        this.props.querySearchCb('V', this.state.selected);
      }
    });
      if(FOLDER_STRUCTURE_URL){
          $http
              .get(FOLDER_STRUCTURE_URL)
              .success(data => this.setState(
                  {
                      treelist:this.convertToTreeData(data.filter(item => item.catalog === "chart"),null)
                  })
              )
      }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.displayId === null) {
      this.reload();
    }
  }

  createFolder = (name, key) =>{
        const parentId = (key===null || key==="datavis-group#ungrouped") ? null:key.substring(1);
        const data={
            "parent_id":parentId,
            "name":name,
            "catalog":"chart"
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
            alert("请选择一个可视化组件")
        } else {
            const selectedvid = selected.split(":")[1]
            $http
                .post(appSettingsConfig.server.backendUrl+'/api/visualizations/'+selectedvid+'/folder',data)
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
                .error(() => alert("改名失败"));
    }

    copyVisualization = () => {
      if(
          this.state.selected === null ||
          this.state.visualization === null ||
          this.state.selected === "datavis-group#ungrouped" ||
          this.state.selected.substr(0,1) === "s")
        {
            alert("请选择一个可视化组件")
        } else {
          const data = this.state.visualization;
          data.name+="(copy)";
          delete data.id;
          delete data.created_at;
          delete data.updated_at;
          const postdata = _.extend({},data,{query_id:_.split(this.state.selected,":")[0]});
          $http
            .post(this.props.appSettings.server.backendUrl + '/api/visualizations', postdata)
            .success(() => this.reload())
            .error(()=> alert("复制失败"));
        }
    }


  reload(holdTab) {
    let type = null;
    let selected = null;
    let visualization = null;
    if (holdTab) {
      type = 'V';
      selected = this.state.selected;
      visualization = this.state.visualization;
    }

    this.props.querySearchCb(type, selected);

    this.setState({
      selected,
      visualization,
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
                      treelist:this.convertToTreeData(data.filter(item => item.catalog === "chart"),null)
                  })
              )
      }
  }

  searchBy(value) {
    const allItems = _.cloneDeep(this.state.all);
    this.props.querySearchCb(null, null);
    if (value === '' || value === null) {
      this.setState({
        filtered: allItems
      });
    } else {
      this.setState({
        filtered: _.filter(allItems, item => {
          if (!item.visualizations || item.visualizations.length < 1) {
            return false;
          }
          item.visualizations = _.filter(item.visualizations, visualization =>
            visualization.name.includes(value)
          );
          return (
            _.filter(item.visualizations, visualization =>
              visualization.name.includes(value)
            ).length > 0
          );
        })
      });
    }
  }

  orderBy(value) {
    this.props.querySearchCb(null, null);
    this.setState({
      filtered: _.reverse(_.orderBy(this.state.filtered, item => item[value]))
    });
  }

  findVisualization(id) {
    const queryId = _.split(id, ':')[0];
    const visualizationId = _.split(id, ':')[1];
    const { all } = this.state;

    return _.find(
      _.get(
        _.find(all, query => query.id === _.parseInt(queryId)),
        'visualizations',
        []
      ),
      visualization => visualization.id === _.parseInt(visualizationId)
    );
  }

  visualizationRender() {
    const { filtered } = this.state;
    const tempNodes = [];
    _.map(filtered, query =>
      _.map(query.visualizations, visualization => {
        if (!visualization.name.includes('Table')) {
          tempNodes.push(
            <TreeNode
              icon={<Icon type="pie-chart" style={{ color: '#428bca' }} />}
              title={(
                <span
                  onDoubleClick={event => {
                    this.setState({ editMode: true });
                  }}
                  onContextMenu={(e)=>{
                    e.preventDefault();
                    console.log(query.id + ':' + visualization.id);

                  }}
                >
                  {this.state.editMode &&
                  this.state.selected &&
                  _.isEqual(
                    this.state.selected,
                    query.id + ':' + visualization.id
                  ) ? (
                    <Input
                      autoFocus
                      size="small"
                      value={this.state.rename}
                      onFocus={event => {
                        this.setState({
                          rename: visualization.name
                        });
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
                        if (this.state.rename === visualization.name) {
                          console.log('NO CHANGE');
                        } else {
                          this.setState({ loading: true });
                          this.updateVisualization({ name: this.state.rename });
                        }
                      }}
                      onPressEnter={() => {
                        this.setState({ editMode: false });
                        if (this.state.rename === visualization.name) {
                          console.log('NO CHANGE');
                        } else {
                          this.setState({ loading: true });
                          this.updateVisualization({ name: this.state.rename });
                        }
                      }}
                    />
                  ) : (
                    visualization.name+"[id: "+visualization.id+"]"
                  )}
                </span>
              )}
              key={query.id + ':' + visualization.id}
              isLeaf
            />
          );
        }
      })
    );

    return tempNodes;
  }

  foldervisualizationRender(item) {
        const { filtered } = this.state;
        const tempNodes = [];
        _.map(filtered, query =>
            _.map(query.visualizations,visualization => {
                 if (visualization.folder_id && !visualization.name.includes('Table') && visualization.folder_id.toString() === item.key.substring(1)) {
                    tempNodes.push(
                      <TreeNode
                        icon={<Icon type="pie-chart" style={{ color: '#428bca' }} />}
                        title={(
                          <span
                            onDoubleClick={event => {
                                        this.setState({ editMode: true });
                                    }}
                          >
                            {this.state.editMode &&
                  this.state.selected &&
                  _.isEqual(
                      this.state.selected,
                      query.id + ':' + visualization.id
                  ) ? (
                    <Input
                      autoFocus
                      size="small"
                      value={this.state.rename}
                      onFocus={event => {
                              this.setState({
                                  rename: visualization.name
                              });
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
                              if (this.state.rename === visualization.name) {
                                  console.log('NO CHANGE');
                              } else {
                                  this.setState({ loading: true });
                                  this.updateVisualization({ name: this.state.rename });
                              }
                          }}
                      onPressEnter={() => {
                              this.setState({ editMode: false });
                              if (this.state.rename === visualization.name) {
                                  console.log('NO CHANGE');
                              } else {
                                  this.setState({ loading: true });
                                  this.updateVisualization({ name: this.state.rename });
                              }
                          }}
                    />
                  ) : (
                      visualization.name
                  )}
                          </span>
                            )}
                        key={query.id + ':' + visualization.id}
                        isLeaf
                      />
                    );
                }
            })
        );

        return tempNodes;
    }

  updateVisualization(data) {
    this.props.Visualization.save(
      _.extend(this.state.visualization, data),
      result => {
        notification.success('保存成功');
        this.setState({
          loading: false
        });
      },
      () => {
        notification.error('无法保存');
        this.setState({
          loading: false
        });
      }
    );
  }

  renderTree = (treelist,idx) => {
        return treelist.map(item => {
            if (!item.children){
                return (
                  <TreeNode title={item.title} key={item.key}>
                    {this.foldervisualizationRender(item)}
                  </TreeNode>
                )}
            return(
              <TreeNode title={item.title} key={item.key}>
                {this.foldervisualizationRender(item)}
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
                      可视化组件列表:
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col span={18}>
                    <Search
                      placeholder="搜索可视化组件..."
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
            {this.props.simpleMode ? null : (
              <Row>
                <Col span={7}>
                  <Button
                    size="small"
                    type="link"
                    style={{ color: '#3d4d66' }}
                    onClick={e => {
                      navigateToWithSearch('/query/unset/charts/new','folder_id='+this.state.selected,true);
                    }}
                  >
                    <Icon type="plus-square" style={{ color: '#13cd66' }} />
                    新建组件
                  </Button>
                </Col>
                <Col span={7}>
                  <Button
                    size="small"
                    type="link"
                    style={{ color: '#3d4d66' }}
                    onClick={() => this.copyVisualization()}
                  >
                    <Icon type="copy" style={{ color: '#13cd66' }} />
                    复制组件
                  </Button>
                </Col>
                <Col span={7}>
                  <CreateNewFolder 
                    onSuccess={name => { 
                    return this.state.selected===null ? 
                    this.createFolder(name, null):
                    this.createFolder(name,this.state.selected);}}
                  />
                </Col>
                <Col span={6}>
                  <MoveToFolder 
                    structure={this.state.treelist} 
                    onSuccess={(targetfolder) => 
                  this.moveTofolder(this.state.selected,targetfolder)} 
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
            )}
            <Row>
              <Col style={{ paddingRight: '10px' }}>
                <DirectoryTree
                  defaultExpandedKeys={['datavis-group#ungrouped']}
                  onSelect={(value, node, extra) => {
                    const stillEdit = value[0] === this.state.selected;
                    this.setState({
                      selected: value[0],
                      editMode: stillEdit,
                      visualization: this.findVisualization(value[0]),
                      selectedtitle: node.node.props.title
                    });
                    this.props.querySearchCb(
                      node.node.isLeaf() ? 'V' : 'Q',
                      value[0]
                    );
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
                    title="可视化组件总集合(无分组)"
                    key="datavis-group#ungrouped"
                  >
                    {this.visualizationRender()}
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

ChartsListSearch.propTypes = {
  displayId: PropTypes.string,
  querySearchCb: PropTypes.func,
  simpleMode: PropTypes.bool
};

ChartsListSearch.defaultProps = {
  displayId: null,
  querySearchCb: (a, b) => {},
  simpleMode: false
};

export default function init(ngModule) {
  ngModule.component(
    'chartsListSearch',
    react2angular(ChartsListSearch, Object.keys(ChartsListSearch.propTypes), [
      'appSettings',
      'Visualization'
    ])
  );
}

init.init = true;
