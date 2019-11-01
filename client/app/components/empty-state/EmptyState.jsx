import { keys, some } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import classNames from 'classnames';
import { $uibModal } from '@/services/ng';
import { currentUser } from '@/services/auth';
import organizationStatus from '@/services/organizationStatus';
import './empty-state.less';

function createDashboard() {
  $uibModal.open({
    component: 'editDashboardDialog',
    resolve: {
      dashboard: () => ({ name: null, layout: null })
    }
  });
}

function Step({ show, completed, text, url, urlText, onClick }) {
  if (!show) {
    // return null;
  }

  return (
    <li className={classNames({ done: completed })}>
      <a href={url || ''} onClick={onClick}>
        {urlText}
      </a>{' '}
      {text}
    </li>
  );
}

function ShowOnBoarding({
  translate,
  isAvailable,
  isCompleted,
  helpLink,
  onboardingMode
}) {
  // Show if `onboardingMode=false` or any requested step not completed
  const shouldShow =
    !onboardingMode ||
    some(keys(isAvailable), step => isAvailable[step] && !isCompleted[step]);

  if (!shouldShow) {
    // return null;
  }

  return (
    <div className="empty-state__steps">
      <br />
      <h4>可视化面板创建向导:</h4>
      <ol>
        {currentUser.isAdmin && (
          <Step
            url="data_sources/new"
            urlText={translate('HOME.EMPTY_STATE.CONNECT')}
            text="新的数据源"
          />
        )}
        {!currentUser.isAdmin && (
          <Step
            text="请系统管理员权限用户连接一个数据源"
          />
        )}
        <Step
          url="queries/new"
          urlText={translate('HOME.EMPTY_STATE.CREATE')}
          text="可视化组件"
        />
        <Step
          onClick={createDashboard}
          urlText={translate('HOME.EMPTY_STATE.CREATE')}
          text="可视化面板"
        />
        <Step
          url="users/new"
          urlText="添加"
          text={translate('HOME.EMPTY_STATE.YOUR_TEAM_MEMBERS')}
        />
      </ol>
      <p>
        {translate('HOME.EMPTY_STATE.NEED_MORE_SUPPORT')}{' '}
        {"请查阅DataVis使用文档."}
        <i className="fa fa-external-link m-l-5" aria-hidden="true" />
      </p>
    </div>
  );
}

Step.propTypes = {
  text: PropTypes.string.isRequired,
  url: PropTypes.string,
  urlText: PropTypes.string,
  onClick: PropTypes.func
};

Step.defaultProps = {
  url: null,
  urlText: null,
  onClick: null
};

export function EmptyState({
  icon,
  title,
  header,
  description,
  illustration,
  helpLink,
  onboardingMode,
  showAlertStep,
  showDashboardStep,
  showInviteStep,
  $translate
}) {
  const translate = key => ($translate ? $translate.instant(key) : key);

  const isAvailable = {
    dataSource: true,
    query: true,
    alert: showAlertStep,
    dashboard: showDashboardStep,
    inviteUsers: showInviteStep
  };

  const isCompleted = {
    dataSource: organizationStatus.objectCounters.data_sources > 0,
    query: organizationStatus.objectCounters.queries > 0,
    alert: organizationStatus.objectCounters.alerts > 0,
    dashboard: organizationStatus.objectCounters.dashboards > 0,
    inviteUsers: organizationStatus.objectCounters.users > 1
  };

  return (
    <div className="empty-state bg-white tiled">
      <div className="empty-state__summary">
        {title && <h5>{title}</h5>}
        {header && <h4>{header}</h4>}
        <h2>
          <i className={icon} />
        </h2>
        <p>{description}</p>
        <img
          src='/static/images/illustrations/main.png'
          alt={illustration + ' Illustration'}
          width="75%"
        />
      </div>

      <ShowOnBoarding
        translate={translate}
        helpLink={helpLink}
        onboardingMode={onboardingMode}
      />
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string,
  header: PropTypes.string,
  description: PropTypes.string.isRequired,
  illustration: PropTypes.string.isRequired,
  helpLink: PropTypes.string.isRequired,

  onboardingMode: PropTypes.bool,
  showAlertStep: PropTypes.bool,
  showDashboardStep: PropTypes.bool,
  showInviteStep: PropTypes.bool,

  $translate: PropTypes.func
};

EmptyState.defaultProps = {
  icon: null,
  title: null,
  header: null,

  onboardingMode: false,
  showAlertStep: false,
  showDashboardStep: false,
  showInviteStep: false,
  $translate: text => text
};

export default function init(ngModule) {
  ngModule.component(
    'emptyState',
    react2angular(EmptyState, Object.keys(EmptyState.propTypes), ['$translate'])
  );
}

init.init = true;
