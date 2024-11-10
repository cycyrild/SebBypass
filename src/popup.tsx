import React, { useState, useRef, useEffect } from 'react';
import { EnableRequest, DisableRequest, GetStatusRequest, UpdateRqUrlsFilterRequest, MessageResponse } from './messages';
import ReactDOM from 'react-dom/client'
import { Helmet } from 'react-helmet';
import "./popup.css"

const RQ_URLS_FILTER_DEFAULT = ["<all_urls>"];

const Popup = () => {
    const [response, setResponse] = useState<MessageResponse | null>(null);
    const [tmpUrlsFilter, setTmpUrlsFilter] = useState<string | null>(null);

    const refreshDomFromResponse = (response: MessageResponse) => {
        setTmpUrlsFilter(JSON.stringify(response.rqUrlsFilter, null, 2));
        setResponse(response);
    }

    useEffect(() => {
        chrome.runtime.sendMessage(
            {
                action: 'getStatus'
            } as GetStatusRequest,
            refreshDomFromResponse
        );
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const sebXML = reader.result as string;
                chrome.runtime.sendMessage(
                    {
                        action: 'enable',
                        sebXML: sebXML,
                        rqUrlsFilter: RQ_URLS_FILTER_DEFAULT
                    } as EnableRequest,
                    refreshDomFromResponse
                );
            };
            reader.readAsText(file);
        }
    };

    const handleDisable = () => {
        chrome.runtime.sendMessage(
            {
                action: 'disable'
            } as DisableRequest,
            refreshDomFromResponse
        );
    };

    const setRqUrlsFilterToDomainStartUrlAndUpdate = () => {
        if (!response)
            throw new Error('response should not be nullish when updating request urls filter');

        if (!response.sebStartUrl)
            throw new Error('response.sebStartUrl should not be nullish when updating request urls filter');

        const domainStartUrl = new URL(response.sebStartUrl).origin;

        chrome.runtime.sendMessage(
            {
                action: 'updateRqUrlsFilter',
                rqUrlsFilter: [`${domainStartUrl}/*`]
            } as UpdateRqUrlsFilterRequest,
            refreshDomFromResponse
        );
    }

    const updateRequestUrlsFilterFromInput = () => {
        if (!response)
            throw new Error('response should not be nullish when updating request urls filter');

        if (!tmpUrlsFilter)
            throw new Error('tmpUrlsFilter should not be nullish when updating request urls filter');

        try {
            const urlsFilter = JSON.parse(tmpUrlsFilter) as string[];
            chrome.runtime.sendMessage(
                {
                    action: 'updateRqUrlsFilter',
                    rqUrlsFilter: urlsFilter
                } as UpdateRqUrlsFilterRequest,
                refreshDomFromResponse
            );
        }
        catch (e) {
            alert('Invalid JSON');
            refreshDomFromResponse(response);
        }
    }

    return (
        <div>
            <Helmet>
                <title>SEB Popup</title>
            </Helmet>
            <h1>SEB configuration</h1>
            {response && (
                <>
                    <div className='status'>
                        <div className='key-value'>
                            <div>STATUS</div>
                            <div className='value'>
                                {response.enabled ? '🟢 ENABLED' : '🔴 DISABLED'}
                            </div>
                        </div>
                        {response.errorMsg &&
                            <div className='key-value'>
                                <div>ERROR</div>
                                <div className='value'>
                                    {response.errorMsg}
                                </div>
                            </div>}

                        {response.enabled &&
                            <>
                                <div className='key-value'>
                                    <div>START URL</div>
                                    {response.sebStartUrl &&
                                        <a className='value' href={response.sebStartUrl} target='_blank'>{response.sebStartUrl}</a>
                                    }
                                </div>
                                <div className='key-value'>
                                    <div>RQ URLS FILTER</div>
                                    <div className='value'>
                                        {JSON.stringify(response.rqUrlsFilter)}
                                    </div>
                                </div>
                                <button onClick={handleDisable}>Disable</button>
                            </>
                        }
                    </div>

                    {!response.enabled &&
                        <input type="file" onChange={handleFileChange} />
                    }
                    {response.enabled && (
                        tmpUrlsFilter !== null ? (
                            <>
                                <h2>Request URLs filter</h2>
                                <textarea
                                    className='request-filter-urls'
                                    value={tmpUrlsFilter}
                                    onChange={(e) => setTmpUrlsFilter(e.target.value)}
                                    rows={10}
                                    cols={50}
                                />
                                <button onClick={updateRequestUrlsFilterFromInput}>Update</button>
                                <br />
                                {response.sebStartUrl &&
                                    <button onClick={setRqUrlsFilterToDomainStartUrlAndUpdate}>
                                        Update and set to the domain of the start URL
                                    </button>
                                }
                            </>
                        ) : (
                            <div>tmpUrlsFilter is nullish</div>
                        )
                    )}

                    {response.sebDictionnary &&
                        <>
                            <h2>Seb dictionnary</h2>
                            <textarea readOnly className='seb-dict' value={JSON.stringify(response.sebDictionnary, null, 2)}>
                            </textarea>
                        </>
                    }
                </>
            )}
            <br />
            <br />
            <br />
            <a href='debugging.html' target='_blank'>SEB file debugging</a>
        </div>
    );
};



ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>,
)