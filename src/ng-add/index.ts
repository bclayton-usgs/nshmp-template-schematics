import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

import {
  addPackageJsonDependency,
  NodeDependency,
  NodeDependencyType,
  getWorkspace,
  getProjectFromWorkspace, 
  addModuleImportToRootModule } from 'schematics-utilities';

export function ngAdd(options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    setupProject(tree, options);
    addDependencies(tree);
    updateAngularJsonOptions(tree, options);

    return tree;
  };
}

function addDependencies(host: Tree): Tree {
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

  dependencies.forEach(dependency => addPackageJsonDependency(host, dependency));

  return host;
}

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

function updateAngularJsonOptions(host: Tree, _options: any): Tree {
  const workspace = getWorkspace(host);
  const projectName = <string>workspace.defaultProject || '';

  if (host.exists('angular.json')) {
    const sourceText = host.read('angular.json')!.toString('utf-8');
    const json = JSON.parse(sourceText);

    if (json.projects &&
          json.projects[projectName] &&
          json.projects[projectName].architect &&
          json.projects[projectName].architect.build &&
          json.projects[projectName].architect.build.options &&
          json.projects[projectName].architect.build.options) {

      let options = json.projects[projectName].architect.build.options;

      if (options.styles) {
        json.projects[projectName].architect.build.options.styles
            .unshift('node_modules/@nshmp/nshmp-ng-template/scss/styles.scss');
      }

      host.overwrite('angular.json', JSON.stringify(json, null, 2));
    }

  }

  return host;
}
