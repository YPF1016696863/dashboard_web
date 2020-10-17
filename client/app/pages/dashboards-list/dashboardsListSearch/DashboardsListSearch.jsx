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
  Modal,
  Form,
  message, Avatar
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

import './dashboards-search.css';

import { policy } from '@/services/policy';
import { CreateNewFolder } from '@/components/create-new-folder/CreateNewFolder';
import { MoveToFolder } from '@/components/move-to-folder/MoveToFolder';
import { DeleteFolder } from "@/components/delete-folder/DeleteFolder";
import { FolderRename } from "@/components/folder-rename/FolderRename";
import {appSettingsConfig} from "@/config/app-settings";
import {$http} from "@/services/ng";
import {IMG_ROOT} from "@/services/data-source";

const FOLDER_STRUCTURE_URL =
    appSettingsConfig.server.backendUrl + '/api/folder_structures';
const { TreeNode, DirectoryTree } = Tree;
const { Search } = Input;

class DashboardsListSearch extends React.Component {
  state = {
    dashboard: null,
    editMode: false,
    rename: null,
    selected: null,
    dashboardName: '',
    all: null,
    filtered: null,
    loading: true,
    visible: false,
    treelist: null,
    selectedtitle: null
  };

  componentDidMount() {
    Dashboard.allDashboards().$promise.then(res => {
      this.setState({
        all: res,
        filtered: res,
        loading: false
      });

      if (this.props.slugId) {
        this.setState({
          selected: this.props.slugId
        });
        this.props.dashboardSearchCb([this.props.slugId]);
      }
    });
    if(FOLDER_STRUCTURE_URL){
      $http
          .get(FOLDER_STRUCTURE_URL)
          .success(data =>
          {
            const tl=this.convertToTreeData(data.filter(item => item.catalog === "dashboard"),null)
            this.setState(
                {
                  treelist:tl
                })
          }
          )
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.slugId === null) {
      this.reload();
    }
  }

  // eslint-disable-next-line react/sort-comp
  reload(holdTab) {
    let dashboardid = null;
    let dashboard = null;
    if (holdTab) {
      dashboardid = this.state.selected;
      dashboard = this.state.dashboard;
    }
    this.props.dashboardSearchCb([dashboardid]);
    this.setState({
      dashboard,
      selected: dashboardid,
      all: null,
      filtered: null,
      loading: true
    });
    Dashboard.allDashboards().$promise.then(res => {
      this.setState({
        all: res,
        filtered: res,
        loading: false
      });
    });
    $http
        .get(FOLDER_STRUCTURE_URL)
        .success(data => this.setState(
            {
              treelist:this.convertToTreeData(data.filter(item => item.catalog === "dashboard"),null)
            }
        ));
  }

  
  
  searchBy(value) {
    const allItems = _.cloneDeep(this.state.all);
    this.props.dashboardSearchCb(null);
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
    this.props.dashboardSearchCb(null);
    this.setState({
      filtered: _.orderBy(this.state.filtered, item => item[value])
    });
  }

  updateDashboard = data => {
    _.extend(this.state.dashboard, data);
    data = _.extend({}, data, {
      slug: this.state.dashboard.id,
      version: this.state.dashboard.version
    });
    Dashboard.save(
      data,
      dashboard => {
        message.success('可视化面板信息更新成功');
        this.setState({ loading: false });
        this.reload(true);
      },
      error => {
        message.error('可视化面板更新失败', '出现错误');
        this.setState({ loading: false });
        this.reload(true);
      }
    );
  };

  showModal = () => {
    this.setState({
      visible: true
    });
  };

  hideModal = () => {
    this.setState({
      visible: false
    });
    if (policy.isCreateDashboardEnabled()) {
      if (_.isEmpty(this.state.dashboardName)) {
        message.error('仪表板名称不能为空');
        return;
      }

      this.props.$http
        .post(this.props.appSettings.server.backendUrl + '/api/dashboards', {
          name: this.state.dashboardName,
          folder_id: (this.state.selected &&
              this.state.selected.substr(0,1) === 's' ?
              this.state.selected.substring(1):null)
        })
        .success(response => {
          this.props.$location
            .path(`/dashboards/${response.slug}`)
            .search('edit')
            .replace();
        });
    }
  };

  newName = e => {
    const { value } = e.target;
    this.setState({ dashboardName: value });
  };

