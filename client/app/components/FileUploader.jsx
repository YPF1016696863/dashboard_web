import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import { Upload, Icon, message } from 'antd';
import { appSettingsConfig } from '@/config/app-settings';

const { Dragger } = Upload;
const UPLOAD_URL = appSettingsConfig.server.backendUrl + "/api/file_upload";
class FileUploader extends React.Component {

  constructor(props) {
    super(props);
    // const {$rootScope} = props;
    // Get theme flag from rootScope first, if not exist, set to false, which means use light theme.
    this.state = { fileList: [] };
  }

  componentDidMount() {
    if (this.props.fileurl) {
      this.setState({
        fileList: [
          {
            uid: '-1',
            name: this.props.fileurl,
            url: this.props.fileurl,
            thumbUrl: '/static/images/db-logos/upload.png'
          }
        ]
      });
    }
  }

  render() {
    const { disabled } = this.props;
    const props = {
      disabled,
      showUploadList: { showPreviewIcon: !!disabled === false, showRemoveIcon: false, showDownloadIcon: false },
      accept: ".xlsx,.xlsm,.xlsb,.xltx,.xltm,.xls,.xlt,.xml,.csv",
      name: 'file',
      listType: 'picture',
      className: 'upload-list-inline',
      withCredentials: true,
      multiple: false,
      action: UPLOAD_URL,
      onPreview: () => { },
      onChange: info => {
        let fileList = [...info.fileList];
        fileList = fileList.slice(-1);
        this.setState({ fileList });

        const { status } = info.file;
        if (status !== 'uploading') {
          // console.log(uploading...);
        }
        if (status === 'done') {
          if (info.file.response.status === "OK") {
            this.setState({
              fileList: [
                {
                  uid: '-1',
                  name: info.file.response.url,
                  url: info.file.response.url,
                  thumbUrl: '/static/images/db-logos/upload.png'
                }
              ]
            });
            this.props.updateUrl(info.file.response.url); // 传入后台的url
          }
          // console.log(info.file.response.url); // 202010/655066__0618方案数据.xlsx
        } else if (status === 'error') {
          console.log(`${info.file.name} file upload failed.`);
        }
      }
    };
    return (
      <Dragger {...props} fileList={this.state.fileList}>
        <p className="ant-upload-drag-icon">
          <Icon type="inbox" />
        </p>
        <p className="ant-upload-text">单击或拖动文件到该区域以上传至服务器</p>
        <p className="ant-upload-hint">
          支持单文件上传.该文件上传后将由DataVis自动转为数据源并可直接使用,创建QueryResults并添加该文件数据源后,
          可执行基于SQL的复杂查询.
        </p>
      </Dragger>
    );
  }
}

FileUploader.propTypes = {
  fileurl: PropTypes.string,
  disabled: PropTypes.bool,
  updateUrl: PropTypes.func.isRequired
};

FileUploader.defaultProps = {
  fileurl: '',
  disabled: false
};

export default function init(ngModule) {
  ngModule.component('fileUploader', react2angular(FileUploader, Object.keys(FileUploader.propTypes), ['$rootScope', '$scope']));
}

init.init = true;

