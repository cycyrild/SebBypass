import { HeaderHandler } from './header-handler';
import { DisableRequest, EnableRequest, GetStatusRequest, UpdateRqUrlsFilterRequest } from './messages';
import { SebFile } from './seb-tools';

const handler = new HeaderHandler();

chrome.runtime.onMessage.addListener(async (request: EnableRequest | DisableRequest | GetStatusRequest | UpdateRqUrlsFilterRequest, sender, sendResponse) => {
    if (request.action === 'enable' && request.sebXML) {
        const sebFile = await SebFile.createInstance(request.sebXML);
        if (!sebFile) {
            sendResponse(handler.getStatus('Error parsing SEB file'));
            return;
        }
        handler.enable(sebFile, request.rqUrlsFilter);
        sendResponse(handler.getStatus());
    } else if (request.action === 'disable') {
        handler.disable();
        sendResponse(handler.getStatus());
    } else if (request.action === 'getStatus') {
        sendResponse(handler.getStatus());
    } else if (request.action === 'updateRqUrlsFilter' && request.rqUrlsFilter) {
        handler.updateRqUrlsFilter(request.rqUrlsFilter);
        sendResponse(handler.getStatus());
    } else {
        sendResponse({ errorMsg: 'Unknown action' });
    }
});

chrome.browserAction.onClicked.addListener(() => {
    chrome.windows.create({
        url: chrome.runtime.getURL('popup.html'),
        type: 'popup',
        width: 400,
        height: 600
    });
});
