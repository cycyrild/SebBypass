import { MessageResponse } from "./messages";
import { SebFile } from "./seb-tools";

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 SEB/3.7.0 (x64)";
// const CSP_HEADERS = ["content-security-policy", "x-frame-options"];
const SEB_CKH_HTTP_HEADER_NAME = "X-SafeExamBrowser-ConfigKeyHash";

export class HeaderHandler {
    private isEnabled: boolean;
    private sebFile?: SebFile;
    private onBeforeSendHeadersProcessing: (details: chrome.webRequest.WebRequestHeadersDetails) => chrome.webRequest.BlockingResponse | void;
    // private onHeadersReceivedProcessing: (details: chrome.webRequest.WebResponseHeadersDetails) => chrome.webRequest.BlockingResponse | void;

    private rqUrlsFilter: string[] | undefined;

    constructor() {
        this.isEnabled = false;
        this.sebFile = undefined;
        this.onBeforeSendHeadersProcessing = this.onBeforeSendHeaders.bind(this);
        // this.onHeadersReceivedProcessing = this.onHeadersReceived.bind(this);
    }

    public updateRqUrlsFilter(rqUrlsFilter: string[]): void {
        if (this.isEnabled) {
            chrome.webRequest.onBeforeSendHeaders.removeListener(this.onBeforeSendHeadersProcessing);
            // chrome.webRequest.onHeadersReceived.removeListener(this.onHeadersReceivedProcessing);

            chrome.webRequest.onBeforeSendHeaders.addListener(
                this.onBeforeSendHeadersProcessing,
                { urls: rqUrlsFilter },
                ["blocking", "requestHeaders"]
            );

            // chrome.webRequest.onHeadersReceived.addListener(
            //     this.onHeadersReceivedProcessing,
            //     { urls: rqUrlsFilter },
            //     ["blocking", "responseHeaders"]
            // );

            this.rqUrlsFilter = rqUrlsFilter;
        } else {
            throw new Error("Not enabled");
        }
    }

    // private onHeadersReceived(details: chrome.webRequest.WebResponseHeadersDetails): chrome.webRequest.BlockingResponse | void {
    //     // Remove CSP headers
    //     details.responseHeaders = details.responseHeaders!.filter(header => {
    //         const headerName = header.name.toLowerCase();
    //         return !CSP_HEADERS.includes(headerName);
    //     });

    //     return { responseHeaders: details.responseHeaders };
    // }

    private onBeforeSendHeaders(details: chrome.webRequest.WebRequestHeadersDetails): chrome.webRequest.BlockingResponse | void {
        // Modify User-Agent header
        const userAgentHeader = details.requestHeaders!.find(header => header.name.toLowerCase() === "user-agent");
        if (userAgentHeader) {
            userAgentHeader.value = USER_AGENT;
        } else {
            throw new Error("No user agent");
        }
            
        // Add X-SafeExamBrowser-ConfigKeyHash header
        if (this.sebFile) {
            try {
                const configKey = this.sebFile.getConfigKey(details.url);
                const newHeader = { name: SEB_CKH_HTTP_HEADER_NAME, value: configKey };
                details.requestHeaders!.push(newHeader);
            } catch (err) {
                console.error("Error fetching config key:", err);
                throw err;
            }
        }
        else {
            throw new Error("No SEB file");
        }

        return { requestHeaders: details.requestHeaders };
    }

    public enable(sebFile: SebFile, rqUrlsFilter: string[]): void {
        if (!this.isEnabled) {
            this.sebFile = sebFile;

            chrome.webRequest.onBeforeSendHeaders.addListener(
                this.onBeforeSendHeadersProcessing,
                { urls: rqUrlsFilter },
                ["blocking", "requestHeaders"]
            );

            // chrome.webRequest.onHeadersReceived.addListener(
            //     this.onHeadersReceivedProcessing,
            //     { urls: rqUrlsFilter },
            //     ["blocking", "responseHeaders"]
            // );

            this.isEnabled = true;
            this.rqUrlsFilter = rqUrlsFilter;
        }
        else {
            throw new Error("Already enabled");
        }
    }

    public disable(): void {
        if (this.isEnabled) {
            chrome.webRequest.onBeforeSendHeaders.removeListener(this.onBeforeSendHeadersProcessing);
            // chrome.webRequest.onHeadersReceived.removeListener(this.onHeadersReceivedProcessing);

            this.isEnabled = false;
            this.sebFile = undefined;
            this.rqUrlsFilter = undefined;
        } else {
            throw new Error("Already disabled");
        }
    }

    public getStatus(errorMsg?: string): MessageResponse {
        return {
            enabled: this.isEnabled,
            sebDictionnary: this.sebFile?.Dictionnary,
            sebStartUrl: this.sebFile?.StartUrl,
            rqUrlsFilter: this.rqUrlsFilter,
            errorMsg: errorMsg
        };
    }
}
