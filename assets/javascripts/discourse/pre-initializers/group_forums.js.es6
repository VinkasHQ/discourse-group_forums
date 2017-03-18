import { default as computed, observes } from 'ember-addons/ember-computed-decorators';
import Category from 'discourse/models/category';
import NavItem from 'discourse/models/nav-item';
import GroupController from 'discourse/controllers/group';
import GroupIndexRoute from 'discourse/routes/group-index';
import GroupMembersRoute from 'discourse/routes/group-members';

export default {
  name: 'group_discourse',
  before: 'inject-discourse-objects',
  initialize() {

    Category.reopen({

      @computed('custom_fields.primary_group_id')
      primary_group_id: {
        get() {
          return this.get("custom_fields.primary_group_id");
        },
        set(value) {
          this.set("custom_fields.primary_group_id", value);
        }
      }

    });

    NavItem.reopen({

      filterMode: function() {
        var name = this.get('name');

        if( name.split('/')[0] === 'category' ) {
          return 'c/' + this.get('categorySlug');
        } else {
          var mode = "",
          category = this.get("category"),
          group = this.get("group");

          if(category){
            mode += "c/";
            mode += Discourse.Category.slugFor(this.get('category'));
            if (this.get('noSubcategories')) { mode += '/none'; }
            mode += "/l/";
          }

          if(group) { mode += "f/" + group.name + "/"; }
          return mode + name.replace(' ', '-');
        }
      }.property('name')

    });

    NavItem.reopenClass({
      // create a nav item from the text, will return null if there is not valid nav item for this particular text
      fromText(text, opts) {
        var split = text.split(","),
            name = split[0],
            testName = name.split("/")[0],
            anonymous = !Discourse.User.current();

        if (anonymous && !Discourse.Site.currentProp('anonymous_top_menu_items').includes(testName)) return null;
        if (!Discourse.Category.list() && testName === "categories") return null;
        //if (!Discourse.Site.currentProp('group_menu_items').includes(testName)) return null;

        var args = { name: name, hasIcon: name === "unread" }, extra = null, self = this;
        if (opts.category) { args.category = opts.category; }
        if (opts.group) { args.group = opts.group; }
        if (opts.noSubcategories) { args.noSubcategories = true; }
        _.each(NavItem.extraArgsCallbacks, function(cb) {
          extra = cb.call(self, text, opts);
          _.merge(args, extra);
        });

        const store = Discourse.__container__.lookup('store:main');
        return store.createRecord('nav-item', args);
      },

      buildGroupList(group, args) {
        args = args || {};

        if (group) { args.group = group; }

        let items = Discourse.SiteSettings.top_menu.split("|");

        if (args.filterMode && !_.some(items, i => i.indexOf(args.filterMode) !== -1)) {
          items.push(args.filterMode);
        }

        return items.map(i => Discourse.NavItem.fromText(i, args))
                    .filter(i => i !== null && !(group && i.get("name").indexOf("grou") === 0));
      }

    });

  }
};
