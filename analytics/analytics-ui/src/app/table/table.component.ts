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

import { Component, OnInit, Injectable, ViewChild } from '@angular/core'
import { MatSort, MatTableDataSource } from '@angular/material'
import { cloneDeep, union } from 'lodash'

import { ResultsService } from '../gaffer/results.service'
import { TypeService } from '../gaffer/type.service'
import { TimeService } from '../gaffer/time.service'
import { SchemaService } from '../gaffer/schema.service'

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html'
})
@Injectable()
export class TableComponent implements OnInit {
  data = {
    results: new MatTableDataSource([])
  }
  @ViewChild(MatSort) sort: MatSort
  displayedColumns: Set<any>
  schema = { edges: {}, entities: {}, types: {} }

  constructor(
    private results: ResultsService,
    private types: TypeService,
    private time: TimeService,
    private schemaService: SchemaService
  ) {}

  /**
   * Fetches the results. It first loads the latest types from the config and the latest schema.
   */
  ngOnInit() {
    this.types.get().subscribe(() => {
      this.schemaService.get().subscribe(schema => {
        this.schema = schema
      })
      const sortedResults = {
        edges: [],
        entities: [],
        other: []
      }
      const results = this.results.get()
      for (const i in results) {
        if (results[i]['class'].split('.').pop() === 'Entity') {
          sortedResults.entities.push(results[i])
        } else if (results[i]['class'].split('.').pop() === 'Edge') {
          sortedResults.edges.push(results[i])
        } else {
          sortedResults.other.push(results[i])
        }
      }

      this.processResults(sortedResults)
    })
  }

  private processResults = function(resultsData) {
    const ids = []
    const groupByProperties = []
    const properties = []
    this.resultsByType = {}
    this.data.tooltips = {}

    // Transform the edges into a displayable form
    this.processElements(
      'Edge',
      'edges',
      ['resultType', 'GROUP', 'SOURCE', 'DESTINATION', 'DIRECTED'],
      ids,
      groupByProperties,
      properties,
      resultsData
    )
    // Transform the entities into a displayable form
    this.processElements(
      'Entity',
      'entities',
      ['resultType', 'GROUP', 'SOURCE'],
      ids,
      groupByProperties,
      properties,
      resultsData
    )
    // Transform the other types into a displayable form
    this.processOtherTypes(ids, properties, resultsData)

    this.data.allColumns = union(union(ids, groupByProperties), properties)

    if (!this.data.columns || this.data.columns.length === 0) {
      this.data.columns = cloneDeep(this.data.allColumns)
    }
    this.data.allTypes = []
    this.data.allGroups = []
    for (const type in this.resultsByType) {
      this.data.allTypes.push(type)
      for (const group in this.resultsByType[type]) {
        this.data.allGroups = union(group, this.data.allGroups)
      }
    }

    if (!this.data.types || this.data.types.length === 0) {
      this.data.types = cloneDeep(this.data.allTypes)
    }
    if (!this.data.groups || this.data.groups.length === 0) {
      this.data.groups = cloneDeep(this.data.allGroups)
    }

    this.updateFilteredResults()
  }

  updateFilteredResults = function() {
    this.data.results = []
    for (const t in this.data.types) {
      if (this.data.types[t] in this.resultsByType) {
        for (const g in this.data.groups) {
          if (this.data.groups[g] in this.resultsByType[this.data.types[t]]) {
            this.data.results = this.data.results.concat(
              this.resultsByType[this.data.types[t]][this.data.groups[g]]
            )
          }
        }
      }
    }
    // Set the results to be displayed in the table
    this.data.results = new MatTableDataSource(this.data.results)
    this.columnsToDisplay = this.data.columns
  }

  private processElements = function(
    type,
    typePlural,
    idKeys,
    ids,
    groupByProperties,
    properties,
    resultsData
  ) {
    // If there are elements of this type
    if (
      resultsData[typePlural] &&
      Object.keys(resultsData[typePlural]).length > 0
    ) {
      this.resultsByType[type] = []
      ids = union(idKeys, ids)
      // For each element
      for (const i in resultsData[typePlural]) {
        const element = resultsData[typePlural][i]
        if (element) {
          // Convert the ids (i.e. result type, GROUP and SOURCE) into a displayable form for the table
          const result = {}
          for (const idIndex in idKeys) {
            const id = idKeys[idIndex]
            if ('SOURCE' === id && element.source === undefined) {
              result[id] = this.convertValue(id, element.vertex)
            } else {
              result[id] = this.convertValue(id, element[id.toLowerCase()])
            }
          }
          result['resultType'] = type

          // Get all of the properties to show in the table
          if (element.properties) {
            if (!(element.group in this.resultsByType[type])) {
              this.resultsByType[type][element.group] = []

              const elementDef = this.schema[typePlural][element.group]
              if (elementDef && elementDef.properties) {
                if (elementDef.groupBy) {
                  for (const j in elementDef.groupBy) {
                    const propName = elementDef.groupBy[j]
                    const typeDef = this.schema.types[
                      elementDef.properties[propName]
                    ]
                    if (
                      typeDef &&
                      typeDef.description &&
                      !(propName in this.data.tooltips)
                    ) {
                      this.data.tooltips[propName] = typeDef.description
                    }
                    groupByProperties = union(propName, groupByProperties)
                  }
                }
                for (const propertyName in elementDef.properties) {
                  const typeDef = this.schema.types[
                    elementDef.properties[propertyName]
                  ]
                  if (
                    typeDef &&
                    typeDef.description &&
                    !(propertyName in this.data.tooltips)
                  ) {
                    this.data.tooltips[propertyName] = typeDef.description
                  }
                  properties = union(propertyName, properties)
                }
              }
            }
            for (const prop in element.properties) {
              properties = union(prop, properties)
              result[prop] = this.convertValue(prop, element.properties[prop])
            }
          }
          if (!(element.group in this.resultsByType[type])) {
            this.resultsByType[type][element.group] = []
          }
          this.resultsByType[type][element.group].push(result)
        }
      }
    }
  }

  private processOtherTypes = function(ids, properties, resultsData) {
    for (const i in resultsData.other) {
      const item = resultsData.other[i]
      if (item) {
        const result = { GROUP: '' }
        for (const key in item) {
          const value = this.convertValue(key, item[key])
          if ('class' === key) {
            result['resultType'] = item[key].split('.').pop()
            ids = union('resultType', ids)
          } else if ('vertex' === key) {
            result['SOURCE'] = value
            ids = union('SOURCE', ids)
          } else if (
            'source' === key ||
            'destination' === key ||
            'directed' === key ||
            'group' === key
          ) {
            const parsedKey = key.toUpperCase()
            result[parsedKey] = value
            ids = union(parsedKey, ids)
          } else if ('value' === key) {
            result[key] = value
            ids = union(key, ids)
          } else {
            result[key] = value
            properties = union(key, properties)
          }
        }
        if (!(result['resultType'] in this.resultsByType)) {
          this.resultsByType[result['resultType']] = {}
        }
        if (!(result.GROUP in this.resultsByType[result['resultType']])) {
          this.resultsByType[result['resultType']][result.GROUP] = []
        }
        this.resultsByType[result['resultType']][result.GROUP].push(result)
      }
    }
  }

  private convertValue = function(name, value) {
    let parsedValue = value
    if (parsedValue) {
      parsedValue = this.types.getShortValue(parsedValue)
      if (this.time.isTimeProperty(name)) {
        parsedValue = this.time.getDateString(name, parsedValue)
      }
    }
    return parsedValue
  }
}