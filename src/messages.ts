import { XMLDictionary } from "./seb-tools";

export type EnableRequest = {
    action: 'enable';
    sebXML: string;
    rqUrlsFilter: string[];
};

export type DisableRequest = {
    action: 'disable';
};

export type GetStatusRequest = {
    action: 'getStatus';
};

export type UpdateRqUrlsFilterRequest = {
    action: 'updateRqUrlsFilter';
    rqUrlsFilter: string[];
};

export interface MessageResponse {
    enabled: boolean;
    sebDictionnary?: XMLDictionary;
    sebStartUrl?: string;
    rqUrlsFilter?: string[];
    errorMsg?: string;
}