  renderTree = (treelist,idx) => {
    const allItems = _.cloneDeep(this.state.all);
    const folderItem = _.filter(allItems, item3 => item3.folder_id != null)
    return treelist.map(item => {
      if (!item.children){
        return (
          <TreeNode title={item.title} key={item.key}>
            {_.map(_.filter(folderItem, item1 => item1.folder_id.toString() === item.key.substring(1)), item2 => (
              <TreeNode
                icon={(
                  <Icon
                    type="dashboard"
                    style={{ color: '#801336' }}
                  />
                    )}
                title={(
                  <span
                    onDoubleClick={event => {
                                this.setState({ editMode: true });
                            }}
                  >
                    {this.state.editMode &&
                              this.state.selected &&
                              (this.state.selected === item2.slug && !this.state.dashboard.readOnly()) ? (
                                <Input
                                  autoFocus
                                  size="small"
                                  value={this.state.rename}
                                  onFocus={event => {
                                          if (this.state.dashboard.readOnly()) {
                                              return;
                                          }
                                          this.setState({ rename: item2.name });
                                      }}
                                  onChange={event => {
                                          if (this.state.dashboard.readOnly()) {
                                              return;
                                          }
                                          this.setState(
                                              {
                                                  rename: event.target.value
                                              },
                                              () => { }
                                          );
                                      }}
                                  onBlur={() => {
                                          if (this.state.dashboard.readOnly()) {
                                              return;
                                          }
                                          this.setState({ editMode: false });
                                          if (this.state.rename === item2.name) {
                                              console.log('NO CHANGE');
                                          } else {
                                              this.setState({ loading: true });
                                              this.updateDashboard({
                                                  name: this.state.rename
                                              });
                                          }
                                      }}
                                  onPressEnter={() => {
                                          if (this.state.dashboard.readOnly()) {
                                              return;
                                          }
                                          this.setState({ editMode: false });
                                          if (this.state.rename === item2.name) {
                                              console.log('NO CHANGE');
                                          } else {
                                              this.setState({ loading: true });
                                              this.updateDashboard({
                                                  name: this.state.rename
                                              });
                                          }
                                      }}
                                />
                              ) : (
                                  item2.name
                              )}
                  </span>
                    )}
                key={item2.slug}
                isLeaf
              />
              ))

              }
          </TreeNode>
        )}
      return(
        <TreeNode title={item.title} key={item.key}>
          {_.map(_.filter(folderItem, item1 => item1.folder_id.toString() === item.key.substring(1)), item2 => (
            <TreeNode
              icon={(
                <Icon
                  type="dashboard"
                  style={{ color: '#801336' }}
                />
                    )}
              title={(
                <span
                  onDoubleClick={event => {
                                this.setState({ editMode: true });
                            }}
                >
                  {this.state.editMode &&
                              this.state.selected &&
                              (this.state.selected === item2.slug && !this.state.dashboard.readOnly()) ? (
                                <Input
                                  autoFocus
                                  size="small"
                                  value={this.state.rename}
                                  onFocus={event => {
                                          if (this.state.dashboard.readOnly()) {
                                              return;
                                          }
                                          this.setState({ rename: item2.name });
                                      }}
                                  onChange={event => {
                                          if (this.state.dashboard.readOnly()) {
                                              return;
                                          }
                                          this.setState(
                                              {
                                                  rename: event.target.value
                                              },
                                              () => { }
                                          );
                                      }}
                                  onBlur={() => {
                                          if (this.state.dashboard.readOnly()) {
                                              return;
                                          }
                                          this.setState({ editMode: false });
                                          if (this.state.rename === item2.name) {
                                              console.log('NO CHANGE');
                                          } else {
                                              this.setState({ loading: true });
                                              this.updateDashboard({
                                                  name: this.state.rename
                                              });
                                          }
                                      }}
                                  onPressEnter={() => {
                                          if (this.state.dashboard.readOnly()) {
                                              return;
                                          }
                                          this.setState({ editMode: false });
                                          if (this.state.rename === item2.name) {
                                              console.log('NO CHANGE');
                                          } else {
                                              this.setState({ loading: true });
                                              this.updateDashboard({
                                                  name: this.state.rename
                                              });
                                          }
                                      }}
                                />
                              ) : (
                                  item2.name
                              )}
                </span>
                    )}
              key={item2.slug}
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

  createFolder = (name, key) =>{
        const parentId = (key===null || key==="datavis-group#ungrouped") ? null:key.substring(1);
        const data={
            "parent_id":parentId,
            "name":name,
            "catalog":"dashboard"
        };
        $http
            .post(FOLDER_STRUCTURE_URL,data)
            .success(() => {this.reload(); 
              // console.log("folder-created")
            })
            .error(() => alert("创建失败"))
    }

  moveTofolder = (selected, targetfolder) => {
        const data={
            folder_id:targetfolder.substring(1)
        }
        $http
            .post(appSettingsConfig.server.backendUrl+'/api/dashboards/'+selected+'/folder',data)
            .success(() => {this.reload(); 
              // console.log("move done")
            })
            .error(() => alert("移动失败,请选择一个仪表盘"))

    }

  deleteFolder = (selected) => {
    if (selected && selected.substr(0,1)==="s"){
      $http
          .delete(appSettingsConfig.server.backendUrl+'/api/folder_structures/'+selected.substring(1))
          .success(() => {this.reload();
            // console.log("delete complete")
          })
          .error(() => alert("删除失败"))

    } else {
      // eslint-disable-next-line no-alert
      alert("请选择一个文件夹")
    }
  }

    foldernameUpdate = (data) => {
        if(this.state.selected && this.state.selected.substr(0,1)==="s")
            $http
                .post(appSettingsConfig.server.backendUrl+'/api/folder_structures/'+this.state.selected.substring(1),data)
                .success(()=>{this.reload();
                  // console.log('rename complete')
                })
                .error(() => alert("改名失败"))
    }

    copyDashboard=()=>{
    if(this.state.selected === null ||
        this.state.selected === "datavis-group#ungrouped" ||
        this.state.selected.substr(0,1) === "s")
    {
      alert("请选择一个仪表盘")
    } else {
      $http
          .get(this.props.appSettings.server.backendUrl + '/api/dashboards/'+this.state.selected)
          .success((response) => {
              const backgroundinformation = response.background_image;
              const widgets = response.widgets;
              _.forEach(widgets,(value)=>{
                  delete value.id;
                  delete value.created_at;
                  delete value.updated_at;
                  value.visualization_id = value.visualization.id;
                  delete value.visualization;
              });
              const postdata = response;
              postdata.name+="(copy)"
              delete postdata.slug;
              delete postdata.id;
              delete postdata.created_at;
              delete postdata.updated_at;
              delete postdata.widgets;
              delete postdata.background_image;
              $http
                  .post(this.props.appSettings.server.backendUrl + '/api/dashboards', postdata)
                  .success((newresponse) => {
                      const backdata =
                          {
                              background_image:backgroundinformation
                          }
                      $http.
                          post(this.props.appSettings.server.backendUrl + '/api/dashboards/'+newresponse.id,backdata)
                          .success(()=>{this.reload()});
                      _.forEach(widgets,(value)=>{
                      value.dashboard_id = newresponse.id;
                      // console.log("post value",value);
                      $http
                          .post(this.props.appSettings.server.backendUrl + '/api/widgets',value)
                          .success(()=>{ this.reload();
                            // console.log("successvalue",value.visualization_id)
                          })
                          .error(e => console.log("widget errorlala",e));
                      })
                      this.reload();
                  })
                  .error(e=>console.log("copy error information ",e));
          })
          .error((e)=>console.log("error information",e))
    }
    }

  render() {
    // console.log("state dashboard ",this.state.dashboard);
    // console.log("all",this.state.all);
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
                    可视化仪表盘列表:
                  </div>
                </Col>
                <Col span={11} align="right">
                  {policy.isCreateDashboardEnabled() ? (
                    <Modal
                      destroyOnClose
                      title="新建仪表盘"
                      visible={this.state.visible}
                      onOk={this.hideModal}
                      onCancel={this.hideModal}
                      okText="确认"
                      cancelText="取消"
                    >
                      <Form onSubmit={this.handleSubmit}>
                        <Form.Item label="仪表盘名称">
                          <Input
                            prefix={(
                              <Icon
                                type="dashboard"
                                style={{ color: 'rgba(0,0,0,.25)' }}
                              />
                              )}
                            placeholder="新仪表盘"
                            onChange={this.newName}
                          />
                        </Form.Item>
                      </Form>
                    </Modal>
                    ) : (
                      <Modal
                        destroyOnClose
                        title="新建仪表盘"
                        visible={this.state.visible}
                        onOk={this.hideModal}
                        onCancel={this.hideModal}
                        okText="确认"
                        cancelText="取消"
                      >
                        <Alert
                          message="错误"
                          description="无法创建可视化仪表板，原因：权限受限"
                          type="warning"
                          showIcon
                        />
                      </Modal>
                      )}
                </Col>
              </Row>
              <Row>
                <Col span={18}>
                  <Search
                    placeholder="搜索可视化仪表板..."
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
            <Col span={8}>
              <Button
                size="small"
                type="link"
                style={{ color: '#3d4d66' }}
                onClick={this.showModal}
              >
                <Icon type="plus-square" style={{ color: '#13cd66' }} />
                新建仪表盘
              </Button>
            </Col>
            <Col span={8}>
              <Button
                size="small"
                type="link"
                style={{ color: '#3d4d66' }}
                onClick={() => {this.copyDashboard()}}
              >
                <Icon type="copy" style={{ color: '#13cd66' }} />
                复制仪表盘
              </Button>
            </Col>
            <Col span={8}>
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
          <Row>
            <Col style={{ paddingRight: '10px' }}>
              <DirectoryTree
                defaultExpandedKeys={['datavis-group#ungrouped']}
                onSelect={(value, node, extra) => {
                    const stillEdit = value[0] === this.state.selected;
                    this.setState({
                      selected: value[0],
                      editMode: stillEdit,
                      dashboard: _.find(
                        this.state.all,
                        dashboard => dashboard.slug === value[0]
                      ),
                      selectedtitle: node.node.props.title
                    });
                    this.props.dashboardSearchCb(value);
                  }}
                selectedKeys={[this.state.selected]}
              >
                <TreeNode
                  title="可视化仪表板(无分组)"
                  key="datavis-group#ungrouped"
                >
                  {_.map(this.state.filtered, item => {
                      return (
                        <TreeNode
                          icon={(
                            <Icon
                              type="dashboard"
                              style={{ color: '#801336' }}
                            />
                          )}
                          title={(
                            <span
                              onDoubleClick={event => {
                                this.setState({ editMode: true });
                              }}
                            >
                              {this.state.editMode &&
                                this.state.selected &&
                                (this.state.selected === item.slug && !this.state.dashboard.readOnly()) ? (
                                  <Input
                                    autoFocus
                                    size="small"
                                    value={this.state.rename}
                                    onFocus={event => {
                                      if (this.state.dashboard.readOnly()) {
                                        return;
                                      }
                                      this.setState({ rename: item.name });
                                    }}
                                    onChange={event => {
                                      if (this.state.dashboard.readOnly()) {
                                        return;
                                      }
                                      this.setState(
                                        {
                                          rename: event.target.value
                                        },
                                        () => { }
                                      );
                                    }}
                                    onBlur={() => {
                                      if (this.state.dashboard.readOnly()) {
                                        return;
                                      }
                                      this.setState({ editMode: false });
                                      if (this.state.rename === item.name) {
                                        console.log('NO CHANGE');
                                      } else {
                                        this.setState({ loading: true });
                                        this.updateDashboard({
                                          name: this.state.rename
                                        });
                                      }
                                    }}
                                    onPressEnter={() => {
                                      if (this.state.dashboard.readOnly()) {
                                        return;
                                      }
                                      this.setState({ editMode: false });
                                      if (this.state.rename === item.name) {
                                        console.log('NO CHANGE');
                                      } else {
                                        this.setState({ loading: true });
                                        this.updateDashboard({
                                          name: this.state.rename
                                        });
                                      }
                                    }}
                                  />
                                ) : (
                                  item.name
                                )}
                            </span>
                          )}
                          key={item.slug}
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

DashboardsListSearch.propTypes = {
  slugId: PropTypes.string,
  dashboardSearchCb: PropTypes.func.isRequired
};

DashboardsListSearch.defaultProps = {
  slugId: null
};

export default function init(ngModule) {
  ngModule.component(
    'dashboardsListSearch',
    react2angular(
      DashboardsListSearch,
      Object.keys(DashboardsListSearch.propTypes),
      ['appSettings', '$http', '$location']
    )
  );
}

init.init = true;
