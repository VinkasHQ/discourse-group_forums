import OpenComposer from "discourse/mixins/open-composer";
import GroupsRoute from 'discourse/routes/groups';

const DiscoveryForumsRoute = GroupsRoute.extend(OpenComposer, {
  renderTemplate() {
    this.render("navigation/default", { outlet: "navigation-bar" });
    this.render("discovery/forums", { outlet: "list-container" });
  },

  beforeModel() {
    this.controllerFor("navigation/default").set("filterMode", "forums");
  }
});

export default DiscoveryForumsRoute;
