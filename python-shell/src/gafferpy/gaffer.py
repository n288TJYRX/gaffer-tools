#
# Copyright 2016 Crown Copyright
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

"""
This module contains Python copies of Gaffer java classes
"""

import json


class ToJson:
    """
    Enables implementations to be converted to json via a to_json method
    """

    def __repr__(self):
        return json.dumps(self.to_json())

    def to_json(self):
        """
        Converts an object to a simple json dictionary
        """
        raise NotImplementedError('Use an implementation')

    def __str__(self):
        return str(self.to_json())

    def __eq__(self, other):
        return self.to_json() == other.to_json()


class ResultConverter:
    @staticmethod
    def to_gaffer_objects(result):
        objs = result
        if result is not None and isinstance(result, list):
            objs = []
            for result_item in result:
                if 'class' in result_item:
                    if result_item[
                        'class'] == 'uk.gov.gchq.gaffer.data.element.Entity':
                        element = Entity(result_item['group'],
                                         result_item['vertex'])
                        if 'properties' in result_item:
                            element.properties = result_item['properties']
                        objs.append(element)
                    elif result_item[
                        'class'] == 'uk.gov.gchq.gaffer.data.element.Edge':
                        element = Edge(result_item['group'],
                                       result_item['source'],
                                       result_item['destination'],
                                       result_item['directed'])
                        if 'properties' in result_item:
                            element.properties = result_item['properties']
                        if 'matchedVertex' in result_item:
                            element.matched_vertex = result_item[
                                'matchedVertex']
                        objs.append(element)
                    elif result_item[
                        'class'] == 'uk.gov.gchq.gaffer.operation.data.EntitySeed':
                        objs.append(EntitySeed(result_item['vertex']))
                    elif result_item[
                        'class'] == 'uk.gov.gchq.gaffer.operation.data.EdgeSeed':
                        seed = EdgeSeed(result_item['source'],
                                        result_item['destination'],
                                        result_item['directed'])
                        if 'matchedVertex' in result_item:
                            seed.matched_vertex = result_item['matchedVertex']
                        objs.append(seed)
                    else:
                        raise TypeError(
                            'Element type is not recognised: ' + str(
                                result_item))
                elif 'vertex' in result_item:
                    objs.append(EntitySeed(result_item['vertex']))
                else:
                    objs.append(result_item)

        # Return the objects
        return objs


class ElementSeed(ToJson):
    def __repr__(self):
        return json.dumps(self.to_json())

    def to_json(self):
        raise NotImplementedError('Use either EntitySeed or EdgeSeed')

    def to_json_wrapped(self):
        raise NotImplementedError('Use either EntitySeed or EdgeSeed')


class EntitySeed(ElementSeed):
    def __init__(self, vertex):
        super().__init__()
        self.vertex = vertex

    def to_json(self):
        return {'class': 'uk.gov.gchq.gaffer.operation.data.EntitySeed',
                'vertex': self.vertex}

    def to_json_wrapped(self):
        return {
            'uk.gov.gchq.gaffer.operation.data.EntitySeed': {
                'vertex': self.vertex
            }
        }


class EdgeSeed(ElementSeed):
    def __init__(self, source, destination, directed, matched_vertex=None):
        super().__init__()
        self.source = source
        self.destination = destination
        if isinstance(directed, str):
            self.directed = directed
        elif directed:
            self.directed = DirectedType.DIRECTED
        else:
            self.directed = DirectedType.UNDIRECTED
        self.matched_vertex = matched_vertex

    def to_json(self):
        seed = {
            'class': 'uk.gov.gchq.gaffer.operation.data.EdgeSeed',
            'source': self.source,
            'destination': self.destination,
            'directed': self.directed
        }

        if self.matched_vertex is not None:
            seed['matchedVertex'] = self.matched_vertex

        return seed

    def to_json_wrapped(self):
        seed = {
            'source': self.source,
            'destination': self.destination,
            'directed': self.directed
        }

        if self.matched_vertex is not None:
            seed['matchedVertex'] = self.matched_vertex

        return {
            'uk.gov.gchq.gaffer.operation.data.EdgeSeed': seed
        }


class Comparator(ToJson):
    def __init__(self, class_name, fields):
        super().__init__()

        self.class_name = class_name
        self.fields = fields

    def to_json(self):
        json = {
            'class': self.class_name
        }

        if self.fields is not None:
            for key in self.fields:
                json[key] = self.fields[key]

        return json


