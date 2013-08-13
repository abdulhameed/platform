define(['App', 'marionette', 'handlebars', 'views/PostItemView', 'text!templates/PostList.html', 'text!templates/partials/pagination.html'],
	function( App, Marionette, Handlebars, PostItemView, template, paginationTemplate)
	{
		Handlebars.registerPartial('pagination', paginationTemplate);

		return Marionette.CompositeView.extend( {
			//Template HTML string
			template: Handlebars.compile(template),
			initialize: function() {
				this.listenTo(this.collection, "add", this.updatePagination, this);
				this.listenTo(this.collection, "remove", this.updatePagination, this);
				this.listenTo(this.collection, "reset", this.updatePagination, this);
			},
			
			itemView: PostItemView,
			itemViewOptions: {
				//foo: "bar"
			},

			itemViewContainer: '.list-view-posts-list',
			
			events: {
				'click .js-list-view-select-post' : 'showHideBulkActions',
				'click .js-page-first' : 'showFirstPage',
				'click .js-page-next' : 'showNextPage',
				'click .js-page-prev' : 'showPreviousPage',
				'click .js-page-last' : 'showLastPage',
				'click .js-page-change' : 'showPage',
				'change #filter-posts-count' : 'updatePageSize',
				'change #filter-posts-sort' : 'updatePostsSort',
				
			},
			
			showHideBulkActions : function ()
			{
				$checked = this.$('.js-list-view-select-post input[type="checkbox"]:checked')
				if ($checked.length > 0)
				{
					this.$('.js-list-view-bulk-actions').removeClass('hidden');
					this.$('.js-list-view-bulk-actions').addClass('visible');
				}
				else
				{
					this.$('.js-list-view-bulk-actions').removeClass('visible');
					this.$('.js-list-view-bulk-actions').addClass('hidden');
				}
			},

			serializeData : function ()
			{
				var data = { items: this.collection.toJSON() };
				data = _.extend(data, {
					pagination: this.collection.state
				});

				return data;
			},

			showNextPage : function (e)
			{
				e.preventDefault();
				// Already at last page, skip
				if (this.collection.state.lastPage <= this.collection.state.currentPage) return;

				this.collection.getNextPage();
				this.updatePagination();
			},
			showPreviousPage : function (e)
			{
				e.preventDefault();
				// Already at last page, skip
				if (this.collection.state.firstPage >= this.collection.state.currentPage) return;

				this.collection.getPreviousPage();
				this.updatePagination();
			},
			showFirstPage : function (e)
			{
				e.preventDefault();
				// Already at last page, skip
				if (this.collection.state.firstPage >= this.collection.state.currentPage) return;

				this.collection.getFirstPage();
				this.updatePagination();
			},
			showLastPage : function (e)
			{
				e.preventDefault();
				// Already at last page, skip
				if (this.collection.state.lastPage <= this.collection.state.currentPage) return;

				this.collection.getLastPage();
				this.updatePagination();
			},
			showPage : function (e)
			{
				e.preventDefault();
				var $el = this.$(e.currentTarget);
				var num = 0;
				_.each(
					$el.attr('class').split(" "),
					function (v) {
						if (v.indexOf("page-") === 0)
						{
							num = v.replace("page-", "");
						}
					}
				);
				this.collection.getPage(num -1);
				this.updatePagination();
			},

			updatePagination: function ()
			{
				var template = Handlebars.compile(paginationTemplate);
				this.$('.pagination').replaceWith(template({
					pagination: this.collection.state
				}));
			},
			updatePageSize : function (e)
			{
				e.preventDefault();
				var size = parseInt(this.$('#filter-posts-count').val());
				if (typeof size == 'number' && size > 0)
				{
					this.collection.setPageSize(size, {
						first: true
					});
				}
			},
			updatePostsSort : function (e)
			{
				e.preventDefault();
				var orderby = this.$('#filter-posts-sort').val();
				this.collection.setSorting(orderby);
				this.collection.getFirstPage();
			}
		});
	});
