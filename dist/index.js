/*

    curl-impersonate by wearr.

    IF YOU PAID FOR THIS SOFTWARE, YOU HAVE BEEN SCAMMED!

*/
import * as proc from "child_process";
import * as path from 'path';
export class CurlImpersonate {
    constructor(url, options) {
        this.url = url;
        this.options = options;
        this.validMethods = ["GET", "POST"];
        this.binary = "";
    }
    makeRequest() {
        return new Promise((resolve, reject) => {
            if (this.validateOptions(this.options)) {
                this.setProperBinary();
                let headers = this.convertHeaderObjectToCURL();
                let flags = this.options.flags || [];
                if (this.options.method == "GET") {
                    this.getRequest(flags, headers)
                        .then(response => resolve(response))
                        .catch(error => reject(error));
                }
                else if (this.options.method == "POST") {
                    this.postRequest(flags, headers, this.options.body)
                        .then(response => resolve(response))
                        .catch(error => reject(error));
                }
                else {
                    // Handle other HTTP methods if needed
                    reject(new Error("Unsupported HTTP method"));
                }
            }
            else {
                reject(new Error("Invalid options"));
            }
        });
    }
    validateOptions(options) {
        if (this.validMethods.includes(options.method.toUpperCase())) {
            if (options.body !== undefined && options.method == "GET") {
                throw new Error("Method is GET with an HTTP payload!");
            }
            else {
                try {
                    new URL(this.url);
                    return true;
                }
                catch {
                    throw new Error("URL is invalid! Must have http:// or https:// !");
                }
            }
        }
        else {
            throw new Error("Invalid Method! Valid HTTP methods are " + this.validMethods);
        }
    }
    setProperBinary() {
        switch (process.platform) {
            case "linux":
                if (process.arch == "x64") {
                    this.binary = "curl-impersonate-chrome-linux-x86";
                    break;
                }
                else if (process.arch == "arm") {
                    this.binary = "curl-impersonate-chrome-linux-aarch64";
                    break;
                }
                else {
                    throw new Error(`Unsupported architecture: ${process.arch}`);
                }
            case "darwin":
                this.binary = "curl-impersonate-chrome-darwin-x86";
                break;
            default:
                throw new Error(`Unsupported Platform! ${process.platform}`);
        }
    }
    async getRequest(flags, headers) {
        // GET REQUEST
        let binpath = path.join(__dirname, '..', 'bin', this.binary);
        let args = `${flags.join(' ')} ${headers} ${this.url}`;
        const result = proc.spawnSync(`${binpath} ${args}`, { shell: true });
        return result.stdout.toString(); // Convert the stdout buffer to a string and return it
    }
    async postRequest(flags, headers, body) {
        // POST REQUEST
        let binpath = path.join(__dirname, '..', 'bin', this.binary);
        let args = `${flags.join(' ')} ${headers} -d '${JSON.stringify(body)}' ${this.url}`;
        const result = proc.spawnSync(`${binpath} ${args}`, { shell: true });
        return result.stdout.toString(); // Convert the stdout buffer to a string and return it
    }
    convertHeaderObjectToCURL() {
        return Object.entries(this.options.headers).map(([key, value]) => `-H '${key}: ${value}'`).join(' ');
    }
}
export default CurlImpersonate;
//# sourceMappingURL=index.js.map