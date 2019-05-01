import { Component, OnInit, Input } from "@angular/core";
import { AnalyticsService } from '../gaffer/analytics.service';

@Component({
  selector: "app-parameter-form",
  templateUrl: "./parameter-form.component.html",
  styleUrls: ["./parameter-form.component.css"]
})
export class ParameterFormComponent implements OnInit {
  @Input("parameters") parameters;
  title;

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit() {
    console.log(this.parameters);

    //Check there are parameters
    if (this.parameters === null || this.parameters === undefined) {
      throw "Expected defined, non-null value for parameters. Got " +
        this.parameters;
    }

    //Check we have only one parameter
    // if (Array.isArray(this.parameters)) {
    //   if (!Array.isArray(this.parameters[0]) {
    //     let array = [];
    //     this.parameters
    //   }
    // }

    if (!this.title) {
      this.title = "Parameters";
    }
  }

  getTimeUnit = function(parameterName) {
    var metaData = this.time.getTimeMetaData(parameterName);
    return metaData ? metaData.unit : undefined;
  };

  //Update the analytic operation whenever a parameter changes
  onChange = function(parameter, parameterName) {
    console.log(parameter);
    console.log(parameterName);
    console.log(this.parameters);
    this.analyticsService.updateAnalytic(this.parameters, parameter, parameterName);
  }
}
