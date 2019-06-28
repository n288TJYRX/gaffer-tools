/*
 * Copyright 2019 Crown Copyright
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

import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { AnalyticsService } from '../gaffer/analytics.service';
import { DynamicFormComponent } from '../components/dynamic-form/dynamic-form.component';
import { FieldConfig } from '../field.interface';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-parameter-form',
  templateUrl: './parameter-form.component.html'
})
export class ParameterFormComponent implements OnInit {
  @Input() parameters;

  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;
  regConfig: FieldConfig[] = [
    {
      type: 'input',
      label: 'Username',
      inputType: 'text',
      name: 'name',
      validations: [
        {
          name: 'required',
          validator: Validators.required,
          message: 'Name Required'
        },
        {
          name: 'pattern',
          validator: Validators.pattern('^[a-zA-Z]+$'),
          message: 'Accept only text'
        }
      ]
    },
    {
      type: 'input',
      label: 'Email Address',
      inputType: 'email',
      name: 'email',
      validations: [
        {
          name: 'required',
          validator: Validators.required,
          message: 'Email Required'
        },
        {
          name: 'pattern',
          validator: Validators.pattern(
            '^[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$'
          ),
          message: 'Invalid email'
        }
      ]
    },
    {
      type: 'input',
      label: 'Password',
      inputType: 'password',
      name: 'password',
      validations: [
        {
          name: 'required',
          validator: Validators.required,
          message: 'Password Required'
        }
      ]
    },
    {
      type: 'radiobutton',
      label: 'Gender',
      name: 'gender',
      options: ['Male', 'Female'],
      value: 'Male'
    },
    {
      type: 'date',
      label: 'DOB',
      name: 'dob',
      validations: [
        {
          name: 'required',
          validator: Validators.required,
          message: 'Date of Birth Required'
        }
      ]
    },
    {
      type: 'select',
      label: 'Country',
      name: 'country',
      value: 'UK',
      options: ['India', 'UAE', 'UK', 'US']
    },
    {
      type: 'checkbox',
      label: 'Accept Terms',
      name: 'term',
      value: true
    },
    {
      type: 'button',
      label: 'Save'
    }
  ];

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit() {}

  /** Update the analytic operation whenever a parameter changes */
  onChange = function(parameter, parameterName) {
    this.analyticsService.updateAnalytic(parameter, parameterName);
    const analytic = this.analyticsService.getAnalytic();
    this.parameters = analytic.uiMapping;
  };
}
