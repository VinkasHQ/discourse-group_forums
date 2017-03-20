export default Discourse.Route.extend({
  beforeModel: function() {
    this.transitionTo("forum.latest");
  }
});
