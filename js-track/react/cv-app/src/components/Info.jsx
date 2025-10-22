import { useState } from 'react';

function Info() {
    const [formData, setFormData] = useState({
        name: 'Full Name',
        profession: 'Profession',
        email: 'email@mail.com',
        phone: '(123) 456-7890',
        location: 'City, ST'
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <>
            <input
                className="big"
                type="text"
                placeholder="Enter name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
            />
            <input
                className="secondary"
                type="text"
                placeholder="Profession"
                value={formData.profession}
                onChange={(e) => handleChange('profession', e.target.value)}
            />
            <hr />

            <div className="contact-info">
                <div className="email">
                    <svg
                        width="64px"
                        height="64px"
                        viewBox="0 -4 32 32"
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                        xmlns:sketch="http://www.bohemiancoding.com/sketch/ns"
                        fill="currentColor"
                        stroke="currentColor"
                    >
                        <g id="SVGRepo_bgCarrier" strokeWidth={0} />
                        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
                        <g id="SVGRepo_iconCarrier">
                            {" "}
                            <title>mail</title> <desc>Created with Sketch Beta.</desc> <defs> </defs>{" "}
                            <g
                                id="Page-1"
                                stroke="none"
                                strokeWidth={1}
                                fill="none"
                                fillRule="evenodd"
                                sketch:type="MSPage"
                            >
                                {" "}
                                <g
                                    id="Icon-Set"
                                    sketch:type="MSLayerGroup"
                                    transform="translate(-412.000000, -259.000000)"
                                    fill="currentColor"
                                >
                                    {" "}
                                    <path
                                        d="M442,279 C442,279.203 441.961,279.395 441.905,279.578 L433,270 L442,263 L442,279 L442,279 Z M415.556,280.946 L424.58,271.33 L428,273.915 L431.272,271.314 L440.444,280.946 C440.301,280.979 415.699,280.979 415.556,280.946 L415.556,280.946 Z M414,279 L414,263 L423,270 L414.095,279.578 C414.039,279.395 414,279.203 414,279 L414,279 Z M441,261 L428,271 L415,261 L441,261 L441,261 Z M440,259 L416,259 C413.791,259 412,260.791 412,263 L412,279 C412,281.209 413.791,283 416,283 L440,283 C442.209,283 444,281.209 444,279 L444,263 C444,260.791 442.209,259 440,259 L440,259 Z"
                                        id="mail"
                                        sketch:type="MSShapeGroup"
                                    >
                                        {" "}
                                    </path>{" "}
                                </g>{" "}
                            </g>{" "}
                        </g>
                    </svg>

                    <input
                        type="email"
                        placeholder="Enter email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                    />
                </div>

                <div className="phone">
                    <svg
                        width="64px"
                        height="64px"
                        viewBox="0 0 16.00 16.00"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        transform="matrix(-1, 0, 0, 1, 0, 0)"
                        stroke="#000000"
                        strokeWidth="0.00016"
                    >
                        <g id="SVGRepo_bgCarrier" strokeWidth={0} />
                        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
                        <g id="SVGRepo_iconCarrier">
                            {" "}
                            <path
                                d="M1 5V1H7V5L4.5 7.5L8.5 11.5L11 9H15V15H11C5.47715 15 1 10.5228 1 5Z"
                                fill="#000000"
                            />{" "}
                        </g>
                    </svg>

                    <input
                        type="tel"
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                    />
                </div>

                <div className="address">
                    <svg
                        width="64px"
                        height="64px"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <g id="SVGRepo_bgCarrier" strokeWidth={0} />
                        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" />
                        <g id="SVGRepo_iconCarrier">
                            {" "}
                            <path
                                d="M12 21C15.5 17.4 19 14.1764 19 10.2C19 6.22355 15.866 3 12 3C8.13401 3 5 6.22355 5 10.2C5 14.1764 8.5 17.4 12 21Z"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />{" "}
                            <path
                                d="M12 12C13.1046 12 14 11.1046 14 10C14 8.89543 13.1046 8 12 8C10.8954 8 10 8.89543 10 10C10 11.1046 10.8954 12 12 12Z"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />{" "}
                        </g>
                    </svg>

                    <input
                        type="text"
                        placeholder="Enter location"
                        value={formData.location}
                        onChange={(e) => handleChange('location', e.target.value)}
                    />
                </div>
            </div>
        </>
    );
}

export default Info;