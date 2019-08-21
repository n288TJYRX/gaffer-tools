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

angular.module('app').factory('navigation', ['$location', '$route', 'common', 'operationChain', function($location, $route, common, operationChain) {

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
        return $location.absUrl();
    }

    /**
     * Update the url parameters with the new operation chain when the operation chain is changed.
     */
    navigation.setOpChainParameters = function() {
        var opChain = operationChain.getOperationChain();
        // console.log("opChain is: ", opChain);
        // console.log("opChain[0] is: ", opChain[0]);
        // console.log("opChain[0].expanded is:", opChain[0].expanded);
        // console.log("opChain[0].selectedOperation is:", opChain[0].selectedOperation);
        var serialisedOpChain = JSON.stringify(opChain, function (key, value) {
            if (value && typeof value === 'object') {
              var replacement = {};
              for (var k in value) {
                if (Object.hasOwnProperty.call(value, k)) {
                  replacement[k] = value[k];
                }
              }
              return replacement;
            }
            return value;
          });
        // console.log("serialised operation chain: ", serialisedOpChain);
        // console.log("serialisedOpChain[0]: ", JSON.stringify(opChain[0]));
        var shortOpChain = [];
        var op = {};
        op.class = JSON.stringify(opChain[0].selectedOperation.class).split(".").pop();
        op.fields = opChain[0].fields;
        op.dates = opChain[0].dates;
        shortOpChain.push(op);

        // var params = {op: JSON.stringify(shortOpChain)};

        // console.log("params are: ", params);
        var pageName = navigation.getCurrentURL().split('!/')[1].split('?')[0];

        // var paramString = "?";
        // Object.keys(params).forEach((key) => {
        //     paramString += key.toString() +  "=" + params[key].toString();
        // })
        // var paramString = "a"
        // for (var i = 1; i < 20000; i++) {
        //     paramString += "a";
        // }
        // var params = {op: shortOpChain};
        // var keys = Object.keys(params);
        // var paramString = "?";
        // for (var i=0; i < keys.length; i++) {
        //     paramString += keys[i] + "=" + encodeURIComponent(JSON.stringify(params[keys[i]]).replace(/"/g, "").replace(/\s/g, ''));
        //     if (i < (keys.length-1)) {
        //         urljson+="&";
        //     }
        // }

        // var paramString = "?op=testparamstring";
        // console.log(typeof paramString);
        // console.log("paramString: ", paramString);

        // shortOpChain = ["someteststring"];
        // var params = {op: shortOpChain};
        // console.log("params that work: ", params);

        var params = {op: [JSON.stringify(shortOpChain)[15]]};
        console.log("params are: ", params);
        
        // window.history.pushState(null, null, navigation.getCurrentURL() + paramString);
        $location.path('/' + pageName).search(params);

        // [{class:GetAdjacentIds\,fields:{view:{viewEdges:[],edgeFilters:{},viewEntities:[],entityFilters:{},namedViews:[],summarise:true},input:[],inputPairs:[],inputB:[],options:null},dates:{startDate:null,endDate:null}}]
    }

    return navigation;
}]);
