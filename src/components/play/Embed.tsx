import React, { useEffect, useRef } from 'react';

interface EmbedProps {
    inputUrl: string;
}

const Embed: React.FC<EmbedProps> = ({ inputUrl }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const flag = useRef(false);

    useEffect(() => {
        const iframe = iframeRef.current;
        if (inputUrl != "" && iframe && iframe.contentWindow) {
            if (flag.current) return;
            flag.current = true;

            const docment = iframe.contentDocument || iframe.contentWindow.document;

            const pb: string | null = inputUrl.split("&")[1];
            if (!pb) throw new Error("Missing 'pb' parameter");

            const lng: string | undefined = pb.includes("2d") ? pb.split("d").pop() : undefined;
            const url = "https://www.google.com/maps/embed?pb=" + pb;
            const game_type = Number(inputUrl.split("&")[0]);

            fetch(url)
                .then((response: Response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.text();
                })
                .then((htmlContent: string) => {
                    htmlContent = htmlContent.replace("<head>", '<head><meta name="referrer" content="no-referrer">')
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(htmlContent, "text/html");

                    let addUrl = "";
                    let addScript = "";
                    let allow_keys = ['z', 'r', 'c', 'Z', 'R', 'C', ' '];

                    if (game_type % 10 === 1) {
                        addUrl += "&variables=linksControl&variables=clickToGo";
                    } else {
                        allow_keys = allow_keys.concat(["ArrowUp", "ArrowDown", "W", "S", "w", "s"]);
                    }

                    if (Math.floor(game_type / 10) % 10 !== 1) {
                        allow_keys = allow_keys.concat(["ArrowLeft", "ArrowRight", "A", "D", "a", "d"]);
                    }

                    if (Math.floor(game_type / 100) % 10 === 1) {
                        addUrl += "&variables=scrollwheel";
                    } else {
                        allow_keys = allow_keys.concat(["+", "-", "="]);
                    }

                    const linkbase = "https://api2.ebii.net/";
                    const link = doc.querySelector("link");
                    if (!link || !link.href) throw new Error("Missing <link> element or href");

                    const link2 = `init_js.cgi?url=${link.href}&variables=addressControl&variables=fullscreenControl&variables=showRoadLabels&variables=motionTracking&variables=motionTrackingControl&variables=zoomControl&variables=panControl${addUrl}`;

                    addScript += `
                        document.head.appendChild2 = document.head.appendChild;
                        document.head.appendChild = (e) => {
                            if (String(e.src).includes("AuthenticationService")) {
                                const callback = new URL(e.src).searchParams.get("callback");
                                e.src = "";
                                e.textContent = "/**/" + callback + " && " + callback + "([1,null,0,null,null,[1]])";
                            }
                            document.head.appendChild2(e);
                        };

                        window.addEventListener("keydown", (e) => {
                            const keysToEnable = ${JSON.stringify(allow_keys)};
                            if (!keysToEnable.includes(e.key)) e.stopImmediatePropagation();
                        }, true);
                    `;

                    const scripts = doc.querySelectorAll("script");
                    for (let script of scripts) {
                        if (script.textContent) {
                            if (lng) script.textContent = script.textContent.replace(`${lng}]`, `${lng}],null,null,1,20,1`);
                            script.textContent = addScript + script.textContent;
                            script.textContent = script.textContent.replace(link.href, linkbase + link2);
                            break;
                        }
                    }

                    link.href = linkbase + link2;

                    const style = doc.querySelector("style");
                    if (style) {
                        style.textContent += `
                            .gmnoprint,
                            .gm-iv-address,
                            .gm-fullscreen-control,
                            div:not(.gmnoprint) > .gm-style-cc:not(.gmnoprint) {
                                display: none !important;
                            }
                        `;
                    }

                    docment.open();
                    docment.write(doc.documentElement.outerHTML);
                    docment.close();
                })
                .catch((error: unknown) => {
                    console.error(error);
                });
        }
    }, [inputUrl]);

    return (
        <iframe
            id="streetView"
            ref={iframeRef}
            className="street-view"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
        />
    );
};

export default Embed;
