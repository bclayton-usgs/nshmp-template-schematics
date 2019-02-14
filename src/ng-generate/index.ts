import { Rule } from '@angular-devkit/schematics';
import { buildComponent } from '@angular/cdk/schematics';

import { Schema } from './schema';

const filePath = './__path__/__name@dasherize@if-flat__';

const template = `${filePath}/__name@dasherize__.component.html`;

const stylesheet = `${filePath}/__name@dasherize__.component.__styleext__`;

/**
 * Generate a new component with nshmp-template.
 */
export function ngGenerate(options: Schema): Rule {
  return buildComponent({...options}, {template, stylesheet});
}
