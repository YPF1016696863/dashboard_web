import React from 'react';
import PropTypes from 'prop-types';
import { BigMessage } from '@/components/BigMessage';
import { NoTaggedObjectsFound } from '@/components/NoTaggedObjectsFound';
import { EmptyState } from '@/components/empty-state/EmptyState';

export default function DashboardListEmptyState({ page, searchTerm, selectedTags, $translate }) {
  if (searchTerm !== '') {
    return (
      <BigMessage message="抱歉，我们未找到任何结果。" icon="fa-search" />
    );
  }
  if (selectedTags.length > 0) {
    return (
      <NoTaggedObjectsFound objectType="dashboards" tags={selectedTags} />
    );
  }
  switch (page) {
    case 'favorites': return (
      <BigMessage message="Mark dashboards as Favorite to list them here." icon="fa-star" />
    );
    default: return (
      <EmptyState
        icon="zmdi zmdi-view-quilt"
        description="See the big picture"
        illustration="dashboard"
        helpLink=""
        showDashboardStep
        $translate={$translate}
      />
    );
  }
}

DashboardListEmptyState.propTypes = {
  page: PropTypes.string.isRequired,
  searchTerm: PropTypes.string.isRequired,
  selectedTags: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  $translate: PropTypes.func,
};

DashboardListEmptyState.defaultProps = {
  $translate: text => text,
};
