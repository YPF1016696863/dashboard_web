import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';
import { currentUser, clientConfig } from '@/services/auth';

export class EmailSettingsWarning extends React.Component {

  componentDidMount() {}

  render() {
    const {featureName,$translate} = this.props;
    return (clientConfig.mailSettingsMissing && currentUser.isAdmin) ? (
      <p className="alert alert-danger">
        {$translate.instant("ALERT.EMAIL_SETTINGS_WARNING.MESSAGE",{featureName})}
      </p>
    ) : null;
  }
}

EmailSettingsWarning.propTypes = {
  featureName: PropTypes.string.isRequired
};

export default function init(ngModule) {
  ngModule.component('emailSettingsWarning', react2angular(EmailSettingsWarning,Object.keys(EmailSettingsWarning.propTypes),['$translate']));
}

init.init = true;
