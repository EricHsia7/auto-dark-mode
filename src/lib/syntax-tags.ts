import { _Object } from './build-object';
import { functionalKeywords } from './functional-keywords';
import { namedColors } from './named-colors';
import { FloatObject } from './parse-float';
import { FloatWithUnitObject } from './parse-float-with-unit';
import { IntegerObject } from './parse-integer';
import { IntegerWithUnitObject } from './parse-integer-with-unit';
import { systemColors } from './system-colors';

export type SyntaxTag = 'number' | 'integer' | 'float' | 'length' | 'font' | 'distance' | 'absolute' | 'zero' | 'viewport' | 'relative' | 'container' | 'position' | 'percentage' | 'angle' | 'hex' | 'color' | 'preposition' | 'to' | 'at' | 'from' | 'cardinal' | 'vertical' | 'horizontal' | 'center' | 'extent' | 'shape' | 'variable_name' | 'named_color' | 'system_color' | 'functional_keyword' | 'model' | 'variable' | 'gradient';

export type SyntaxTagSet = Set<SyntaxTag>;

export function getSyntaxTags(obj: _Object | any): SyntaxTagSet {
  const tags = new Set();

  if (typeof obj !== 'object') return tags;
  if (Array.isArray(obj)) return tags;
  if (!obj.hasOwnProperty('type')) return tags;

  if (obj.type === 'integer' || obj.type === 'float') {
    tags.add('number');
    if (obj.type === 'integer') {
      tags.add('integer');
    } else if (obj.type === 'float') {
      tags.add('float');
    }
    if (obj.value === 0) {
      tags.add('length');
      tags.add('font');
      tags.add('distance');
      tags.add('absolute');
      tags.add('zero');
    }
  } else if (obj.type === 'integer-u' || obj.type === 'float-u') {
    if ('%' === obj.unit) {
      tags.add('position');
      tags.add('length');
      tags.add('distance');
      tags.add('font');
      tags.add('relative');
      tags.add('percentage');
    } else if (['px', 'pt', 'pc', 'cm', 'in', 'mm', 'Q'].indexOf(obj.unit) > -1) {
      tags.add('length');
      tags.add('distance');
      tags.add('font');
      tags.add('absolute');
    } else if (['deg', 'rad', 'turn', 'grad'].indexOf(obj.unit) > -1) {
      tags.add('angle');
    } else if (['dvh', 'dvw', 'lvh', 'lvw', 'svh', 'svw', 'vb', 'vh', 'vi', 'vmax', 'vmin', 'vw'].indexOf(obj.unit) > -1) {
      tags.add('length');
      tags.add('viewport');
      tags.add('distance');
      tags.add('absolute');
    } else if (['em', 'ch', 'cap', 'ic', 'lh'].indexOf(obj.unit) > -1) {
      tags.add('length');
      tags.add('font');
      tags.add('distance');
      tags.add('relative');
    } else if (['rem', 'rch', 'rcap', 'ric', 'rlh'].indexOf(obj.unit) > -1) {
      tags.add('length');
      tags.add('font');
      tags.add('distance');
      tags.add('relative');
    } else if (['cqw', 'cqh', 'cqi', 'cqb', 'cqmin', 'cqmax'].indexOf(obj.unit) > -1) {
      tags.add('length');
      tags.add('distance');
      tags.add('container');
      tags.add('relative');
    }
    if (obj.type === 'integer-u') {
      tags.add('integer');
    } else if (obj.type === 'float-u') {
      tags.add('float');
    }
    if (obj.value === 0) {
      tags.add('zero');
    }
  } else if (obj.type === 'string') {
     if ('to' === obj.value) {
      tags.add('preposition');
      tags.add('to');
    } else if ('at' === obj.value) {
      tags.add('preposition');
      tags.add('at');
    } else if ('from' === obj.value) {
      tags.add('preposition');
      tags.add('from');
    } else if (['top', 'left', 'bottom', 'right'].indexOf(obj.value) > -1) {
      tags.add('position');
      tags.add('cardinal');
      if (['top', 'bottom'].indexOf(obj.value) > -1) {
        tags.add('vertical');
      } else if (['left', 'right'].indexOf(obj.value) > -1) {
        tags.add('horizontal');
      }
    } else if ('center' === obj.value) {
      tags.add('position');
      tags.add('vertical');
      tags.add('horizontal');
      tags.add('center');
    } else if (['closest-side', 'closest-corner', 'farthest-side', 'farthest-corner'].indexOf(obj.value) > -1) {
      tags.add('position');
      tags.add('extent');
    } else if (['circle', 'ellipse'].indexOf(obj.value) > -1) {
      tags.add('shape');
    } else if (/^--[a-z0-9_\-]+$/i.test(obj.value)) {
      tags.add('variable_name');
    } else if (namedColors.hasOwnProperty(obj.value)) {
      tags.add('named_color');
      tags.add('color');
    } else if (systemColors.hasOwnProperty(obj.value)) {
      tags.add('system_color');
      tags.add('color');
    } else if (functionalKeywords.hasOwnProperty(obj.value)) {
      tags.add('functional_keyword');
      tags.add('color');
    }
  } else if (obj.type === 'model') {
    tags.add('model');
    if (obj.model === 'var') {
      tags.add('variable');
    } else if (['rgb', 'rgba', 'hsl', 'hsla'].indexOf(obj.model) > -1) {
      tags.add('color');
    } else if (['linear-gradient', 'radial-gradient', 'conic-gradient'].indexOf(obj.model) > -1) {
      tags.add('gradient');
    }
  }
  return tags;
}

type TagToType = {
  number: IntegerObject | FloatObject;
  integer: IntegerObject | IntegerWithUnitObject;
  float: FloatObject | FloatWithUnitObject;

  length: IntegerObject | FloatObject | IntegerWithUnitObject | FloatWithUnitObject;
  angle: IntegerWithUnitObject | FloatWithUnitObject;
  percentage: IntegerWithUnitObject | FloatWithUnitObject;
  position: StringObject | IntegerWithUnitObject | FloatWithUnitObject;
  distance: IntegerWithUnitObject | FloatWithUnitObject;
  font: IntegerObject | FloatObject | IntegerWithUnitObject | FloatWithUnitObject;

  absolute: IntegerWithUnitObject | FloatWithUnitObject;
  relative: IntegerWithUnitObject | FloatWithUnitObject;
  container: IntegerWithUnitObject | FloatWithUnitObject;
  viewport: IntegerWithUnitObject | FloatWithUnitObject;

  zero: IntegerObject | FloatObject | IntegerWithUnitObject | FloatWithUnitObject;

  string: StringObject;
  hex: StringObject;
  variable_name: StringObject;
  named_color: StringObject;
  system_color: StringObject;
  functional_keyword: StringObject;
  color: StringObject | ModelObject;

  to: StringObject;
  from: StringObject;
  at: StringObject;
  preposition: StringObject;

  shape: StringObject;
  extent: StringObject;
  cardinal: StringObject;
  vertical: StringObject;
  horizontal: StringObject;
  center: StringObject;

  model: ModelObject;
  variable: ModelObject;
  gradient: ModelObject;
};

export function hasSyntaxTagAndObjectIs<T extends SyntaxTag>(obj: _Object | any, tags: Set<SyntaxTag>, tag: T): obj is TagToType[T] {
  if (typeof obj !== 'object') return false;
  if (Array.isArray(obj)) return false;
  if (!obj.hasOwnProperty('type')) return false;

  return tags.has(tag);
}
