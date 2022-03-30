"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = __importDefault(require("chai"));
const sinon_1 = __importDefault(require("sinon"));
const src_1 = require("../../src");
const PlatformApiLogicClient_1 = require("../../src/platformApi/PlatformApiLogicClient");
const allFlowsForWorkspace = __importStar(require("../helpers/allFlowsForWorkspace.json"));
const allCredentialsForWorkspace = __importStar(require("../helpers/allCredentialsForWorkspace.json"));
const allSecretsForWorkspace = __importStar(require("../helpers/allSecretsForWorkspace.json"));
const componentsAccessibleFromContract = __importStar(require("../helpers/componentsAccessibleFromContract.json"));
const flowList = __importStar(require("../helpers/flowList.json"));
const workspaceList = __importStar(require("../helpers/workspaceList.json"));
const flow = __importStar(require("../helpers/flow.json"));
const { expect } = chai_1.default;
let options;
let emitter;
const DEFAULT_PARALLEL_PLATFORM_API_CALLS = process.env.PARALLEL_PLATFORM_API_CALLS || 20;
const DEFAULT_OBJECTS_PER_PAGE = process.env.DEFAULT_OBJECTS_PER_PAGE || 20;
const url = 'https://example.com';
const email = process.env.ELASTICIO_API_USERNAME || 'userName';
const apiKey = process.env.ELASTICIO_API_KEY || 'dXNlck5hbWU6YXBpS2V5';
const resourceServerUrl = 'https://resourceServerUrl.com';
let successBody;
let cfg;
let stub;
describe('PlatformApiLogicClient', () => {
    const user = 'user';
    const pass = 'pass';
    let client;
    beforeEach(() => {
        options = {
            workspaceId: '573dd76962436c349f000003',
            contractId: '1f468982e456b16d0382e8a9',
            parallelCalls: DEFAULT_PARALLEL_PLATFORM_API_CALLS,
            objectsPerPage: DEFAULT_OBJECTS_PER_PAGE,
        };
        emitter = {
            emit: sinon_1.default.spy(),
            logger: src_1.Logger.getLogger(),
        };
        cfg = {
            resourceServerUrl,
            username: user,
            password: pass,
            url,
            email,
            apiKey,
        };
        client = new PlatformApiLogicClient_1.PlatformApiLogicClient(emitter, cfg);
    });
    afterEach(() => {
        sinon_1.default.restore();
    });
    it('Should succeed fetch all flows for workspace', async () => {
        successBody = allFlowsForWorkspace;
        stub = sinon_1.default.stub(client, 'fetchAllFlowsForWorkspace');
        stub.withArgs(options).returns(successBody);
        const result = await client.fetchAllFlowsForWorkspace(options);
        expect(result).to.be.deep.equal(successBody);
    });
    it('Should succeed fetch all credentials for workspace', async () => {
        successBody = allCredentialsForWorkspace;
        stub = sinon_1.default.stub(client, 'fetchAllCredentialsForWorkspace');
        stub.withArgs(options).returns(successBody);
        const result = await client.fetchAllCredentialsForWorkspace(options);
        expect(result).to.be.deep.equal(successBody);
    });
    it('Should succeed fetch all secrets for workspace', async () => {
        successBody = allSecretsForWorkspace;
        stub = sinon_1.default.stub(client, 'fetchAllSecretsForWorkspace');
        stub.withArgs(options).returns(successBody);
        const result = await client.fetchAllSecretsForWorkspace(options);
        expect(result).to.be.deep.equal(successBody);
    });
    it('Should succeed fetch components accessible from contract', async () => {
        successBody = componentsAccessibleFromContract;
        stub = sinon_1.default.stub(client, 'fetchComponentsAccessibleFromContract');
        stub.withArgs(options).returns(successBody);
        const result = await client.fetchComponentsAccessibleFromContract(options);
        expect(result).to.be.deep.equal(successBody);
    });
    it('Should succeed split parallelization with values maxParallelization: 10, splitFactor: 3', async () => {
        stub = sinon_1.default.stub(client, 'splitParallelization');
        stub.withArgs(10, 3).returns({ realSplitFactor: 3, parallelizationPerTask: 3 });
        const result = await client.splitParallelization(10, 3);
        expect(result).to.be.deep.equal({ realSplitFactor: 3, parallelizationPerTask: 3 });
    });
    it('Should succeed split parallelization with values maxParallelization: 10, splitFactor: 10', async () => {
        stub = sinon_1.default.stub(client, 'splitParallelization');
        stub.withArgs(10, 10).returns({ realSplitFactor: 1, parallelizationPerTask: 10 });
        const result = await client.splitParallelization(10, 10);
        expect(result).to.be.deep.equal({ realSplitFactor: 1, parallelizationPerTask: 10 });
    });
    it('Should succeed split parallelization with values maxParallelization: 3, splitFactor: 10', async () => {
        stub = sinon_1.default.stub(client, 'splitParallelization');
        stub.withArgs(3, 10).returns({ realSplitFactor: 1, parallelizationPerTask: 3 });
        const result = await client.splitParallelization(3, 10);
        expect(result).to.be.deep.equal({ realSplitFactor: 1, parallelizationPerTask: 3 });
    });
    it('Should succeed split parallelization with values maxParallelization: 10, splitFactor: 10', async () => {
        stub = sinon_1.default.stub(client, 'splitParallelization');
        stub.withArgs(1000, 10).returns({ realSplitFactor: 100, parallelizationPerTask: 10 });
        const result = await client.splitParallelization(1000, 10);
        expect(result).to.be.deep.equal({ realSplitFactor: 100, parallelizationPerTask: 10 });
    });
    it('Should succeed split parallelization with values maxParallelization: 10, splitFactor: 10', async () => {
        stub = sinon_1.default.stub(client, 'splitParallelization');
        stub.withArgs(1337, 50).returns({ realSplitFactor: 1, parallelizationPerTask: 10 });
        const result = await client.splitParallelization(1337, 50);
        expect(result).to.be.deep.equal({ realSplitFactor: 1, parallelizationPerTask: 10 });
    });
    it('Should succeed split parallelization with values maxParallelization: 10, splitFactor: 10', async () => {
        stub = sinon_1.default.stub(client, 'splitParallelization');
        stub.withArgs(50, 1337).returns({ realSplitFactor: 1, parallelizationPerTask: 50 });
        const result = await client.splitParallelization(50, 1337);
        expect(result).to.be.deep.equal({ realSplitFactor: 1, parallelizationPerTask: 50 });
    });
    it('Should succeed fetch flow list', async () => {
        successBody = flowList;
        stub = sinon_1.default.stub(client, 'fetchFlowList');
        stub.withArgs(options).returns(successBody);
        const result = await client.fetchFlowList(options);
        expect(result).to.be.deep.equal(successBody);
    });
    it('Should succeed fetch workspace list', async () => {
        successBody = workspaceList;
        stub = sinon_1.default.stub(client, 'fetchWorkspaceList');
        stub.withArgs(options).returns(successBody);
        const result = await client.fetchWorkspaceList(options);
        expect(result).to.be.deep.equal(successBody);
    });
    it('Should succeed fetch workspace id by unique criteria', async () => {
        const criteria = { value: 'Timer to E-Mail Test' };
        successBody = {
            data: {
                type: 'workspace',
                id: '573dd76962436c349f000003',
            },
            links: {
                self: '/v2/workspaces/573dd76962436c349f000003',
            },
        };
        stub = sinon_1.default.stub(client, 'fetchWorkspaceId');
        stub.withArgs(criteria.value).returns(successBody);
        const result = await client.fetchWorkspaceId(criteria.value);
        expect(result).to.be.deep.equal(successBody);
    });
    it('Should succeed remove non writable properties', async () => {
        const flow = {
            data: {
                type: 'flow',
                id: '116174084244996637390978',
                created_at: '2018-03-30T10:08:43.582Z',
                current_status: 'inactive',
                last_stop_time: '2019-03-27T15:39:02.825',
                last_modified: '2020-03-27T15:39:02.825',
                last_start_time: '2020-03-27T15:39:02.825',
                status: 'inactive',
                updated_at: '2018-03-30T10:08:43.582Z',
            },
            links: {
                self: '/v2/workspaces/116174084244996637390978',
            },
        };
        const successBody = {
            data: {
                type: 'flow',
                id: '116174084244996637390978',
            },
            links: {
                self: '/v2/workspaces/116174084244996637390978',
            },
        };
        stub = sinon_1.default.stub(client, 'removeNonWritableProperties');
        stub.withArgs(flow).returns(successBody);
        const result = await client.removeNonWritableProperties(flow);
        expect(result).to.not.have.property('created_at');
    });
    it('Should succeed fetch flow id by unique criteria', async () => {
        const criteria = { value: 'Timer to E-Mail Test' };
        const successBody = {
            data: {
                type: 'flow',
                id: '116174084244996637390978',
            },
            links: {
                self: '/v2/workspaces/116174084244996637390978',
            },
        };
        stub = sinon_1.default.stub(client, 'fetchFlowId');
        stub.withArgs(criteria).returns(successBody);
        const result = await client.fetchFlowId(criteria);
        expect(result).to.have.property('data');
    });
    it('Should succeed fetch flow by id', async () => {
        const id = '116174084244996637390978';
        const successBody = {
            type: 'flow',
            id: '116174084244996637390978',
            status: 'inactive',
        };
        stub = sinon_1.default.stub(client, 'fetchFlowById');
        stub.withArgs(id).returns(successBody);
        const result = await client.fetchFlowById(id);
        expect(result).to.have.property('id');
    });
    it('Should succeed fetch flow by name and workspace id', async () => {
        const flowName = 'Timer to E-Mail Test';
        const workspaceId = '573dd76962436c349f000003';
        successBody = flow;
        stub = sinon_1.default.stub(client, 'fetchFlowByNameAndWorkspaceId');
        stub.withArgs(flowName, workspaceId).returns(successBody);
        const result = await client.fetchFlowByNameAndWorkspaceId(flowName, workspaceId);
        expect(result).to.be.deep.equal(successBody);
    });
    it('Should succeed change flow state to active running', async () => {
        const options = {
            action: 'start',
            desiredStatus: 'active',
            flowId: '116174084244996637390978',
        };
        const successBody = {
            type: 'flow',
            id: '116174084244996637390978',
            status: 'active',
        };
        stub = sinon_1.default.stub(client, 'changeFlowState');
        stub.withArgs(options).returns(successBody);
        const result = await client.changeFlowState(options);
        expect(result).to.be.deep.equal(successBody);
    });
    it('Should succeed change flow state to inactive stopped', async () => {
        const options = {
            action: 'stop',
            desiredStatus: 'inactive',
            flowId: '116174084244996637390978',
        };
        const successBody = {
            type: 'flow',
            id: '116174084244996637390978',
            status: 'inactive',
        };
        stub = sinon_1.default.stub(client, 'changeFlowState');
        stub.withArgs(options).returns(successBody);
        const result = await client.changeFlowState(options);
        expect(result).to.be.deep.equal(successBody);
    });
    it('Should succeed start flow', async () => {
        const options = {
            action: 'start',
            desiredStatus: 'active',
            flowId: '116174084244996637390978',
        };
        const successBody = {
            type: 'flow',
            id: '116174084244996637390978',
            status: 'active',
        };
        stub = sinon_1.default.stub(client, 'startFlow');
        stub.withArgs(options.flowId, options).returns(successBody);
        const result = await client.startFlow(options.flowId, options);
        expect(result).to.be.deep.equal(successBody);
    });
    it('Should succeed stop flow', async () => {
        const options = {
            action: 'stop',
            desiredStatus: 'inactive',
            flowId: '116174084244996637390978',
        };
        const successBody = {
            type: 'flow',
            id: '116174084244996637390978',
            status: 'inactive',
        };
        stub = sinon_1.default.stub(client, 'stopFlow');
        stub.withArgs(options.flowId, options).returns(successBody);
        const result = await client.stopFlow(options.flowId, options);
        expect(result).to.be.deep.equal(successBody);
    });
    it('Should succeed stop flow', async () => {
        const options = {
            flow,
            includeDataSamples: true,
        };
        const successBody = {
            data: {
                type: 'flow',
                id: '116174084244996637390978',
                status: 'inactive',
            },
            links: {
                self: '/v2/workspaces/116174084244996637390978',
            },
        };
        stub = sinon_1.default.stub(client, 'hydrateFlow');
        stub.withArgs(options).returns(successBody);
        const result = await client.hydrateFlow(options);
        expect(result).to.be.deep.equal(successBody);
    });
});
