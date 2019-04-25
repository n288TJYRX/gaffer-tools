import { Component, OnInit } from "@angular/core";
import { OperationService } from '../gaffer/operation.service';

@Component({
  selector: "app-analytics",
  templateUrl: "./analytics.component.html",
  styleUrls: ["./analytics.component.css"]
})
export class AnalyticsComponent implements OnInit {
  availableOperations;
  analytics = [[], []];

  constructor(private operationService: OperationService) {}

  ngOnInit() {
    //this.analytics = analytics.reloadAnalytics();
    this.reloadOperations(); // Load the operations
  }

  // analytics = [
  //   "Get Adjacent Ids",
  //   "Get All Elements",
  //   "frequent-vehicles-in-region"
  // ];

  //delete most of this left over from operation chain
  populateOperations = function(availableOperations) {
    this.availableOperations = [];

    for (var i in availableOperations) {
      var operation = availableOperations[i];

      if (
        !this.previous ||
        !this.previous.selectedOperation ||
        !this.previous.selectedOperation.next ||
        this.previous.selectedOperation.next.indexOf(operation.class) > -1
      ) {
        operation.formattedName =
          operation.name !== undefined
            ? operation.name.toLowerCase().replace(/\s+/g, "")
            : "";
        operation.formattedDescription =
          operation.description !== undefined
            ? operation.description.toLowerCase().replace(/\s+/g, "")
            : "";

        if (operation.formattedName === "getelements") {
          this.placeholder = "Search for an operation (e.g Get Elements)";
        }
        this.availableOperations.push(operation);
      }
    }

    this.availableOperations.sort(function(a, b) {
      if (a.namedOp && !b.namedOp) {
        return -1;
      }
      if (!a.namedOp && b.namedOp) {
        return 1;
      }
      if (a.formattedName > b.formattedName) {
        return 1;
      }
      if (a.formattedName < b.formattedName) {
        return -1;
      }
      if (a.formattedDescription > b.formattedDescription) {
        return 1;
      }
      if (a.formattedDescription < b.formattedDescription) {
        return -1;
      }
      return 0;
    });

    // Hard code the other data I assume we will get when we load up the analytic
    var operationNames = ["Frequent Vehicles In Region", "Another Analytic"];
    var descriptions = [
      "Displays frequent vehicles in region as a table of results.",
      "Another description"
    ];
    var operation1 = {
      class: "uk.gov.gchq.gaffer.named.operation.NamedOperation",
      fields: "some field",
      parameters: [
        "Result Limit",
        "Start Date (YYYY-MM-DD)",
        "End Date (YYYY-MM-DD)",
        "Vehicle Type"
      ],
      operationName: "frequent-vehicles-in-region"
    };
    var operation2 = {
      fields: {
        input: "some input",
        inputB: "some other input",
        view: "some view"
      }
    };
    var readAccessRoles = ["User", "User"];
    var writeAccessRoles = ["User", "User"];
    var operations = [operation1, operation2];
    var parameters = [
      [
        "Result Limit",
        "Start Date (YYYY-MM-DD)",
        "End Date (YYYY-MM-DD)",
        "Vehicle Type"
      ]
    ];
    var outputTypes = ["table", "table"];
    var score = [2, 3];
    var color = ["red", "yellow"];
    var icons = ["star", "directions_bus"]; //some names of icons from img folder

    // Create the analytics from this hard coded data
    var _i = 0;
    for (_i = 0; _i < 2; _i++) {
      //this.analytics[i].operation = availableOperations[i];

      this.analytics[_i].operationName = operationNames[_i];
      this.analytics[_i].description = descriptions[_i];
      this.analytics[_i].operations = operations[_i];
      this.analytics[_i].readAccessRoles = readAccessRoles[_i];
      this.analytics[_i].writeAccessRoles = writeAccessRoles[_i];
      this.analytics[_i].parameters = parameters[_i];
      this.analytics[_i].outputType = [];
      this.analytics[_i].outputType.output = outputTypes[_i];
      this.analytics[_i].score = score[_i];
      this.analytics[_i].color = color[_i];
      this.analytics[_i].header = [];
      this.analytics[_i].header.iconURL = icons[_i];
    }
    console.log(this.analytics);
    this.analytics = this.availableOperations;
  };

  // Delete this?
  getOperations = function() {
    return this.operationService
      .getAvailableOperations(true)
      .then(function(ops) {
        this.populateOperations(ops);
        return this.availableOperations;
      });
  };

  // load the operations
  reloadOperations = function() {
    this.operationService.reloadOperations(true).subscribe(
      availableOperations => {
        console.log(availableOperations)
        this.populateOperations(availableOperations)},
      err => console.log(err));
    //this.populateOperations()
    //use error service to handle error
  };
}