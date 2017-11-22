/*
 * Copyright 2017 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict'

angular.module('app').factory('table', ['common', 'events', 'types', function(common, events, types) {
    var table = {};

    var tableData = {entities: {}, edges: {}, entitySeeds: [], other: []};

    table.getData = function() {
        return tableData;
    }

    table.clear = function() {
        tableData = {entities: {}, edges: {}, entitySeeds: [], other: []};
    }

    var parseEntity = function(entity) {
        var summarised = {};

        summarised.vertex = types.getShortValue(entity.vertex);
        summarised.group = entity.group;
        summarised.properties = parseElementProperties(entity.properties);

        return summarised;
    }

    var parseElementProperties = function(properties) {
        var summarisedProperties = {};

        var props = Object.keys(properties);
        for (var i in props) {
            summarisedProperties[props[i]] = types.getShortValue(properties[props[i]]);
        }

        return summarisedProperties;
    }

    var parseEdge = function(edge) {
        var summarised = {};
        summarised.source = types.getShortValue(edge.source);
        summarised.destination = types.getShortValue(edge.destination);
        summarised.group = edge.group;
        summarised.directed = edge.directed;
        summarised.properties = parseElementProperties(edge.properties);

        return summarised;

    }

    table.update = function(results) {
        for (var i in results.entities) {
            var entity = parseEntity(results.entities[i]);
            if(!tableData.entities[entity.group]) {
                tableData.entities[entity.group] = [];
            }

            if (!common.arrayContainsObject(tableData.entities[entity.group], entity)) {
                tableData.entities[entity.group].push(entity);
            }
        }

        for (var i in results.edges) {
            var edge = parseEdge(results.edges[i]);
            if(!tableData.edges[edge.group]) {
                tableData.edges[edge.group] = [];
            }
            if (!common.arrayContainsObject(tableData.edges[edge.group], edge)) {
                tableData.edges[edge.group].push(edge);
            }
        }

        for (var i in results.entitySeeds) {
            var es = common.parseVertex(results.entitySeeds[i]);
            if (tableData.entitySeeds.indexOf(es) == -1) {
                tableData.entitySeeds.push(es);
            }
        }

        for (var i in results.other) {
            if (tableData.other.indexOf(results.other[i]) === -1) {
                tableData.other.push(results.other[i]);
            }
        }
        events.broadcast('tableUpdated', [tableData]);

    }


    return table;
}]);