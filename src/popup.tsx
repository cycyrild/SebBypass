import React, { useState, useRef, useEffect } from 'react';
import { EnableRequest, DisableRequest, GetStatusRequest, UpdateRqUrlsFilterRequest, MessageResponse } from './messages';
import ReactDOM from 'react-dom/client'
import { Helmet } from 'react-helmet';
import { JsonInputRef, JsonInput } from './jsonStringArrayInput';
import "./popup.css"

const Popup = () => {
    const [response, setResponse] = useState<MessageResponse | undefined>(undefined);
    const jsonInputRef = useRef<JsonInputRef>(null);
    const rqUrlsFilterDefault = ["<all_urls>"];
    useEffect(() => {
        chrome.runtime.sendMessage({ action: 'getStatus' } as GetStatusRequest, (response: MessageResponse) => {
            setResponse(response);
        });
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
                        rqUrlsFilter: rqUrlsFilterDefault
                    } as EnableRequest, (response: MessageResponse) => {
                        setResponse(response);
                    });
            };
            reader.readAsText(file);
        }
    };

    const handleDisable = () => {
        chrome.runtime.sendMessage({ action: 'disable' } as DisableRequest, (response: MessageResponse) => {
            setResponse(response);
        });
    };

    const handleUpdate = () => {
        chrome.runtime.sendMessage({ action: 'updateRqUrlsFilter', rqUrlsFilter: jsonInputRef.current?.getValidInput() } as UpdateRqUrlsFilterRequest, (response: MessageResponse) => {
            setResponse(response);
        });
    };

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
                                    {response.sebStartUrl ? (
                                        <a className='value' href={response.sebStartUrl} target='_blank'>{response.sebStartUrl}</a>
                                    ) : null}
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
                    {response.enabled &&
                        <>
                            <JsonInput ref={jsonInputRef} defaultValue={rqUrlsFilterDefault} currentValue={response.rqUrlsFilter} />
                            <button onClick={handleUpdate}>Update</button>
                        </>
                    }
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