class ElementPropertyComparator(Comparator):
    def __init__(self, groups, property, reversed=False):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.data.element.comparison.ElementPropertyComparator',
            fields={
                'groups': groups,
                'property': property,
                'reversed': reversed
            }
        )


class SeedPair(ToJson):
    def __init__(self, first, second):
        super().__init__()

        if isinstance(first, ElementSeed):
            self.first = first
        else:
            self.first = EntitySeed(first)

        if isinstance(second, ElementSeed):
            self.second = second
        else:
            self.second = EntitySeed(second)

    def to_json(self):
        return {
            'class': 'uk.gov.gchq.gaffer.commonutil.pair.Pair',
            'first': self.first.to_json_wrapped(),
            'second': self.second.to_json_wrapped()
        }


class Element(ToJson):
    def __init__(self, class_name, group, properties=None):
        super().__init__()
        if not isinstance(class_name, str):
            raise TypeError('ClassName must be a class name string')
        if not isinstance(group, str):
            raise TypeError('Group must be a string')
        if not isinstance(properties, dict) and properties is not None:
            raise TypeError('properties must be a dictionary or None')
        self.class_name = class_name
        self.group = group
        self.properties = properties

    def to_json(self):
        element = {'class': self.class_name, 'group': self.group}
        if self.properties is not None:
            element['properties'] = self.properties
        return element


class Entity(Element):
    def __init__(self, group, vertex, properties=None):
        super().__init__('uk.gov.gchq.gaffer.data.element.Entity', group,
                         properties)
        self.vertex = vertex

    def to_json(self):
        entity = super().to_json()
        entity['vertex'] = self.vertex
        return entity


class Edge(Element):
    def __init__(self, group, source, destination, directed, properties=None,
                 matched_vertex=None):
        super().__init__('uk.gov.gchq.gaffer.data.element.Edge', group,
                         properties)
        # Validate the arguments
        if not isinstance(directed, bool):
            raise TypeError('Directed must be a boolean')
        self.source = source
        self.destination = destination
        self.directed = directed
        self.matched_vertex = matched_vertex

    def to_json(self):
        edge = super().to_json()
        edge['source'] = self.source
        edge['destination'] = self.destination
        edge['directed'] = self.directed
        if self.matched_vertex is not None:
            edge['matchedVertex'] = self.matched_vertex

        return edge


class View(ToJson):
    def __init__(self, entities=None, edges=None):
        super().__init__()
        self.entities = entities
        self.edges = edges

    def to_json(self):
        view = {}
        if self.entities is not None:
            el_defs = {}
            for el_def in self.entities:
                el_defs[el_def.group] = el_def.to_json()
            view['entities'] = el_defs
        if self.edges is not None:
            el_defs = {}
            for el_def in self.edges:
                el_defs[el_def.group] = el_def.to_json()
            view['edges'] = el_defs

        return view


class ElementDefinition(ToJson):
    def __init__(self, group,
                 transient_properties=None,
                 group_by=None,
                 pre_aggregation_filter_functions=None,
                 post_aggregation_filter_functions=None,
                 transform_functions=None,
                 post_transform_filter_functions=None):
        super().__init__()
        self.group = group
        self.transient_properties = transient_properties
        self.pre_aggregation_filter_functions = pre_aggregation_filter_functions
        self.post_aggregation_filter_functions = post_aggregation_filter_functions
        self.transform_functions = transform_functions
        self.post_transform_filter_functions = post_transform_filter_functions
        if group_by is None:
            group_by = []
        self.group_by = group_by

    def to_json(self):
        element_def = {}
        if self.transient_properties is not None:
            props = {}
            for prop in self.transient_properties:
                props[prop.name] = prop.class_name
            element_def['transientProperties'] = props
        if self.pre_aggregation_filter_functions is not None:
            funcs = []
            for func in self.pre_aggregation_filter_functions:
                funcs.append(func.to_json())
            element_def['preAggregationFilterFunctions'] = funcs
        if self.post_aggregation_filter_functions is not None:
            funcs = []
            for func in self.post_aggregation_filter_functions:
                funcs.append(func.to_json())
            element_def['postAggregationFilterFunctions'] = funcs
        if self.transform_functions is not None:
            funcs = []
            for func in self.transform_functions:
                funcs.append(func.to_json())
            element_def['transformFunctions'] = funcs
        if self.post_transform_filter_functions is not None:
            funcs = []
            for func in self.post_transform_filter_functions:
                funcs.append(func.to_json())
            element_def['postTransformFilterFunctions'] = funcs
        element_def['groupBy'] = self.group_by
        return element_def


