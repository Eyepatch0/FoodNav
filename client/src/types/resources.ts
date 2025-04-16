export interface Market {
    "Agency ID": string;
    "Agency Name": string;
    "Shipping Address": string;
    "Day of Week": string;
    "Starting Time": string;
    "Ending Time": string;
    "Frequency": string;
    "Food Pantry Requirements": string | null;
    "Food Format": string | null;
    "Choice Options": string | null;
    "Distribution Models": string | null;
    coordinates: string;
}

export interface Partner {
    "External ID": string;
    "Name": string;
    "Status": string;
    "Last SO Create Date": string;
    "Agency Region": string;
    "County/Ward": string;
    "Shipping Address": string;
    "Phone": string;
    "Day of Week": string;
    "Monthly Options": string;
    "Starting Time": string;
    "Ending Time": string;
    "By Appointment Only": string;
    "Food Pantry Requirements": string | null;
    "Distribution Models": string | null;
    "Food Format": string | null;
    coordinates: string;
}