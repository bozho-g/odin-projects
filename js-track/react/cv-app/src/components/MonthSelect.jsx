export default function MonthSelect({ value, onChange, disabled }) {
    const months = [
        { value: 'jan', label: 'Jan' },
        { value: 'feb', label: 'Feb' },
        { value: 'mar', label: 'Mar' },
        { value: 'apr', label: 'Apr' },
        { value: 'may', label: 'May' },
        { value: 'jun', label: 'Jun' },
        { value: 'jul', label: 'Jul' },
        { value: 'aug', label: 'Aug' },
        { value: 'sep', label: 'Sep' },
        { value: 'oct', label: 'Oct' },
        { value: 'nov', label: 'Nov' },
        { value: 'dec', label: 'Dec' }
    ];

    return (
        <select value={value} onChange={onChange} disabled={disabled}>
            {months.map(month => (
                <option key={month.value} value={month.value}>
                    {month.label}
                </option>
            ))}
        </select>
    );
}
