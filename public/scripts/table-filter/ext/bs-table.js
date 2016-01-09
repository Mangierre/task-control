!function($) {

    'use strict';

    var filterData = {};
    var bootstrapTableFilter;
    var serverUrl;

    var getTypeByValues = function(filter) {
        console.log(filter.type);
        return {type: filter.type};
        var typeFloat = true, typeInt = true;
        $.each(filter.values, function(i, val) {
            if (typeInt && (parseInt(val) != val)) {
                typeInt = false;
            }
            if (typeFloat && (parseFloat(val) != val)) {
                typeFloat = false;
            }
        });
        if (typeInt || typeFloat) {
            return {type: 'range'};
        }
        if (serverUrl) {
            var delimiter = serverUrl.indexOf('?') < 0 ? '?' : '&';
            return {
                type: 'search',
                source: serverUrl + delimiter + 'resourceFor=' + filter.field
            };
        }
        return {type: 'select'};
    };
    var getCols = function(cols, data, useAjax) {
        var ret = {};
        $.each(cols, function(i, col) {
            {
                ret[col.field] = {
                    field: col.field,
                    label: col.title,
                    type: col.type,
                    values: []
                };
            }
        });
        $.each(data, function(i, row) {
            $.each(ret, function(field, filter) {
                if (ret[field].values.indexOf(row[field]) < 0) {
                    ret[field].values.push(row[field]);
                }
            });
        });
        $.each(ret, function(field, def) {
            ret[field] = $.extend(ret[field], getTypeByValues(def));
        });
        return ret;
    };
    var rowFilter = function(item, i) {
        var filterType;
        var ret = true;
        $.each(item, function(field, value) {
            filterType = false;
            try {
                filterType = bootstrapTableFilter.getFilterType(field);
                var filter = bootstrapTableFilter.getFilter(field);
                if (typeof filter.values !== 'undefined') {
                    value = filter.values.indexOf(value);
                }
                if (filterType && typeof filterData[field] !== 'undefined') {
                    ret = ret && bootstrapTableFilter.checkFilterTypeValue(filterType, filterData[field], value);
                }
            }
            catch (e) {}
        });
        return ret;
    };

    $.fn.bootstrapTableFilter.externals.push(function() {
        if (this.options.connectTo) {
            bootstrapTableFilter = this;

            var $bootstrapTable = $(this.options.connectTo);
            var options = $bootstrapTable.bootstrapTable('getOptions');
            var data = $bootstrapTable.bootstrapTable('getData');

            var cols = options.columns;

            serverUrl = options.url;
            var dataSourceServer = false;
            var filters = this.options.filters.length ? [] : getCols(cols, data, dataSourceServer);

            $.each(filters, function(field, filter) {
                bootstrapTableFilter.addFilter(filter);
            });
            if (serverUrl) {
                this.$el.on('submit.bs.table.filter', function() {
                    filterData = bootstrapTableFilter.getData();
                    var delimiter = serverUrl.indexOf('?') < 0 ? '?' : '&';
                    var url = serverUrl + delimiter + 'filter=' + encodeURIComponent(JSON.stringify(filterData));
                    $bootstrapTable.bootstrapTable('refresh', {url: url});
                });
            }
            else {
                $bootstrapTable.bootstrapTable('registerSearchCallback', rowFilter);
                this.$el.on('submit.bs.table.filter', function() {
                    filterData = bootstrapTableFilter.getData();
                    $bootstrapTable.bootstrapTable('updateSearch');
                });
            }
        }
    });

}(jQuery);