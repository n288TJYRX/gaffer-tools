/*
 * Copyright 2018-2019 Crown Copyright
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

import { of, Observable, Observer } from 'rxjs';
import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';

import { ConfigService } from '../config/config.service';

/**
 * This simple service stores and serves to the default operation options
 */
@Injectable()
export class OperationOptionsService {

    defaultOperationOptionsConfiguration = null;

    constructor(private config: ConfigService) {}

    /**
     * Updates the default configuration for options components
     * @param {Object} newDefaults
     */
    setDefaultConfiguration = function(newDefaults) {
        this.defaultOperationOptionsConfiguration = cloneDeep(newDefaults);
    }

    /**
     * Gets the default configuration for options components
     */
    getDefaultConfiguration = function() {
        return cloneDeep(this.defaultOperationOptionsConfiguration);
    }

    /**
     * Derives the operation options to be inserted into a query
     * from the default operation options configuration
     */
    getDefaultOperationOptions = function() {
        return this.extractOperationOptions(this.defaultOperationOptionsConfiguration)
    }


    /**
     * Asynchronous method which guarentees that correct default operation options,
     * even if they have not yet been loaded. If they have already been set, it returns an
     * asychrounous wrapper for the current options. If not, it gets the default from the
     * configuration service.
     */
    getDefaultOperationOptionsAsync = function() {
        if (this.defaultOperationOptionsConfiguration !== null) {
            return of(this.getDefaultOperationOptions());
        }

        var observable = Observable.create((observer: Observer<String>) => {
            this.config.get().subscribe((conf) => {
                var defaultConfiguration = conf.operationOptions;
                observer.next(this.extractOperationOptions(defaultConfiguration));
            });
        });

        return observable;
    }

    /**
     * Derives the operation options from any operation options configuration;
     * @param {Object} operationOptionsConfiguration
     */
    extractOperationOptions = function(operationOptionsConfiguration) {
        if (operationOptionsConfiguration === undefined) {  // undefined configuration implies explicitly that no options were configured
            return undefined;
        }

        var options = {};
        if (operationOptionsConfiguration === null) {   // null configuration implies that the configuration has not been fetched yet
            return options;
        }

        for (var i in operationOptionsConfiguration.visible) {
            var option = operationOptionsConfiguration.visible[i];

            if (option.value !== undefined) {
                if (Array.isArray(option.value)) {
                    if (option.value.length) {
                        options[option.key] = option.value.join(',');
                    }
                } else {
                    options[option.key] = option.value
                }
            }
        }

        return options;
    }
};