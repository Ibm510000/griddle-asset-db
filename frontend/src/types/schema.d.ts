/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  '/assets/': {
    /** Get Assets */
    get: operations['get_assets_assets__get'];
    /** New Asset */
    post: operations['new_asset_assets__post'];
  };
  '/assets/{uuid}': {
    /** New Asset */
    get: operations['new_asset_assets__uuid__get'];
    /** Put Asset */
    put: operations['put_asset_assets__uuid__put'];
  };
  '/assets/{uuid}/versions': {
    /** Get Asset Versions */
    get: operations['get_asset_versions_assets__uuid__versions_get'];
    /** New Asset Version */
    post: operations['new_asset_version_assets__uuid__versions_post'];
  };
}

export type webhooks = Record<string, never>;

export interface components {
  schemas: {
    /** Asset */
    Asset: {
      /** Asset Name */
      asset_name: string;
      /** Author Pennkey */
      author_pennkey: string;
      /** Keywords */
      keywords: string;
      /** Image Url */
      image_url: string | null;
      /** Id */
      id: string;
      /** Versions */
      versions: components['schemas']['Version'][];
    };
    /** AssetCreate */
    AssetCreate: {
      /** Asset Name */
      asset_name: string;
      /** Author Pennkey */
      author_pennkey: string;
      /** Keywords */
      keywords: string;
      /** Image Url */
      image_url: string | null;
    };
    /** Body_new_asset_assets__post */
    Body_new_asset_assets__post: {
      asset: components['schemas']['AssetCreate'];
    };
    /** HTTPValidationError */
    HTTPValidationError: {
      /** Detail */
      detail?: components['schemas']['ValidationError'][];
    };
    /** ValidationError */
    ValidationError: {
      /** Location */
      loc: (string | number)[];
      /** Message */
      msg: string;
      /** Error Type */
      type: string;
    };
    /** Version */
    Version: {
      /** Author Pennkey */
      author_pennkey: string;
      /** Asset Id */
      asset_id: string;
      /** Semver */
      semver: string;
      /** File Key */
      file_key: string;
      asset: components['schemas']['Asset'];
    };
    /** VersionCreate */
    VersionCreate: {
      /** Author Pennkey */
      author_pennkey: string;
      /** Asset Id */
      asset_id: string;
      /** Semver */
      semver: string;
      /** File Key */
      file_key: string;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}

export type $defs = Record<string, never>;

export type external = Record<string, never>;

export interface operations {
  /** Get Assets */
  get_assets_assets__get: {
    parameters: {
      query?: {
        search?: string | null;
        keywords?: string | null;
        sort?: 'date' | 'name';
        offset?: number;
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          'application/json': components['schemas']['Asset'][];
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          'application/json': components['schemas']['HTTPValidationError'];
        };
      };
    };
  };
  /** New Asset */
  new_asset_assets__post: {
    requestBody: {
      content: {
        'application/json': components['schemas']['Body_new_asset_assets__post'];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          'application/json': unknown;
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          'application/json': components['schemas']['HTTPValidationError'];
        };
      };
    };
  };
  /** New Asset */
  new_asset_assets__uuid__get: {
    parameters: {
      path: {
        uuid: string;
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          'application/json': components['schemas']['Asset'];
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          'application/json': components['schemas']['HTTPValidationError'];
        };
      };
    };
  };
  /** Put Asset */
  put_asset_assets__uuid__put: {
    parameters: {
      path: {
        uuid: string;
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          'application/json': unknown;
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          'application/json': components['schemas']['HTTPValidationError'];
        };
      };
    };
  };
  /** Get Asset Versions */
  get_asset_versions_assets__uuid__versions_get: {
    parameters: {
      query?: {
        sort?: 'asc' | 'desc';
        offset?: number;
      };
      path: {
        uuid: string;
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          'application/json': components['schemas']['Version'];
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          'application/json': components['schemas']['HTTPValidationError'];
        };
      };
    };
  };
  /** New Asset Version */
  new_asset_version_assets__uuid__versions_post: {
    parameters: {
      path: {
        uuid: string;
      };
    };
    requestBody: {
      content: {
        'application/json': components['schemas']['VersionCreate'];
      };
    };
    responses: {
      /** @description Successful Response */
      200: {
        content: {
          'application/json': unknown;
        };
      };
      /** @description Validation Error */
      422: {
        content: {
          'application/json': components['schemas']['HTTPValidationError'];
        };
      };
    };
  };
}
