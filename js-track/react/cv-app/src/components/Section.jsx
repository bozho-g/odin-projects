import { useState } from "react";

function Section({ children }) {
    const [canEdit, setCanEdit] = useState(false);

    function onSubmit(e) {
        setCanEdit(true);
        const inputs = e.target.parentElement.parentElement.querySelectorAll('input, select, textarea');
        inputs.forEach((input) => {
            input.nodeName === "INPUT" ? input.setAttribute('readonly', 'readonly') : input.disabled = true;
            input.style.cursor = 'default';
        });
    }

    function onEdit(e) {
        setCanEdit(false);
        const inputs = e.target.parentElement.parentElement.querySelectorAll('input, select, textarea');
        inputs.forEach((input) => {
            input.type === "text" ? input.removeAttribute('readonly') : input.removeAttribute('disabled');
            input.style.cursor = 'pointer';
        });
    }

    return (
        <section data-disabled={canEdit ? "true" : "false"}>
            <>
                {children}
            </>

            <div className="buttons">
                <button className="edit" disabled={!canEdit} onClick={onEdit}>Edit</button>
                <button className="submit" disabled={canEdit} onClick={onSubmit}>Submit</button>
            </div>
        </section>
    );
}

export default Section;
