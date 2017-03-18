import buildForumRoute from 'discourse/plugins/group_forums/discourse/routes/build-forum-route';
import DiscoverySortableController from 'discourse/controllers/discovery-sortable';

export default {
  after: 'inject-discourse-objects',
  name: 'dynamic-forum-route-builders',

  initialize(registry, app) {
    const site = Discourse.Site.current();
    site.get('filters').forEach(filter => {
      const filterCapitalized = filter.capitalize();
      app[`Forum${filterCapitalized}Controller`] = DiscoverySortableController.extend();
      app[`Forum${filterCapitalized}Route`] = buildForumRoute(filter);
    });

    Discourse.ForumTopController = DiscoverySortableController.extend();

    Discourse.ForumTopRoute = buildForumRoute('top');

    site.get('periods').forEach(period => {
      const periodCapitalized = period.capitalize();
      app[`ForumTop${periodCapitalized}Controller`] = DiscoverySortableController.extend();
      app[`ForumTop${periodCapitalized}Route`] = buildForumRoute('top/' + period);
    });
  }
};