class Property(ToJson):
    def __init__(self, name, class_name):
        super().__init__()
        if not isinstance(name, str):
            raise TypeError('Name must be a string')
        if not isinstance(class_name, str):
            raise TypeError('ClassName must be a class name string')
        self.name = name
        self.class_name = class_name

    def to_json(self):
        return {self.name: self.class_name}


class GafferFunction(ToJson):
    def __init__(self, class_name, classType, function_fields=None):
        super().__init__()
        self.class_name = class_name
        self.function_fields = function_fields
        self.classType = classType

    def to_json(self):
        function_context = {}
        function = {'class': self.class_name}
        if self.function_fields is not None:
            for key in self.function_fields:
                function[key] = self.function_fields[key]
        function_context[self.classType] = function

        return function_context


class FilterFunction(GafferFunction):
    def __init__(self, class_name, selection, function_fields=None):
        super().__init__(class_name, 'predicate', function_fields)
        self.selection = selection

    def to_json(self):
        function_context = super().to_json()
        function_context['selection'] = self.selection

        return function_context


class TransformFunction(GafferFunction):
    def __init__(self, class_name, selection, projection, function_fields=None):
        super().__init__(class_name, 'function', function_fields)
        self.selection = selection
        self.projection = projection

    def to_json(self):
        function_context = super().to_json()
        function_context['selection'] = self.selection
        function_context['projection'] = self.projection

        return function_context


class DirectedType:
    EITHER = 'EITHER'
    DIRECTED = 'DIRECTED'
    UNDIRECTED = 'UNDIRECTED'


class InOutType:
    EITHER = 'EITHER'
    IN = 'INCOMING'
    OUT = 'OUTGOING'


class SeedMatchingType:
    RELATED = 'RELATED'
    EQUAL = 'EQUAL'


class EdgeVertices:
    NONE = 'NONE'
    SOURCE = 'SOURCE'
    DESTINATION = 'DESTINATION'
    BOTH = 'BOTH'


class UseMatchedVertex:
    IGNORE = 'IGNORE'
    EQUAL = 'EQUAL'
    OPPOSITE = 'OPPOSITE'


class NamedOperationParameter:
    def __init__(self,
                 name,
                 value_class,
                 description=None,
                 default_value=None,
                 required=False):
        self.name = name
        self.value_class = value_class
        self.description = description
        self.default_value = default_value
        self.required = required

    def get_detail(self):
        detail = {
            "valueClass": self.value_class,
            "required": self.required
        }
        if self.description is not None:
            detail['description'] = self.description
        if self.default_value is not None:
            detail['defaultValue'] = self.default_value
        return detail


class OperationChain(ToJson):
    def __init__(self, operations):
        self.operations = operations

    def to_json(self):
        operations_json = []
        for operation in self.operations:
            operations_json.append(operation.to_json())
        return {'operations': operations_json}


class Operation(ToJson):
    def __init__(self,
                 class_name,
                 view=None,
                 options=None):
        self.class_name = class_name
        self.view = view
        self.options = options

    def to_json(self):
        operation = {'class': self.class_name}
        if self.options is not None:
            operation['options'] = self.options
        if self.view is not None:
            operation['view'] = self.view.to_json()

        return operation


class AddElements(Operation):
    """
    This class defines a Gaffer Add Operation.
    """

    def __init__(self,
                 elements=None,
                 skip_invalid_elements=False,
                 validate=True,
                 view=None,
                 options=None):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.operation.impl.add.AddElements',
            view=view,
            options=options)
        self.elements = elements
        self.skip_invalid_elements = skip_invalid_elements
        self.validate = validate

    def to_json(self):
        operation = super().to_json()
        operation['skipInvalidElements'] = self.skip_invalid_elements
        operation['validate'] = self.validate
        if self.elements is not None:
            elements_json = []
            for element in self.elements:
                elements_json.append(element.to_json())
            operation['input'] = elements_json
        return operation


