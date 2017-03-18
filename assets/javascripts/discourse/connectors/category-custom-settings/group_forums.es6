export default {
  setupComponent(args, component) {
    component.set('groups', this.site.groups);
  }
}