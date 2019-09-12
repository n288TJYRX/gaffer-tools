import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResultsComponent } from './results.component';
import { MaterialModule } from '../material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HtmlComponent } from './html/html.component';
import { TableComponent } from './table/table.component';
import { BarComponent } from './bar/bar.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { PieComponent } from './pie/pie.component';
import { LineComponent } from './line/line.component';

@NgModule({
  declarations: [ResultsComponent, HtmlComponent, TableComponent, BarComponent, PieComponent, LineComponent],
  imports: [
    CommonModule, MaterialModule, FlexLayoutModule, NgxChartsModule
  ]
})
export class ResultsModule { }