class GenerateElements(Operation):
    def __init__(self,
                 generator_class_name,
                 element_generator_fields=None,
                 objects=None,
                 view=None,
                 options=None):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.operation.impl.generate.GenerateElements',
            view=view,
            options=options)
        self.generator_class_name = generator_class_name
        self.element_generator_fields = element_generator_fields
        self.objects = objects

    def to_json(self):
        operation = super().to_json()

        if self.objects is not None:
            operation['input'] = self.objects

        element_generator = {'class': self.generator_class_name}
        if self.element_generator_fields is not None:
            for key, value in self.element_generator_fields.items():
                element_generator[key] = value
        operation['elementGenerator'] = element_generator
        return operation


class GenerateObjects(Operation):
    def __init__(self,
                 generator_class_name,
                 element_generator_fields=None,
                 elements=None,
                 view=None,
                 options=None):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.operation.impl.generate.GenerateObjects',
            view=view,
            options=options)
        self.generator_class_name = generator_class_name
        self.element_generator_fields = element_generator_fields
        self.elements = elements

    def to_json(self):
        operation = super().to_json()

        if self.elements is not None:
            elements_json = []
            for element in self.elements:
                elements_json.append(element.to_json())
            operation['input'] = elements_json

        element_generator = {'class': self.generator_class_name}
        if self.element_generator_fields is not None:
            for key, value in self.element_generator_fields.items():
                element_generator[key] = value
        operation['elementGenerator'] = element_generator
        return operation


class Validate(Operation):
    def __init__(self,
                 validate,
                 skip_invalid_elements=True):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.operation.impl.Validate')

        self.validate = validate
        self.skip_invalid_elements = skip_invalid_elements

    def to_json(self):
        operation = super().to_json()

        operation['validate'] = self.validate
        operation['skipInvalidElements'] = self.skip_invalid_elements
        return operation


class ExportToGafferResultCache(Operation):
    def __init__(self,
                 key=None,
                 op_auths=None,
                 options=None):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.operation.impl.export.resultcache.ExportToGafferResultCache',
            view=None,
            options=options)
        if not isinstance(key, str) and key is not None:
            raise TypeError('key must be a string')
        self.key = key
        self.op_auths = op_auths

    def to_json(self):
        operation = super().to_json()

        if self.key is not None:
            operation['key'] = self.key

        if self.op_auths is not None:
            operation['opAuths'] = self.op_auths
        return operation


class GetGafferResultCacheExport(Operation):
    def __init__(self,
                 job_id=None,
                 key=None,
                 options=None):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.operation.impl.export.resultcache.GetGafferResultCacheExport',
            view=None,
            options=options)
        self.job_id = job_id
        self.key = key

    def to_json(self):
        operation = super().to_json()

        if self.job_id is not None:
            operation['jobId'] = self.job_id
        if self.key is not None:
            operation['key'] = self.key
        return operation


class ExportToSet(Operation):
    def __init__(self, key=None, options=None):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.operation.impl.export.set.ExportToSet',
            view=None,
            options=options)
        if not isinstance(key, str) and key is not None:
            raise TypeError('key must be a string')
        self.key = key

    def to_json(self):
        operation = super().to_json()

        if self.key is not None:
            operation['key'] = self.key

        return operation


class GetSetExport(Operation):
    def __init__(self,
                 job_id=None,
                 key=None,
                 options=None):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.operation.impl.export.set.GetSetExport',
            view=None,
            options=options)
        self.job_id = job_id
        self.key = key

    def to_json(self):
        operation = super().to_json()

        if self.job_id is not None:
            operation['jobId'] = self.job_id
        if self.key is not None:
            operation['key'] = self.key

        return operation


class GetExports(Operation):
    def __init__(self,
                 get_exports=None,
                 options=None):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.operation.impl.export.GetExports',
            view=None,
            options=options)
        self.get_exports = get_exports

    def to_json(self):
        operation = super().to_json()

        if self.get_exports is not None:
            operation['getExports'] = self.get_exports

        return operation


class GetJobDetails(Operation):
    def __init__(self,
                 job_id=None,
                 options=None):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.operation.impl.job.GetJobDetails',
            view=None,
            options=options)
        self.job_id = job_id

    def to_json(self):
        operation = super().to_json()

        if self.job_id is not None:
            operation['jobId'] = self.job_id

        return operation


