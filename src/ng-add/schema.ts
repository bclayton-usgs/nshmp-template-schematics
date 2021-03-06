

export interface Schema {

  /** Name of the project */
  project: string;

  /** Whether to update the angular.json file with assets and styles */
  angularUpdate: boolean;

  /** Whether to invoke ng-generate component schematic */
  addComponent: boolean;

}
