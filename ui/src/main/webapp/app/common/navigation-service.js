/*
 * Copyright 2017-2019 Crown Copyright
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

'use strict';

angular.module('app').factory('navigation', ['$location', 'common', 'operationChain', function($location, common, operationChain) {

    var navigation = {};

    var currentPage = $location.path().substr(1);

    var parameters = {};

    navigation.getCurrentPage = function() {
        return currentPage;
    }

    navigation.goToQuery = function() {
        navigation.goTo("query");
    }

    /**
     * Change the page, keeping the parameters in the url
     */
    navigation.goTo = function(pageName) {
        if(pageName && common.startsWith(pageName, "/")) {
            pageName = pageName.substr(1);
        }
        currentPage = pageName;
        $location.path('/' + pageName);
    }

    /**
     * Update the url with new parameters, without changing the page
     */
    navigation.updateURL = function(graphIds) {
        var pageName = navigation.getCurrentURL().split('!/')[1].split('?')[0]
        // Update the graphId parameters
        if (graphIds != null && graphIds.length > 0) {
            var params = {graphId: graphIds}
            $location.path('/' + pageName).search(params);
        } else {
            $location.path('/' + pageName).search('graphId',null);
        }
    }

    navigation.getCurrentURL = function() {
        return window.location.href;
    }

    /**
     * Update the url parameters with the new operation chain when the operation chain is changed.
     */
    navigation.setOpChainParameters = function() {
        var opChain = operationChain.getOperationChain();
        console.log(opChain);
        var serialisedOpChain = JSON.stringify(opChain);
        console.log(serialisedOpChain);
        var params = {op: JSON.stringify(opChain)};
        var pageName = navigation.getCurrentURL().split('!/')[1].split('?')[0];
        $location.path('/' + pageName).search(params);
    }

    return navigation;
}]);