class GetAllJobDetails(Operation):
    def __init__(self, options=None):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.operation.impl.job.GetAllJobDetails',
            view=None,
            options=options)

    def to_json(self):
        operation = super().to_json()

        return operation


class GetJobResults(Operation):
    def __init__(self, options=None):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.operation.impl.job.GetJobResults',
            view=None,
            options=options)

    def to_json(self):
        operation = super().to_json()

        return operation


class GetOperation(Operation):
    def __init__(self,
                 class_name,
                 seeds=None,
                 view=None,
                 directed_type=DirectedType.EITHER,
                 in_out_type=InOutType.EITHER,
                 seed_matching_type=SeedMatchingType.RELATED,
                 options=None):
        super().__init__(
            class_name=class_name,
            view=view,
            options=options)

        if not isinstance(class_name, str):
            raise TypeError(
                'ClassName must be the operation class name as a string')

        self.seeds = seeds
        self.directed_type = directed_type
        self.in_out_type = in_out_type
        self.seed_matching_type = seed_matching_type

    def to_json(self):
        operation = super().to_json()

        if self.seeds is not None:
            json_seeds = []
            for seed in self.seeds:
                if isinstance(seed, ElementSeed):
                    json_seeds.append(seed.to_json())
                else:
                    json_seeds.append(EntitySeed(seed).to_json())
            operation['input'] = json_seeds

        if self.seed_matching_type is not None and self.seed_matching_type is not SeedMatchingType.RELATED:
            operation['seedMatching'] = self.seed_matching_type
        if self.directed_type is not None and self.directed_type is not DirectedType.EITHER:
            operation['directedType'] = self.directed_type
        if self.in_out_type is not None and self.in_out_type is not InOutType.EITHER:
            operation['includeIncomingOutGoing'] = self.in_out_type
        return operation


class GetElements(GetOperation):
    def __init__(self,
                 seeds=None,
                 view=None,
                 directed_type=DirectedType.EITHER,
                 in_out_type=InOutType.EITHER,
                 seed_matching_type=SeedMatchingType.RELATED,
                 options=None):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.operation.impl.get.GetElements',
            seeds=seeds,
            view=view,
            directed_type=directed_type,
            in_out_type=in_out_type,
            seed_matching_type=seed_matching_type,
            options=options)


class GetAdjacentIds(GetOperation):
    def __init__(self,
                 seeds=None,
                 view=None,
                 in_out_type=InOutType.EITHER,
                 options=None):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.operation.impl.get.GetAdjacentIds',
            seeds=seeds,
            view=view,
            directed_type=DirectedType.EITHER,
            in_out_type=in_out_type,
            seed_matching_type=SeedMatchingType.RELATED,
            options=options)


class GetAllElements(GetOperation):
    def __init__(self,
                 view=None,
                 directed_type=DirectedType.EITHER,
                 options=None):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.operation.impl.get.GetAllElements',
            seeds=None,
            view=view,
            directed_type=directed_type,
            in_out_type=InOutType.EITHER,
            options=options)


class NamedOperation(GetOperation):
    def __init__(self,
                 name,
                 seeds=None,
                 view=None,
                 parameters=None,
                 options=None):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.named.operation.NamedOperation',
            seeds=seeds,
            view=view,
            directed_type=DirectedType.EITHER,
            in_out_type=InOutType.EITHER,
            seed_matching_type=SeedMatchingType.RELATED,
            options=options)
        self.name = name
        self.parameters = parameters;

    def to_json(self):
        operation = super().to_json()
        operation['operationName'] = self.name
        if self.parameters is not None:
            operation['parameters'] = self.parameters
        return operation


class AddNamedOperation(Operation):
    def __init__(self,
                 operation_chain,
                 name,
                 description=None,
                 read_access_roles=None,
                 write_access_roles=None,
                 overwrite=False,
                 parameters=None,
                 options=None):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.named.operation.AddNamedOperation',
            options=options)
        self.operation_chain = operation_chain
        self.name = name
        self.description = description
        self.read_access_roles = read_access_roles
        self.write_access_roles = write_access_roles
        self.overwrite = overwrite
        self.parameters = parameters

    def to_json(self):
        operation = super().to_json()
        operation['operationChain'] = self.operation_chain
        operation['operationName'] = self.name
        operation['overwriteFlag'] = self.overwrite
        if self.description is not None:
            operation['description'] = self.description
        if self.read_access_roles is not None:
            operation['readAccessRoles'] = self.read_access_roles
        if self.write_access_roles is not None:
            operation['writeAccessRoles'] = self.write_access_roles
        if self.parameters is not None:
            operation['parameters'] = {}
            for param in self.parameters:
                if not isinstance(param, NamedOperationParameter):
                    raise TypeError(
                        'All parameters must be a NamedOperationParameter')
                operation['parameters'][param.name] = param.get_detail()

        return operation


