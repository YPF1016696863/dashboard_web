import React from 'react';
import PropTypes from 'prop-types';
import { react2angular } from 'react2angular';

import { EmailSettingsWarning } from '@/components/EmailSettingsWarning';
import UserEdit from '@/components/users/UserEdit';
import UserShow from '@/components/users/UserShow';
import LoadingState from '@/components/items-list/components/LoadingState';

import { User } from '@/services/user';
import settingsMenu from '@/services/settingsMenu';
import { $route } from '@/services/ng';
import { currentUser } from '@/services/auth';
import PromiseRejectionError from '@/lib/promise-rejection-error';
import './settings.less';

class UserProfile extends React.Component {

  constructor(props) {
    super(props);
    this.state = { user: null };
  }

  componentDidMount() {
    const userId = $route.current.params.userId || currentUser.id;
    User.get({ id: userId }).$promise
      .then(user => this.setState({ user: User.convertUserInfo(user) }))
      .catch((error) => {
        // ANGULAR_REMOVE_ME This code is related to Angular's HTTP services
        if (error.status && error.data) {
          error = new PromiseRejectionError(error);
        }
        this.props.onError(error);
      });
  }

  render() {
    const {$translate} = this.props;
    const { user } = this.state;
    const canEdit = user && (currentUser.isAdmin || currentUser.id === user.id);
    const UserComponent = canEdit ? UserEdit : UserShow;

    return (
      <React.Fragment>
        <EmailSettingsWarning featureName={$translate.instant("USERPROFILE.INVITE_EMAILS")} $translate={$translate} />
        <div className="row">
          {user ? <UserComponent user={user} /> : <LoadingState className="" />}
        </div>
      </React.Fragment>
    );
  }
}

UserProfile.propTypes = {
  onError: PropTypes.func,
};

UserProfile.defaultProps = {
  onError: () => {},
};

export default function init(ngModule) {
  settingsMenu.add({
    title: 'USERPROFILE.ACCOUNT',
    path: 'users/me',
    order: 7,
  });

  ngModule.component('pageUserProfile', react2angular(UserProfile, Object.keys(UserProfile.propTypes), ['$translate']));
}

init.init = true;
