export const formatTime = (timeString: string) => {
    try {
        const time = new Date(`1970-01-01T${timeString}`);
        return time.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    } catch (error) {
        return timeString;
    }
};