class DeleteNamedOperation(Operation):
    def __init__(self, name, options=None):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.named.operation.DeleteNamedOperation',
            options=options)
        self.name = name

    def to_json(self):
        operation = super().to_json()
        operation['operationName'] = self.name
        return operation


class GetAllNamedOperations(Operation):
    def __init__(self, options=None):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.named.operation.GetAllNamedOperations',
            options=options)


class DiscardOutput(Operation):
    def __init__(self):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.operation.impl.DiscardOutput')


class GetElementsBetweenSets(Operation):
    def __init__(self, options=None, view=None, seed_matching=None,
                 in_out_type=None, directed_type=None, input_b=None):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.accumulostore.operation.impl.GetElementsBetweenSets',
            options=options,
            view=view
        )
        self.seed_matching = seed_matching
        self.in_out_type = in_out_type
        self.directed_type = directed_type
        self.input_b = input_b

    def to_json(self):
        operation = super().to_json()

        if self.seed_matching is not None:
            operation['seedMatching'] = self.seed_matching

        if self.in_out_type is not None:
            operation['includeIncomingOutGoing'] = self.in_out_type

        if self.directed_type is not None:
            operation['directedType'] = self.directed_type

        if self.input_b is not None:
            operation['inputB'] = self.input_b

        return operation


class GetElementsWithinSet(Operation):
    def __init__(self, options=None, view=None, directed_type=None):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.accumulostore.operation.impl.GetElementsWithinSet',
            options=options,
            view=view
        )
        self.directed_type = directed_type

    def to_json(self):
        operation = super().to_json()

        if self.directed_type is not None:
            operation['directedType'] = self.directed_type

        return operation


class SummariseGroupOverRanges(Operation):
    def __init__(self, options=None, view=None,
                 in_out_type=None, directed_type=None):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.accumulostore.operation.impl.SummariseGroupOverRanges',
            options=options,
            view=view
        )
        self.in_out_type = in_out_type
        self.directed_type = directed_type

    def to_json(self):
        operation = super().to_json()

        if self.in_out_type is not None:
            operation['includeIncomingOutGoing'] = self.in_out_type

        if self.directed_type is not None:
            operation['directedType'] = self.directed_type

        return operation


class GetElementsInRanges(Operation):
    def __init__(self, options=None, view=None,
                 in_out_type=None, directed_type=None):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.accumulostore.operation.impl.GetElementsInRanges',
            options=options,
            view=view
        )
        self.in_out_type = in_out_type
        self.directed_type = directed_type

    def to_json(self):
        operation = super().to_json()

        if self.in_out_type is not None:
            operation['includeIncomingOutGoing'] = self.in_out_type

        if self.directed_type is not None:
            operation['directedType'] = self.directed_type

        return operation


class Count(Operation):
    def __init__(self):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.operation.impl.Count'
        )


class CountGroups(Operation):
    def __init__(self, limit=None, options=None):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.operation.impl.CountGroups',
            view=None,
            options=options)
        self.limit = limit

    def to_json(self):
        operation = super().to_json()

        if self.limit is not None:
            operation['limit'] = self.limit

        return operation


class Limit(Operation):
    def __init__(self, result_limit):
        super().__init__(class_name='uk.gov.gchq.gaffer.operation.impl.Limit')
        self.result_limit = result_limit

    def to_json(self):
        operation = super().to_json()
        operation['resultLimit'] = self.result_limit

        return operation


class ToSet(Operation):
    def __init__(self):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.operation.impl.output.ToSet')


class ToArray(Operation):
    def __init__(self):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.operation.impl.output.ToArray')


class ToEntitySeeds(Operation):
    def __init__(self):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.operation.impl.output.ToEntitySeeds')


class ToList(Operation):
    def __init__(self):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.operation.impl.output.ToList')


