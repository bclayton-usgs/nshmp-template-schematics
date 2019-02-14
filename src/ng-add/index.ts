import {
    Rule,
    SchematicContext,
    Tree,
    noop, 
    chain,
    externalSchematic} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { getWorkspace } from '@schematics/angular/utility/config';
import {
  NodeDependency,
  NodeDependencyType,
  getProjectFromWorkspace, 
  addModuleImportToRootModule, 
  addPackageToPackageJson} from 'schematics-utilities';

import { Schema } from './schema';

const assets: Asset[] = [
  {
    glob: '**/*',
    input: 'node_modules/@nshmp/nshmp-ng-template/assets',
    output: './assets'
  },
  {
    glob: '**/*',
    input: 'node_modules/uswds/dist/img',
    output: './assets/uswds'
  },
  {
    glob: '**/*',
    input: 'node_modules/uswds/dist/fonts',
    output: '~uswds/dist/fonts'
  }
];

const stylesPath = 'node_modules/@nshmp/nshmp-ng-template/scss/styles.scss'; 

/**
 * Update dependencies in package,json, update styles and assets
 * in angular.json, and update app module with nshmp module import.   
 */
export function ngAdd(options: Schema): Rule {
  return chain([
    createComponent(options),
    (tree: Tree, _context: SchematicContext) => {
      setupProject(tree, options);
      addDependencies(tree);
      
      options.angularUpdate ? updateAngularJsonOptions(tree, options) : noop();

      _context.addTask(new NodePackageInstallTask());

      return tree;
    }
  ])
}

/**
 * Add needed dependencies to run nshmp-ng-template
 */
function addDependencies(host: Tree) {
  const dependencies: NodeDependency[] = [
    {
      type: NodeDependencyType.Default,
      version: '^7.3.0',
      name: '@angular/material'
    },
    {
      type: NodeDependencyType.Default,
      version: '^7.3.0',
      name: '@angular/cdk'
    },
    {
      type: NodeDependencyType.Default,
      version: '^7.2.4',
      name: '@angular/animations'
    },
    {
      type: NodeDependencyType.Default,
      version: '^2.0.8',
      name: 'hammerjs'
    },
    {
      type: NodeDependencyType.Default,
      version: '^2.0.0-beta.4',
      name: 'uswds'
    }
  ];

  dependencies.forEach(dependency => {
    addPackageToPackageJson(
        host,
        dependency.type,
        dependency.name,
        dependency.version);
  });

  return host;
}

/**
 * Check whether and assest object as been added. 
 */
function checkAsset(assets: Array<any>, assetCheck: any) {

  return assets.some((asset) => {
    if (typeof asset === 'object') {
      return Object.keys(asset).every((key) => {
        return asset[key] === assetCheck[key];
      })
    } else {
      return false;
    }
  });
}

/**
 * Invoke the ng-generate component schematic.
 */
function createComponent(options: Schema) {

  return options.addComponent ?
      externalSchematic('@nshmp/nshmp-template-schematics', 'component', options) :
      noop();
}

/**
 * Add the nshmp template module to app.module.ts 
 */
function setupProject(host: Tree, _options: any) : Tree {
  const workspace = getWorkspace(host);
  const project = getProjectFromWorkspace(workspace, _options.project);

  addModuleImportToRootModule(
      host,
      'NshmpTemplateModule',
      '@nshmp/nshmp-ng-template',
      project);

  return host;
}

/**
 * Update the angular.json file with the paths needed for styles
 * and assets. 
 */
function updateAngularJsonOptions(host: Tree, options: any): Tree {

  if (host.exists('angular.json')) {
    const sourceText = host.read('angular.json')!.toString('utf-8');
    const json = JSON.parse(sourceText);
    const projectName = Object.keys(json['projects'])[0] || options.project; 

    if (!(json.projects[projectName].architect.build.options === null)) {
      let options = json.projects[projectName].architect.build.options;

      if (options.styles && !options.styles.includes(stylesPath)) {
        options.styles.unshift(stylesPath);
      }

      if (options.assets) {
        assets.forEach(asset => {
          if (!checkAsset(options.assets, asset)) {
            options.assets.push(asset);
          }
        });
      }

      host.overwrite('angular.json', JSON.stringify(json, null, 2));
    }

  }

  return host;
}

interface Asset {
  glob: string;
  input: string;
  output: string;
}
