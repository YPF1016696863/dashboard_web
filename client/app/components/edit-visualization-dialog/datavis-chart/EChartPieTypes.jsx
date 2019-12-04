import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import { Input, Modal, Button, Radio, Row, Col, Avatar, Divider } from 'antd';
import { appSettingsConfig } from '../../../config/app-settings';

const CHART_IMG_ROOT = '/static/images/';

class EChartPieTypes extends React.Component {
    constructor(props) {
        super(props);
        const { $rootScope } = props;
        this.state = {
            chartTypes: {
              pie: { name: 'Echarts饼图', icon: 'pie-chart' },
              rose: { name: 'Echarts玫瑰图', icon: 'pie-chart' },
              doughnut: { name: 'Echarts环形图', icon: 'pie-chart' }
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
              title="Echarts饼图图表类型选择"
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
                  <Radio value="pie" align="center">
                    <Avatar
                      shape="square"
                      size="large"
                      src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-pie.png`}
                    />
                    <span style={{ fontSize: '12px' }}>饼图</span>
                  </Radio>
                 
                  <Radio value="doughnut" align="center">
                    <Avatar
                      shape="square"
                      size="large"
                      src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-donut.png`}
                    />
                    <span style={{ fontSize: '12px' }}>环形图</span>
                  </Radio>
                  
                  <Radio value="rose" align="center">
                    <Avatar
                      shape="square"
                      size="large"
                      src={`${CHART_IMG_ROOT}/datavis-charts/datavis-echarts-rose.png`}
                    />
                    <span style={{ fontSize: '12px' }}>玫瑰图</span>
                  </Radio>
                  
                </Radio.Group>
              </div>
            </Modal>
          </>
        );
    }
}

EChartPieTypes.propTypes = {
    chartType: PropTypes.string,
    serie: PropTypes.string,
    chartTypeCb: PropTypes.func.isRequired
};

EChartPieTypes.defaultProps = {
    chartType: '',
    serie: ''
};

export default function init(ngModule) {
    ngModule.component(
        'eChartPieTypes',
        react2angular(EChartPieTypes, Object.keys(EChartPieTypes.propTypes), [
            '$rootScope',
            '$scope'
        ])
    );
}

init.init = true;