class ToVertices(Operation):
    def __init__(self, edge_vertices=None, use_matched_vertex=None):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.operation.impl.output.ToVertices')
        self.edge_vertices = edge_vertices
        self.use_matched_vertex = use_matched_vertex;

    def to_json(self):
        operation = super().to_json()

        if self.edge_vertices is not None:
            operation['edgeVertices'] = self.edge_vertices

        if self.use_matched_vertex is not None:
            operation['useMatchedVertex'] = self.use_matched_vertex

        return operation


class ToCsv(Operation):
    def __init__(self,
                 element_generator,
                 include_header=True):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.operation.impl.output.ToCsv'
        )
        self.element_generator = element_generator
        self.include_header = include_header

    def to_json(self):
        operation = super().to_json()

        operation['elementGenerator'] = self.element_generator
        operation['includeHeader'] = self.include_header

        return operation


class ToMapCsv(Operation):
    def __init__(self,
                 element_generator):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.operation.impl.output.ToMap'
        )
        self.element_generator = element_generator

    def to_json(self):
        operation = super().to_json()

        operation['elementGenerator'] = self.element_generator

        return operation


class Sort(Operation):
    def __init__(self, comparators, elements=None, result_limit=None):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.operation.impl.compare.Sort'
        )
        self.comparators = comparators
        self.elements = elements
        self.result_limit = result_limit

    def to_json(self):
        operation = super().to_json()

        comparators_json = []
        for comparator in self.comparators:
            if not isinstance(comparator, Comparator):
                raise TypeError(
                    'All comparators must be a Gaffer Comparator object')
            comparators_json.append(comparator.to_json())
        operation['comparators'] = comparators_json

        if self.elements is not None:
            elements_json = []
            for element in self.elements:
                elements_json.append(element.to_json())
            operation['input'] = elements_json

        if self.result_limit is not None:
            operation['resultLimit'] = self.result_limit

        return operation


class Max(Operation):
    def __init__(self, comparators, elements=None):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.operation.impl.compare.Max'
        )
        self.comparators = comparators
        self.elements = elements

    def to_json(self):
        operation = super().to_json()

        comparators_json = []
        for comparator in self.comparators:
            if not isinstance(comparator, Comparator):
                raise TypeError(
                    'All comparators must be a Gaffer Comparator object')
            comparators_json.append(comparator.to_json())
        operation['comparators'] = comparators_json

        if self.elements is not None:
            elements_json = []
            for element in self.elements:
                elements_json.append(element.to_json())
            operation['input'] = elements_json

        return operation


class Min(Operation):
    def __init__(self, comparators, elements=None):
        super().__init__(
            class_name='uk.gov.gchq.gaffer.operation.impl.compare.Min'
        )
        self.comparators = comparators
        self.elements = elements

    def to_json(self):
        operation = super().to_json()

        comparators_json = []
        for comparator in self.comparators:
            if not isinstance(comparator, Comparator):
                raise TypeError(
                    'All comparators must be a Gaffer Comparator object')
            comparators_json.append(comparator.to_json())
        operation['comparators'] = comparators_json

        if self.elements is not None:
            elements_json = []
            for element in self.elements:
                elements_json.append(element.to_json())
            operation['input'] = elements_json

        return operation


class ExportToOtherGraph(Operation):
    def __init__(self, graph_id=None, elements=None, parent_schema_ids=None,
                 schema=None, parent_store_properties_id=None,
                 store_properties=None):
        super().__init__(
            'uk.gov.gchq.gaffer.operation.export.graph.ExportToOtherGraph'
        )

        self.graph_id = graph_id
        self.elements = elements
        self.parent_schema_ids = parent_schema_ids
        self.schema = schema
        self.parent_store_properties_id = parent_store_properties_id
        self.store_properties = store_properties

    def to_json(self):
        operation = super().to_json()

        if self.graph_id is not None:
            operation['graphId'] = self.graph_id

        if self.elements is not None:
            elements_json = []
            for element in self.elements:
                elements_json.append(element.to_json())
            operation['input'] = elements_json

        if self.parent_schema_ids is not None:
            operation['parentSchemaIds'] = self.parent_schema_ids

        if self.schema is not None:
            operation['schema'] = self.schema

        if self.parent_store_properties_id is not None:
            operation[
                'parentStorePropertiesId'] = self.parent_store_properties_id

        if self.store_properties is not None:
            operation['storeProperties'] = self.store_properties

        return operation


