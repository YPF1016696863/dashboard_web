import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import { Input, Modal, Button, Radio, Row, Col, Avatar, Divider } from 'antd';
import { appSettingsConfig } from '../../../config/app-settings';

const CHART_IMG_ROOT = '/static/images/';

class EChartTypes extends React.Component {
    constructor(props) {
        super(props);
        const { $rootScope } = props;
        this.state = {
            chartTypes: {
                line: { name: '折线图', icon: 'line-chart' },
                bar: { name: '柱状图', icon: 'bar-chart' },
                bar2: { name: '横向柱状图', icon: 'bar-chart' },
                area: { name: '面积图', icon: 'area-chart' },
                scatter: { name: '散点图', icon: 'circle-o' },
                scatter2: { name: '气泡图', icon: 'circle-o' }
            },
            selected: this.props.chartType,
            preSelected: this.props.chartType,
            visible: false
        };
    }

    showModal = () => {
        this.setState({
            visible: true
        });
    };

    handleOk = e => {
        this.setState({
            visible: false,
            preSelected: this.state.selected
        });
        this.props.chartTypeCb(this.props.serie, this.state.selected);
    };

    handleCancel = e => {
        this.setState({
            visible: false
        });
    };

    render() {
        const value = this.state.preSelected
            ? this.state.chartTypes[this.state.preSelected].name
            : '';
        const placeholder = '请选择图表类型';
        return (
          <>
            <Input
              value={value}
              placeholder={placeholder}
              onClick={this.showModal}
            />
            <Modal
              title="Echarts基础图表类型选择"
              visible={this.state.visible}
              onOk={this.handleOk}
              onCancel={this.handleCancel}
              okText="确认"
              cancelText="取消"
            >
              <p style={{ fontSize: '14px' }}>选择图表类型:</p>
              <div>
                <Radio.Group
                  defaultValue={this.state.preSelected}
                  onChange={e => {
                this.setState({
                  selected: e.target.value
                });
              }}
                >
                  <Radio value="line" align="center">
                    <Avatar
                      shape="square"
                      size="large"
                      src={`${CHART_IMG_ROOT}/datavis-charts/datavis-line.png`}
                    />
                    <span style={{ fontSize: '12px' }}>折线图</span>
                  </Radio>
                  <Radio value="bar" align="center">
                    <Avatar
                      shape="square"
                      size="large"
                      src={`${CHART_IMG_ROOT}/datavis-charts/datavis-bar.png`}
                    />
                    <span style={{ fontSize: '12px' }}>柱状图</span>
                  </Radio>
                  <Radio value="bar2" align="center">
                    <Avatar
                      shape="square"
                      size="large"
                      src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-bar.png`}
                    />
                    <span style={{ fontSize: '12px' }}>横向柱状图</span>
                  </Radio>
                  <Radio value="area" align="center">
                    <Avatar
                      shape="square"
                      size="large"
                      src={`${CHART_IMG_ROOT}/datavis-charts/datavis-area.png`}
                    />
                    <span style={{ fontSize: '12px' }}>面积图</span>
                  </Radio>
                  
                  <Radio value="scatter" align="center">
                    <Avatar
                      shape="square"
                      size="large"
                      src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-scatter.png`}
                    />
                    <span style={{ fontSize: '12px' }}>散点图</span>
                  </Radio>
                  <Radio value="scatter2" align="center">
                    <Avatar
                      shape="square"
                      size="large"
                      src={`${CHART_IMG_ROOT}/datavis-charts/datavis-scatter.png`}
                    />
                    <span style={{ fontSize: '12px' }}>气泡图</span>
                  </Radio>
                  
                </Radio.Group>
              </div>
            </Modal>
          </>
        );
    }
}

EChartTypes.propTypes = {
    chartType: PropTypes.string,
    serie: PropTypes.string,
    chartTypeCb: PropTypes.func.isRequired
};

EChartTypes.defaultProps = {
    chartType: '',
    serie: ''
};

export default function init(ngModule) {
    ngModule.component(
        'eChartTypes',
        react2angular(EChartTypes, Object.keys(EChartTypes.propTypes), [
            '$rootScope',
            '$scope'
        ])
    );
}

init.init = true;
