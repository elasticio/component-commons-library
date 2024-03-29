import mapLimit from 'async/mapLimit';
import { PlatformApiRestClient } from './PlatformApiRestClient';

async function sleep(amount: any) { await new Promise((r) => setTimeout(r, amount)); }

const DEFAULT_PARALLEL_PLATFORM_API_CALLS = process.env.PARALLEL_PLATFORM_API_CALLS || 20;
const DEFAULT_OBJECTS_PER_PAGE = process.env.DEFAULT_OBJECTS_PER_PAGE || 20;

interface AllFlowsForWorkspaceOptions {
  objectsPerPage?: number;
  parallelCalls?: number;
  workspaceId?: string;
}

interface WorkspaceListOptions {
  objectsPerPage?: number;
  parallelCalls?: number;
}

export class PlatformApiLogicClient extends PlatformApiRestClient {
  workspaceList: any;

  makeRequest: any;

  emitter: any;

  /**
   * Fetch all flows for a given workspace
   * @param {string} options.workspaceId Id of the workspace to search
   * @returns {Promise<[]>} An array of flows
   */
  async fetchAllFlowsForWorkspace(options: AllFlowsForWorkspaceOptions = {}): Promise<any[]> {
    const {
      objectsPerPage = DEFAULT_OBJECTS_PER_PAGE,
      parallelCalls = DEFAULT_PARALLEL_PLATFORM_API_CALLS,
      workspaceId,
    } = options;

    const results: any = [];

    const objectCountResponse = await this.makeRequest({
      url: `/flows?workspace_id=${workspaceId}&page[size]=1`,
      method: 'GET',
    });

    const objectCount = objectCountResponse.meta.total;
    const numPages = Math.ceil(objectCount / Number(objectsPerPage));
    const pageRange = Array.from({ length: numPages }, (_X, i) => i + 1);
    await mapLimit(pageRange, parallelCalls, async (pageNumber: any) => {
      const pageResult = await this.makeRequest({
        url: `/flows?workspace_id=${workspaceId}&page[size]=${objectsPerPage}&page[number]=${pageNumber}`,
        method: 'GET',
      });
      const objectArray = pageResult.data;
      results.push(...objectArray);
    });

    return results;
  }

  /**
   * Fetch all credentials for a given workspace
   * @param {string} options.workspaceId
   * @returns {Promise<[{{
   *     credentialId: string,
   *     credentialName: string,
   *     componentId: string,
   * }}]>}
   */
  async fetchAllCredentialsForWorkspace(options: any = {}) {
    const {
      workspaceId,
    } = options;

    const credentialsResponse = await this.makeRequest({
      method: 'GET',
      url: `/credentials?workspace_id=${workspaceId}`,
    });
    return credentialsResponse.data.map((credential: any) => ({
      credentialId: credential.id,
      credentialName: credential.attributes.name.trim(),
      componentId: credential.relationships.component.data.id,
    }));
  }

