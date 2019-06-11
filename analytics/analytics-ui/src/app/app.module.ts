import { BrowserModule } from '@angular/platform-browser'
import { FormsModule } from '@angular/forms' // <-- NgModel lives here
import { NgModule } from '@angular/core'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { UpgradeModule } from '@angular/upgrade/static'
import { MaterialModule } from './material.module'
import { LayoutModule } from '@angular/cdk/layout'
import { FlexLayoutModule } from '@angular/flex-layout'
import { AppRoutingModule } from './app-routing.module'
import { HttpClientModule } from '@angular/common/http'
import { ToastrModule } from 'ngx-toastr'

import { AppComponent } from './app.component'
import { OperationComponent } from './operation/operation.component'
import { TableComponent } from './table/table.component'
import { AnalyticsComponent } from './analytics/analytics.component'
import { AnalyticComponent } from './analytic/analytic.component'
import { NavComponent } from './nav/nav.component'
import { ParameterFormComponent } from './parameter-form/parameter-form.component'
import { ParameterInputComponent } from './parameter-input/parameter-input.component'

import { AnalyticsService } from './gaffer/analytics.service'
import { ErrorService } from './dynamic-input/error.service'
import { EndpointService } from './config/endpoint-service'
import { QueryService } from './gaffer/query.service'
import { ResultsService } from './gaffer/results.service'
import { TypeService } from './gaffer/type.service'
import { TimeService } from './gaffer/time.service'
import { SchemaService } from './gaffer/schema.service'

@NgModule({
  declarations: [
    AppComponent,
    AnalyticsComponent,
    AnalyticComponent,
    OperationComponent,
    NavComponent,
    TableComponent,
    ParameterFormComponent,
    ParameterInputComponent
  ],
  imports: [
    BrowserModule,
    UpgradeModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    LayoutModule,
    FlexLayoutModule,
    ToastrModule.forRoot()
  ],
  providers: [
    AnalyticsService,
    ErrorService,
    EndpointService,
    QueryService,
    ResultsService,
    TypeService,
    TimeService,
    SchemaService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private upgrade: UpgradeModule) {}
  ngDoBootstrap() {
    this.upgrade.bootstrap(document.body, ['myApp'], { strictDi: true })
  }
}
