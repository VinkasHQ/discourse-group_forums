# name: group_forums
# about: Enable forum feature for user groups
# version: 0.1.0
# authors: Vinoth Kannan (vinothkannan@vinkas.com)
# url: https://github.com/VinkasHQ/discourse-group_forums

enabled_site_setting :group_forums_enabled

PLUGIN_NAME = "group_forums".freeze

register_asset "stylesheets/group_forums.scss"

after_initialize do

  load File.expand_path('../controllers/group_forums_controller.rb', __FILE__)

  Group.class_eval do

    def primary_category_ids
      CategoryCustomField
        .where(name: "primary_group_id", value: id)
        .pluck(:category_id)
    end

    def primary_categories
      Category.where(id: primary_category_ids)
    end

  end

  module ::GroupDiscourse
    class Engine < ::Rails::Engine
      engine_name PLUGIN_NAME
      isolate_namespace GroupDiscourse
    end
  end

  require_dependency 'list_controller'

  class ::GroupDiscourse::ListController < ::ListController
    requires_plugin PLUGIN_NAME

    alias :default_build_topic_list_options :build_topic_list_options

    def build_topic_list_options
      options = default_build_topic_list_options

      group = Group.find_by(name: params.require(:name))
      @title = group.full_name || group.name
      options[:include_category_ids] = group.primary_category_ids

      options
    end

  end

  BasicGroupSerializer.class_eval do
    attribute :primary_category_ids, key: :categories
  end

  require_dependency 'topic_query'

  ::TopicQuery.add_custom_filter(:include_category_ids) do |result, topic_query|
    ids = topic_query.options[:include_category_ids]

    result = result.where("categories.id IN (?)", ids).references(:categories) if ids.present?

    result
  end

  GroupDiscourse::Engine.routes.draw do
    Discourse.filters.each do |filter|
      get "#{filter}" => "list##{filter}", constraints: { format: /(json|html)/ }
    end

    Discourse.anonymous_filters.each do |filter|
      get "#{filter}.rss" => "list##{filter}_feed", format: :rss
    end

    get "top" => "list#top"

    TopTopic.periods.each do |period|
      get "top/#{period}.rss" => "list#top_#{period}_feed", format: :rss
      get "top/#{period}" => "list#top_#{period}"
    end
  end

  Discourse.module_eval do
    def self.anonymous_filters
      @anonymous_filters = [:latest, :top, :categories, :forums]
    end

    def self.top_menu_items
      @top_menu_items ||= Discourse.filters + [:category, :categories, :forums, :top]
    end

    def self.anonymous_top_menu_items
      @anonymous_top_menu_items ||= Discourse.anonymous_filters + [:category, :categories, :forums, :top]
    end
  end

  require_dependency "homepage_constraint"

  Discourse::Application.routes.prepend do
    root "group_forums#index", constraints: HomePageConstraint.new("forums"), :as => "forums_index"
    get "forums" => "group_forums#index"
    mount ::GroupDiscourse::Engine, at: "/f/:name"
  end
end