  /**
 * Fetch all credentials for a given workspace
 * @param {string} options.workspaceId
 * @returns {Promise<[{{
   *     secretId: string,
   *     secretName: string,
   *     componentIds: string[],
   * }}]>}
   */
  async fetchAllSecretsForWorkspace(options: any = {}) {
    const { workspaceId } = options;
    if (!workspaceId) throw new Error('workspaceId not provided, can\'t fetch secrets');
    const secrets = await this.makeRequest({ method: 'GET', url: `/workspaces/${workspaceId}/secrets` });
    const resp: any = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const secret of secrets.data) {
      const secretId = secret.id;
      const secretName = secret.attributes.name.trim();
      let componentIds: any = [];
      try {
        if (secret.relationships.component) componentIds.push(secret.relationships.component.data.id);
        if (secret.relationships.auth_client) {
          const clientId = secret.relationships.auth_client.data.id;
          const clientResponse = await this.makeRequest({ method: 'GET', url: `/auth-clients/${clientId}` });
          componentIds = clientResponse.data.relationships.components.data.map((x: any) => x.id);
        }
      } catch (e: any) {
        this.emitter.logger.info(`Can't find related to secret component - ${e.message}`);
      }
      resp.push({ secretId, secretName, componentIds });
    }
    return resp;
  }

  /**
 * Fetch secret by id for a given workspace
 * @param {string} options.secretId
 * @returns {Promise<{
   *     id: string,
   *     type: string,
   *     links: object,
   *     attributes: object,
   *     relationships: object,
   * }>}
   */
  async fetchSecretById(options: any = {}) {
    const { workspaceId = process.env.ELASTICIO_WORKSPACE_ID, secretId } = options;
    if (!secretId) throw new Error('secretId not provided, can\'t fetch secret');
    const secret = await this.makeRequest({ method: 'GET', url: `/workspaces/${workspaceId}/secrets/${secretId}` });
    return secret.data;
  }

  /**
 * Refresh token by secret id for a given workspace
 * @param {string} options.secretId
 * @returns {Promise<{
   *     id: string,
   *     type: string,
   *     links: object,
   *     attributes: object,
   *     relationships: object,
   * }>}
   */
  async refreshTokenBySecretId(options: any = {}) {
    const { workspaceId = process.env.ELASTICIO_WORKSPACE_ID, secretId } = options;
    if (!secretId) throw new Error('secretId not provided, can\'t fetch secret');
    const secret = await this.makeRequest({ method: 'POST', url: `/workspaces/${workspaceId}/secrets/${secretId}/refresh` });
    return secret.data;
  }

  /**
   * Fetch All Components Accessible From a Given Workspace
   * @param {string} options.contractId Contract ID
   * @returns {Promise<[{{
   *    componentId: string,
   *    componentName: string,
   *    componentDevTeam: string
   * }}]>}
   */
  async fetchComponentsAccessibleFromContract(options: any = {}) {
    const {
      contractId,
    } = options;

    const componentsResponse = await this.makeRequest({
      method: 'GET',
      url: `/components?contract_id=${contractId}`,
    });
    return componentsResponse.data.map((component: any) => ({
      componentId: component.id,
      componentName: component.attributes.name,
      componentDevTeam: component.attributes.team_name,
    }));
  }

  /* eslint-disable-next-line class-methods-use-this */
  splitParallelization(maxParallelization: any, splitFactor: any) {
    const realSplitFactor = Math.max(Math.floor(maxParallelization / splitFactor), 1);
    const parallelizationPerTask = Math.max(
      Math.floor(maxParallelization / realSplitFactor), 1,
    );
    return {
      realSplitFactor,
      parallelizationPerTask,
    };
  }

  /**
   *  Fetches a list of flows
   * @param.workspaceId {string} Optional Workspace ID to limit results
   * @returns {Promise<[{{
   *     flowDetails: object,
   *     flowId: string,
   *     flowName: string,
   *     workspaceId: string,
   *     workspaceName: string,
   *     contractId: string,
   *     contractName: string,
   *     contractDetails: object,
   *     workspaceDetails: object
   * }}]>}
   */
  async fetchFlowList(options: any = {}) {
    const {
      parallelCalls = DEFAULT_PARALLEL_PLATFORM_API_CALLS,
      workspaceId,
    } = options;

    const {
      realSplitFactor,
      parallelizationPerTask,
    } = this.splitParallelization(parallelCalls, 2);

    let flows;
    const workspaces = await this.fetchWorkspaceList({});
    if (!workspaceId) {
      const nonFlatFlows = await mapLimit(workspaces, realSplitFactor,
        async (workspace: any) => this.fetchAllFlowsForWorkspace({ parallelCalls: parallelizationPerTask, workspaceId: workspace.workspaceId }));
      flows = nonFlatFlows.flat();
    } else {
      flows = await this.fetchAllFlowsForWorkspace({
        parallelCalls,
        workspaceId,
      });
    }

    return flows.map((flow: any) => {
      const matchingWorkspaces = workspaces
        .filter((workspace: any) => workspace.workspaceId === flow.relationships.workspace.data.id);
      if (matchingWorkspaces.length !== 1) {
        throw new Error('Failed to find matching workspace');
      }
      const matchingWorkspace = matchingWorkspaces[0];
      return {
        flowDetails: flow,
        flowId: flow.id,
        flowName: flow.attributes.name,
        ...matchingWorkspace,
      };
    });
  }

  /**
   * Fetch a list of all workspaces across all contracts for a user
   * @param options
   * @returns {Promise<[{{
   *     workspaceId: string,
   *     workspaceName: string,
   *     contractId: string,
   *     contractName: string,
   *     contractDetails: object,
   *     workspaceDetails: object
   * }}]>}
   */
  async fetchWorkspaceList(options: WorkspaceListOptions = {}) {
    if (!this.workspaceList) {
      const {
        objectsPerPage = DEFAULT_OBJECTS_PER_PAGE,
        parallelCalls = DEFAULT_PARALLEL_PLATFORM_API_CALLS,
      } = options;

      // See the following issues for context
      // https://github.com/elasticio/elasticio/issues/4238
      // https://github.com/elasticio/elasticio/issues/4236
      // https://github.com/elasticio/elasticio/issues/4242
      if (this.usingTaskUser) {
        const workspaceRequest = await this.makeRequest({
          method: 'GET',
          url: `/workspaces/${process.env.ELASTICIO_WORKSPACE_ID}`,
        });
        const workspace = workspaceRequest.data;
        const contractId = workspace.relationships.contract.data.id;
        const contractRequest = await this.makeRequest({
          method: 'GET',
          url: `/contracts/${contractId}`,
        });
        const contract = contractRequest.data;
        this.workspaceList = [{
          contractId,
          workspaceId: workspace.id,
          workspaceName: workspace.attributes.name,
          contractName: contract.attributes.name,
          contractDetails: contract,
          workspaceDetails: workspace,
        }];
        return this.workspaceList;
      }

      const contractsRequest = await this.makeRequest({
        method: 'GET',
        url: '/contracts?page[size]=1',
      });
      const contractsCount = contractsRequest.meta.total;
      const contractsPageRange = Array.from({ length: contractsCount }, (_X, i) => i + 1);
      const nonFlatContracts = await mapLimit(
        contractsPageRange,
        parallelCalls,
        async (pageNumber: any) => {
          const multipleContractsRequest = await this.makeRequest({
            method: 'GET',
            url: `/contracts?page[size]=${objectsPerPage}&page[number]=${pageNumber}`,
          });
          return multipleContractsRequest.data;
        },
      );
      const contracts = nonFlatContracts.flat();

      const contractsDictionary = contracts.reduce((soFar: any, contract: any) => {
        /* eslint-disable-next-line no-param-reassign */
        soFar[contract.id] = contract;
        return soFar;
      }, {});

      const nonFlatWorkspaces = await mapLimit(
        contracts,
        parallelCalls,
        async (contract: any) => {
          const currentContractId = contract.id;
          const workspacesCountResponse = await this.makeRequest({
            url: `workspaces?contract_id=${currentContractId}&page[size]=1`,
            method: 'GET',
          });
          const objectCount = workspacesCountResponse.meta.total;
          const numPages = Math.ceil(objectCount / Number(objectsPerPage));
          const pageRange = Array.from({ length: numPages }, (_X, i) => i + 1);

          return mapLimit(
            pageRange,
            parallelCalls,
            async (pageNumber: any) => {
              const queries = [
                `contract_id=${contract.id}`,
                `page[size]=${objectsPerPage}`,
                `page[number]=${pageNumber}`,
              ];
              const workspaceRequest = await this.makeRequest({
                method: 'GET',
                url: `/workspaces?${queries.join('&')}`,
              });
              return workspaceRequest.data;
            },
          );
        },
      );

      const workspaces = nonFlatWorkspaces.flat().flat();

      this.workspaceList = workspaces.map((workspace: any) => {
        const contractId = workspace.relationships.contract.data.id;
        return {
          contractId,
          workspaceId: workspace.id,
          workspaceName: workspace.attributes.name,
          contractName: contractsDictionary[contractId].attributes.name,
          contractDetails: contractsDictionary[contractId],
          workspaceDetails: workspace,
        };
      });
    }
    return this.workspaceList;
  }

  /**
   * Given a set of unique criteria, find the workspace that matches
   * @param {{
   *     value: {}
   * }} workspaceUniqueCriteria
   * @returns {Promise<{{
   *     workspaceId: string,
   *     workspaceName: string,
   *     contractId: string,
   *     contractName: string,
   *     contractDetails: object,
   *     workspaceDetails: object
   * }}>}
   */
  async fetchWorkspaceId(workspaceUniqueCriteria: any) {
    const workspaces = await this.fetchWorkspaceList({});

    const matchingWorkspaces = workspaces.filter((workspace: any) => Object
      .keys(workspaceUniqueCriteria.value)
      .every((key) => (key.includes('flow') ? true : workspaceUniqueCriteria.value[key] === workspace[key])));

    if (matchingWorkspaces.length !== 1) {
      this.emitter.logger.trace('Found %d workspaces for criteria: %j, throwing error', matchingWorkspaces.length, workspaceUniqueCriteria);
      throw new Error(`Found ${matchingWorkspaces.length} workspaces for criteria: ${JSON.stringify(workspaceUniqueCriteria)}`);
    }
    return matchingWorkspaces[0];
  }

  /**
   * Given a flow, remove the properties of the flow that are regularly changed
   * by the system such as last executed time
   * @param {{}} flow
   * @param {boolean} Should keep data samples in returned object
   * @returns {{}} A copy of the flow with these properties removed
   */
  /* eslint-disable-next-line class-methods-use-this */
  removeNonWritableProperties(flow: any, includeDataSamples: any) {
    const flowLevelPropertiesToSkip = [
      'created_at',
      'current_status',
      'last_stop_time',
      'last_modified',
      'last_start_time',
      'status',
      'updated_at',
    ];
    const nodeLevelPropertiesToSkip = [
      'dynamic_metadata',
      'dynamic_select_model',
    ];
    if (!includeDataSamples) {
      nodeLevelPropertiesToSkip.push('selected_data_samples');
    }

    const toReturn = JSON.parse(JSON.stringify(flow));

    flowLevelPropertiesToSkip.forEach((flowLevelPropertyToSkip) => {
      delete toReturn[flowLevelPropertyToSkip];
    });
    toReturn.graph.nodes.forEach((node: any) => {
      nodeLevelPropertiesToSkip.forEach((nodeLevelPropertyToSkip) => {
        /* eslint-disable-next-line no-param-reassign */
        delete node[nodeLevelPropertyToSkip];
      });
    });

    return toReturn;
  }

  /**
   * Given a set of unique criteria for a flow, find the corresponding flow
   * TODO: Below implementation is correct but can be made more efficient for some cases
   * @param {{
   *     value: {}
   * }} Criteria which uniquely describes a flow
   * @returns {Promise<null|{{}}>} Returns null if there are no matches.
   *     Otherwise returns the content of the flow.
   */
  async fetchFlowId(flowUniqueCriteria: any) {
    const flows = await this.fetchFlowList({});

    const matchingFlows = flows.filter((flow: any) => Object
      .keys(flowUniqueCriteria.value)
      .every((key) => flowUniqueCriteria.value[key] === flow[key]));

    if (matchingFlows.length === 0) {
      return null;
    }

    if (matchingFlows.length > 1) {
      this.emitter.logger.trace('Found more than 1 object for criteria: %j, throwing error', flowUniqueCriteria);
      throw new Error(`Found more than 1 object for criteria: ${JSON.stringify(flowUniqueCriteria)}`);
    }
    return matchingFlows[0].flowDetails;
  }

  async fetchFlowById(id: any) {
    const flow = await this.makeRequest({
      method: 'GET',
      url: `/flows/${id}`,
    });
    return flow.data;
  }

  // much faster and less load to API than fetchFlowId
  async fetchFlowByNameAndWorkspaceId(flowName: any, workspaceId: any) {
    const flowsForWS = await this.fetchAllFlowsForWorkspace({ workspaceId });
    const matchingFlows = flowsForWS.filter((wsFlow) => wsFlow.attributes.name === flowName);
    if (matchingFlows.length !== 1) {
      throw new Error(`Found ${matchingFlows.length} matching flow instead of 1`);
    }
    return matchingFlows[0];
  }

  /**
   * Given a flow, change the flow to a given state (running, stopped, etc)
   * and wait for that change to take effect
   * @param {{
   *     action: string,
   *     desiredStatus: string,
   *     flowId: string
   * }} - Info for the request
   * @returns {Promise<>}
   */
  /* eslint-disable no-await-in-loop */
  async changeFlowState(options: any = {}) {
    const {
      timeout = 90000,
      pollInterval = 1000,
      action,
      desiredStatus,
      flowId,
    } = options;
    const timeoutTime = Date.now() + timeout;

    // Make sure flow is not changing states
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (Date.now() > timeoutTime) {
        throw new Error(`Timeout in waiting for flow ${flowId} to ${action}`);
      }

      const flow = await this.makeRequest({
        method: 'GET',
        url: `/flows/${flowId}`,
      });
      if (flow.data.attributes.current_status === flow.data.attributes.status) {
        break;
      }
      await sleep(pollInterval);
    }

    await this.makeRequest({
      method: 'POST',
      url: `/flows/${flowId}/${action}`,
    });

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (Date.now() > timeoutTime) {
        throw new Error(`Timeout in waiting for flow ${flowId} to ${action}`);
      }
      const flow = await this.makeRequest({
        method: 'GET',
        url: `/flows/${flowId}`,
      });
      if (flow.data.attributes.current_status === desiredStatus) {
        break;
      }
      await sleep(pollInterval);
    }
  }
  /* eslint-enable no-await-in-loop */

  async startFlow(flowId: any, options = {}) {
    return this.changeFlowState({
      ...options,
      flowId,
      action: 'start',
      desiredStatus: 'active',
    });
  }

  async stopFlow(flowId: any, options = {}) {
    return this.changeFlowState({
      ...options,
      flowId,
      action: 'stop',
      desiredStatus: 'inactive',
    });
  }

  async hydrateFlow(options: any = {}) {
    const {
      flow,
      includeDataSamples,
      removeNonWritableProperties,
      parallelCalls = DEFAULT_PARALLEL_PLATFORM_API_CALLS,
    } = options;

    // Enrich all data samples
    if (includeDataSamples) {
      const sampleIds = flow.attributes.graph.nodes
        .filter((node: any) => node.selected_data_samples)
        .map((node: any) => node.selected_data_samples)
        .flat();
      const samples = await mapLimit(sampleIds, parallelCalls, async (sampleId: any) => {
        let sampleRequest;
        try {
          sampleRequest = await this.makeRequest({
            method: 'GET',
            url: `/data-samples/${sampleId}`,
          });
        } catch (e: any) {
          throw new Error(`Can't extract data sample with id: ${sampleId}. Error: ${e.message}`);
        }
        const sample = sampleRequest.data.attributes;
        return {
          sample,
          sampleId,
        };
      });
      const sampleDictionary = samples.reduce((soFar: any, sample: any) => {
        /* eslint-disable-next-line no-param-reassign */
        soFar[sample.sampleId] = sample.sample;
        return soFar;
      }, {});
      flow.attributes.graph.nodes
        .filter((node: any) => node.selected_data_samples)
        .forEach((node: any) => {
          /* eslint-disable-next-line no-param-reassign */
          node.selected_data_samples = node.selected_data_samples
            .map((sampleId: any) => sampleDictionary[sampleId]);
        });
    } else {
      flow.attributes.graph.nodes
        .filter((node: any) => node.selected_data_samples)
        .forEach((node: any) => {
          /* eslint-disable-next-line no-param-reassign */
          delete node.selected_data_samples;
        });
    }

    // Remove all attributes that a regularly re-written by the platform
    if (removeNonWritableProperties) {
      flow.attributes = this.removeNonWritableProperties(flow.attributes, includeDataSamples);
    }

    // Enrich credential names
    const credentialsList = await this.fetchAllCredentialsForWorkspace({
      workspaceId: flow.relationships.workspace.data.id,
    });
    flow.attributes.graph.nodes.forEach((node: any) => {
      if (node.credentials_id) {
        const matchingCredentials = credentialsList
          .filter((credential: any) => credential.credentialId === node.credentials_id);
        if (matchingCredentials.length !== 1) {
          throw new Error('Expected a single matching credential');
        }
        /* eslint-disable-next-line no-param-reassign */
        node.credentials_id = {
          credentialId: matchingCredentials[0].credentialId,
          credentialName: matchingCredentials[0].credentialName,
        };
      }
    });

    const secretsList = await this.fetchAllSecretsForWorkspace({
      workspaceId: flow.relationships.workspace.data.id,
    });
    flow.attributes.graph.nodes.forEach((node: any) => {
      if (node.secret_id) {
        const matchingSecrets = secretsList.filter((secret: any) => secret.secretId === node.secret_id);
        if (matchingSecrets.length !== 1) throw new Error('Expected a single matching secret');
        /* eslint-disable-next-line no-param-reassign */
        node.secret_id = {
          secretId: matchingSecrets[0].secretId,
          secretName: matchingSecrets[0].secretName,
        };
      }
    });
    // Enrich command and component Id fields
    flow.attributes.graph.nodes.forEach((node: any) => {
      const commandParts = node.command.split(/[/:@]/);
      /* eslint-disable-next-line no-param-reassign */
      node.command = {
        actionOrTrigger: commandParts[2],
        componentVersion: commandParts[3],
      };
      /* eslint-disable-next-line no-param-reassign */
      node.component_id = {
        componentId: node.component_id,
        componentDevTeam: commandParts[0],
        componentName: commandParts[1],
      };
    });

    return flow;
  }
}
