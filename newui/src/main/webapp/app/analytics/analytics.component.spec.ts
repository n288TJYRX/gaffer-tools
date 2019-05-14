import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Input, Component } from '@angular/core';
import { empty, Observable, from, throwError} from "rxjs";

import { AnalyticsComponent } from './analytics.component';
import { AnalyticsService } from '../gaffer/analytics.service';
import { ErrorService } from '../dynamic-input/error.service';
import { MatGridListModule, MatCardModule, MatTooltipModule } from '@angular/material';

class AnalyticsServiceStub {
  reloadAnalytics = () => {
    return empty();
  }
}

@Component({
  selector: "app-analytic",
  templateUrl: '../analytic/analytic.component.html'
})
class AnalyticComponentStub {
  @Input("model") model;
}

class ErrorServiceStub {
  handle = (data) => {
  }
}

describe('AnalyticsComponent', () => {
  let component: AnalyticsComponent;
  let fixture: ComponentFixture<AnalyticsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AnalyticsComponent, AnalyticComponentStub ],
      providers: [
        { provide: AnalyticsService, useClass: AnalyticsServiceStub},
        { provide: ErrorService, useClass: ErrorServiceStub}
      ],
      imports: [
        MatGridListModule,
        MatCardModule,
        MatTooltipModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyticsComponent);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should call reload analytics at initialisation', () => {
    let spy = spyOn(component, 'reloadAnalytics');
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledWith();
  })

  it('should set analytics if successfully loads analytics', () => {
    let testData = 'Test data';
    let analyticsService = TestBed.get(AnalyticsService);
    spyOn(analyticsService, 'reloadAnalytics').and.returnValue(from([testData]));
    
    component.reloadAnalytics();

    expect(component.analytics).toEqual(testData);
  });

  it('should show error if fails to load analytics', () => {
    let error = new Error()
    let testData = throwError(error);
    let analyticsService = TestBed.get(AnalyticsService);
    spyOn(analyticsService, 'reloadAnalytics').and.returnValue(testData);
    let errorService = TestBed.get(ErrorService);
    let spy = spyOn(errorService, 'handle');

    component.reloadAnalytics();

    expect(spy).toHaveBeenCalledWith("Error loading operations, see the console for details",null,error);
  });
});
