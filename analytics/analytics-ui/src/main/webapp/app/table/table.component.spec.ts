import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTableModule, MatCardModule, MatTableDataSource } from '@angular/material';
import { empty} from "rxjs";

import { TableComponent } from './table.component';
import { ResultsService } from '../gaffer/results.service';

class ResultsServiceStub {
  get = () => {
    return [];
  }
}

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableComponent ],
      imports: [
        MatTableModule,
        MatCardModule
      ],
      providers: [
        { provide: ResultsService, useClass: ResultsServiceStub },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should get the results at initialisation', () => {
    let resultsService = TestBed.get(ResultsService);
    let spy = spyOn(resultsService, 'get');

    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
  })

  it('should update the table at initialisation', () => {
    let spy = spyOn(component, 'onResultsUpdated');

    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
  });

  it('should be able to update the results', () => {
    component.data = {
      results: new MatTableDataSource([0])
    };
    let arrayNewResults = [0,1,2];
    fixture.detectChanges();

    component.onResultsUpdated(arrayNewResults);

    expect(component.data.results.data).toEqual(arrayNewResults);
  });

  it('should be able to calculate the columns', () => {
    component.displayedColumns = new Set();
    let arrayNewResults = [{key1: 'key1 value'},
                           {key2: 'key2 value'}];
    let keys = new Set(['key1','key2']);
    fixture.detectChanges();

    component.onResultsUpdated(arrayNewResults)

    expect(component.displayedColumns).toEqual(keys);
  });

  it('should not display the properties column', () => {
    let results = [
      { key1: 'key1 value',
        properties: { 'count' : 10 }
      },
      { key2: 'key2 value',
        properties: { 'count' : 20 }
      }
    ];

    component.onResultsUpdated(results);

    expect(component.displayedColumns.has('properties')).toBeFalsy();
  })

  it('should display the count column if there is count data', () => {
    let results = [
      { key1: 'key1 value',
        properties: { 'count' : 10 }
      },
      { key2: 'key2 value',
        properties: { 'count' : 20 }
      }
    ];
    
    component.onResultsUpdated(results);

    expect(component.displayedColumns.has('count')).toBeTruthy();
  })

  it('should strip the class name', () => {
    let results = [
      { key1: 'key1 value',
        class: 'test.class.name.Entity',
        properties: { 'count' : 10 }
      }
    ];

    component.onResultsUpdated(results);

    expect(component.data.results.data[0]['class']).toEqual('Entity');
  })
});
