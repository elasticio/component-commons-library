"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformApiRestClient = void 0;
const remove_trailing_slash_1 = __importDefault(require("remove-trailing-slash"));
const util_1 = __importDefault(require("util"));
const BasicAuthRestClient_1 = require("../authentication/BasicAuthRestClient");
class PlatformApiRestClient extends BasicAuthRestClient_1.BasicAuthRestClient {
    constructor(emitter, cfg) {
        if (!!cfg.email !== !!cfg.apiKey) {
            throw new Error('Either both Email and API Key need to be provided or neither should be provided.');
        }
        if (!!cfg.url && (!cfg.email || !cfg.apiKey)) {
            throw new Error('If providing a Platform Instance URL, then an Email and API Key need to be provided as well.');
        }
        const baseUrl = (0, remove_trailing_slash_1.default)((cfg.url || process.env.ELASTICIO_API_URI).trim());
        const myCfg = {
            username: cfg.email || process.env.ELASTICIO_API_USERNAME,
            password: cfg.apiKey || process.env.ELASTICIO_API_KEY,
            resourceServerUrl: `${baseUrl}/v2`,
        };
        super(emitter, myCfg);
        this.usingTaskUser = !cfg.email;
        if (this.usingTaskUser) {
            this.emitter.logger.info(`Will connect to ${baseUrl} as task user`);
        }
        else {
            this.emitter.logger.info(`Will connect to ${baseUrl} as specified user`);
        }
    }
    handleRestResponse(response) {
        if (response.statusCode >= 400) {
            this.emitter.logger.error(`Error in making request to ${response.request.uri.href} Status code: ${response.statusCode}, Body: ${JSON.stringify(response.body)}`);
            if (response.body.errors && response.body.errors.length > 0) {
                throw new Error(`${response.statusCode} ${response.statusMessage} - ${response.body.errors[0].title}: ${response.body.errors[0].detail}`);
            }
            throw new Error(`Unexpected ${response.statusCode} response - ${response.statusMessage}: ${JSON.stringify(response.body)}`);
        }
        // Check for responses with non-json bodies.
        // It usually means we got a 200 response from something that isn't the platform API
        if (response.body && (!response.headers['content-type'] || !response.headers['content-type'].includes('application/json'))) {
            // eslint-disable-next-line max-len
            this.emitter.logger.error(`Error in making request to ${response.request.uri.href} Expected a JSON response. Status code: ${response.statusCode}, Body: ${util_1.default.inspect(response.body)}`);
            throw new Error(`Expected a JSON response. Instead received Content-Type ${response.headers['content-type']} - Is the API URL correct?`);
        }
        this.emitter.logger.trace(`Response statusCode: ${response.statusCode}, body: %j`, response.body);
        return response.body;
    }
}
exports.PlatformApiRestClient = PlatformApiRestClient;
