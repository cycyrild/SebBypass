import { MessageResponse } from "./messages";
import { SebFile } from "./seb-tools";

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 SEB/3.1.1 (x64)";

export class HeaderHandler {
    private isEnabled: boolean;
    private sebFile?: SebFile;
    private boundAddHeader: (details: chrome.webRequest.WebRequestHeadersDetails) => chrome.webRequest.BlockingResponse | void;
    private rqUrlsFilter: string[] | undefined;

    constructor() {
        this.isEnabled = false;
        this.sebFile = undefined;
        this.boundAddHeader = this.addHeader.bind(this);
    }
    public updateRqUrlsFilter(rqUrlsFilter: string[]): void {
        if (this.isEnabled) {
            chrome.webRequest.onBeforeSendHeaders.removeListener(this.boundAddHeader);
            chrome.webRequest.onBeforeSendHeaders.addListener(
                this.boundAddHeader,
                { urls: rqUrlsFilter },
                ["blocking", "requestHeaders"]
            );
            this.rqUrlsFilter = rqUrlsFilter;
        }
    }

    private addHeader(details: chrome.webRequest.WebRequestHeadersDetails): chrome.webRequest.BlockingResponse | void {
        const userAgentHeader = details.requestHeaders!.find(header => header.name.toLowerCase() === 'user-agent');
        if (userAgentHeader) {
            userAgentHeader.value = USER_AGENT;
        }
        else {
            throw new Error("No user agent");
        }

        if (this.sebFile) {
            try {
                const configKey = this.sebFile.getConfigKey(details.url);
                const newHeader = { name: "X-SafeExamBrowser-ConfigKeyHash", value: configKey };
                details.requestHeaders!.push(newHeader);
            } catch (err) {
                console.error("Error fetching config key:", err);
            }
        }

        return { requestHeaders: details.requestHeaders };
    }

    public enable(sebFile: SebFile, rqUrlsFilter: string[]): void {
        if (!this.isEnabled) {
            this.sebFile = sebFile;
            chrome.webRequest.onBeforeSendHeaders.addListener(
                this.boundAddHeader,
                { urls: rqUrlsFilter},
                ["blocking", "requestHeaders"]
            );
            this.isEnabled = true;
            this.rqUrlsFilter = rqUrlsFilter;
        }
    }

    public disable(): void {
        if (this.isEnabled) {
            chrome.webRequest.onBeforeSendHeaders.removeListener(this.boundAddHeader);
            this.isEnabled = false;
            this.sebFile = undefined;
            this.rqUrlsFilter = undefined;
        }
    }

    public getStatus(errorMsg?: string): MessageResponse {
        return {
            enabled: this.isEnabled,
            sebDictionnary: this.sebFile?.dictionnary,
            sebStartUrl: this.sebFile?.startUrl,
            rqUrlsFilter: this.rqUrlsFilter,
            errorMsg: errorMsg
        };
    }
}