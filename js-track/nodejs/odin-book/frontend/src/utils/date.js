import {
    format,
    isThisYear,
    differenceInMinutes,
    differenceInHours,
} from 'date-fns';

export function formatPostDate(createdAt) {
    const date = new Date(createdAt);
    const now = new Date();

    const minutes = differenceInMinutes(now, date);
    const hours = differenceInHours(now, date);

    if (hours < 24) {
        if (minutes < 60) {
            return minutes <= 0
                ? 'just now'
                : `${minutes}m`;
        }

        return `${hours}h`;
    }

    if (isThisYear(date)) {
        return format(date, 'MMM d');
    }

    return format(date, 'MMM d yyyy');
}