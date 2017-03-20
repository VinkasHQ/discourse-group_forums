import computed from "ember-addons/ember-computed-decorators";
import NavigationDefaultController from 'discourse/controllers/navigation/default';
import CategoryList from 'discourse/models/category-list';

export default NavigationDefaultController.extend({

  @computed("group")
  categories(group) {
    return this._super()
            .filter(c => group.forum_category_ids.indexOf(c[`id`]) != -1)
  },

  @computed("filterMode", "group")
  navItems(filterMode, group) {
    // we don't want to show the period in the navigation bar since it's in a dropdown
    if (filterMode.indexOf("top/") === 0) { filterMode = filterMode.replace("top/", ""); }
    return Discourse.NavItem.buildGroupList(group, { filterMode });
  }
});