class ExportToOtherAuthorisedGraph(Operation):
    def __init__(self, graph_id=None, elements=None, parent_schema_ids=None,
                 parent_store_properties_id=None):
        super().__init__(
            'uk.gov.gchq.gaffer.operation.export.graph.ExportToOtherAuthorisedGraph'
        )

        self.graph_id = graph_id
        self.elements = elements
        self.parent_schema_ids = parent_schema_ids
        self.parent_store_properties_id = parent_store_properties_id

    def to_json(self):
        operation = super().to_json()

        if self.graph_id is not None:
            operation['graphId'] = self.graph_id

        if self.elements is not None:
            elements_json = []
            for element in self.elements:
                elements_json.append(element.to_json())
            operation['input'] = elements_json

        if self.parent_schema_ids is not None:
            operation['parentSchemaIds'] = self.parent_schema_ids

        if self.parent_store_properties_id is not None:
            operation[
                'parentStorePropertiesId'] = self.parent_store_properties_id

        return operation


class AddElementsFromSocket(Operation):
    def __init__(self, hostname=None, port=None, element_generator=None,
                 parallelism=None, validate=None, skip_invalid_elements=None,
                 delimiter=None, options=None):
        super().__init__(
            'uk.gov.gchq.gaffer.operation.impl.add.AddElementsFromSocket',
            options=options
        )

        self.hostname = hostname
        self.port = port
        self.element_generator = element_generator
        self.parallelism = parallelism
        self.validate = validate
        self.skip_invalid_elements = skip_invalid_elements
        self.delimiter = delimiter

    def to_json(self):
        operation = super().to_json()

        if self.hostname is not None:
            operation['hostname'] = self.hostname

        if self.port is not None:
            operation['port'] = self.port

        if self.element_generator is not None:
            operation['elementGenerator'] = self.element_generator

        if self.parallelism is not None:
            operation['parallelism'] = self.parallelism

        if self.validate is not None:
            operation['validate'] = self.validate

        if self.skip_invalid_elements is not None:
            operation['skipInvalidElements'] = self.skip_invalid_elements

        if self.delimiter is not None:
            operation['delimiter'] = self.delimiter

        return operation


class AddElementsFromFile(Operation):
    def __init__(self, filename=None, element_generator=None,
                 parallelism=None, validate=None, skip_invalid_elements=None,
                 options=None):
        super().__init__(
            'uk.gov.gchq.gaffer.operation.impl.add.AddElementsFromFile',
            options=options
        )

        self.filename = filename
        self.element_generator = element_generator
        self.parallelism = parallelism
        self.validate = validate
        self.skip_invalid_elements = skip_invalid_elements

    def to_json(self):
        operation = super().to_json()

        if self.filename is not None:
            operation['filename'] = self.filename

        if self.element_generator is not None:
            operation['elementGenerator'] = self.element_generator

        if self.parallelism is not None:
            operation['parallelism'] = self.parallelism

        if self.validate is not None:
            operation['validate'] = self.validate

        if self.skip_invalid_elements is not None:
            operation['skipInvalidElements'] = self.skip_invalid_elements

        return operation


class GetGraph:
    def get_url(self):
        return self.url


class GetSchema(GetGraph):
    def __init__(self, url=None):
        self.url = '/graph/schema'


class GetFilterFunctions(GetGraph):
    def __init__(self, url=None):
        self.url = '/graph/filterFunctions'


class GetClassFilterFunctions(GetGraph):
    def __init__(self, class_name=None, url=None):
        self.url = '/graph/filterFunctions/' + class_name


class GetElementGenerators(GetGraph):
    def __init__(self, url=None):
        self.url = '/graph/elementGenerators'


class GetObjectGenerators(GetGraph):
    def __init__(self, url=None):
        self.url = '/graph/objectGenerators'


class GetOperations(GetGraph):
    def __init__(self, url=None):
        self.url = '/graph/operations'


class GetSerialisedFields(GetGraph):
    def __init__(self, class_name=None, url=None):
        self.url = '/graph/serialisedFields/' + class_name


class GetStoreTraits(GetGraph):
    def __init__(self, url=None):
        self.url = '/graph/storeTraits'


class IsOperationSupported:
    def __init__(self, operation=None):
        self.operation = operation

    def get_operation(self):
        return self.operation
