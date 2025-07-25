import { _Object } from './build-object';
import { functionalKeywords } from './functional-keywords';
import { namedColors } from './named-colors';
import { FloatObject } from './parse-float';
import { FloatWithUnitObject } from './parse-float-with-unit';
import { IntegerObject } from './parse-integer';
import { IntegerWithUnitObject } from './parse-integer-with-unit';
import { systemColors } from './system-colors';

export type SyntaxTag = 'number' | 'integer' | 'float' | 'length' | 'font' | 'distance' | 'absolute' | 'zero' | 'viewport' | 'relative' | 'container' | 'position' | 'percentage' | 'angle' | 'hex' | 'color' | 'preposition' | 'to' | 'at' | 'from' | 'cardinal' | 'vertical' | 'horizontal' | 'center' | 'extent' | 'shape' | 'variable-name' | 'named-color' | 'system-color' | 'functional-keyword' | 'model' | 'variable' | 'gradient';

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
    if (/^#[a-f0-9]{3,8}/i.test(obj.value)) {
      tags.add('hex');
      tags.add('color');
    } else if ('to' === obj.value) {
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
      tags.add('variable-name');
    } else if (namedColors.hasOwnProperty(obj.value)) {
      tags.add('named-color');
      tags.add('color');
    } else if (systemColors.hasOwnProperty(obj.value)) {
      tags.add('system-color');
      tags.add('color');
    } else if (functionalKeywords.hasOwnProperty(obj.value)) {
      tags.add('functional-keyword');
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
  length: IntegerWithUnitObject | FloatWithUnitObject;
  angle: IntegerWithUnitObject | FloatWithUnitObject;
  percentage: IntegerWithUnitObject | FloatWithUnitObject;
};

export function hasSyntaxTagAndObjectIs<T extends SyntaxTag>(obj: _Object, tags: Set<SyntaxTag>, tag: T): obj is TagToType[T] {
  return tags.has(tag)

  /*switch (tag) {
    case 'number':
      return true;
    case 'length':
      return true;
    case 'angle':
      return true;
    case 'percentage':
      return true;
      return true;
    default:
      return false;
  }*/
}
