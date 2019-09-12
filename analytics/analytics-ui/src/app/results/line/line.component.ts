import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-line',
  templateUrl: './line.component.html',
  styleUrls: ['./line.component.css']
})
export class LineComponent {

  multi = [
    {
      "name": "Switzerland",
      "series": [
        {
          "value": 3484,
          "name": "2016-09-17T15:20:13.998Z"
        },
        {
          "value": 3810,
          "name": "2016-09-21T20:36:13.506Z"
        },
        {
          "value": 3336,
          "name": "2016-09-23T15:21:50.181Z"
        },
        {
          "value": 4965,
          "name": "2016-09-16T00:53:38.609Z"
        },
        {
          "value": 6497,
          "name": "2016-09-18T07:35:09.240Z"
        }
      ]
    },
    {
      "name": "Lesotho",
      "series": [
        {
          "value": 6082,
          "name": "2016-09-17T15:20:13.998Z"
        },
        {
          "value": 6408,
          "name": "2016-09-21T20:36:13.506Z"
        },
        {
          "value": 5113,
          "name": "2016-09-23T15:21:50.181Z"
        },
        {
          "value": 5454,
          "name": "2016-09-16T00:53:38.609Z"
        },
        {
          "value": 5809,
          "name": "2016-09-18T07:35:09.240Z"
        }
      ]
    },
    {
      "name": "Ethiopia",
      "series": [
        {
          "value": 2943,
          "name": "2016-09-17T15:20:13.998Z"
        },
        {
          "value": 4683,
          "name": "2016-09-21T20:36:13.506Z"
        },
        {
          "value": 4041,
          "name": "2016-09-23T15:21:50.181Z"
        },
        {
          "value": 6848,
          "name": "2016-09-16T00:53:38.609Z"
        },
        {
          "value": 6413,
          "name": "2016-09-18T07:35:09.240Z"
        }
      ]
    },
    {
      "name": "Colombia",
      "series": [
        {
          "value": 6675,
          "name": "2016-09-17T15:20:13.998Z"
        },
        {
          "value": 3146,
          "name": "2016-09-21T20:36:13.506Z"
        },
        {
          "value": 5604,
          "name": "2016-09-23T15:21:50.181Z"
        },
        {
          "value": 2528,
          "name": "2016-09-16T00:53:38.609Z"
        },
        {
          "value": 4136,
          "name": "2016-09-18T07:35:09.240Z"
        }
      ]
    },
    {
      "name": "Trinidad and Tobago",
      "series": [
        {
          "value": 5743,
          "name": "2016-09-17T15:20:13.998Z"
        },
        {
          "value": 3189,
          "name": "2016-09-21T20:36:13.506Z"
        },
        {
          "value": 2192,
          "name": "2016-09-23T15:21:50.181Z"
        },
        {
          "value": 4688,
          "name": "2016-09-16T00:53:38.609Z"
        },
        {
          "value": 4794,
          "name": "2016-09-18T07:35:09.240Z"
        }
      ]
    }
  ];

  view: any[] = [700, 400];

  // options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Country';
  showYAxisLabel = true;
  yAxisLabel = 'Population';

  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  // line, area
  autoScale = true;

  constructor() {
  }

  onSelect(event) {
    console.log(event);
  }

}
