import MonthSelect from './MonthSelect';

export default function EducationItem({ item, removeItem, handleChange }) {
    return (
        <div className="item">
            <div className="text-duration">
                <input
                    type="text"
                    className="bold input-flex"
                    placeholder="Enter university name"
                    value={item.universityName}
                    onChange={(e) => handleChange(item.id, { ...item, universityName: e.target.value })}
                />
                <div className="dates">
                    <MonthSelect
                        value={item.endMonth}
                        onChange={(e) => handleChange(item.id, { ...item, endMonth: e.target.value })}
                    />
                    <input
                        type="text"
                        className="year"
                        placeholder="Year"
                        value={item.endYear}
                        onChange={(e) => handleChange(item.id, { ...item, endYear: e.target.value })}
                    />
                </div>
            </div>

            <input
                type="text"
                placeholder="Degree and optional info"
                value={item.info}
                onChange={(e) => handleChange(item.id, { ...item, info: e.target.value })}
            />

            <svg onClick={() => removeItem(item)} className="remove-btn" fill="#ff0000" width="64px" height="64px" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>remove</title> <path d="M11.188 4.781c6.188 0 11.219 5.031 11.219 11.219s-5.031 11.188-11.219 11.188-11.188-5-11.188-11.188 5-11.219 11.188-11.219zM11.25 17.625l3.563 3.594c0.438 0.438 1.156 0.438 1.594 0 0.406-0.406 0.406-1.125 0-1.563l-3.563-3.594 3.563-3.594c0.406-0.438 0.406-1.156 0-1.563-0.438-0.438-1.156-0.438-1.594 0l-3.563 3.594-3.563-3.594c-0.438-0.438-1.156-0.438-1.594 0-0.406 0.406-0.406 1.125 0 1.563l3.563 3.594-3.563 3.594c-0.406 0.438-0.406 1.156 0 1.563 0.438 0.438 1.156 0.438 1.594 0z"></path> </g></svg>
        </div>
    );
}
